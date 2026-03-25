import { validationResult } from "express-validator";
import ApiError from "../utils/apiError.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({
    path: err.path,
    message: err.msg,
  }));

  return res
    .status(400)
    .json(new ApiError(400, "Invalid inputs", extractedErrors));
};

export default validate;
