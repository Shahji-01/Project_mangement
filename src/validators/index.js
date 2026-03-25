import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constant.js";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is inValid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is requried")
      .isLength({ min: 3 }),
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("fullName is requried")
      .isLength({ min: 3 }),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is requried")
      .isLength({ min: 3 }),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is inValid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is requried")
      .isLength({ min: 3 }),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is requried")
      .isLength({ min: 3 }),
  ];
};
const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("old password is required"),

    body("newPassword")
      .notEmpty()
      .withMessage("new password is required")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 characters"),
  ];
};
const userForgotPasswordValidator = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Email is invalid")
      .notEmpty()
      .withMessage("Email is required"),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [body("newPassword").notEmpty().withMessage("Password is required")];
};
const createProjectValidator = () => {
  return [
    body("name").notEmpty().withMessage("Name is required"),
    body("description").optional(),
  ];
};
const addMemberToProjectValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("invalid email"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableUserRole)
      .withMessage("Role is invalid"),
  ];
};
export {
  addMemberToProjectValidator,
  createProjectValidator,
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
};
