import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

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

export async function PATCH(req:Request,{params}:{params:{roomId:string}}) {
    try{

        const {userId} = auth();
        if(!params.roomId){
            return new NextResponse('Room Id is required',{status:400})
        }

        if(!userId){
            return new NextResponse('Unauthorized',{status:401})
        }
        const body = await req.json();
        const existingRoom = await prismadb.room.findUnique({
        where: {
            id: params.roomId,
        },
        include: {
            Hotel: true,
        },
        });

        if (!existingRoom) {
            return new NextResponse("Room not found", { status: 404 });
        }

        if (!existingRoom.Hotel) {
            return new NextResponse("Hotel not found", { status: 404 });
        }

        if (existingRoom.Hotel.userId !== userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const validatedBody = roomSchema.safeParse(body);
        if (!validatedBody.success) {
            return new NextResponse("Invalid room data", { status: 400 });
        }

        const room = await prismadb.room.update({
            where:{
                id: params.roomId,
            },
            data: validatedBody.data,
        })
        

        return NextResponse.json(room)
    }catch(error){
        console.log('Eroor at /api/room/roomId PATCH', error)
        return new NextResponse('Internal Server Error', {status:500})
    }
}

export async function DELETE(req:Request,{params}:{params:{roomId:string}}) {
    try{
        
        const {userId} = auth();
        if(!params.roomId){
            return new NextResponse('Room Id is required',{status:400})
        }

        if(!userId){
            return new NextResponse('Unauthorized',{status:401})
        }
        const existingRoom = await prismadb.room.findUnique({
        where: {
            id: params.roomId,
        },
        include: {
            Hotel: true,
        },
        });

        if (!existingRoom) {
            return new NextResponse("Room not found", { status: 404 });
        }

        if (!existingRoom.Hotel) {
            return new NextResponse("Hotel not found", { status: 404 });
        }

        if (existingRoom.Hotel.userId !== userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const room = await prismadb.room.delete({
            where:{
                id: params.roomId,
            }
           
        })

        return NextResponse.json(room)
    }catch(error){
        console.log('Eroor at /api/room/roomId DELETE', error)
        return new NextResponse('Internal Server Error', {status:500})
    }
}