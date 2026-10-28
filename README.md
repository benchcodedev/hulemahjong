# Hule Mahjong — React.js Edition (Vercel Ready)

Full booking system & interactive Management CMS for **Hule Mahjong** (PIK 2 — La Riviera & Palembang), converted 1:1 into **React 18 + Vite + React Router v6 + Tailwind CSS v3.4** for zero-config deployment on **Vercel**.

## Key Features
- **Public Reservation Engine (`/`)**: Live slot availability, 7-day paginating date selector, suite & player picker, promo code engine (`HULE10`, `FIRSTROUND`), and sticky reservation summary card.
- **Digital Reservation Pass & 1-Page Print PDF (`/booking/:bookingCode`)**: Interactive WhatsApp confirmation, BCA transfer proof upload, and dedicated 1-page boarding-pass print layout featuring the official **BENCHCODE™** trademark.
- **Full Public Pages**: Suites & Tables (`/tables`), Patron Membership (`/membership`), Tournaments & Clinics (`/events`, `/events/:slug`), Lightbox Gallery (`/gallery`), and Locations & Booking Lookup (`/contact`).
- **Full Management CMS (`/admin`)**:
  - Demo Login (`/admin/login`): `admin@hulemahjong.id` / `password123`
  - Executive Dashboard & Live Occupancy Matrix (`/admin`)
  - Reservations & Walk-In Creator (`/admin/bookings`)
  - Suites, Pricing & `+ Tambah / − Kurangi Meja Otomatis` (`/admin/tables`)
  - Session Time Slots & Promo Vouchers (`/admin/slots-promos`)
  - Events & Clinic Registrations (`/admin/events`)
  - Photo & Media Gallery (`/admin/gallery`)
  - Membership Tiers & Applications (`/admin/memberships`)
  - Global Brand/Banner/Payment Settings & Concierge Inbox (`/admin/settings`)

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Vercel
1. Import repository `benchcodedev/hulemahjong` in [Vercel](https://vercel.com/new).
2. Framework Preset: **Vite** (auto-detected), Build Command: `npm run build`, Output Directory: `dist`.
3. `vercel.json` is pre-configured with SPA rewrites so all deep links (`/tables`, `/booking/...`, `/admin`) work out of the box.

---
Powered by **BENCHCODE™**
