import { nanoid } from "nanoid";
import catchAsyncError from "../middlewares/catch-async-errors.js";
import userModel from "../models/user.model.js";
import ErrorHandler from "../utils/Error-handler.js";
import sendAccessToken from "../utils/jwt-token.js";
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  const isUsernameExits = await userModel.exists({
    "personal_info.username": username,
  });
  isUsernameExits ? (username += nanoid().substring(0, 5)) : "";
  return username;
};
export const authController = {
  signupUser: catchAsyncError(async (req, res, next) => {
    try {
      const { fullname, email, password } = req.body;
      const isEmailExits = await userModel.findOne({
        "personal_info.email": email,
      });
      if (isEmailExits) {
        return res
          .status(403)
          .json({ error: "User already exits with this email" });
      }
      if (fullname.length < 3) {
        return res
          .status(403)
          .json({ error: "Fullname must be at least 3 letters long" });
      }
      if (!email.length) {
        return res.status(403).json({ error: "Enter Email" });
      }
      if (!emailRegex.test(email)) {
        return res.status(403).json({ error: "Invalid Email" });
      }
      if (!passwordRegex.test(password)) {
        return res.status(403).json({
          error:
            "Password shoukd be 6 to 20 characters long with a numerix, 1 lowercase and 1 uppercase letters",
        });
      }

      const username = await generateUsername(email);

      const user = await userModel.create({
        personal_info: {
          fullname,
          email,
          password,
          username,
        },
      });
      const token = sendAccessToken(user);
      res.status(201).json({
        success: true,
        message: "User Created",
        user,
        token,
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 400));
    }
  }),
  signinUser: catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    try {
      // Checking if user has given password and email both
      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }
      // Checking if user exits or not
      const user = await userModel
        .findOne({ "personal_info.email": email })
        .select("+personal_info.password");
      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
      }
      // Checking if password matched or not
      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
      }
      const token = sendAccessToken(user);
      res.status(201).json({
        success: true,
        message: "Login successful",
        user,
        token,
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 400));
    }
  }),
};
