/**
 * Central API configuration.
 *
 * All frontend code should import API_URL from here instead of
 * hardcoding "http://localhost:5000/api". In production, set
 * VITE_API_URL in your deployment environment (e.g. Vercel) to your
 * deployed backend URL, e.g. https://your-backend.onrender.com/api
 */
export const API_URL: string =
  (import.meta.env["VITE_API_URL"] as string | undefined) ||
  "http://localhost:5000/api";
