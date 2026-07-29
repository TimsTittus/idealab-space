# SJCET AICTE IDEA Lab — Management Platform

A mobile-first Progressive Web App (PWA) for managing equipment reservations, real-time space check-ins, workshops, and maker profiles at the SJCET AICTE IDEA Lab.

---

## Key Features & Usecases

### 🔒 Institutional Authentication
- **Domain-Restricted Access**: Strict authentication policy restricting sign-ups and Google OAuth logins exclusively to `@sjcetpalai.ac.in` (including student subdomains like `@cy.sjcetpalai.ac.in`). Enforced at both PostgreSQL trigger level and client PKCE middleware.

### 📍 Space Check-in & Occupancy Tracking
- **Live Occupancy Feed**: Track active makers currently working in the lab.
- **Quick Check-In Flow**: Fast, touch-friendly check-in workflow capturing visit purpose (Project Work, Self Learning, Event, Visiting) and estimated duration.

### 🛠️ Equipment Reservation System
- **Categorized Equipment Catalog**: Browse 3D printers, laser cutters, CNC routers, electronics workstations, and embedded systems gear.
- **Time Slot Booking**: Select 1-hour reservation windows (8:00 AM – 8:00 PM) up to 5 days in advance.
- **Conflict Prevention**: Database-level concurrency control (`EXCLUDE USING GIST`) preventing double-bookings.

### 📅 Events & Workshops Hub
- **Activity Feed**: View upcoming, ongoing, and past workshops, hackathons, and training sessions.
- **Status Tags**: Categorized event tags with live indicators for ongoing sessions.

### 👤 Maker Profiles
- **Portfolio & Skill Cards**: Showcase technical skill tags (Robotics, IoT, AI/ML, Web Dev), programming language proficiency levels, department info, and GitHub link.

### 📺 TV Kiosk Live Dashboard (`/tv-dashboard`)
- **Realtime Kiosk View**: Full-screen landscape dashboard designed for wall-mounted TV monitors.
- **WebSocket Sync**: Instant visual updates when makers check in or check out via Supabase Realtime.
- **Always-On Display**: Integrated Screen Wake Lock API to prevent display sleep during lab operational hours.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, GoTrue Auth, Realtime WebSockets)
- **ORM & Query Builder**: [Drizzle ORM](https://orm.drizzle.team/)
- **Icons & UI Utilities**: Lucide React, Date-fns

---

## Getting Started

### 1. Environment Setup
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
```

### 2. Database Initialization
Run the database DDL script located at `supabase/schema.sql` in your Supabase SQL Editor to set up tables, RLS policies, PostgreSQL triggers, and seed data.

### 3. Run Locally

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

Open `http://localhost:3000` to access the application.