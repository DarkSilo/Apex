import express from "express";
import cors from "cors";
import helmet from "helmet";

import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import memberRoutes from "./routes/member.routes";
import inventoryRoutes from "./routes/inventory.routes";
import sessionRoutes from "./routes/session.routes";
import paymentRoutes from "./routes/payment.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;