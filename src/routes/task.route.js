import { Router } from "express";
import validate from "../middlewares/validator.middleware.js";
import restrictProject from "../middlewares/restrictProject.middleware.js";

import {
  createSubTaskValidator,
  createTaskValidator,
  updateSubTaskValidator,
} from "../validators/index.js";
import {
  UserRoleEnum,
} from "../utils/constant.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
} from "../controllers/task.controller.js";

const taskRouter = Router();

taskRouter.use(isAuthenticated);

taskRouter
  .route("/:projectId")
  .get(getTasks)
  .post(
    restrictProject([UserRoleEnum.ADMIN]),
    createTaskValidator(),
    validate,
    createTask,
  );

taskRouter
  .route("/:projectId/t/:taskId")
  .get(getTaskById)
  .put(
    restrictProject([UserRoleEnum.ADMIN]),
    createTaskValidator(),
    validate,
    updateTask,
  )
  .delete(restrictProject([UserRoleEnum.ADMIN]), deleteTask);

taskRouter
  .route("/:projectId/t/:taskId/subtasks")
  .post(
    restrictProject([UserRoleEnum.ADMIN]),
    createSubTaskValidator(),
    validate,
    createSubTask,
  );

taskRouter
  .route("/:projectId/st/:subTaskId")
  .put(
    restrictProject([UserRoleEnum.ADMIN]),
    updateSubTaskValidator(),
    validate,
    updateSubTask,
  )
  .delete(restrictProject([UserRoleEnum.ADMIN]), deleteSubTask);
export default taskRouter;
