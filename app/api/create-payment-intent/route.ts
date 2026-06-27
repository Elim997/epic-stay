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

        // All fields sourced from server-verified data only
        const safeBookingFields = {
            roomId: room.id,
            hotelId: room.hotelId,
            startDate,
            endDate,
            breakfastIncluded: !!booking.breakfastIncluded,
            userName: user.firstName ?? user.username ?? '',
            userEmail: user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? '',
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
        // On updates, exclude the current booking so changing dates on your own
        // booking doesn't falsely conflict with itself.
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
            // If a stale payment_intent_id was supplied (booking deleted or wrong user),
            // cancel it on Stripe so the client_secret can no longer be used to charge.
            if (payment_intent_id) {
                try {
                    await stripe.paymentIntents.cancel(payment_intent_id)
                } catch {
                    // Already cancelled, succeeded, or not found — safe to ignore
                }
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount: computedTotal * 100,
                currency: safeBookingFields.currency,
                automatic_payment_methods: { enabled: true }
            })

            await prismadb.booking.create({
                data: {
                    ...safeBookingFields,
                    paymentIntentId: paymentIntent.id,
                    paymentStatus: false,
                }
            })

            return NextResponse.json({ paymentIntent })
        }
    } catch (error) {
        console.log('Error at /api/create-payment-intent POST', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
