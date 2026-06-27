import { z } from "zod";

export const hotelSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  image: z.string().min(1),
  country: z.string().min(1),
  state: z.string().optional().default(""),
  city: z.string().optional().default(""),
  locationDescription: z.string().min(10),
  gym: z.boolean().optional().default(false),
  spa: z.boolean().optional().default(false),
  bar: z.boolean().optional().default(false),
  resturant: z.boolean().optional().default(false),
  freeWifi: z.boolean().optional().default(false),
  safe: z.boolean().optional().default(false),
  elevator: z.boolean().optional().default(false),
  swimmingPool: z.boolean().optional().default(false),
  petFriendly: z.boolean().optional().default(false),
  WheelchairAccess: z.boolean().optional().default(false),
  parking: z.boolean().optional().default(false),
});

// Partial schema for PATCH: absent fields are undefined (Prisma skips them)
export const hotelUpdateSchema = hotelSchema.partial();

export const roomSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  roomPrice: z.number().int().min(1),
  breakFastPrice: z.number().int().min(0).optional().default(0),
  bedCount: z.number().int().min(0).optional().default(0),
  guestCount: z.number().int().min(0).optional().default(0),
  bathroomCount: z.number().int().min(0).optional().default(0),
  singleBed: z.number().int().min(0).optional().default(0),
  doubleBed: z.number().int().min(0).optional().default(0),
  TV: z.boolean().optional().default(false),
  balcony: z.boolean().optional().default(false),
  heating: z.boolean().optional().default(false),
  nonSmokingRoom: z.boolean().optional().default(false),
  AC: z.boolean().optional().default(false),
  cityView: z.boolean().optional().default(false),
  oceanView: z.boolean().optional().default(false),
  mountionView: z.boolean().optional().default(false),
});

// Partial schema for PATCH: absent fields are undefined (Prisma skips them)
export const roomUpdateSchema = roomSchema.partial();
