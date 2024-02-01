import express from "express";
import { commentController } from "../controllers/comment.controller.js";
import { isAuthenticateUser } from "../middlewares/authenticate.middleware.js";
export const commentRouter = express.Router();

commentRouter.post(
  "/add-comment",
  isAuthenticateUser,
  commentController.createComment
);
commentRouter.post("/get-comments", commentController.getComments);
commentRouter.post("/get-replies", commentController.getReplies);
commentRouter.post(
  "/delete-comments",
  isAuthenticateUser,
  commentController.deleteComments
);
