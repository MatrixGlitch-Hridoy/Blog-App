export const isAuthenticateUser = catchAsyncErrors(async (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const decodedData = jwt.verify(accessToken, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);

  next();
});
