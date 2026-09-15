import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import Order from "./models/Order.js";
import { initSocket } from "./socket.js";
import { syncMenuDatabase } from "./services/menuSync.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET must be configured");
  await connectDB();
  // Checkout uniqueness must be enforced before accepting requests.
  await Order.init();

  // Always synchronize the curated menu against the exact database this
  // running backend is connected to. This removes the production-only
  // "Product not found" failure caused by Render pointing at a database
  // that had not been manually seeded.
  const menuSync = await syncMenuDatabase({ preserveOperationalFlags: true });
  console.log(
    `🍽️ Menu catalog verified (${menuSync.productsCreated} created, ${menuSync.productsUpdated} updated)`,
  );

  const httpServer = http.createServer(app);

  // Real-time updates (admin -> customer catalog changes, catering
  // enquiries -> admin dashboard) share the HTTP server and the same
  // CORS allow-list as the REST API.
  initSocket(httpServer, app.get("allowedOrigins"));

  httpServer.listen(PORT, () => {
    console.log(`🚀 Tripathi Restaurant API running on port ${PORT}`);
    console.log(`🔌 Real-time updates enabled via Socket.io`);
  });
};

startServer().catch((error) => {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
});
