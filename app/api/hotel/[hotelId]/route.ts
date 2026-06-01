import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const hotelSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  image: z.string().min(1),
  country: z.string().min(1),
  state: z.string().optional().default(""),
  city: z.string().optional().default(""),
  locationDescription: z.string().min(10),
  gym: z.boolean().optional().default(false),
  spa: z.boolean().optional().default(false),
  bar: z.boolean().optional().default(false),
  resturant: z.boolean().optional().default(false),
  freeWifi: z.boolean().optional().default(false),
  safe: z.boolean().optional().default(false),
  elevator: z.boolean().optional().default(false),
  swimmingPool: z.boolean().optional().default(false),
  petFriendly: z.boolean().optional().default(false),
  WheelchairAccess: z.boolean().optional().default(false),
  parking: z.boolean().optional().default(false),
});

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
        const validatedBody = hotelSchema.safeParse(body);
        if (!validatedBody.success) {
            return new NextResponse('Invalid hotel data', { status: 400 });
        }
        const hotel = await prismadb.hotel.update({
            where:{
                id: params.hotelId,
            },
            data: validatedBody.data
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