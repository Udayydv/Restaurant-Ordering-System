import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminCategoryRoutes from "./routes/adminCategoryRoutes.js";
import adminCustomerRoutes from "./routes/adminCustomerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cateringRoutes from "./routes/cateringRoutes.js";
import adminCateringRoutes from "./routes/adminCateringRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";


const app = express();

app.use(helmet());

// CORS_ORIGIN in .env should be a comma-separated list of allowed
// frontend origins, e.g.:
//   CORS_ORIGIN=http://localhost:8080,https://your-frontend.vercel.app
// Falls back to common local dev ports if not set, so local
// development keeps working without any .env changes.
const defaultDevOrigins = [
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:3000",
];

const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins =
  configuredOrigins.length > 0 ? configuredOrigins : defaultDevOrigins;

// Exported so server.js can reuse the exact same allow-list when
// initializing Socket.io (real-time updates share the CORS policy
// with the REST API).
app.set("allowedOrigins", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header) such as
      // health checks or curl.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/catering", cateringRoutes);
app.use("/api/admin/catering", adminCateringRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);



app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Tripathi Restaurant API is running",
  });
});

export default app;