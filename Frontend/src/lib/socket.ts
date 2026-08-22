import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/lib/api-config";

/*
 * Socket.io needs the bare server origin, not the /api-prefixed REST
 * base URL — strip a trailing "/api" if present.
 */
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

let socket: Socket | null = null;

/*
 * Lazily creates (or returns) a single shared Socket.io connection for
 * the whole app. Used for real-time catalog updates (new/updated
 * products & categories), admin order/catering notifications, and
 * live order-status pushes to the customer who placed the order.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      withCredentials: true,
    });
  }

  return socket;
}
