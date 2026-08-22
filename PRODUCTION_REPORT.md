# Tripathi Eats Now — Production Integration Report

UI was not touched anywhere — every change below is backend logic, data,
or non-visual frontend logic (API calls, request payloads).

## 1. Files changed

**Backend**
- `backend/src/models/user.js` → renamed to `User.js` (case-sensitivity bug, see §3)
- `backend/src/controllers/adminDashboardController.js` — fixed import casing
- `backend/src/models/Product.js` — added `slug` field
- `backend/src/models/Order.js` — added `orderMode`, address now conditionally required, `paymentMethod` enum extended to `cod`/`upi`
- `backend/src/models/Otp.js` — TTL index on `expiresAt` (auto-cleanup)
- `backend/src/controllers/cartController.js` — resolves product by real ID *or* slug (root cause fix, see §3)
- `backend/src/controllers/orderController.js` — pickup support, UPI support, address only required for delivery
- `backend/src/controllers/authController.js` — sends OTP via real SMS provider instead of console-only
- `backend/src/routes/authRoutes.js` — added per-IP rate limiting on OTP endpoints
- `backend/src/app.js` — CORS origins now driven by `CORS_ORIGIN` env var; removed a stray leaked-looking comment
- `backend/package.json` — added `seed-products` script
- `backend/.env.example`, `backend/.gitignore`

**Frontend**
- `src/lib/api-config.ts` — **new**, centralizes `API_URL`
- `src/lib/cart.tsx`, `src/lib/auth.tsx`, `src/routes/checkout.tsx`, `src/routes/admin/{orders,customers,products,categories,index}.tsx` — now import `API_URL` instead of hardcoding `localhost:5000`
- `src/routes/checkout.tsx` — pickup orders no longer blocked; sends `orderMode` to the order API; only creates an address for delivery orders
- `.env.example` — **new**
- `.gitignore` — now ignores `.env*`

**New backend files**
- `backend/src/services/smsService.js` — real OTP SMS provider (2Factor / MSG91)
- `backend/src/scripts/seedProducts.js` — migrates the real menu into MongoDB
- `backend/src/seed-data/products.json` (62 items), `categories.json` (13 categories)

**Deployment**
- `render.yaml` — **new**, Render blueprint for the backend

