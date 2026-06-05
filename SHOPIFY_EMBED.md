# Shopify embed mode

> **Full system documentation:** see [QTAG_SYSTEM_GUIDE.md](./QTAG_SYSTEM_GUIDE.md) for the complete flow, `isPhoneNumberAllow`, WhatsApp relay, APIs, dev testing, and file map.

The app is trimmed for **Shopify iframe / external links**: login, activate, **public scan**, WhatsApp/message contact relay, and dev test lab. Shop, dashboard, and orders stay disabled.

## Active routes

| URL | Purpose |
|-----|---------|
| `/login` | Phone OTP start |
| `/verify` | OTP verify |
| `/dev/qr` | **Dev only** — test QR per category |
| `/t/{uid}` | **Primary QR** — router: PRINTED → not-active UI or activate; ACTIVE → contact page |
| `/scan/{uid}` | Same router as `/t/{uid}` |
| `/t/{uid}/activate` | Owner activation (auth required) |
| `/api/auth/*` | Auth |
| `/api/activate/{uid}` | Save activation |
| `/api/contact/message/{uid}` | Finder → owner relay (company WhatsApp when phone hidden) |
| `/api/scans` | Scan beacon |
| `/api/dev/test-tags` | **Dev only** — seed/reset test tags |

## QR on stickers (production)

Encode the **router URL**, not `/activate`:

```
https://YOUR_QTAG_HOST/t/TAG_UID_HERE
```

Flow:

1. **First scan (PRINTED)** — finder sees “not active”; owner signs in and activates.
2. **Later scans (ACTIVE)** — finder sees masked contact, WhatsApp (if owner allowed), and message relay.

Direct activate link (optional, e.g. post-purchase email):

```
https://YOUR_QTAG_HOST/login?next=/t/TAG_UID_HERE/activate
```

## LAN / phone testing (development)

In `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://YOUR_LAN_IP:3000
NEXT_PUBLIC_QR_BASE_URL=http://YOUR_LAN_IP:3000
OTP_TEST_EXPOSE_CODE=true
```

Run `npm run dev` (binds `0.0.0.0`). After login you land on `/dev/qr` with one QR per category.

Dev test tag UIDs: `devar7kp`, `devpet7k`, `devbag7k`, `devhme7k`, `devbyb7k`.

Set `NEXT_PUBLIC_COMPANY_CONTACT_PHONE=03261548853` for relay message copy.

## Restore full app

In `src/lib/shopify-embed.ts`:

```ts
export const SHOPIFY_EMBED_MODE = false;
```

Re-enable full chrome in `src/app/layout.tsx` and remove API 503 guards on shop/orders routes.

## Still disabled in embed mode

- Shop, checkout, dashboard, orders UI, payments
- Tag management APIs (`/api/tags`, `/api/orders`, …) return 503
