# Campusly

Campusly is an original, iPhone-first student super app inspired by the useful workflow ideas in [UniCC](https://github.com/Arya4930/UniCC). It brings attendance, timetable, academics, assignments, exams, notes, campus services, and AI-assisted planning into a fast installable PWA.

This repository is a from-scratch implementation. It does not copy UniCC source code.

## Current Release

The included release is a polished vertical slice with:

- A native-feeling mobile dashboard
- Attendance analytics, subject breakdowns, trends, and calculator entry points
- A day timetable with current-class and next-free-slot states
- GPA trajectory, grades, assignments, and export entry points
- Profile, notes, community, placements, hostel, settings, and AI entry points
- Dedicated secondary hubs for assignments, exams, notes, community, placements, and hostel
- A global command palette with `Ctrl+K` / `Cmd+K` access
- Safe-area-aware iPhone layout with standalone PWA metadata
- Offline app-shell caching, last-known navigation caching, and a background-sync hook
- Supabase Auth clients, middleware session refresh, and a validated sign-in route
- VTOP username/password sign-in with a manually completed CAPTCHA and HTTP-only session cookies
- Typed offline-cached API modules with retry behavior
- PostgreSQL schema with constraints, indexes, and row-level security policies

Campus data is loaded live from VTOP Chennai after sign-in and cached in Supabase when configured.

## Stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- TanStack Query
- Zustand
- React Hook Form and Zod
- Supabase Auth, PostgreSQL, Storage, and Realtime

## Run Locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The visual demo works without environment variables. Supabase-backed authentication becomes active after `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured.

## Folder Structure

```text
app/
  academics/             # GPA, grades, assignments
  attendance/            # analytics and calculators
  auth/sign-in/          # Supabase Auth form
  profile/               # campus services and settings
  timetable/             # current and upcoming classes
components/              # mobile UI and feature views
lib/
  api/                   # typed client boundary and offline cache
  store/                 # persisted app preferences
  supabase/              # browser and server clients
  vtop/                  # bridge contract and security notes
public/
  sw.js                  # app-shell cache and background-sync hook
supabase/
  schema.sql             # complete baseline database schema
```

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Create a private Storage bucket named `notes`.
4. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Enable email/password sign-in in Authentication.
6. Add Storage policies that scope note uploads to an `auth.uid()` folder.
7. Enable Realtime for `notifications`, `assignments`, `hostel_complaints`, and `leave_requests`.

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## VTOP Integration

The reference UniCC guide shows that the upstream portal workflow depends on a VTOP session and semester identifiers before semester-scoped data retrieval. Campusly keeps that responsibility behind a private server-side bridge.

The client should talk only to trusted Next.js route handlers or Supabase Edge Functions. Those server-side functions call the bridge, normalize upstream responses, and write the student-owned rows to Supabase. VTOP passwords must never be saved in local storage or shipped back to the browser after sign-in.

The login UI uses:

- `GET /api/vtop/captcha` to proxy the bridge CAPTCHA image and keep its opaque challenge token HTTP-only.
- `POST /api/vtop/login` to submit the username, password, manually typed CAPTCHA, and challenge token to the bridge.

For local review without bridge credentials, these routes issue a demo CAPTCHA and a short-lived demo session. CAPTCHA solving is intentionally not automated because the upstream challenge must remain user-completed.

See `lib/vtop/README.md`.

## Offline Model

`public/sw.js` caches the app shell and navigation responses. `lib/api/client.ts` retries network requests and falls back to last-known JSON stored locally. For a full launch:

- Store structured records in IndexedDB instead of local storage.
- Add a mutation outbox for assignments, notes, complaints, and leave requests.
- Ask for push notification permission only after the student opts into a useful reminder.
- Generate PNG 192px and 512px maskable icons for store-quality installation.

## Deployment

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Add the Supabase environment variables.
4. Deploy.
5. Verify `/manifest.webmanifest`, `/sw.js`, standalone install behavior, and safe-area spacing on a physical iPhone.

The service worker is intentionally served with a no-cache header so updates are picked up promptly.

## Production Roadmap

The schema already includes assignments, exams, results, notifications, notes, community posts, comments, companies, placements, hostel profiles, complaints, mess menus, and leave requests. The next implementation passes should add their dedicated routes, realtime subscriptions, IndexedDB mutation outbox, push registration, PDF and CSV exports, and the private VTOP synchronization workers.
