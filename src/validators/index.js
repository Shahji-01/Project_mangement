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
const createTaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long"),

    body("assignedTo")
      .notEmpty()
      .withMessage("Assigned user is required")
      .isMongoId()
      .withMessage("Invalid user ID"),

    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["todo", "in-progress", "completed"])
      .withMessage("Invalid status value"),
  ];
};
const createSubTaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
  ];
};

const updateSubTaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),

    body("isCompleted")
      .notEmpty()
      .withMessage("isCompleted is required")
      .isBoolean()
      .withMessage("isCompleted must be a boolean")
      .toBoolean(),
  ];
};
const createNoteValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 1 })
      .withMessage("Content cannot be empty"),
  ];
};

const updateNoteValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 1 })
      .withMessage("Content cannot be empty"),
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
  createTaskValidator,
  createSubTaskValidator,
  updateSubTaskValidator,
  createNoteValidator,
  updateNoteValidator,
};
