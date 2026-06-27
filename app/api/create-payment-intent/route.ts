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

        // Build booking fields from server-verified sources only — never trust client for
        // hotelOwnerId, paymentStatus, userId, totalPrice, or pricing inputs.
        const safeBookingFields = {
            roomId: booking.roomId,
            hotelId: booking.hotelId,
            startDate,
            endDate,
            breakfastIncluded: !!booking.breakfastIncluded,
            userName: user.firstName ?? user.username ?? '',
            userEmail: user.emailAddresses[0].emailAddress,
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

        if (foundBooking && payment_intent_id) {
            const updated_intent = await stripe.paymentIntents.update(payment_intent_id, {
                amount: computedTotal * 100
            })

            await prismadb.booking.update({
                where: { paymentIntentId: payment_intent_id, userId: user.id },
                data: safeBookingFields
                // paymentStatus is intentionally excluded: the PATCH /api/booking/[Id]
                // handler owns that field after Stripe confirms payment
            })

            return NextResponse.json({ paymentIntent: updated_intent })
        } else {
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
