import { getHotelByUserId } from "@/actions/getHotelByUserId";
import HotelList from "@/components/hotel/HotelList";

const MyHotels = async () => {
  const hotels = await getHotelByUserId();
  if (!hotels) return <div>no hotel found</div>;
  return (
    <div>
      <h2 className="text-2xl font-semibold">Here are your hotels</h2>
      <HotelList hotels={hotels} />
    </div>
  );
};

export default MyHotels;
