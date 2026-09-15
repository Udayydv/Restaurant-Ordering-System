/*
 * Single source of truth for the restaurant's physical location and
 * delivery pricing rules. Coordinates are configurable via env vars
 * so this can be pointed at the real outlet location without a code
 * change.
 */

export const RESTAURANT_LOCATION = {
  // Fallback is centered in Adarsh Nagar Colony, Roza (the restaurant's
  // configured locality) instead of the old Varanasi placeholder. For the
  // strict 3 km Sip n Scoop boundary, set RESTAURANT_LAT / RESTAURANT_LNG
  // on Render to the exact entrance pin of the restaurant.
  latitude: Number(process.env.RESTAURANT_LAT) || 27.85140844,
  longitude: Number(process.env.RESTAURANT_LNG) || 79.95466821,
};

// Distance (km, upper bound inclusive) -> flat delivery fee (INR).
// Ordered ascending; the first slab whose `upTo` the distance falls
// within is used.
export const DELIVERY_FEE_SLABS = [
  { upTo: 3, fee: 5 },
  { upTo: 7, fee: 15 },
  { upTo: 10, fee: 30 },
];

// Beyond the last slab we don't deliver at all.
export const MAX_DELIVERY_DISTANCE_KM = 10;
