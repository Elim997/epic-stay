import prismadb from '@/lib/prismadb'
import { currentUser } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16'
})

export async function POST(req: Request) {
    try {
        const user = await currentUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { booking, payment_intent_id } = body;

        if (!booking?.roomId) {
            return new NextResponse('Room Id is required', { status: 400 })
        }

        if (!booking?.hotelId) {
            return new NextResponse('Hotel Id is required', { status: 400 })
        }

        // Explicit null guard before Date construction — new Date(null) = epoch, not NaN
        if (booking.startDate == null || booking.endDate == null) {
            return new NextResponse('Invalid booking dates', { status: 400 })
        }

        const room = await prismadb.room.findUnique({
            where: { id: booking.roomId },
            include: { Hotel: true }
        })

        if (!room) {
            return new NextResponse('Room not found', { status: 404 })
        }

        if (!room.Hotel) {
            return new NextResponse('Hotel not found', { status: 404 })
        }

        if (room.hotelId !== booking.hotelId) {
            return new NextResponse('Room does not belong to this hotel', { status: 400 })
        }

        const startDate = new Date(booking.startDate)
        const endDate = new Date(booking.endDate)

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return new NextResponse('Invalid booking dates', { status: 400 })
        }

        const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        if (nights <= 0) {
            return new NextResponse('Invalid booking dates', { status: 400 })
        }

        const computedTotal = nights * room.roomPrice + (booking.breakfastIncluded ? nights * room.breakFastPrice : 0)

        const userEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
            ?? user.emailAddresses[0]?.emailAddress
            ?? ''

        if (!userEmail) {
            return new NextResponse('User email is required', { status: 400 })
        }

        // All fields sourced from server-verified data only
        const safeBookingFields = {
            roomId: room.id,
            hotelId: room.hotelId,
            startDate,
            endDate,
            breakfastIncluded: !!booking.breakfastIncluded,
            userName: user.firstName ?? user.username ?? '',
            userEmail,
            userId: user.id,
            hotelOwnerId: room.Hotel.userId,
            currency: 'usd',
            totalPrice: computedTotal,
        }

        let foundBooking;
        if (payment_intent_id) {
            foundBooking = await prismadb.booking.findUnique({
                where: { paymentIntentId: payment_intent_id, userId: user.id }
            })
        }

        // Block double-booking: check for confirmed bookings on overlapping dates.
        // On updates, exclude the current booking so date changes don't conflict with itself.
        const overlap = await prismadb.booking.findFirst({
            where: {
                roomId: room.id,
                paymentStatus: true,
                startDate: { lt: endDate },
                endDate: { gt: startDate },
                ...(foundBooking ? { NOT: { paymentIntentId: payment_intent_id } } : {}),
            }
        })
        if (overlap) {
            return new NextResponse('Room is not available for these dates', { status: 409 })
        }

        if (foundBooking && payment_intent_id) {
            // Write DB first so it is the source of truth; sync Stripe amount after
            await prismadb.booking.update({
                where: { paymentIntentId: payment_intent_id, userId: user.id },
                data: safeBookingFields
                // paymentStatus intentionally excluded — PATCH /api/booking/[Id] owns it
            })

            const updated_intent = await stripe.paymentIntents.update(payment_intent_id, {
                amount: computedTotal * 100
            })

            return NextResponse.json({ paymentIntent: updated_intent })
        } else {
            // If a stale payment_intent_id was supplied, cancel it on Stripe only when
            // no booking record exists for it at all (i.e., it belongs to no user).
            // Cancelling another user's PI would destroy their in-progress checkout.
            if (payment_intent_id) {
                const anyBooking = await prismadb.booking.findUnique({
                    where: { paymentIntentId: payment_intent_id }
                })
                if (!anyBooking) {
                    try {
                        await stripe.paymentIntents.cancel(payment_intent_id)
                    } catch (cancelError: any) {
                        // StripeInvalidRequestError = already cancelled/succeeded — safe to ignore.
                        // Any other error type (auth, rate limit) warrants a log.
                        if (cancelError?.type !== 'StripeInvalidRequestError') {
                            console.log('Unexpected error cancelling stale PI:', cancelError)
                        }
                    }
                }
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount: computedTotal * 100,
                currency: safeBookingFields.currency,
                automatic_payment_methods: { enabled: true }
            })

            try {
                await prismadb.booking.create({
                    data: {
                        ...safeBookingFields,
                        paymentIntentId: paymentIntent.id,
                        paymentStatus: false,
                    }
                })
            } catch (dbError) {
                // DB write failed after Stripe PI was created — cancel the PI to prevent
                // an orphaned intent that can never be confirmed or reconciled.
                try { await stripe.paymentIntents.cancel(paymentIntent.id) } catch {}
                throw dbError
            }

            return NextResponse.json({ paymentIntent })
        }
    } catch (error) {
        console.log('Error at /api/create-payment-intent POST', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
