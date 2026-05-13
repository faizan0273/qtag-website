# Qtag, smart QR tags (MVP)

A Pakistan-focused web app for **smart QR tags** (vehicle, medical, lost & found, and more). People reach owners on WhatsApp **without exposing private numbers** unless the owner chooses to share.

**Stack:** Next.js 14 (App Router), TypeScript, MongoDB (Mongoose), TailwindCSS, WhatsApp Cloud API, JWT auth.

This MVP centres on physical QR tags and activation; the shop lists multiple safety-oriented SKUs.

---

## Quick Start

```bash
# 1. Install
pnpm install        # or: npm install / yarn

# 2. Configure
cp .env.example .env.local
#  → fill MONGODB_URI, JWT_SECRET, and (optional) WhatsApp creds

# 3. Run
pnpm dev
# → http://localhost:3000
```

**Without WhatsApp credentials**, OTP codes print to the server console (great for local dev). With creds, they go to WhatsApp via Meta Cloud API.

---

## What Works

- ✅ Phone-OTP auth (WhatsApp primary, console fallback in dev)
- ✅ Order placement (Cash on Delivery)
- ✅ Tag UID generation per order line
- ✅ QR activation flow (binds tag to user)
- ✅ Public scan page (no login)
- ✅ Send-message-to-owner relay (forwards to owner's WhatsApp)
- ✅ Lost / Found mode toggle
- ✅ Owner dashboard (tags, orders)
- ✅ Rate limiting on OTP + contact endpoints
- ✅ Phone-number masking everywhere

## What's Stubbed (clear hooks to extend)

- 🔌 Online payment (currently COD; Safepay/JazzCash hooks ready in `src/lib/payments.ts`)
- 🔌 SMS fallback (interface ready in `src/lib/sms.ts`)
- 🔌 Admin dashboard (auth + role guard wired; UI is a starter page)
- 🔌 Shipping/courier integration (order has tracking fields ready)

---

## Folder Structure

```
qtag/                               # project root (your checkout folder may differ)
├── src/
│   ├── app/
│   │   ├── (marketing)/             # public pages
│   │   │   ├── page.tsx             # /  homepage
│   │   │   ├── shop/page.tsx        # product page
│   │   │   └── checkout/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── verify/page.tsx
│   │   ├── (app)/                   # auth-protected
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── dashboard/tags/[id]/page.tsx
│   │   │   └── dashboard/orders/page.tsx
│   │   ├── t/[uid]/
│   │   │   ├── page.tsx             # public scan page
│   │   │   └── activate/page.tsx
│   │   ├── order-success/[id]/page.tsx
│   │   ├── api/                     # API routes (= our backend)
│   │   │   ├── auth/...
│   │   │   ├── orders/...
│   │   │   ├── tags/...
│   │   │   ├── contact/...
│   │   │   └── scans/...
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                      # Button, Input, Label, Card
│   │   ├── layout/                  # Header, Footer
│   │   └── ...
│   ├── lib/                         # all "backend" + shared utilities
│   │   ├── env.ts                   # Zod-validated env
│   │   ├── db.ts                    # mongoose connection (cached)
│   │   ├── auth.ts                  # JWT, sessions, getCurrentUser
│   │   ├── otp.ts                   # generate/verify OTP
│   │   ├── whatsapp.ts              # Meta Cloud API client
│   │   ├── sms.ts                   # SMS fallback (stub)
│   │   ├── phone.ts                 # +92 normalization & masking
│   │   ├── uid.ts                   # tag UID generator
│   │   ├── qr.ts                    # PNG QR generation
│   │   ├── rate-limit.ts            # in-memory limiter
│   │   ├── validation.ts            # Zod schemas
│   │   ├── api-helpers.ts           # ok(), bad(), withAuth()
│   │   └── constants.ts
│   ├── models/                      # Mongoose models
│   │   ├── User.ts
│   │   ├── Tag.ts
│   │   ├── Order.ts
│   │   ├── OtpSession.ts
│   │   ├── Scan.ts
│   │   └── Message.ts
│   ├── types/index.ts
│   └── middleware.ts                # auth gate for /dashboard
├── public/
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Architecture Notes

- **Backend = Next.js Route Handlers.** Everything in `src/app/api/**/route.ts`. No separate server.
- **Database access** is centralized in `src/lib/db.ts` with a cached connection (Next.js hot-reload safe).
- **All secrets via env**, validated at boot in `src/lib/env.ts`, and the app refuses to start if anything is missing or malformed.
- **Auth = JWT in httpOnly cookie.** Set on `/api/auth/otp/verify`. Read in middleware and `getCurrentUser()`.
- **Privacy is a hard rule, not a feature.** The owner's phone number never leaves the server in API responses to public endpoints. All masking happens server-side.
- **WhatsApp is pluggable.** `src/lib/whatsapp.ts` exports `sendWhatsAppMessage()`, and the rest of the codebase doesn't know whether it's using Meta, Wati, or a stub.

---

## Key User Flows

| # | Flow | Routes involved |
|---|---|---|
| 1 | Shop tags | `/shop` → `/checkout` → `POST /api/orders` → `/order-success/[id]` |
| 2 | Login | `/login` → `POST /api/auth/otp/start` → `/verify` → `POST /api/auth/otp/verify` |
| 3 | Activate | scan → `/t/[uid]` (sees "not activated") → `/t/[uid]/activate` → `POST /api/tags/[uid]/activate` |
| 4 | Public scan | `/t/[uid]` → see tag profile, message owner → `POST /api/contact/message/[uid]` → owner gets WhatsApp |
| 5 | Lost mode | dashboard → toggle lost → `POST /api/tags/[id]/lost` → public page changes |

---

## Production Checklist (before launching)

- [ ] Set strong `JWT_SECRET` (≥32 random bytes).
- [ ] Use a managed MongoDB (Atlas / Railway).
- [ ] Replace in-memory rate limiter with Redis (`src/lib/rate-limit.ts` has the swap point marked).
- [ ] Get Meta WhatsApp templates approved (`qtag_otp`, `qtag_scan_alert`).
- [ ] Add Sentry for error monitoring.
- [ ] Add a real payment gateway (Safepay recommended).
- [ ] Add admin role + admin dashboard.
- [ ] Run `pnpm build` clean, with no TS errors and no ESLint errors.
- [ ] Test full flow on a real Pakistani phone with WhatsApp.

---

## License

Private project. All rights reserved.
