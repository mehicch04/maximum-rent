# Maximum Rent a Car

A production booking system for a car rental agency in Herzegovina. Guests search the fleet, check real availability for their dates and send a request. Staff confirm it, hand over the car, print the contract and close the rental, all from one panel.

**Live:** [maximum-rent.com](https://maximum-rent.com)

---

## Contents

- [What it does](#what-it-does)
- [Tech stack](#tech-stack)
- [Running locally](#running-locally)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [How availability works](#how-availability-works)
- [Deployment](#deployment)

---

## What it does

### For the guest

Search the fleet by dates, location, vehicle type and brand. Only vehicles genuinely free for the requested period are shown. Optional equipment is picked alongside the car, and the price is calculated live before the request is sent.

The site runs in Croatian and English, with prices in convertible marks or euros.

### For the agency

| Screen | Purpose |
|---|---|
| **Reservations** | Confirm, cancel, edit and hand over vehicles |
| **Vehicles** | Fleet with prices, photos and live status |
| **Equipment** | Catalogue, stock levels and what is currently out |
| **Contracts** | Rental agreement prepared for handover, exported to PDF or Word |
| **Analytics** | Revenue, fleet utilisation, best performing vehicles |
| **Export** | Reservations, vehicles and messages as Excel |
| **Messages** | Contact enquiries and business quote requests |
| **Company** | Agency details, locations, seasonal pricing |

### Rental lifecycle

```
Enquiry  →  Confirmed  →  In progress  →  Completed
                 │              │
                 │              └─ car with the guest, still held
                 └─ car reserved, hidden from search
```

Handover records the actual pickup time. Return records fuel level, deposit outcome and any extra charge. Closing a rental frees the car and its equipment immediately. That matters most when a guest returns early, since those spare days become bookable at once.

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Database | PostgreSQL (Supabase) via Prisma ORM |
| i18n | next-intl (hr / en) |
| Email | Resend |
| Push notifications | Telegram Bot API |
| Documents | jsPDF, docx, ExcelJS |
| Validation | Zod |
| Hosting | Vercel |

---

## Running locally

Requires Node.js 18+ and access to a PostgreSQL database.

```bash
git clone https://github.com/Bakeee99/maximum-rent.git
cd maximum-rent
npm install

cp .env.example .env.local   # then fill in the values

npx prisma generate
npx prisma db push
npm run dev
```

Site at `http://localhost:3000`, admin panel at `/admin`.

### Scripts

| Command | Action |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | Lint the codebase |
| `npm run db:push` | Apply schema to the database |
| `npm run db:seed` | Seed initial data |
| `npm run db:studio` | Browse the database |

---

## Environment variables

```bash
# Database
DATABASE_URL=              # connection pooler, port 6543
DIRECT_URL=                # session pooler, port 5432

# Admin panel
ADMIN_PASSWORD=

# Email (Resend)
RESEND_API_KEY=
INQUIRY_FROM_EMAIL=
INQUIRY_TO_EMAIL=

# Phone notifications (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Vehicle photos (Supabase Storage)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Misc
NEXT_PUBLIC_SITE_URL=
CRON_SECRET=               # guards the scheduled data cleanup
```

> `DIRECT_URL` must use the **session pooler** (port 5432). The direct connection is IPv6-only and migrations will fail over IPv4.

---

## Project structure

```
app/
  [locale]/               public site, hr and en
  admin/                  panel; one folder per screen
    actions.ts            confirm, cancel, vehicle blocks
    edit-actions.ts       editing reservations
    checkout-actions.ts   handover and return
    extend-actions.ts     continuing a rental on another vehicle
  api/                    public routes and export

components/
  fleet/                  search and vehicle listings
  reservation/            booking form
  admin/                  panel, including the handover module
  ui/                     shared date and time pickers

lib/
  availability.ts         vehicle availability
  extras-availability.ts  equipment availability and fleet occupancy
  pricing.ts              daily rate, seasonal included
  analytics.ts            reporting
  company.ts              agency details

prisma/
  schema.prisma
```

---

## Data model

Eleven tables. The ones that matter most:

- **Car** · vehicle, with a regular and a seasonal rate
- **Inquiry** · a reservation, from enquiry through to a closed rental
- **InquiryExtra** · equipment on a reservation, priced as it was at the time
- **CarBlock** · vehicle off the road: service, damage, private use
- **Extra** · equipment catalogue with total stock
- **CompanyInfo** · agency details, also printed on contract headers
- **Location** · pickup and drop-off points

Prices and equipment names are **copied onto the reservation** when it is created. Changing the price list later never rewrites what a guest was already quoted.

---

## How availability works

This is the core of the system, so it is worth spelling out.

**A vehicle is held** when it has a confirmed reservation, a rental in progress, or a block overlapping the requested period. Completed and cancelled reservations hold nothing.

**Overlap is strict:** two periods clash when one starts before the other ends *and* ends after the other starts. Periods that merely touch, where one returns at 10:00 and the next picks up at 10:00, are not a clash.

**Equipment is tracked per unit**, across both sources at once: bookings from the website and those entered by staff. A child seat given out over the phone therefore disappears from the website too, and the other way round.

Every check runs again on the server before anything is written. What is greyed out in the browser is a convenience, not a guarantee.

---

## Deployment

Hosted on Vercel. Every push to `main` triggers a build.

Before deploying:

```bash
npm run build     # must pass locally
```

After a schema change:

```bash
npx prisma generate
npx prisma db push
```

---

## Author

Built by [mehiccdev](https://mehiccdev.com), custom web applications.

bakir.mehic@mehiccdev.com

---

© Maximum Rent a Car. Source code remains the property of mehiccdev.
