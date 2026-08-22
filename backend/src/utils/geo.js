import {
  RESTAURANT_LOCATION,
  DELIVERY_FEE_SLABS,
  MAX_DELIVERY_DISTANCE_KM,
} from "../config/restaurant.js";

const EARTH_RADIUS_KM = 6371;

const toRad = (deg) => (deg * Math.PI) / 180;

/*
 * Great-circle distance between two lat/lng points, in kilometres.
 * Standard haversine formula.
 */
export const distanceKm = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((EARTH_RADIUS_KM * c).toFixed(2));
};

export const distanceFromRestaurantKm = (latitude, longitude) => {
  return distanceKm(
    RESTAURANT_LOCATION.latitude,
    RESTAURANT_LOCATION.longitude,
    latitude,
    longitude
  );
};

/*
 * Applies the distance-based delivery fee slabs:
 *   0–3 km  -> ₹5
 *   3–7 km  -> ₹15
 *   7–10 km -> ₹30
 *   >10 km  -> not deliverable (returns null)
 */
export const calculateDeliveryFee = (km) => {
  if (km === null || km === undefined || Number.isNaN(km)) {
    return null;
  }

  if (km > MAX_DELIVERY_DISTANCE_KM) {
    return null;
  }

  for (const slab of DELIVERY_FEE_SLABS) {
    if (km <= slab.upTo) {
      return slab.fee;
    }
  }

  return null;
};

/*
 * Convenience helper: given raw coordinates, return both the distance
 * from the restaurant and the resulting delivery fee (or null if out
 * of range).
 */
export const getDeliveryQuote = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return { distanceKm: null, deliveryFee: null, deliverable: false };
  }

  const km = distanceFromRestaurantKm(lat, lng);
  const fee = calculateDeliveryFee(km);

  return {
    distanceKm: km,
    deliveryFee: fee,
    deliverable: fee !== null,
  };
};
