import prismadb from "@/lib/prismadb";

export const getHotelById = async (hotelId: string) => {
  try {
    const hotel = await prismadb.hotel.findUnique({
      where: {
        id: hotelId,
      },
      include: {
        rooms: true,
      },
    });

    if (!hotel) return null;
    return hotel;
  } catch (error: any) {
    throw new Error(error);
  }
};

// didn't really need to make it a react component (.tsx) but renaming it to .ts will make errors *shrugs*
