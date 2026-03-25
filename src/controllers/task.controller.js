import AsyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import Project from "../models/project.model.js";
import mongoose from "mongoose";
import Task from "../models/task.model.js";
import SubTask from "../models/subtask.model.js";

const createTask = AsyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const files = req.files || [];

  files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname} `,
      mimeType: file.mimeType,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    status,
    assignedBy: new mongoose.Types.ObjectId(req.id),
    attachments,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task created successfully"));
});
const getTasks = AsyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const task = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assignedTo", "avatar username fullName");

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task fetch successfully"));
});
const getTaskById = AsyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            _id: 1,
            username: 1,
            fullName: 1,
            avatar: 1,
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: { _id: 1, username: 1, fullName: 1, avatar: 1 },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
  ]);
  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task[0], "Task fetch successfully"));
});
const updateTask = AsyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description, assignedTo, status } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const files = req.files || [];

  files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname} `,
      mimeType: file.mimeType,
      size: file.size,
    };
  });

  const task = await Task.findByIdAndUpdate(taskId, {
    title,
    description,
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    status,
    assignedBy: new mongoose.Types.ObjectId(req.id),
    attachments,
  });
  if (!task) {
    throw new ApiError(500, "Fail to update the task");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task created successfully"));
});
const deleteTask = AsyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project does't exits");
  }
  await Task.findByIdAndDelete(taskId);
  return res.status(200).json(new ApiResponse(200, "task has been deleted"));
});
const createSubTask = AsyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project does't exits");
  }
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "task does't exits");
  }
  const subtask = await SubTask.create({
    title,
    task: new mongoose.Types.ObjectId(taskId),
    createdBy: new mongoose.Types.ObjectId(req.id),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "subtask is created"));
});
const updateSubTask = AsyncHandler(async (req, res) => {
  const { projectId, subTaskId } = req.params;
  const { title, isCompleted } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project does't exits");
  }
  const subtask = await SubTask.findByIdAndUpdate(subTaskId, {
    title,
    isCompleted,
  });
  if (!subtask) {
    throw new ApiError(404, "Project does't exits or failed to update");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "subtask is updated successfully"));
});
const deleteSubTask = AsyncHandler(async (req, res) => {
  const { projectId, subTaskId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project does't exits");
  }
  const subtask = await SubTask.findByIdAndDelete(subTaskId);
  if (!subtask) {
    throw new ApiError(404, "Project does't exits or failed to update");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "subtask is deleted successfully"));
});

export {
  createTask,
  getTaskById,
  getTasks,
  deleteSubTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  updateTask,
};
