import { getHotelById } from "@/actions/getHotelById";
import AddHotelForm from "@/components/hotel/AddHotelForm";
import { auth } from "@clerk/nextjs";
interface HotelPageProps {
  params: {
    hotelId: string;
  };
}
const Hotel = async ({ params }: HotelPageProps) => {
  const hotel = await getHotelById(params.hotelId);
  const { userId } = auth();
  if (!userId) {
    return <> Not Signed In</>;
  }
  if (hotel && hotel.userId !== userId) {
    return <> Access Denied</>;
  }

  return (
    <div>
      <AddHotelForm hotel={hotel} />
    </div>
  );
};

export default Hotel;
