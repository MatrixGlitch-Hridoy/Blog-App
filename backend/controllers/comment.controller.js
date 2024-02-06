import catchAsyncError from "../middlewares/catch-async-errors.js";
import blogModel from "../models/blog.model.js";
import commentModel from "../models/comment.model.js";
import notificationModel from "../models/notification.model.js";
import ErrorHandler from "../utils/Error-handler.js";
const deleteComments = (_id) => {
  commentModel
    .findOneAndDelete({ _id })
    .then((comment) => {
      if (comment.parent) {
        commentModel
          .findOneAndUpdate(
            { _id: comment.parent },
            { $pull: { children: _id } }
          )
          .then((data) => console.log("comment delete from parent"))
          .catch((err) => console.log(err));
      }
      notificationModel
        .findOneAndDelete({ comment: _id })
        .then((notification) => console.log("comment notification deleted"));
      notificationModel
        .findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } })
        .then((notification) => console.log("reply notification deleted"));
      blogModel
        .findOneAndUpdate(
          { _id: comment.blog_id },
          {
            $pull: { comments: _id },
            $inc: { "activity.total_comments": -1 },
            "activity.total_parent_comments": comment.parent ? 0 : -1,
          }
        )
        .then((blog) => {
          if (comment.children.length) {
            comment.children.map((replies) => {
              deleteComments(replies);
            });
          }
        });
    })
    .catch((err) => {
      return next(new ErrorHandler(err.message, 500));
    });
};
export const commentController = {
  createComment: catchAsyncError(async (req, res, next) => {
    const authId = req.user;
    const { _id, comment, blog_author, replying_to, notification_id } =
      req.body;
    let commentObj = {
      blog_id: _id,
      blog_author,
      comment,
      commented_by: authId,
    };
    if (replying_to) {
      commentObj.parent = replying_to;
      commentObj.isReply = true;
    }
    try {
      if (!comment.length) {
        return res
          .status(403)
          .json({ error: "Write something to leave a comment" });
      }
      const commentFile = await commentModel.create(commentObj);
      if (commentFile) {
        const { comment, commentedAt, children } = commentFile;
        await blogModel.findOneAndUpdate(
          { _id },
          {
            $push: { comments: commentFile._id },
            $inc: {
              "activity.total_comments": 1,
              "activity.total_parent_comments": replying_to ? 0 : 1,
            },
          }
        );
        let notificationObj = {
          type: replying_to ? "reply" : "comment",
          blog: _id,
          notification_for: blog_author,
          user: authId,
          comment: commentFile._id,
        };
        if (replying_to) {
          notificationObj.replied_on_comment = replying_to;
          const replyingToCommentDoc = await commentModel.findOneAndUpdate(
            { _id: replying_to },
            { $push: { children: commentFile._id } }
          );
          if (replyingToCommentDoc) {
            notificationObj.notification_for =
              replyingToCommentDoc.commented_by;
          }
          if (notification_id) {
            await notificationModel.findOneAndUpdate(
              { _id: notification_id },
              { reply: commentFile._id }
            );
          }
        }
        await notificationModel.create(notificationObj);
        res.status(200).json({
          comment,
          commentedAt,
          _id: commentFile._id,
          authId,
          children,
        });
      }
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  getComments: catchAsyncError(async (req, res, next) => {
    const { blog_id, skip } = req.body;
    const maxLimit = 5;
    try {
      const comments = await commentModel
        .find({ blog_id, isReply: false })
        .populate(
          "commented_by",
          "personal_info.username personal_info.fullname personal_info.profile_img"
        )
        .skip(skip)
        .limit(maxLimit)
        .sort({ commentedAt: -1 });
      return res.status(200).json(comments);
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  getReplies: catchAsyncError(async (req, res, next) => {
    const { _id, skip } = req.body;
    const maxLimit = 5;
    try {
      const doc = await commentModel
        .findOne({ _id })
        .populate({
          path: "children",
          options: {
            limit: maxLimit,
            skip: skip,
            sort: { commentedAt: -1 },
          },
          populate: {
            path: "commented_by",
            select:
              "personal_info.profile_img personal_info.fullname personal_info.username",
          },
          select: "-blog_id -updatedAt",
        })
        .select("children");
      return res.status(200).json({ replies: doc.children });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  deleteComments: catchAsyncError(async (req, res, next) => {
    const authId = req.user;
    const { _id } = req.body;
    try {
      const comment = await commentModel.findOne({ _id });
      if (comment) {
        if (
          authId.toString() === comment.commented_by.toString() ||
          authId.toString() === comment.blog_author.toString()
        ) {
          deleteComments(_id);
          return res.status(200).json({ message: "Comments Deleted" });
        } else {
          return res
            .status(403)
            .json({ error: "You can not delete this comment", comment });
        }
      }
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
};
