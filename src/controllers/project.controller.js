import AsyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import Project from "../models/project.model.js";
import ProjectMember from "../models/projectmember.model.js";
import Task from "../models/task.model.js";
import SubTask from "../models/subtask.model.js";
import Note from "../models/note.model.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRoleEnum } from "../utils/constant.js";

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
    .status(200)
    .json(new ApiResponse(200, "Project updated successfully"));
});
const deleteProject = AsyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findByIdAndDelete(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  // Recursive deletion of related documents
  const projectTasks = await Task.find({ project: projectId }).distinct("_id");
  await Promise.all([
    ProjectMember.deleteMany({ project: projectId }),
    Task.deleteMany({ project: projectId }),
    SubTask.deleteMany({ task: { $in: projectTasks } }),
    Note.deleteMany({ project: projectId }),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, "Project deleted successfully"));
});
const getProjects = AsyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project", // make sure this matches your schema
        foreignField: "_id",
        as: "project",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "projectMembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$projectMembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$project",
    },
    {
      $project: {
        _id: 0,
        role: 1,
        "project._id": 1,
        "project.name": 1,
        "project.description": 1,
        "project.members": 1,
        "project.createdAt": 1,
        "project.createdBy": 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Project fetch successfully"));
});
const getProjectById = AsyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetch successfully "));
});
const addMembersToProject = AsyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const { projectId } = req.params;

  const user = await User.findOne({
    email,
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await ProjectMember.findOneAndUpdate(
    {
      user: user._id,
      project: projectId,
    },
    {
      role,
    },
    {
      new: true,
      upsert: true,
    },
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "Project member has been added"));
});
const getProjectMembers = AsyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const projectMembers = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: {
          $arrayElemAt: ["$user", 0],
        },
      },
    },
    {
      $project: {
        project: 1,
        user: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, projectMembers, "Project member has been added"),
    );
});
const updateMemberRole = AsyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newRole } = req.body;

  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(404, "Invalid Role");
  }
  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }
  projectMember = await ProjectMember.findByIdAndUpdate(
    projectMember._id,
    {
      role: newRole,
    },
    {
      new: true,
    },
  );
  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "Project member role updated successfully",
      ),
    );
});
const deleteMember = AsyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }
  projectMember = await ProjectMember.findByIdAndDelete(projectMember._id);
  return res
    .status(200)
    .json(new ApiResponse(200, "Project member removed successfully"));
});

export {
  getProjectById,
  getProjects,
  createProject,
  updateMemberRole,
  updateProject,
  deleteMember,
  addMembersToProject,
  getProjectMembers,
  deleteProject,
};
