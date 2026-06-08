import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server"
import { z } from "zod"

const roomSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  roomPrice: z.number().int().min(0),
  breakFastPrice: z.number().int().min(0).optional().default(0),
  bedCount: z.number().int().min(0).optional().default(0),
  guestCount: z.number().int().min(0).optional().default(0),
  bathroomCount: z.number().int().min(0).optional().default(0),
  singleBed: z.number().int().min(0).optional().default(0),
  doubleBed: z.number().int().min(0).optional().default(0),
  TV: z.boolean().optional().default(false),
  balcony: z.boolean().optional().default(false),
  heating: z.boolean().optional().default(false),
  nonSmokingRoom: z.boolean().optional().default(false),
  AC: z.boolean().optional().default(false),
  cityView: z.boolean().optional().default(false),
  oceanView: z.boolean().optional().default(false),
  mountionView: z.boolean().optional().default(false),
});

export async function POST(req:Request) {
    try{
        const {userId} = auth();

        if(!userId){
            return new NextResponse('Unauthorized',{status:401})
        }
        
        const body = await req.json();
        const { hotelId, ...roomData } = body;

        if (!hotelId) {
            return new NextResponse("Hotel Id is required", { status: 400 });
        }
        const hotel = await prismadb.hotel.findUnique({
            where: {
                id: hotelId,
            },
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
        console.log('Eroor at /api/room POST', error)
        return new NextResponse('Internal Server Error', {status:500})
    }
}