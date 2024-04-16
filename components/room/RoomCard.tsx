"use client";

import AmenitiyItem from "@/components/AmenitiyItem";
import AddRoomForm from "@/components/room/AddRoomForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Booking, Hotel, Room } from "@prisma/client";
import axios from "axios";
import {
  AirVent,
  Bath,
  Bed,
  BedDouble,
  BedSingle,
  Castle,
  CigaretteOff,
  Heater,
  Home,
  Loader2,
  Mountain,
  Pencil,
  Plus,
  Ship,
  Trash,
  Tv,
  Users,
  Wand2,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaCity } from "react-icons/fa6";
import { MdBalcony } from "react-icons/md";
import { DatePickerWithRange } from "./DateRangePicker";
import { DateRange } from "react-day-picker";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import { useAuth } from "@clerk/nextjs";
import useBookRoom from "@/hooks/useBookRoom";

interface RoomCardProps {
  hotel?: Hotel & {
    rooms: Room[];
  };
  room: Room;
  bookings?: Booking[];
}

const RoomCard = ({ hotel, room, bookings = [] }: RoomCardProps) => {
  const { setRoomData, paymentIntentId, setClientSecret, setPaymentIntentId } =
    useBookRoom();
  const pathname = usePathname();
  const isHotelDetailsPage = pathname.includes("hotel-details");
  const isBookRoom = pathname.includes("book-room");
  const [isLoading, setIsLoading] = useState(false);
  const [bookingIsLoading, setBookingIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>();
  const [totalPrice, setTotalPrice] = useState(room.roomPrice);
  const [includeBreakfast, setIncludeBreakfast] = useState(false);
  const [days, setDays] = useState(1);
  const router = useRouter();
  const { userId } = useAuth();
  const { toast } = useToast();
  const handleDialogueOpen = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (date && date.from && date.to) {
      const dayCount = differenceInCalendarDays(date.to, date.from);
      setDays(dayCount);
      if (dayCount && room.roomPrice) {
        if (includeBreakfast && room.breakFastPrice) {
          setTotalPrice(
            dayCount * room.roomPrice + dayCount * room.breakFastPrice
          );
        } else {
          setTotalPrice(dayCount * room.roomPrice);
        }
      } else {
        setTotalPrice(room.roomPrice);
      }
    }
  }, [date, room.roomPrice, includeBreakfast, room.breakFastPrice]);
  const handleRoomDelete = (room: Room) => {
    setIsLoading(true);
    const imageKey = room.image.substring(room.image.lastIndexOf("/") + 1);
    axios
      .post("/api/uploadthing/delete", { imageKey })
      .then(() => {
        axios
          .delete(`/api/room/${room.id}`)
          .then(() => {
            router.refresh();
            toast({
              variant: "success",
              description: "Room Deleted",
            });
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
            toast({
              variant: "destructive",
              description: "Something wrong",
            });
          });
      })
      .catch(() => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          description: "Something wrong",
        });
      });
  };

  const disabledDates = useMemo(() => {
    let dates: Date[] = [];

    const roomBookings = bookings.filter(
      (booking) => booking.roomId === room.id && booking.paymentStatus
    );

    roomBookings.forEach((booking) => {
      const range = eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });
      dates = [...dates, ...range];
    });
    return dates;
  }, [bookings]);

  const handleBookRoom = () => {
    if (!userId)
      return toast({
        variant: "destructive",
        description: "Make sure you are Logged in!",
      });
    if (!hotel?.userId)
      return toast({
        variant: "destructive",
        description: "Error, Try to refresh the page ",
      });
    if (date?.from && date?.to) {
      setBookingIsLoading(true);
      // this data used to manage our payment
      const bookingRoomData = {
        room,
        totalPrice,
        breakfastIncluded: includeBreakfast,
        startDate: date.from,
        endDate: date.to,
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
            hotelOwnerId: hotel.userId,
            hotelId: hotel.id,
            roomId: room.id,
            startDate: date.from,
            endDate: date.to,
            breakfastIncluded: includeBreakfast,
            totalPrice: totalPrice,
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
    } else {
      toast({
        variant: "destructive",
        description: "Error, Please Select a Date",
      });
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{room.title}</CardTitle>
        <CardDescription>{room.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="aspect-square overflow-hidden relative h-[200px] rounded-lg">
          <Image
            fill
            src={room.image}
            alt={room.title}
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 content-start text-sm">
          <AmenitiyItem>
            <Bed className="h-4 w-4" />
            {room.bedCount} Bed{"(s)"}
          </AmenitiyItem>
          <AmenitiyItem>
            <Users className="h-4 w-4" /> {room.guestCount} Guest{"(s)"}
          </AmenitiyItem>
          <AmenitiyItem>
            <Bath className="h-4 w-4" /> {room.bathroomCount} Bathroom{"(s)"}
          </AmenitiyItem>
          {room.singleBed > 0 && (
            <AmenitiyItem>
              <BedSingle className="h-4 w-4" />
              {room.singleBed} Single Bed{"(s)"}
            </AmenitiyItem>
          )}
          {room.doubleBed > 0 && (
            <AmenitiyItem>
              <BedDouble className="h-4 w-4" />
              {room.doubleBed} Double Bed{"(s)"}
            </AmenitiyItem>
          )}
          {room.TV && (
            <AmenitiyItem>
              <Tv className="h-4 w-4" />
              TV
            </AmenitiyItem>
          )}
          {room.balcony && (
            <AmenitiyItem>
              <MdBalcony className="h-4 w-4" />
              Balcony
            </AmenitiyItem>
          )}
          {room.AC && (
            <AmenitiyItem>
              <AirVent className="h-4 w-4" />
              AC
            </AmenitiyItem>
          )}
          {room.cityView && (
            <AmenitiyItem>
              <FaCity className="h-4 w-4" />
              City View
            </AmenitiyItem>
          )}
          {room.mountionView && (
            <AmenitiyItem>
              <Mountain className="h-4 w-4" />
              Mountain View
            </AmenitiyItem>
          )}
          {room.oceanView && (
            <AmenitiyItem>
              <Ship className="h-4 w-4" />
              Ocean View
            </AmenitiyItem>
          )}
          {room.nonSmokingRoom && (
            <AmenitiyItem>
              <CigaretteOff className="h-4 w-4" />
              Non Smoking
            </AmenitiyItem>
          )}
          {room.heating && (
            <AmenitiyItem>
              <Heater className="h-4 w-4" />
              Heating
            </AmenitiyItem>
          )}
        </div>

        <Separator />
        <div className="flex gap-4 justify-between">
          <div>
            Room Price: <span className="font-bold">${room.roomPrice}</span>
            <span className="text-xs">/24hrs</span>
          </div>
          {room.breakFastPrice > 0 && (
            <div>
              Breakfast Price:
              <span className="font-bold">${room.breakFastPrice}</span>
            </div>
          )}
        </div>
        <Separator />
      </CardContent>
      {!isBookRoom && (
        <CardFooter>
          {isHotelDetailsPage ? (
            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-2">
                  Select the days that you like to stay
                </div>
                <DatePickerWithRange
                  date={date}
                  setDate={setDate}
                  disabledDates={disabledDates}
                />
              </div>
              {room.breakFastPrice > 0 && (
                <div>
                  <div className="mb-2">
                    Do you want to include daily breakfast aswell?
                  </div>
                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id="breakFast"
                      onCheckedChange={(value) => setIncludeBreakfast(!!value)}
                    />
                    <label htmlFor="breakFast" className="text-sm">
                      Include Breakfast
                    </label>
                  </div>
                </div>
              )}
              <div>
                Total Price: <span className="font-bold">${totalPrice}</span>
                <span className="font-bold"> for {days} Days</span>
              </div>
              <Button
                onClick={() => handleBookRoom()}
                disabled={bookingIsLoading}
                type="button"
              >
                {bookingIsLoading ? (
                  <Loader2 className="mr-2 size-4" />
                ) : (
                  <Wand2 />
                )}
                {bookingIsLoading ? "Loading..." : "Book Room"}
              </Button>
            </div>
          ) : (
            <div className="flex w-full justify-between">
              <Button
                disabled={isLoading}
                type="button"
                variant="ghost"
                onClick={() => {
                  handleRoomDelete(room);
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Deleting
                  </>
                ) : (
                  <>
                    <Trash />
                    Delete
                  </>
                )}
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                  <Button
                    type="button"
                    variant="outline"
                    className="max-w-[150px]"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Update Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[900px] w-[90%]">
                  <DialogHeader className="px-2">
                    <DialogTitle>Update Room</DialogTitle>
                    <DialogDescription>
                      Update details about a room
                    </DialogDescription>
                  </DialogHeader>
                  <AddRoomForm
                    hotel={hotel}
                    room={room}
                    handleDialogueOpen={handleDialogueOpen}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default RoomCard;
