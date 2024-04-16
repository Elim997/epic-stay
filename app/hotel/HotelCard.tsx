"use client";

import AmenitiyItem from "@/components/AmenitiyItem";
import { MdOutlinePets } from "react-icons/md";
import { HotelWithRooms } from "@/components/hotel/AddHotelForm";
import { Button } from "@/components/ui/button";
import {
  FaElevator,
  FaHandSparkles,
  FaPersonSwimming,
  FaSquareParking,
} from "react-icons/fa6";
import { cn } from "@/lib/utils";
import {
  Accessibility,
  ArrowBigUpDash,
  Dumbbell,
  HandHeart,
  MapPin,
  TreePine,
  UtensilsCrossed,
  Vault,
  Wifi,
  Wine,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import useLocation from "@/hooks/useLocation";

const HotelCard = ({ hotel }: { hotel: HotelWithRooms }) => {
  const pathname = usePathname();
  const isMyHotels = pathname.includes("my-hotels");
  const router = useRouter();
  const { getCountryByCode } = useLocation();
  const country = getCountryByCode(hotel.country);
  return (
    <div
      onClick={() => !isMyHotels && router.push(`/hotel-details/${hotel.id}`)}
      className={cn(
        "col-span-1 cursor-pointer transition hover:scale-105",
        isMyHotels && "cursor-default"
      )}
    >
      <div className="flex gap-2 bg-background/50 border border-primary/10 rounded-lg">
        <div className="flex-1 aspect-square overflow-hidden relative w-full h-[210px] rounded-s-lg">
          <Image
            fill
            src={hotel.image}
            alt={hotel.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between h-[210px] gap-1 p-1 py-2 text-sm">
          <h3 className="font-semibold text-xl">{hotel.title}</h3>
          <div className="text-primary/90">
            {hotel.description.substring(0, 45)}
          </div>
          <div className="text-primary/90 justify-between gap-2">
            <AmenitiyItem>
              <MapPin className="size-4" /> {country?.name},{hotel.city}
            </AmenitiyItem>
            <div className="flex flex-col-2 md:flex-col-2 gap-4 p-1 py-2">
              {hotel.gym && (
                <AmenitiyItem>
                  <Dumbbell className="size-4" />
                </AmenitiyItem>
              )}
              {hotel.bar && (
                <AmenitiyItem>
                  <Wine className="size-4" />
                </AmenitiyItem>
              )}
              {hotel.elevator && (
                <AmenitiyItem>
                  <FaElevator className="size-4" />
                </AmenitiyItem>
              )}
              {hotel.freeWifi && (
                <AmenitiyItem>
                  <Wifi className="size-4" />
                </AmenitiyItem>
              )}
              {hotel.spa && (
                <AmenitiyItem>
                  <FaHandSparkles className="size-4" />
                </AmenitiyItem>
              )}
              {hotel.safe && (
                <AmenitiyItem>
                  <Vault className="size-4" />
                </AmenitiyItem>
              )}
              {hotel.resturant && (
                <AmenitiyItem>
                  <UtensilsCrossed className="size-4" />
                </AmenitiyItem>
              )}
              {hotel.WheelchairAccess && (
                <AmenitiyItem>
                  <Accessibility className="size-4" />
                </AmenitiyItem>
              )}
              {hotel.petFriendly && (
                <AmenitiyItem>
                  <MdOutlinePets className="size-4" />
                </AmenitiyItem>
              )}
              {hotel.parking && (
                <AmenitiyItem>
                  <FaSquareParking className="size-4" />
                </AmenitiyItem>
              )}
              {hotel.swimmingPool && (
                <AmenitiyItem>
                  <FaPersonSwimming className="size-4" />
                </AmenitiyItem>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {hotel?.rooms[0]?.roomPrice && (
                <>
                  <div className="font-semibold text-base">
                    ${hotel?.rooms[0].roomPrice}
                  </div>
                  <div className="text-xs">/ 24hrs</div>
                </>
              )}
            </div>
            {isMyHotels && (
              <Button
                onClick={() => {
                  router.push(`/hotel/${hotel.id}`);
                }}
                variant="outline"
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
