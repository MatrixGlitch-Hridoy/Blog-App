import jwt from "jsonwebtoken";
export const isAuthenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Jwt token is missing" });
  }
  try {
    const decodedInfo = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedInfo.id;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Invalid JWT token. Authentication failed." });
  }
};
