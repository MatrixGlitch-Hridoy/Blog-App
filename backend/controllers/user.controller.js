import catchAsyncError from "../middlewares/catch-async-errors.js";
import userModel from "../models/user.model.js";
import ErrorHandler from "../utils/Error-handler.js";

export const userController = {
  searchUsers: catchAsyncError(async (req, res, next) => {
    const { query } = req.body;
    try {
      const users = await userModel
        .find({
          "personal_info.username": new RegExp(query, "i"),
        })
        .limit(50)
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img -_id"
        );
      return res.status(200).json({ users });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  getUserProfile: catchAsyncError(async (req, res, next) => {
    const { username } = req.body;
    try {
      const user = await userModel
        .findOne({
          "personal_info.username": username,
        })
        .select("-personal_info.password -google_auth -updatedAt -blogs");
      return res.status(200).json(user);
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
};
