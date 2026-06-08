import prismadb from '@/lib/prismadb'
import { currentUser } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string,{
    apiVersion: '2023-10-16'
})

export async function POST(req:Request) {
    const user = await currentUser()

    if(!user){
        return new NextResponse('Unauthorized', {status: 401})
    }

    const body = await req.json()
    const {booking, payment_intent_id} = body;

    if (!booking?.roomId) {
        return new NextResponse('Room Id is required', {status: 400})
    }

    const room = await prismadb.room.findUnique({
        where: { id: booking.roomId }
    })

    if (!room) {
        return new NextResponse('Room not found', {status: 404})
    }

    if (room.hotelId !== booking.hotelId) {
        return new NextResponse('Room does not belong to this hotel', {status: 400})
    }

    const startDate = new Date(booking.startDate)
    const endDate = new Date(booking.endDate)
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    if (nights <= 0) {
        return new NextResponse('Invalid booking dates', {status: 400})
    }

    const computedTotal = nights * room.roomPrice + (booking.breakfastIncluded ? nights * room.breakFastPrice : 0)

    const bookingData = {
        ...booking,
        userName: user.firstName,
        userEmail: user.emailAddresses[0].emailAddress,
        userId: user.id,
        currency: 'usd',
        paymentIntentId: payment_intent_id,
        totalPrice: computedTotal,
    }

    let foundBooking;

    if (payment_intent_id){
        foundBooking = await prismadb.booking.findUnique({
            where: {paymentIntentId: payment_intent_id, userId: user.id}
        })
    }
    if(foundBooking && payment_intent_id){
        //update
        const current_intent = await stripe.paymentIntents.retrieve(payment_intent_id)
        if(current_intent){
            const updated_intent = await stripe.paymentIntents.update(payment_intent_id,{
                amount: computedTotal * 100
            })
            const res = await prismadb.booking.update({
                where:{paymentIntentId:payment_intent_id,userId:user.id},
                data: bookingData
            })

            if (!res){
                return NextResponse.error()
            }

            return NextResponse.json({paymentIntent: updated_intent})
        }
    }else{
        //create
        const paymentIntent = await stripe.paymentIntents.create({
            amount: computedTotal * 100,
            currency: bookingData.currency,
            automatic_payment_methods: {enabled: true}
        })

        bookingData.paymentIntentId = paymentIntent.id;

        await prismadb.booking.create({
            data: bookingData
        })

        return NextResponse.json({paymentIntent})
    }

    return new NextResponse('Internal Server Error', {status:500})

}
