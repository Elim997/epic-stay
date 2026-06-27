import prismadb from "@/lib/prismadb";
import { roomUpdateSchema } from "@/lib/validationSchemas";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

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
            where: { id: params.roomId },
            include: { Hotel: true },
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

        const validatedBody = roomUpdateSchema.safeParse(body);
        if (!validatedBody.success) {
            return new NextResponse("Invalid room data", { status: 400 });
        }

        const hasUpdate = Object.values(validatedBody.data).some(v => v !== undefined)
        if (!hasUpdate) {
            return new NextResponse('No fields to update', { status: 400 });
        }

        const room = await prismadb.room.update({
            where: { id: params.roomId },
            data: validatedBody.data,
        })

        return NextResponse.json(room)
    } catch(error){
        console.log('Error at /api/room/roomId PATCH', error)
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
            where: { id: params.roomId },
            include: { Hotel: true },
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
            where:{ id: params.roomId }
        })

        return NextResponse.json(room)
    } catch(error){
        console.log('Error at /api/room/roomId DELETE', error)
        return new NextResponse('Internal Server Error', {status:500})
    }
}
