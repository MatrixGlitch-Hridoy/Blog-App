import express from "express";
import { authController } from "../controllers/auth.controller.js";
export const authRouter = express.Router();

authRouter.post("/signup", authController.signupUser);
authRouter.post("/signin", authController.signinUser);
