import AsyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import {
  emailVerificatioMail,
  forgotPasswordMail,
  sendMail,
} from "../utils/mailgen.js";
import crypto from "crypto";

const generateAccessAndRefreshToken = AsyncHandler(async (UserId) => {
  const user = await User.findById(UserId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefershToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
});

const registerUser = AsyncHandler(async (req, res, next) => {
  const { email, username, fullName, password } = req.body;

  const existuser = await User.findOne({ $or: [{ email }, { username }] });
  if (existuser) {
    throw new ApiError(200, "User already exits", []);
  }
  const newUser = new User({
    email,
    username,
    fullName,
    password,
  });
  await newUser.save();

  const { unHashToken, hashToken, tokenExpiry } =
    newUser.generateTemporaryToken();
  newUser.emailVerificationToken = hashToken;
  newUser.emailVerificationExpiry = tokenExpiry;
  await newUser.save({ validateBeforeSave: false });

  const options = {
    email: newUser?.email,
    subject: "Pls verify your email",
    mailgenContent: emailVerificatioMail(
      newUser.username,
      `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashToken}`,
    ),
  };
  await sendMail(options);
  const user = await User.findById(newUser._id).select(
    "-password -refreshToken -emailVerificationToken -forgotPasswordExpiry",
  );
  console.log(user);
  if (!user) {
    throw new ApiError(500, "Something went wrong while register the user");
  }
  console.log("user");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user },
        "User has been registered successfully and an verification mail has been sent to your mail ",
      ),
    );
});

const loginUser = AsyncHandler(async (req, res, next) => {
  const { email, password, username } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Username or email is required");
  }
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(
      400,
      "there is no user with the username or email that you entered.",
    );
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -emailVerificationToken -emailVerificationExpiry -forgotPasswordExpiry -forgotPasswordToken -refreshToken",
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "user is logged in"));
});

const logoutUser = AsyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "user logout successfully"));
});

const getUser = AsyncHandler(async (req, res, next) => {
  return res.status(200).json(new ApiResponse(200, req.user, "data is sent"));
});

const changePassword = AsyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "password is incorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Password has been change successfully"));
});

const verifyEmail = AsyncHandler(async (req, res, next) => {
  const { verificationToken } = req.params;
  if (!verificationToken) {
    throw new ApiError(400, "there is no verification token.");
  }
  let hashToken = crypto
    .createHash("SHA-256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });
  if (!user) {
    throw new ApiError(400, "token is expired or invalid");
  }
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerfied = true;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, "Email is verified"));
});

const resendEmailVerification = AsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.id);
  if (!user) {
    throw new ApiError(404, "user does exist");
  }
  if (user.isEmailVerfied) {
    throw new ApiError(400, "Email is already verified");
  }

  const { unHashToken, hashToken, tokenExpiry } =
    newUser.generateTemporaryToken();
  newUser.emailVerificationToken = hashToken;
  newUser.emailVerificationExpiry = tokenExpiry;
  await newUser.save({ validateBeforeSave: false });

  const options = {
    email: newUser?.email,
    subject: "Pls verify your email",
    mailgenContent: emailVerificatioMail(
      newUser.username,
      `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashToken}`,
    ),
  };
  await sendMail(options);
  return res.status(200).json(new ApiResponse(200, "New mail has been sent"));
});

const refreshAccessToken = AsyncHandler(async (req, res, next) => {
  const incomingrefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingrefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }
  const decodedToken = await jwt.verify(
    incomingrefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );

  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }
  if (incomingrefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "refresh token is expired");
  }
  const options = {
    httpOnly: true,
    secure: true,
  };
  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshToken(user._id);
  user.refreshToken = newRefreshToken;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(200, "refresh token is refreshed"));
});

const forgotPasswordRequest = AsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does't exists");
  }
  const { unHashToken, hashToken, tokenExpiry } =
    await user.generateTemporaryToken();
  user.forgotPasswordToken = hashToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  const options = {
    email: user?.email,
    subject: "Forgot password reset mail",
    mailgenContent: forgotPasswordMail(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashToken}`,
    ),
  };
  await sendMail(options);
  return res
    .status(200)
    .json(new ApiResponse(200, "mail has been sent to your mail"));
});

const resetForgotPassword = AsyncHandler(async (req, res, next) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  let hashToken = crypto.createHash("SHA-256").update(resetToken).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashToken,
    forgotPasswordExpiry: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    throw new ApiError(489, "Token is invalid  or expired");
  }
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Password resest successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  changePassword,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
};
