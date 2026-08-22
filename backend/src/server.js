import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

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
