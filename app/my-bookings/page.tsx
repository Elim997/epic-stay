import { getBookingsByHotelOwnerId } from "@/actions/getBookingByHotelOwnerId";
import { getBookingsByUserId } from "@/actions/getBookingByUserId";
import MyBookingsClient from "@/components/booking/MyBookingsClient";

const MyBookings = async () => {
  const bookingsFromVisiors = await getBookingsByHotelOwnerId();
  const bookingsIHaveMade = await getBookingsByUserId();

  if (!bookingsFromVisiors && !bookingsIHaveMade)
    return <div>No bookings found</div>;

  return (
    <div className="flex flex-col gap-10">
      {!!bookingsIHaveMade?.length && (
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-6 mt-2">
            Here are bookings you have made
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookingsIHaveMade.map((booking) => (
              <MyBookingsClient key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {!!bookingsFromVisiors?.length && (
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-6 mt-2">
            Here are booking that visiors have made
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookingsFromVisiors.map((booking) => (
              <MyBookingsClient key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
