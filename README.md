# AR Glam Studio

AR Glam Studio is a laptop-first salon operations app for customer intake, service tracking, manual payment logging, and Calendly booking sync.

## What it includes

- iPad-friendly customer check-in flow
- returning customer lookup by phone or email
- customer history and visit ledger
- service catalog with default pricing
- manual payment tracking
- Calendly sync and booking-to-customer matching

## Local run

1. Copy the env template:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Create the local database and seed services:

```bash
npm run db:push
npm run db:generate
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

5. Open the app:

- laptop: `http://localhost:3000`
- iPad on the same Wi-Fi: `http://<your-laptop-local-ip>:3000/checkin`

## Calendly setup

Fill these in `.env` to enable booking sync:

- `CALENDLY_API_TOKEN`
- `CALENDLY_USER_URI`

Then use the `Bookings` page to run a sync.

Webhook endpoint for later:

- `POST /api/calendly/webhook`

## Email Configuration

The application is integrated with **Zoho Mail** for sending automated booking confirmations, modification updates, and cancellation notices directly to the customer and the host.

- **Provider:** Zoho (`smtp.zoho.com`)
- **From Address:** `hello@arglamstudio.com`
- **Environment Variables Required:**
  - `EMAIL_USER` (set to `hello@arglamstudio.com`)
  - `EMAIL_PASS` (the standalone Zoho App Password)

Ensure these are properly configured in Vercel to allow the Next.js Server Actions to dispatch notifications seamlessly.

## Main routes

- `/` dashboard
- `/checkin` iPad check-in
- `/customers` customer list and history
- `/visits` visit/payment tracking
- `/services` service catalog
- `/bookings` Calendly sync and booking review

## Laptop-first today, cloud later

Version 1 uses SQLite so it is simple to run on a personal laptop. Later, this app can be moved to a VPS with minimal UI changes by:

- switching the database from SQLite to Postgres
- adding auth
- exposing the webhook publicly
- running the same Next.js app behind a reverse proxy
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
