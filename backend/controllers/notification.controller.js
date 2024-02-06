import catchAsyncError from "../middlewares/catch-async-errors.js";
import ErrorHandler from "../utils/Error-handler.js";
import notificationModel from "../models/notification.model.js";

export const notificationController = {
  getNewNotification: catchAsyncError(async (req, res, next) => {
    const authId = req.user;
    try {
      const result = await notificationModel.exists({
        notification_for: authId,
        seen: false,
        user: { $ne: authId },
      });
      if (result) {
        return res.status(200).json({ new_notification_available: true });
      } else {
        return res.status(200).json({ new_notification_available: false });
      }
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  getNotifications: catchAsyncError(async (req, res, next) => {
    const authId = req.user;
    const { page, filter, deleteDocCount } = req.body;
    const maxLimit = 10;
    let findQuery = { notification_for: authId, user: { $ne: authId } };
    let skipDocs = (page - 1) * maxLimit;
    if (filter !== "all") {
      findQuery.type = filter;
    }
    if (deleteDocCount) {
      skipDocs -= deleteDocCount;
    }
    try {
      const notifications = await notificationModel
        .find(findQuery)
        .skip(skipDocs)
        .limit(maxLimit)
        .populate("blog", "title blog_id")
        .populate(
          "user",
          "personal_info.fullname personal_info.username personal_info.profile_img"
        )
        .populate("comment", "comment")
        .populate("replied_on_comment", "comment")
        .populate("reply", "comment")
        .sort({ createdAt: -1 })
        .select("createdAt type seen reply");
      if (notifications) {
        await notificationModel
          .updateMany(findQuery, { seen: true })
          .skip(skipDocs)
          .limit(maxLimit);
        return res.status(200).json({ notifications });
      }
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  getNotificationCount: catchAsyncError(async (req, res, next) => {
    const authId = req.user;
    const { filter } = req.body;
    let findQuery = { notification_for: authId, user: { $ne: authId } };
    if (filter !== "all") {
      findQuery.type = filter;
    }
    try {
      const count = await notificationModel.countDocuments(findQuery);
      return res.status(200).json({ totalDocs: count });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
};
