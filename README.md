# Epic Stay

Hotel booking demo app built with Next.js, Prisma, PostgreSQL, Clerk, Stripe, and UploadThing.

## Features

- User authentication with Clerk
- Hotel creation and management
- Room creation and management
- Image uploads
- Date-based room booking
- Stripe payment flow
- Search/filter hotels by location

## Tech Stack

- Next.js 14
- TypeScript
- Prisma
- PostgreSQL / Neon
- Clerk
- Stripe
- UploadThing
- TailwindCSS
- Shadcn UI

## Environment Variables

DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

## Local Setup

npm install
npx prisma generate
npx prisma db push
npm run dev
