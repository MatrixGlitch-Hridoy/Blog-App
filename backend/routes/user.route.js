import express from "express";
import { userController } from "../controllers/user.controller.js";
export const userRouter = express.Router();

userRouter.post("/search-users", userController.searchUsers);
userRouter.post("/profile", userController.getUserProfile);
