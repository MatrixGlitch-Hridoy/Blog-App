import express from "express";
import { isAuthenticateUser } from "../middlewares/authenticate.middleware.js";
import { blogController } from "../controllers/blog.controller.js";
export const blogRouter = express.Router();

blogRouter.post("/create-blog", isAuthenticateUser, blogController.createBlog);
