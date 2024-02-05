import express from "express";
import { userController } from "../controllers/user.controller.js";
import { isAuthenticateUser } from "../middlewares/authenticate.middleware.js";
export const userRouter = express.Router();

userRouter.post("/search-users", userController.searchUsers);
userRouter.post("/profile", userController.getUserProfile);
userRouter.post(
  "/update-profile-img",
  isAuthenticateUser,
  userController.updateProfileImage
);
userRouter.post(
  "/update-profile",
  isAuthenticateUser,
  userController.updateProfile
);
