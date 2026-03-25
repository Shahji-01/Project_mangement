import AsyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import Project from "../models/project.model.js";
import ProjectMember from "../models/projectmember.model.js";
import mongoose from "mongoose";
import { UserRoleEnum } from "../utils/constant.js";

const createProject = AsyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.id),
  });

  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRoleEnum.ADMIN,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});
const updateProject = AsyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    {
      new: true,
    },
  );
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return res
    .status(202)
    .json(new ApiResponse(201, "Project update successfully     "));
});
const deleteProject = AsyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findByIdAndDelete(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return res
    .status(202)
    .json(new ApiResponse(201, "Project delete successfully     "));
});
const getProjects = AsyncHandler(async (req, res) => {});
const getProjectById = AsyncHandler(async (req, res) => {});
const addMembersToProject = AsyncHandler(async (req, res) => {});
const getProjectMembers = AsyncHandler(async (req, res) => {});
const updateMemberRolte = AsyncHandler(async (req, res) => {});
const deleteMember = AsyncHandler(async (req, res) => {});

export {
  getProjectById,
  getProjects,
  createProject,
  updateMemberRolte,
  updateProject,
  deleteMember,
  addMembersToProject,
  getProjectMembers,
  deleteProject,
};
