import { Router } from "express";
import validate from "../middlewares/validator.middleware.js";
import restrictProject from "../middlewares/restrictProject.middleware.js";
import {
  addMembersToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
} from "../controllers/project.controller.js";
import {
  addMemberToProjectValidator,
  createProjectValidator,
} from "../validators/index.js";
import { AvailableUserRole, UserRoleEnum } from "../utils/constant.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const projectRouter = Router();

projectRouter.use(isAuthenticated);
projectRouter
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validate, createProject);

projectRouter
  .route("/:projectId")
  .get(restrictProject(AvailableUserRole), getProjectById)
  .put(
    restrictProject([UserRoleEnum.ADMIN]),
    createProjectValidator(),
    validate,
    updateProject,
  )
  .delete(restrictProject([UserRoleEnum.ADMIN]), deleteProject);

projectRouter
  .route("/:projectId/members")
  .get(getProjectMembers)
  .put(
    restrictProject([UserRoleEnum.ADMIN]),
    addMemberToProjectValidator(),
    validate,
    addMembersToProject,
  );

projectRouter
  .route("/:projectId/members/:userId")
  .put(restrictProject([UserRoleEnum.ADMIN]), updateMemberRole)
  .delete(restrictProject([UserRoleEnum.ADMIN]), deleteMember);

export default projectRouter;
