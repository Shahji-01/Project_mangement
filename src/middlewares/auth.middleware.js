import AsyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import ApiError from "../utils/apiError.js";
const isAuthenticated = AsyncHandler(async (req, res, next) => {
  // Check if token exists in cookies
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");
  if (!token) {
    throw new ApiError(
      401,
      "You are not logged in. Please log in to get access.",
    );
  }

  try {
    // Verify token
    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // Add user ID to request
    req.id = decoded.userId;
    const user = await User.findById(req.id).select([
      "-password",
      "-emailVerificationToken",
      "-refreshToken",
      "-resetPasswordToken",
    ]);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token. Please log in again.");
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Your token has expired. Please log in again.");
    }
    throw error;
  }
});
export default isAuthenticated;
