# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Sync schema to database (no migration files — uses db push)
npx prisma studio    # Browse database in browser UI
```

There are no tests configured in this project.

## Architecture

**Epic Stay** is a full-stack hotel booking app. Everything runs inside a single Next.js 14 app directory — no separate frontend/backend repos.

### Request flow

- **Pages** live in `/app` using the App Router. Most data fetching happens in Server Components via `/actions/*.ts` functions that call Prisma directly.
- **API Routes** (`/app/api/`) handle mutations (hotel/room CRUD, booking creation, Stripe payment intents, UploadThing file uploads).
- **Client Components** use Zustand (`/hooks/useBookRoom.ts`) to carry booking state (selected room, dates, payment intent ID) across the multi-step booking flow.

### Auth

Clerk handles all authentication. `middleware.ts` protects every route except `/`, `/hotel-details/:id/*`, and `/api/uploadthing`. Use `auth()` from `@clerk/nextjs` in server code and `useAuth()` / `useUser()` in client components. The `userId` from Clerk is stored on Hotel and Booking records to gate ownership checks.

### Database

Prisma + PostgreSQL (Neon serverless). Three models: `Hotel` → `Room` (cascade delete) → `Booking`. Schema lives in `/prisma/schema.prisma`. No migrations directory — all schema changes go through `prisma db push`.

### Payments

Stripe payment intents are created/updated idempotently via `/app/api/create-payment-intent/`. The `paymentIntentId` is stored on the Booking row with a unique constraint so duplicate requests update rather than re-create.

### Validation

Zod schemas are defined inline in API route files. `hotelSchema` (in `/app/api/hotel/`) is the main one. React Hook Form + Zod are used on the client side in form components under `/components/hotel/` and `/components/room/`.

### Image uploads

UploadThing handles all image storage. The CDN domain (`utfs.io`) is whitelisted in `next.config.mjs` for `next/image`. File routes are defined in `/app/api/uploadthing/core.ts`.

## Environment variables

```
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
UPLOADTHING_SECRET
UPLOADTHING_APP_ID
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
