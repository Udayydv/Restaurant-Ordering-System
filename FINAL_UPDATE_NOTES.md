# Final Sip n Scoop + Restaurant Dual-Flow Update

Implemented in this package:

- Separate Restaurant and Sip n Scoop carts can coexist without deleting one another.
- Restaurant checkout remains `/checkout`; Sip n Scoop uses `/sip-n-scoop/checkout`.
- Sip n Scoop is delivery-only, flat ₹10, and the backend enforces the 3 km radius.
- `Use current location` requests high-accuracy GPS and auto-fills the address through a backend reverse-geocoding endpoint.
- Backend order records now include `orderType`, delivery distance, and delivery coordinates snapshot.
- Sip n Scoop order numbers use `SNS-...`; restaurant orders use `TRP-...`.
- Admin orders display Sip n Scoop prominently and can filter All / Restaurant / Sip n Scoop.
- Sip n Scoop status wording uses Accepted / Packing in the admin order card while keeping compatible backend status values.
- Admin products can filter All / Restaurant / Sip n Scoop; existing CRUD, availability toggle, soft-delete and price/image editing remain intact.
- Customer order history labels Restaurant vs Sip n Scoop.
- Cross-selling prompts were added between restaurant and Sip n Scoop checkout/confirmation flows.
- Catalog loading retries slow backend wake-up and displays a real retry error instead of misleading `0 items`.
- JSON responses are validated so an HTML `<!DOCTYPE ...>` response produces a useful deployment/API error instead of `Unexpected token <`.
- Production API fallback points to `https://tripathi-restaurant-backend.onrender.com/api`; still set `VITE_API_URL` explicitly in Vercel.
- Sip n Scoop seedVersion was increased to 10 so Render startup refreshes older production Sip n Scoop records once.

Validation completed here:

- Frontend TypeScript: `npx tsc --noEmit` passed.
- Backend JavaScript syntax checks passed.
- Sip n Scoop catalog contains 81 products and all are seedVersion 10.

A full Vite production build could not be completed in the Linux workspace because the uploaded ZIP contained Windows-native node_modules and reinstalling all dependencies exceeded the workspace time limit. Run `npm install` and `npm run build` on your Windows machine before pushing.
