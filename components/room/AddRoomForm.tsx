"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Hotel, Room } from "@prisma/client";
import { useForm } from "react-hook-form";
import z from "zod";

interface AddRoomFormProps {
  hotel?: Hotel & {
    rooms: Room[];
  };
  room?: Room;
  handleDialogueOpen: () => void;
}

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must contain atleast 3 chars",
  }),
  description: z.string().min(10, {
    message: "Description must contain atleast 10 chars",
  }),
  bedCount: z.coerce.number().min(1, { message: "Bed count is required" }),
  guestCount: z.coerce.number().min(1, { message: "Guest count is required" }),
  bathroomCount: z.coerce
    .number()
    .min(1, { message: "Bathroom count is required" }),
  singleBed: z.coerce.number().min(0),
  doubleBed: z.coerce.number().min(0),
  image: z.string().min(1, { message: "Image is required" }),
  breakFastPrice: z.coerce.number().optional(),
  roomPrice: z.coerce.number().min(1, { message: "Room price is required" }),
  TV: z.boolean().optional(),
  balcony: z.boolean().optional(),
  heating: z.boolean().optional(),
  nonSmokingRoom: z.boolean().optional(),
  AC: z.boolean().optional(),
  cityView: z.boolean().optional(),
  oceanView: z.boolean().optional(),
  mountionView: z.boolean().optional(),
});

const AddRoomForm = ({ hotel, room, handleDialogueOpen }: AddRoomFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: room || {
      title: "",
      description: "",
      bedCount: 0,
      guestCount: 0,
      bathroomCount: 0,
      singleBed: 0,
      doubleBed: 0,
      image: "",
      breakFastPrice: 0,
      roomPrice: 0,
      TV: false,
      balcony: false,
      heating: false,
      nonSmokingRoom: false,
      AC: false,
      cityView: false,
      oceanView: false,
      mountionView: false,
    },
  });

  return <>ad</>;
};

export default AddRoomForm;
