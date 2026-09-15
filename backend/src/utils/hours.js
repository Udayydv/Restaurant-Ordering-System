/*
 * Restaurant operating hours, checked against IST (Indian Standard
 * Time, UTC+5:30) explicitly — not the server's local timezone —
 * since Render/most hosts run servers in UTC and we never want the
 * "open" check to silently drift by hours depending on where the
 * server happens to be deployed.
 */

const IST_OFFSET_MINUTES = 5.5 * 60;

const parseTimeToMinutes = (value, fallbackMinutes) => {
  if (!value || typeof value !== "string") return fallbackMinutes;

  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());

  if (!match) return fallbackMinutes;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return fallbackMinutes;
  }

  return hours * 60 + minutes;
};

export const getOperatingHours = () => ({
  openTime: process.env.RESTAURANT_OPEN_TIME || "08:00",
  closeTime: process.env.RESTAURANT_CLOSE_TIME || "22:00",
});

const getNowInISTMinutes = () => {
  const now = new Date();

  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  return (utcMinutes + IST_OFFSET_MINUTES) % (24 * 60);
};

/*
 * Returns whether the restaurant is currently open, based on the
 * configured open/close time. Handles the normal same-day case
 * (e.g. 08:00-22:30); also correctly handles an overnight window
 * (e.g. 18:00-02:00) should that ever be configured.
 */
export const isRestaurantOpenNow = () => {
  const { openTime, closeTime } = getOperatingHours();

  const openMinutes = parseTimeToMinutes(openTime, 8 * 60);
  const closeMinutes = parseTimeToMinutes(closeTime, 22 * 60);
  const nowMinutes = getNowInISTMinutes();

  if (openMinutes === closeMinutes) {
    // Configured as always-open.
    return true;
  }

  if (openMinutes < closeMinutes) {
    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  }

  // Overnight window (open time is after close time, e.g. 18:00-02:00)
  return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
};