I verified every change with real tooling, not just by reading: `node --check` on every modified backend file, a live `import()` smoke test of `app.js` (confirms all modules — including the renamed `User.js` — actually resolve), `tsc --noEmit` across the whole frontend (0 errors), and `eslint` on every touched frontend file (0 new errors — the only findings were pre-existing issues in code I didn't touch).

## 2. Root causes fixed (not papered over)

**"Unable to add product to cart"** — the frontend menu (`src/data/menu.ts`) is a static list with string slugs like `"shahi-paneer"`. The backend cart required a real MongoDB ObjectId. Sending a slug caused a Mongoose CastError → generic 500. Fixed by adding a `slug` field to `Product` and resolving either an ObjectId or a slug in the cart controller — **zero frontend/UI changes needed**, since once you run the seed script, those slugs exist as real products.

**Deploy-breaking bug** — `authMiddleware.js` and others imported `../models/User.js` (capital U), but the file was `user.js`. This works by accident on case-insensitive filesystems (Windows/Mac) and **fails completely on Linux** (Render, this sandbox, any real host) — the server wouldn't start. Fixed by renaming the file.

## 3. Known limitation (flagged, not hidden)

17 of the 76 menu items have a 3rd/4th price tier ("Family"/"Quarter") in the frontend. The existing admin product form only has fields for regular/half/full — extending it would mean touching the admin UI, which you said not to do. I kept half/full for those 17 items and dropped the extra tier during seeding. Full list is in the comments of `seedProducts.js`. If you want those tiers back later, it's a small, contained addition to the admin form.

14 "Call for price" dishes were correctly **not** seeded — the frontend already disables "Add to cart" for those.

## 4. Deployment — one correction to your plan

This isn't a plain Vite SPA — it's built on **TanStack Start (SSR)** via Lovable's config, which defaults to a **Cloudflare** (Nitro) target, not a static build. Deploying the frontend to Vercel as-is won't work the way it would for a plain React SPA; Vercel would need the Nitro output configured for its runtime, which isn't set up here. Two realistic paths, in order of least effort:

1. **Use Lovable's own Publish/Deploy** — this project was scaffolded by Lovable specifically for this kind of deployment; simplest by far.
2. **Cloudflare Pages/Workers via Wrangler** — already the default Nitro target for this project (you have `.wrangler`/`.output` locally), so this is "reuse existing architecture" rather than a new setup.

Backend deploys fine to Render as originally planned — `render.yaml` is included. MongoDB Atlas needs no code changes; `MONGO_URI` already works with any `mongodb+srv://` string.

## 5. Environment variables

**Backend** (`backend/.env`, see `.env.example`):
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/TripathiRestaurant
JWT_SECRET=<32+ random chars>
JWT_EXPIRES_IN=7d
ADMIN_PHONE=9999999999
OTP_PROVIDER=            # 2factor | msg91 | (blank = console OTP, dev only)
OTP_API_KEY=
OTP_SENDER_ID=
OTP_TEMPLATE_ID=
CORS_ORIGIN=              # comma-separated, prod only
```

**Frontend** (`.env` or `.env.local`, see `.env.example`):
```
VITE_API_URL=http://localhost:5000/api
```

## 6. MongoDB Atlas setup

1. [cloud.mongodb.com](https://cloud.mongodb.com) → create a free (M0) cluster.
2. Database Access → add a database user with a strong password.
3. Network Access → add `0.0.0.0/0` for now (or Render's static IPs once deployed), tighten later.
4. Connect → Drivers → copy the `mongodb+srv://...` string → paste as `MONGO_URI` (URL-encode any special characters in the password).
5. Collections are created automatically by Mongoose on first write — no manual setup needed.

## 7. Real OTP setup (2Factor — recommended, simplest for India)

1. Sign up at [2factor.in](https://2factor.in), get your API key.
2. Register a **DLT-approved SMS template** (mandatory by Indian telecom regulation for transactional SMS — 2Factor's dashboard walks you through this; it takes a form like `Your OTP for Tripathi Veg Restaurant is {#var#}`).
3. Set in `backend/.env`:
   ```
   OTP_PROVIDER=2factor
   OTP_API_KEY=your_key
   OTP_TEMPLATE_ID=your_approved_template_name
   ```
4. Restart the backend. `/api/auth/request-otp` will now send real SMS.

MSG91 is supported identically (`OTP_PROVIDER=msg91`, plus `OTP_SENDER_ID`) if you prefer it. Without `OTP_PROVIDER` set, OTPs print to the server console — this only works when `NODE_ENV` is not `production`, so you can't accidentally ship without real SMS.

## 8. Running locally

**Backend:**
```bash
cd backend
npm install
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, ADMIN_PHONE at minimum
npm run seed-products      # loads the real menu into MongoDB
npm start
```

**Frontend:**
```bash
cp .env.example .env       # defaults to localhost:5000/api, fine for local dev
npm install
npm run dev
```

## 9. Creating an admin

Simplest path: set `ADMIN_PHONE=<your 10-digit number>` in `backend/.env` before first login. The first time that number logs in through the normal OTP flow, it's automatically granted `role: "admin"`.

## 10. Testing checklist

- **OTP**: request OTP on your `ADMIN_PHONE` number → real SMS should arrive (or console log in dev mode) → verify → confirm `/api/auth/me` returns `role: "admin"`. Try a wrong OTP (should reject), wait for expiry (5 min), and fire >10 requests in 15 min from one IP (should rate-limit).
- **Cart**: after seeding, add a dish from the menu page → should succeed (previously failed here). Refresh the page → cart persists (backend-synced for logged-in users).
- **Checkout**: place a **delivery** order (needs address + pincode) and a **pickup** order (should no longer be blocked) — confirm both create successfully and delivery charge is ₹5 for delivery, ₹0 for pickup.
- **Admin**: log in with `ADMIN_PHONE`, confirm dashboard stats load, orders list shows the orders you just placed, order status can be changed, products/categories CRUD works.
- **Authorization**: log in with a *non*-admin phone number, confirm hitting any `/api/admin/*` endpoint returns 403.

## 11. Remaining/open items

- I could not run a live end-to-end test (no live MongoDB/network in this environment) — I verified module resolution, syntax, types, and lint instead. Please run through §10 once you have Atlas + OTP credentials in place.
- The Family/Quarter price-tier limitation in §3.
- Admin dashboard: verified — `adminDashboardController.js`'s response shape (`totalOrders`, `pendingOrders`, `totalCustomers`, `totalRevenue`, `todayOrders`, `todayRevenue`) matches exactly what `admin/index.tsx` reads. This one is confirmed wired correctly, just needs live data to display.
