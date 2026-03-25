import {
  changePassword,
  forgotPasswordRequest,
  getUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgotPassword,
  verifyEmail,
} from "../controllers/User.controller.js";
import { Router } from "express";
import validate from "../middlewares/validator.middleware.js";
import {
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgotPasswordValidator,
} from "../validators/index.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const userRouter = Router();

// unsecured route
userRouter
  .route("/register")
  .post(userRegisterValidator(), validate, registerUser);

userRouter.route("/login").post(userLoginValidator(), validate, loginUser);
userRouter.route("/verify-email/:verificationToken").get(verifyEmail);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
userRouter
  .route("/reset-password/:resetToken")
  .post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

// secure route
userRouter.route("/logout").post(isAuthenticated, logoutUser);
userRouter.route("/current-user").get(isAuthenticated, getUser);
userRouter.route("/change-password").post(isAuthenticated,userChangeCurrentPasswordValidator(),validate, changePassword);
userRouter
  .route("/resend-email-verification")
  .post(isAuthenticated, resendEmailVerification);
export default userRouter;
