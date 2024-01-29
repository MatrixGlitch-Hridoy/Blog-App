import express from "express";
import { isAuthenticateUser } from "../middlewares/authenticate.middleware.js";
import { blogController } from "../controllers/blog.controller.js";
export const blogRouter = express.Router();

blogRouter.post("/create-blog", isAuthenticateUser, blogController.createBlog);
blogRouter.post("/latest-blogs", blogController.getLatestBlogs);
blogRouter.get("/trending-blogs", blogController.getTrendingBlogs);
blogRouter.post("/search-blogs", blogController.searchBlogs);
blogRouter.post(
  "/all-latest-blogs-count",
  blogController.getAllLatestBlogsCount
);
blogRouter.post("/search-blogs-count", blogController.getSeachBlogsCount);
