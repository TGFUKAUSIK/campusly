# VTOP bridge boundary

The VTOP integration belongs behind a private server-side bridge. The web client must never store or replay VTOP passwords.

The bridge should:

1. Establish the VTOP session after the user manually completes the upstream CAPTCHA challenge.
2. Retrieve semester identifiers before semester-scoped modules.
3. Normalize attendance, timetable, marks, grades, exam, and hostel leave responses.
4. Encrypt short-lived upstream session material at rest.
5. Return normalized JSON to Supabase Edge Functions or trusted Next.js route handlers.

Expected session endpoints:

- `GET /captcha`: return the upstream CAPTCHA image and an opaque `X-Campusly-Challenge-Token`.
- `POST /session`: accept `username`, `password`, the manually entered `captcha`, and the opaque
  `challengeToken`; return a short-lived `sessionToken`.

This directory intentionally contains no copied scraper implementation from UniCC.

CAPTCHA solving is intentionally not automated. The browser receives a challenge image, the student
types the displayed answer, and the private bridge exchanges that answer for a short-lived upstream
session. This preserves the upstream portal's access-control challenge.
