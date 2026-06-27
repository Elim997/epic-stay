import prismadb from "@/lib/prismadb";
import { roomSchema } from "@/lib/validationSchemas";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server"

export async function POST(req:Request) {
    try{
        const {userId} = auth();

        if(!userId){
            return new NextResponse('Unauthorized',{status:401})
        }

        const body = await req.json();
        const { hotelId, ...roomData } = body;

        if (!hotelId || typeof hotelId !== 'string') {
            return new NextResponse("Hotel Id is required", { status: 400 });
        }

        const hotel = await prismadb.hotel.findUnique({
            where: { id: hotelId },
        });

        if (!hotel) {
            return new NextResponse("Hotel not found", { status: 404 });
        }

        if (hotel.userId !== userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const validatedBody = roomSchema.safeParse(roomData);
        if (!validatedBody.success) {
            return new NextResponse("Invalid room data", { status: 400 });
        }

        const room = await prismadb.room.create({
            data: {
                ...validatedBody.data,
                hotelId,
            }
        })

        return NextResponse.json(room)

    } catch(error){
        console.log('Error at /api/room POST', error)
        return new NextResponse('Internal Server Error', {status:500})
    }
}
