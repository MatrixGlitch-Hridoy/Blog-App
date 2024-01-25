import express from "express";
import "dotenv/config";
import cors from "cors";
import ErrorMiddleWare from "./middlewares/error.js";
import { router } from "./routes/index.js";
export const app = express();

// Body Parser
app.use(express.json({ limit: "50mb" }));
// Cors
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

// Routes
app.use(router);

// Health Check
app.get("/health-check", (_req, res, _next) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error.message;
    res.status(503).send();
  }
});

// Invalid Url
app.all("*", (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

app.use(ErrorMiddleWare);
