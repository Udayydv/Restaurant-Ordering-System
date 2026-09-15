# Sip n Scoop V10 changes

This build adds a separate Sip n Scoop checkout and keeps restaurant/Sip n Scoop carts side-by-side in the same browser account. It also hardens production API JSON parsing, retries slow catalog loads, adds a production Render API fallback, moves reverse geocoding behind the backend, enforces high-accuracy browser GPS, keeps the authoritative 3 km/₹10 rule on the backend, labels Sip n Scoop orders in admin/customer order history, adds admin order/product filters, and adds cross-sell prompts between restaurant and Sip n Scoop.

Sip n Scoop seedVersion is now 10 so Render startup re-applies the current Sip n Scoop catalog once against older production records while preserving later admin edits after the migration.

## Deployment variables

Vercel/Frontend should still explicitly set `VITE_API_URL=https://tripathi-restaurant-backend.onrender.com/api` (or your actual Render backend URL). The code now has that Render service URL as a production fallback, but an explicit environment variable is preferred.

Render/Backend must set `CORS_ORIGIN` to the deployed frontend origin(s), comma-separated, and should set exact `RESTAURANT_LAT`/`RESTAURANT_LNG` for the restaurant entrance pin.
