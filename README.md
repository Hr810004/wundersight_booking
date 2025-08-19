Minimal Appointment Booking App (Clinic) – Next.js + Prisma + Postgres

Live links:
- Frontend/API URL: https://wundersight-booking-3gz4.vercel.app/

Test credentials:
- Patient: patient@example.com / Passw0rd!
- Admin: admin@example.com / Passw0rd!

Tech stack
- Next.js (App Router) for UI and API routes
- Prisma ORM with Postgres (Neon)
- JWT auth with role-based access

Environment variables (.env)
- DATABASE_URL: Postgres connection string (use Neon). Example: postgresql://user:pass@host/db?sslmode=require
- JWT_SECRET: long random string
- ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME: admin seed user
- PATIENT_EMAIL / PATIENT_PASSWORD / PATIENT_NAME: optional demo patient

Local setup
1) Install deps: `npm install`
2) Push schema: `npm run db:push`
3) Seed: `npm run db:seed`
4) Dev server: `npm run dev`

API Endpoints
- POST /api/register – { name, email, password } → 201 with { token, role }
- POST /api/login – { email, password } → 200 with { token, role }
- GET /api/slots?from=YYYY-MM-DD&to=YYYY-MM-DD – available 30-min blocks 09:00–17:00 UTC
- POST /api/book – { slotId } [Bearer token patient] → 201; prevents double booking
- GET /api/my-bookings – patient auth
- GET /api/all-bookings – admin auth

Architecture notes
- Data model: users, slots, bookings. Unique on bookings.slotId prevents double booking. Slots unique by (startAt,endAt).
- Auth: JWT; user id and role in payload; verify in route handlers. Store token client-side.
- Concurrency: booking relies on unique DB constraint; conflict returns 409 with code SLOT_TAKEN.
- Error handling: consistent JSON { error: { code, message } } and proper HTTP codes.

Deployment (Vercel + Neon)
1) Create Neon Postgres project; copy connection string → set Vercel Project Env: DATABASE_URL.
2) Set JWT_SECRET and seed vars in Vercel.
3) In Vercel, import this repo and deploy.
4) Prisma on Vercel: Prisma Client is generated via `postinstall`. Schema and seed were applied to Neon already; if needed, run locally with the same DATABASE_URL: `npm run db:push && npm run db:seed`.

Submission Checklist
- Frontend/API URL: https://wundersight-booking-3gz4.vercel.app/
- Patient: patient@example.com / Passw0rd!
- Admin: admin@example.com / Passw0rd!
- Repo URL: https://github.com/Hr810004/wundersight_booking
- Run locally: README steps verified
- Curl steps included
- Notes on trade-offs & next steps below

Verification (curl)
```
curl -s -X POST "$BASE/api/register" -H 'content-type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com","password":"Passw0rd!"}'

TOKEN=$(curl -s -X POST "$BASE/api/login" -H 'content-type: application/json' \
  -d '{"email":"alice@example.com","password":"Passw0rd!"}' | jq -r .token)

curl -s "$BASE/api/slots?from=$(date -u +%F)&to=$(date -u -d "+6 days" +%F)"

SLOT=$(curl -s "$BASE/api/slots?from=$(date -u +%F)&to=$(date -u -d "+6 days" +%F)" | jq -r '.[0].id')

curl -s -X POST "$BASE/api/book" -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d "{\"slotId\":\"$SLOT\"}"

curl -s "$BASE/api/my-bookings" -H "authorization: Bearer $TOKEN"
```

Known limitations / next steps
- No refresh token flow; client stores JWT only.
- Minimal UI; no pagination.
- Simple login throttling (in-memory) added; for production, move to a distributed store.
