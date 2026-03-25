import AsyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ProjectMember from "../models/projectmember.model.js";
import mongoose from "mongoose";

const restrictProject = (roles = []) => {
  AsyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    if (!projectId) {
      throw new ApiError(404, "Project id is missing");
    }
    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
    });
    if (!project) {
      throw new ApiError(404, "Project is missing or not found");
    }
    const givenRole = project?.role;
    req.user.role = givenRole;

    if (!roles.includes(givenRole)) {
      throw new ApiError(
        403,
        "You don't have permission to perform this action",
      );
    }
  });
};

export default restrictProject;
