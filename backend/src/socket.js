import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

/*
 * Initializes a single Socket.io server attached to the same HTTP
 * server Express is using. Call once from server.js.
 */
export const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Admin dashboards join a dedicated room so we can broadcast
    // admin-only events (like new orders and catering enquiries)
    // without leaking them to every connected customer.
    socket.on("join:admin", () => {
      socket.join("admin-room");
    });

    socket.on("leave:admin", () => {
      socket.leave("admin-room");
    });

    // Customers join a room scoped to their own account so we can
    // push them live order-status updates. The JWT is verified here
    // (not just trusted at face value) so one customer can't join
    // another customer's room by guessing their user id.
    socket.on("join:user", (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.join(`user-${decoded.userId}`);
      } catch {
        // Invalid/expired token — silently ignore, no room joined.
      }
    });
  });

  return io;
};

/*
 * Returns the shared io instance. Safe to call from anywhere after
 * initSocket() has run; returns null (no-op) if sockets aren't
 * initialized yet, e.g. during tests.
 */
export const getIO = () => io;

/*
 * Broadcast helpers. These no-op silently if sockets haven't been
 * initialized, so controllers never need to null-check.
 */
export const emitToCustomers = (event, payload) => {
  if (!io) return;
  io.emit(event, payload);
};

export const emitToAdmins = (event, payload) => {
  if (!io) return;
  io.to("admin-room").emit(event, payload);
};

export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user-${userId}`).emit(event, payload);
};
