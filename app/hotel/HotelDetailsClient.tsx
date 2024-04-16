"use client";

import AmenitiyItem from "@/components/AmenitiyItem";
import {
  FaElevator,
  FaHandSparkles,
  FaPersonSwimming,
  FaSquareParking,
} from "react-icons/fa6";

import { HotelWithRooms } from "@/components/hotel/AddHotelForm";
import useLocation from "@/hooks/useLocation";
import { Booking } from "@prisma/client";
import {
  Accessibility,
  Dumbbell,
  MapPin,
  UtensilsCrossed,
  Vault,
  Wifi,
  Wine,
} from "lucide-react";
import Image from "next/image";
import { MdOutlinePets } from "react-icons/md";
import RoomCard from "../../components/room/RoomCard";

const HotelDetailsClient = ({
  hotel,
  bookings,
}: {
  hotel: HotelWithRooms;
  bookings?: Booking[];
}) => {
  const { getCountryByCode, getStateByCode } = useLocation();
  const country = getCountryByCode(hotel.country);
  const state = getStateByCode(hotel.country, hotel?.state);

  return (
    <div className="flex flex-col gap-6 pb-2">
      <div className="aspect-square overflow-hidden relative w-full h-[200px] md:h-[400px] rounded-lg">
        <Image
          fill
          src={hotel.image}
          alt={hotel.title}
          className="object-cover"
        />
      </div>
      <div>
        <h3 className="font-semibold text-xl md:text-3xl">{hotel.title}</h3>
        <div>
          <AmenitiyItem>
            <MapPin className="size-4" />
            {country?.name},{state?.name},{hotel.city}
          </AmenitiyItem>
          <h3 className="font-semibold text-lg mt-4 mb-2">Location Details</h3>
          <p className="text-primary/90 mb-2">{hotel.locationDescription}</p>
          <h3 className="font-semibold text-lg mt-4 mb-2">About the Hotel</h3>
          <p className="text-primary/90 mb-2">{hotel.description}</p>
          <h3 className="font-semibold text-lg mt-4 mb-2">
            Amenities that you might like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 content-start text-sm">
            {hotel.gym && (
              <AmenitiyItem>
                <Dumbbell className="size-4" /> Gym
              </AmenitiyItem>
            )}
            {hotel.bar && (
              <AmenitiyItem>
                <Wine className="size-4" /> Bar
              </AmenitiyItem>
            )}
            {hotel.elevator && (
              <AmenitiyItem>
                <FaElevator className="size-4" /> Elevator
              </AmenitiyItem>
            )}
            {hotel.freeWifi && (
              <AmenitiyItem>
                <Wifi className="size-4" /> Free Wifi
              </AmenitiyItem>
            )}
            {hotel.spa && (
              <AmenitiyItem>
                <FaHandSparkles className="size-4" /> Spa
              </AmenitiyItem>
            )}
            {hotel.safe && (
              <AmenitiyItem>
                <Vault className="size-4" /> Safe
              </AmenitiyItem>
            )}
            {hotel.resturant && (
              <AmenitiyItem>
                <UtensilsCrossed className="size-4" /> Restarunt
              </AmenitiyItem>
            )}
            {hotel.WheelchairAccess && (
              <AmenitiyItem>
                <Accessibility className="size-4" /> Wheel Chair Accessibility
              </AmenitiyItem>
            )}
            {hotel.petFriendly && (
              <AmenitiyItem>
                <MdOutlinePets className="size-4" /> Pet Friendly
              </AmenitiyItem>
            )}
            {hotel.parking && (
              <AmenitiyItem>
                <FaSquareParking className="size-4" /> Parking
              </AmenitiyItem>
            )}
            {hotel.swimmingPool && (
              <AmenitiyItem>
                <FaPersonSwimming className="size-4" /> Swimming Pool
              </AmenitiyItem>
            )}
          </div>
        </div>
        <div>
          {!!hotel.rooms.length && (
            <div>
              <h3 className="text-lg font font-semibold my-4">Hotel Rooms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {hotel.rooms.map((room) => {
                  return (
                    <RoomCard
                      hotel={hotel}
                      room={room}
                      key={room.id}
                      bookings={bookings}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetailsClient;
