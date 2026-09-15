# Tripathi Veg Restaurant - V9

React/TanStack Start storefront and admin panel, backed by Express, MongoDB and Socket.IO.

## Structure

- `Frontend/src/routes`: customer/admin pages and file routing.
- `Frontend/src/lib`: authentication, cart, API configuration, catalog and sockets.
- `Frontend/src/components`, `data`, `assets`: shared UI, curated menu and bundled images.
- `backend/src/routes`, `controllers`, `middleware`: REST API and access checks.
- `backend/src/models`: users, admins, products, categories, carts, addresses, orders, enquiries, feedback and settings.
- `backend/src/services`, `utils`, `config`: sessions, coupons, menu synchronization, delivery and hours.
- `backend/src/scripts`: admin provisioning and manual seeding.
- `backend/test`: integration regressions.
- `render.yaml`: backend deployment blueprint; the frontend deploys separately.

## Local setup

Validation used Node.js 24.20.0 and npm. Run `npm ci` in both `backend` and `Frontend`.

Copy each application's `.env.example` to `.env` only if the destination does not already exist. Keep existing credentials private. Configure a development MongoDB URI and a long random JWT secret.

Run `npm run dev` from `backend` in one terminal and from `Frontend` in another. Open `http://localhost:8080`. The default API is `http://localhost:5000/api`; its health endpoint is `/api/health`.

If using another hostname or port, add that exact frontend origin to backend `CORS_ORIGIN`. The backend synchronizes the menu on startup. `npm run seed-products` is an explicit reseed that can overwrite curated menu settings; normal startup does not require it.

## Environment variables

| Variable | Application | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Frontend | Full API base including `/api`; defaults to localhost:5000. Set before the production build. Public, never a secret. |
| `MONGO_URI` | Backend | Explicit connection to the intended MongoDB database. |
| `JWT_SECRET` | Backend | Required signing secret; missing values stop startup. |
| `JWT_EXPIRES_IN` | Backend | Phone-account token lifetime; default `7d`. |
| `PORT` | Backend | HTTP/Socket.IO port; default `5000`. |
| `NODE_ENV` | Backend | Development or production environment. |
| `CORS_ORIGIN` | Backend | Comma-separated frontend origins, with scheme/port and no path/trailing slash. Shared by REST and sockets. |
| `RESTAURANT_LAT`, `RESTAURANT_LNG` | Backend | Exact outlet coordinates. Existing fallback: `27.85140844, 79.95466821`. |
| `RESTAURANT_OPEN_TIME`, `RESTAURANT_CLOSE_TIME` | Backend | `HH:mm` in IST; defaults `08:00` and `22:00`. Equal values mean always open. |
| `ADMIN_PHONE` | Provisioning | Existing phone account to promote explicitly. No automatic public registration/login promotion. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Optional provisioning | Separate legacy email-admin credentials; password at least 12 characters. |
| `TEST_MONGO_URI` | Tests | Explicit local test database, described below. |

## Administrator access

For the current frontend, register a phone/password account normally. On the trusted backend host, set `ADMIN_PHONE` to that number, confirm the intended `MONGO_URI`, and run `npm run make-admin`. Sign in again and open `/admin`. Existing admin roles are preserved.

The separate legacy email-admin API remains at `/api/admin/login`. If needed, provision it with `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `npm run create-admin`. The current frontend login uses phone accounts. There are no default admin passwords.

## Validation

From `Frontend`, run `npx tsc --noEmit`, `npm run build` and `npm run lint`. The build and type check passed during repair. Normal lint still reports existing formatting violations and warnings; no bulk formatting was performed.

Integration tests require both applications' dependencies and a disposable local MongoDB instance. In PowerShell, from `backend`, choose a **fresh database name for each run**:

```powershell
$env:TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/tripathi_test_local'
npm test
```

The URI must use localhost/127.0.0.1, an explicit port, and a database named `tripathi_test_` followed by lowercase letters/underscores. Tests create synthetic records and preserve the database afterward; do not reuse a populated database. Socket tests use the frontend's existing socket.io-client dependency. Without TEST_MONGO_URI, the suite skips rather than touching the application database.

## Deployment

The checked-in Render blueprint deploys `backend`. Configure its database, secret, frontend CORS origin, outlet coordinates and hours. Startup waits for new order uniqueness indexes; the database account must be able to create indexes.

The frontend uses TanStack Start SSR through the existing Lovable Vite configuration and Nitro. The verified build generated a Cloudflare worker target. Deploy the server output and public assets using that runtime; uploading only static assets does not deploy the SSR application. Set `VITE_API_URL=https://YOUR-BACKEND/api` before building and rebuild when it changes. The localhost fallback would call each visitor's own computer.

Delivery requires location permission through the existing Current Location control and HTTPS on the deployed frontend. Pickup remains available for restaurant orders. UPI on delivery is collected offline; there is no online payment gateway.

See [PROJECT_FIX_REPORT.md](PROJECT_FIX_REPORT.md) for every repair and the remaining limitations. Older production/growth reports describe earlier snapshots and do not establish current deployment readiness.
