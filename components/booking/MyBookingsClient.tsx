"use client";

import AmenitiyItem from "@/components/AmenitiyItem";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Booking, Hotel, Room } from "@prisma/client";
import {
  AirVent,
  Bath,
  Bed,
  BedDouble,
  BedSingle,
  CigaretteOff,
  Heater,
  MapPin,
  Mountain,
  Ship,
  Tv,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaCity } from "react-icons/fa6";
import { MdBalcony } from "react-icons/md";

import { differenceInCalendarDays } from "date-fns";

import { useAuth } from "@clerk/nextjs";
import useBookRoom from "@/hooks/useBookRoom";
import useLocation from "@/hooks/useLocation";
import moment from "moment";

interface MyBookingsClientProps {
  booking: Booking & { Room: Room | null } & { Hotel: Hotel | null };
}

const MyBookingsClient: React.FC<MyBookingsClientProps> = ({ booking }) => {
  const { setRoomData, paymentIntentId, setClientSecret, setPaymentIntentId } =
    useBookRoom();
  const { userId } = useAuth();
  const router = useRouter();
  const [bookingIsLoading, setBookingIsLoading] = useState(false);
  const { getCountryByCode, getStateByCode } = useLocation();
  const { Hotel, Room } = booking;

  const { toast } = useToast();
  if (!Hotel || !Room) return <>Missing Data..?</>;

  const country = getCountryByCode(Hotel.country);
  const state = getStateByCode(Hotel.country, Hotel.state);

  const startDate = moment(booking.startDate).format("MMMM Do YYYY");
  const endDate = moment(booking.endDate).format("MMMM Do YYYY");
  const dayCount = differenceInCalendarDays(booking.endDate, booking.startDate);

  const handleBookRoom = () => {
    if (!userId)
      return toast({
        variant: "destructive",
        description: "Make sure you are Logged in!",
      });
    if (!Hotel?.userId)
      return toast({
        variant: "destructive",
        description: "Error, Try to refresh the page ",
      });

    setBookingIsLoading(true);
    // this data used to manage our payment
    const bookingRoomData = {
      room: Room,
      totalPrice: booking.totalPrice,
      breakfastIncluded: booking.breakfastIncluded,
      startDate: booking.startDate,
      endDate: booking.endDate,
    };
    setRoomData(bookingRoomData);
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // this is the data that will be saved in my db
      body: JSON.stringify({
        booking: {
          hotelOwnerId: Hotel.userId,
          hotelId: Hotel.id,
          roomId: Room.id,
          startDate: bookingRoomData.startDate,
          endDate: bookingRoomData.endDate,
          breakfastIncluded: bookingRoomData.breakfastIncluded,
          totalPrice: bookingRoomData.totalPrice,
        },
        payment_intent_id: paymentIntentId,
      }),
    })
      .then((res) => {
        setBookingIsLoading(false);
        if (res.status === 401) {
          return router.push("/login");
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.paymentIntent.client_secret);
        setPaymentIntentId(data.paymentIntent.id);
        router.push("/book-room");
      })
      .catch((error: any) => {
        console.log("Error", error);
        toast({
          variant: "destructive",
          description: `Error: ${error.message}`,
        });
      });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{Hotel.title}</CardTitle>
        <CardDescription>
          <div className="font-semibold mt-4 py-2">
            <AmenitiyItem>
              <MapPin className="size-4" />
              {country?.name},{state?.name},{Hotel.city}
            </AmenitiyItem>
          </div>
        </CardDescription>
        <CardTitle>{Room.title}</CardTitle>
        <CardDescription>{Room.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="aspect-square overflow-hidden relative h-[200px] rounded-lg">
          <Image
            fill
            src={Room.image}
            alt={Room.title}
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 content-start text-sm">
          <AmenitiyItem>
            <Bed className="h-4 w-4" />
            {Room.bedCount} Bed{"(s)"}
          </AmenitiyItem>
          <AmenitiyItem>
            <Users className="h-4 w-4" /> {Room.guestCount} Guest{"(s)"}
          </AmenitiyItem>
          <AmenitiyItem>
            <Bath className="h-4 w-4" /> {Room.bathroomCount} Bathroom{"(s)"}
          </AmenitiyItem>
          {Room.singleBed > 0 && (
            <AmenitiyItem>
              <BedSingle className="h-4 w-4" />
              {Room.singleBed} Single Bed{"(s)"}
            </AmenitiyItem>
          )}
          {Room.doubleBed > 0 && (
            <AmenitiyItem>
              <BedDouble className="h-4 w-4" />
              {Room.doubleBed} Double Bed{"(s)"}
            </AmenitiyItem>
          )}
          {Room.TV && (
            <AmenitiyItem>
              <Tv className="h-4 w-4" />
              TV
            </AmenitiyItem>
          )}
          {Room.balcony && (
            <AmenitiyItem>
              <MdBalcony className="h-4 w-4" />
              Balcony
            </AmenitiyItem>
          )}
          {Room.AC && (
            <AmenitiyItem>
              <AirVent className="h-4 w-4" />
              AC
            </AmenitiyItem>
          )}
          {Room.cityView && (
            <AmenitiyItem>
              <FaCity className="h-4 w-4" />
              City View
            </AmenitiyItem>
          )}
          {Room.mountionView && (
            <AmenitiyItem>
              <Mountain className="h-4 w-4" />
              Mountain View
            </AmenitiyItem>
          )}
          {Room.oceanView && (
            <AmenitiyItem>
              <Ship className="h-4 w-4" />
              Ocean View
            </AmenitiyItem>
          )}
          {Room.nonSmokingRoom && (
            <AmenitiyItem>
              <CigaretteOff className="h-4 w-4" />
              Non Smoking
            </AmenitiyItem>
          )}
          {Room.heating && (
            <AmenitiyItem>
              <Heater className="h-4 w-4" />
              Heating
            </AmenitiyItem>
          )}
        </div>

        <Separator />
        <div className="flex gap-4 justify-between">
          <div>
            Room Price: <span className="font-bold">${Room.roomPrice}</span>
            <span className="text-xs">/24hrs</span>
          </div>
          {Room.breakFastPrice > 0 && (
            <div>
              Breakfast Price:
              <span className="font-bold">${Room.breakFastPrice}</span>
            </div>
          )}
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <CardTitle>Booking Details</CardTitle>
          <div className="text-primary/90">
            <div>
              Room booked by {booking.userName} for {dayCount} days at{" "}
              {moment(booking.bookedAt).fromNow()}
            </div>
            <div>Check In: {startDate}</div>
            <div>Check Out: {endDate}</div>
            {booking.breakfastIncluded && <div>Breakfast will be served</div>}
            {booking.paymentStatus ? (
              <div className="text-teal-500">
                Paid ${booking.totalPrice} - Room Reserved
              </div>
            ) : (
              <div className="text-rose-500">
                Not Paid ${booking.totalPrice} - Room not Reserved
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button
          disabled={bookingIsLoading}
          variant="outline"
          onClick={() => router.push(`/hotel-details/${Hotel.id}`)}
        >
          View Hotel
        </Button>
        {!booking.paymentStatus && booking.userId === userId && (
          <Button
            disabled={bookingIsLoading}
            variant="outline"
            onClick={() => handleBookRoom()}
          >
            {bookingIsLoading ? "Processing..." : "Pay Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MyBookingsClient;
