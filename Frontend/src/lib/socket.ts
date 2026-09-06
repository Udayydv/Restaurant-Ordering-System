import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/lib/api-config";

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

let socket: Socket | null = null;
let adminToken: string | null = null;
let adminLifecycleBound = false;

function joinAdminRoom() {
  if (!socket || !socket.connected || !adminToken) return;

  socket.emit(
    "join:admin",
    adminToken,
    (result?: { success?: boolean }) => {
      if (!result?.success) {
        console.error("Unable to join admin notification room");
      }
    },
  );
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      // Render/proxy WebSocket upgrades were intermittently closing before
      // establishment. Socket.io HTTP long-polling is still push-based and
      // real-time, but avoids that fragile upgrade path for this small admin
      // dashboard. Durable REST reconciliation remains the final fallback.
      transports: ["polling"],
      upgrade: false,
      autoConnect: true,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }

  return socket;
}

/**
 * Keeps one authenticated admin-room membership attached to the shared socket.
 * Individual admin pages must NOT emit leave:admin when they unmount because
 * every page shares this same Socket.io connection.
 */
export function ensureAdminSocketRoom(token: string) {
  adminToken = token;
  const currentSocket = getSocket();

  if (!adminLifecycleBound) {
    currentSocket.on("connect", joinAdminRoom);
    adminLifecycleBound = true;
  }

  joinAdminRoom();
}

/** Only call when the actual admin logs out, not when an admin route changes. */
export function clearAdminSocketRoom() {
  adminToken = null;
  if (socket?.connected) {
    socket.emit("leave:admin");
  }
}
