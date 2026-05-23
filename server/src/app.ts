import express from "express";
import { tenantContextMiddleware } from "./middleware/tenant-context.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(tenantContextMiddleware);
  app.use("/api", apiRouter);
  return app;
}
