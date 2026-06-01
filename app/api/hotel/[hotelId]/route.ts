import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(req:Request,{params}:{params:{hotelId:string}}) {
    try {
        const {userId} = auth();
        if (!params.hotelId) {
            return new NextResponse("Hotel Id is required", { status: 400 });
        }

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const existingHotel = await prismadb.hotel.findUnique({
        where: {
            id: params.hotelId,
        },
        });

        if (!existingHotel) {
        return new NextResponse("Hotel not found", { status: 404 });
        }

        if (existingHotel.userId !== userId) {
        return new NextResponse("Forbidden", { status: 403 });
        }


        const body = await req.json();
       
        const hotel = await prismadb.hotel.update({
            where:{
                id: params.hotelId,
            },
            data:{...body}
        })

    

        return NextResponse.json(hotel)
    }catch(error){
        console.log('Eroor at /api/hotel/hotelId PATCH', error)
        return new NextResponse('Internal Server Error', {status:500})
    }
}

export async function DELETE(req:Request,{params}:{params:{hotelId:string}}) {
    try{
        
        const {userId} = auth();


        if(!params.hotelId){
            return new NextResponse('Hotel Id is required',{status:400})
        }

        if(!userId){
            return new NextResponse('Unauthorized',{status:401})
        }

        const existingHotel = await prismadb.hotel.findUnique({
        where: {
            id: params.hotelId,
        },
        });

        if (!existingHotel) {
        return new NextResponse("Hotel not found", { status: 404 });
        }

        if (existingHotel.userId !== userId) {
        return new NextResponse("Forbidden", { status: 403 });
        }



        const hotel = await prismadb.hotel.delete({
            where:{
                id: params.hotelId,
            }
           
        })

        return NextResponse.json(hotel)
    }catch(error){
        console.log('Eroor at /api/hotel/hotelId DELETE', error)
        return new NextResponse('Internal Server Error', {status:500})
    }
}