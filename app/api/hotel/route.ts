import prismadb from "@/lib/prismadb";
import { hotelSchema } from "@/lib/validationSchemas";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server"

export async function POST(req:Request) {
    try{
        const body = await req.json();
        const {userId} = auth();

        if(!userId){
            return new NextResponse('Unauthorized',{status:401})
        }
        const validatedBody = hotelSchema.safeParse(body);

        if (!validatedBody.success) {
            return new NextResponse('Invalid hotel data', { status: 400 });
        }

        const hotel = await prismadb.hotel.create({
            data: {
                ...validatedBody.data,
                userId
            }
        })

        return NextResponse.json(hotel)

    } catch(error){
        console.log('Error at /api/hotel POST', error)
        return new NextResponse('Internal Server Error', {status:500})
    }
}
