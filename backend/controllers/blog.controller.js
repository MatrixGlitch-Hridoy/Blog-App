import { nanoid } from "nanoid";
import blogModel from "../models/blog.model.js";
import catchAsyncError from "../middlewares/catch-async-errors.js";
import ErrorHandler from "../utils/Error-handler.js";
import userModel from "../models/user.model.js";
import notificationModel from "../models/notification.model.js";
import commentModel from "../models/comment.model.js";

export const blogController = {
  createBlog: catchAsyncError(async (req, res, next) => {
    try {
      const authId = req.user;
      let { title, des, banner, tags, content, draft, id } = req.body;
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
        id ||
        title
          .replace(/[^a-zA-Z0-9]/g, " ")
          .replace(/\s+/g, "-")
          .trim() + nanoid();

      if (id) {
        const blog = await blogModel.findOneAndUpdate(
          { blog_id },
          { title, des, banner, content, tags, draft: draft ? draft : false }
        );
        res.status(200).json({ message: "Blog Updated", id: blog_id, blog });
      } else {
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
      }
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  getLatestBlogs: catchAsyncError(async (req, res, next) => {
    const { page } = req.body;
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
        .skip((page - 1) * maxLimit)
        .limit(maxLimit);
      return res.status(200).json({ message: "success", blogs });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  getTrendingBlogs: catchAsyncError(async (req, res, next) => {
    const maxLimit = 5;
    try {
      const blogs = await blogModel
        .find({ draft: false })
        .populate(
          "author",
          "personal_info.profile_img personal_info.username personal_info.fullname -_id"
        )
        .sort({
          "activity.total_read": -1,
          "activity.total_likes": -1,
          publishedAt: -1,
        })
        .select("blog_id title  publishedAt -_id")
        .limit(maxLimit);
      return res.status(200).json({ message: "success", blogs });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  searchBlogs: catchAsyncError(async (req, res, next) => {
    const { tag, query, author, page, limit, eliminate_blog } = req.body;
    let findQuery;
    if (tag) {
      findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    } else if (query) {
      findQuery = { title: new RegExp(query, "i"), draft: false };
    } else if (author) {
      findQuery = { author, draft: false };
    }
    const maxLimit = limit ? limit : 5;
    try {
      const blogs = await blogModel
        .find(findQuery)
        .populate(
          "author",
          "personal_info.profile_img personal_info.username personal_info.fullname -_id"
        )
        .sort({ publishedAt: -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit);
      return res.status(200).json({ message: "success", blogs });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  getSeachBlogsCount: catchAsyncError(async (req, res, next) => {
    const { tag, query, author } = req.body;
    let findQuery;
    if (tag) {
      findQuery = { tags: tag, draft: false };
    } else if (query) {
      findQuery = { title: new RegExp(query, "i"), draft: false };
    } else if (author) {
      findQuery = { author, draft: false };
    }
    try {
      const count = await blogModel.countDocuments(findQuery);
      return res.status(200).json({ message: "success", totalDocs: count });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  getAllLatestBlogsCount: catchAsyncError(async (req, res, next) => {
    try {
      const count = await blogModel.countDocuments({ draft: false });
      return res.status(200).json({ message: "success", totalDocs: count });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  getBlogById: catchAsyncError(async (req, res, next) => {
    const { blog_id, draft, mode } = req.body;
    const incrementVal = mode !== "edit" ? 1 : 0;
    try {
      const blog = await blogModel
        .findOneAndUpdate(
          { blog_id },
          { $inc: { "activity.total_reads": incrementVal } }
        )
        .populate(
          "author",
          "personal_info.fullname personal_info.username personal_info.profile_img"
        )
        .select("title des content banner activity publishedAt blog_id tags");
      if (blog) {
        await userModel.findOneAndUpdate(
          { "personal_info.username": blog.author.personal_info.username },
          { $inc: { "account_info.total_reads": incrementVal } }
        );
        if (blog.draft && !draft) {
          return res
            .status(500)
            .json({ error: "You can not access draft blog" });
        }
        return res.status(200).json({ blog });
      }
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  likeBlog: catchAsyncError(async (req, res, next) => {
    const authId = req.user;
    const { _id, isLikedByUser } = req.body;
    const incrementVal = !isLikedByUser ? 1 : -1;

    try {
      const blog = await blogModel.findOneAndUpdate(
        { _id },
        { $inc: { "activity.total_likes": incrementVal } }
      );
      if (blog) {
        if (!isLikedByUser) {
          await notificationModel.create({
            type: "like",
            blog: _id,
            notification_for: blog.author,
            user: authId,
          });
          return res.status(200).json({ liked_by_user: true });
        } else {
          await notificationModel.findOneAndDelete({
            user: authId,
            blog: _id,
            type: "like",
          });
          return res.status(200).json({ liked_by_user: false });
        }
      }
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  isBlogLikedByUser: catchAsyncError(async (req, res, next) => {
    const authId = req.user;
    const { _id } = req.body;
    try {
      const result = await notificationModel.exists({
        user: authId,
        type: "like",
        blog: _id,
      });
      return res.status(200).json({ result });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  manageBlogs: catchAsyncError(async (req, res, next) => {
    const authId = req.user;
    const { page, draft, query, deleteDocCount } = req.body;
    const maxLimit = 5;
    let skipDocs = (page - 1) * maxLimit;
    if (deleteDocCount) {
      skipDocs -= deleteDocCount;
    }
    try {
      const blogs = await blogModel
        .find({
          author: authId,
          draft,
          title: new RegExp(query, "i"),
        })
        .skip(skipDocs)
        .limit(maxLimit)
        .sort({ publishedAt: -1 })
        .select("title banner publishedAt blog_id activity des draft -_id");
      if (blogs) {
        return res.status(200).json({ blogs });
      }
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  manageBlogsCount: catchAsyncError(async (req, res, next) => {
    const authId = req.user;
    const { draft, query } = req.body;
    try {
      const count = await blogModel.countDocuments({
        author: authId,
        draft,
        title: new RegExp(query, "i"),
      });
      return res.status(200).json({ totalDocs: count });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  deleteBlog: catchAsyncError(async (req, res, next) => {
    const authId = req.user;
    const { blog_id } = req.body;
    try {
      const blog = await blogModel.findOneAndDelete({ blog_id });
      if (blog) {
        await notificationModel.deleteMany({ blog: blog._id });
        await commentModel.deleteMany({ blog_id: blog._id });
        await userModel.findOneAndUpdate(
          { _id: authId },
          {
            $pull: { blog: blog._id },
            $inc: { "account_info.total_posts": blog.draft ? 0 : -1 },
          }
        );
        return res.status(200).json({ status: "done" });
      }
    } catch (err) {
      console.log(err);
      return next(new ErrorHandler(err.message, 500));
    }
  }),
};
