import express from "express";
import { authController } from "../controllers/auth.controller.js";
import { isAuthenticateUser } from "../middlewares/authenticate.middleware.js";
export const authRouter = express.Router();

authRouter.post("/signup", authController.signupUser);
authRouter.post("/signin", authController.signinUser);
authRouter.post("/google-auth", authController.signinWithGoogle);
authRouter.post(
  "/change-password",
  isAuthenticateUser,
  authController.changePassword
);
