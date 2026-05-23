# Check List Website

Personal web app for managing daily plans, checklist items, and frequently used links.

## 1. Tech Stack
- Next.js 16 (App Router)
- React + TypeScript
- Tailwind CSS + shadcn/ui + lucide-react
- Supabase PostgreSQL + Supabase Auth
- Deploy target: Vercel

## 2. Clone Project
```bash
git clone https://github.com/tranquangthong03/check-list-website.git
cd check-list-website
```

## 3. Install Dependencies
```bash
npm install
```

## 4. Supabase Configuration
Create a Supabase project, then get:
- Project URL
- Project Anon Key

## 5. Run SQL Schema
Open Supabase SQL Editor and run:
- `supabase/schema.sql`

This creates:
- `profiles`
- `daily_plans`
- `checklist_items`
- `quick_links`
- RLS policies
- `updated_at` triggers

## 6. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

`.env.example` is included. Do not commit `.env.local`.

## 7. Run Local
```bash
npm run dev
```
App runs at `http://localhost:3000`.

## 8. Deploy to Vercel
1. Push repo to GitHub (already configured).
2. Import repo into Vercel.
3. Set environment variables from `.env.local` in Vercel Project Settings.
4. Deploy.

## 9. Completed Features
- Authentication (register, login, logout) with Supabase Auth
- Protected routes for app pages
- Dashboard overview:
  - Current date + greeting
  - Total plans today
  - Completed checklist count
  - Daily progress
  - Recent plans
  - Favorite quick links
- Daily Planner CRUD:
  - Add, edit, delete
  - Change status
  - Filter by date
  - Sort by start time
- Checklist CRUD:
  - Add, edit, delete
  - Done/undone
  - Filter by date
  - Filter all/done/not done
- Quick Links CRUD:
  - Add, edit, delete
  - Open in new tab
  - Favorite/unfavorite
  - Search by name
  - Basic URL validation
- Settings:
  - User profile info
  - Theme toggle (light/dark)
  - Logout action

## 10. Notes
- This project uses Supabase cloud database (no local SQL / SQLite).
- Middleware warning in Next.js 16 indicates `middleware.ts` naming is deprecated in favor of `proxy.ts` in future releases; current behavior still works.
