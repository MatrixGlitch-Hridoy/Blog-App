import express from "express";
import { authRouter } from "./auth.route.js";
import { blogRouter } from "./blog.route.js";
import { userRouter } from "./user.route.js";
export const router = express.Router();
router.use("/api/v1/auth", authRouter);
router.use("/api/v1/blog", blogRouter);
router.use("/api/v1/user", userRouter);
