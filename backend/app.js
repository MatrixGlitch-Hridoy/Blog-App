import express from "express";
import "dotenv/config";
import cors from "cors";
import ErrorMiddleWare from "./middlewares/error.js";
import { router } from "./routes/index.js";
import admin from "firebase-admin";
import serviceAccountKey from "./blog-app-7f6d1-firebase-adminsdk-p4qbw-bc7878f506.json" assert { type: "json" };
export const app = express();

// Body Parser
app.use(express.json({ limit: "50mb" }));
// Cors
app.use(cors());

// Routes
app.use(router);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

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
