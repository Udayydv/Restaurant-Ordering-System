import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket.js";
import { syncMenuDatabase } from "./services/menuSync.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

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

startServer();
