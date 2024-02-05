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
  updateProfileImage: catchAsyncError(async (req, res, next) => {
    const { url } = req.body;
    try {
      await userModel.findOneAndUpdate(
        { _id: req.user },
        { "personal_info.profile_img": url }
      );
      return res.status(200).json({ profile_img: url });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }),
  updateProfile: catchAsyncError(async (req, res, next) => {
    const { username, bio, social_links } = req.body;
    const bioLimit = 150;
    if (username.length < 3) {
      return res
        .status(403)
        .json({ error: "username should be at least 3 letters long" });
    }
    if (bio.length > bioLimit) {
      return res
        .status(403)
        .json({ error: `Bio should not be more than ${bioLimit} characters` });
    }
    const socialLinksArr = Object.keys(social_links);
    try {
      for (let i = 0; i < socialLinksArr.length; i++) {
        if (social_links[socialLinksArr[i]].length) {
          const hostname = new URL(social_links[socialLinksArr[i]]).hostname;
          if (
            !hostname.includes(`${socialLinksArr[i]}.com`) &&
            socialLinksArr[i] !== "website"
          ) {
            return res.status(403).json({
              error: `${socialLinksArr[i]} link is invalid. You must enter a full link`,
            });
          }
        }
      }
      const updateObj = {
        "personal_info.username": username,
        "personal_info.bio": bio,
        social_links,
      };
      await userModel.findOneAndUpdate({ _id: req.user }, updateObj, {
        runValidators: true,
      });

      return res.status(200).json({ username });
    } catch (err) {
      return res
        .status(403)
        .json({
          error: "You must provide full social links with http(s) included",
        });
    }
  }),
};
