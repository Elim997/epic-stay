import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";

export const getHotelByUserId = async () => {
  try {
    const {userId} = auth()

    if(!userId){
        throw new Error('unauthorized')
    }

    const hotels = await prismadb.hotel.findMany({
      where: {
        userId,
      },
      include: {
        rooms: true,
      },
    });

    if (!hotels) return null;
    return hotels;
  } catch (error: any) {
    throw new Error(error);
  }
};
