import express from "express";
import { isAuthenticateUser } from "../middlewares/authenticate.middleware.js";
import { notificationController } from "../controllers/notification.controller.js";
export const notificationRouter = express.Router();

notificationRouter.get(
  "/new-notification",
  isAuthenticateUser,
  notificationController.getNewNotification
);
notificationRouter.post(
  "/notifications",
  isAuthenticateUser,
  notificationController.getNotifications
);
notificationRouter.post(
  "/all-notifications-count",
  isAuthenticateUser,
  notificationController.getNotificationCount
);
