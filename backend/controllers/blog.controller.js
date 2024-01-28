import { nanoid } from "nanoid";
import blogModel from "../models/blog.model.js";
import catchAsyncError from "../middlewares/catch-async-errors.js";
import ErrorHandler from "../utils/Error-handler.js";
import userModel from "../models/user.model.js";

export const blogController = {
  createBlog: catchAsyncError(async (req, res, next) => {
    try {
      const authId = req.user;
      let { title, des, banner, tags, content, draft } = req.body;
      if (!title.length) {
        return res.status(403).json({
          error: "You must provide a title ",
        });
      }
      if (!draft) {
        if (!des.length || des.length > 200) {
          return res.status(403).json({
            error: "You must provide blog description under 200 characters",
          });
        }
        if (!banner.length) {
          return res.status(403).json({
            error: "You must provide blog banner to publish the blog",
          });
        }
        if (!content.blocks) {
          return res.status(403).json({
            error: "There must be some blog content to publish it",
          });
        }
        if (!tags.length || tags.length > 10) {
          return res.status(403).json({
            error: "Provide tags in order to publish the blog, Maximum 10",
          });
        }
      }

      tags = tags.map((tag) => tag.toLowerCase());
      let blog_id =
        title
          .replace(/[^a-zA-Z0-9]/g, " ")
          .replace(/\s+/g, "-")
          .trim() + nanoid();

      const blog = await blogModel.create({
        title,
        des,
        banner,
        content,
        tags,
        author: authId,
        blog_id,
        draft: Boolean(draft),
      });
      if (blog) {
        let incrementVal = draft ? 0 : 1;
        const user = await userModel.findOneAndUpdate(
          { _id: authId },
          {
            $inc: { "account_info.total_posts": incrementVal },
            $push: { blogs: blog._id },
          }
        );
        if (!user) {
          return res
            .status(500)
            .json({ error: "Failed to update total posts number" });
        }
        res.status(201).json({
          success: true,
          message: "Blog Created",
          blog,
        });
      }
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  getLatestBlogs: catchAsyncError(async (req, res, next) => {
    const maxLimit = 5;
    try {
      const blogs = await blogModel
        .find({ draft: false })
        .populate(
          "author",
          "personal_info.profile_img personal_info.username personal_info.fullname -_id"
        )
        .sort({ publishedAt: -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .limit(maxLimit);
      return res.status(200).json({ message: "success", blogs });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
};
