import { Router } from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import restrictProject from "../middlewares/restrictProject.middleware.js";
import validate from "../middlewares/validator.middleware.js";
import {
  createNote,
  deleteNote,
  getNoteById,
  getProjectNotes,
  updateNote,
} from "../controllers/note.controller.js";
import {
  createNoteValidator,
  updateNoteValidator,
} from "../validators/index.js";
import { AvailableUserRole, UserRoleEnum } from "../utils/constant.js";

const noteRouter = Router();

// All note routes require authentication
noteRouter.use(isAuthenticated);

noteRouter
  .route("/:projectId")
  .get(restrictProject(AvailableUserRole), getProjectNotes)
  .post(
    restrictProject([UserRoleEnum.ADMIN]),
    createNoteValidator(),
    validate,
    createNote
  );

noteRouter
  .route("/:projectId/n/:noteId")
  .get(restrictProject(AvailableUserRole), getNoteById)
  .put(
    restrictProject([UserRoleEnum.ADMIN]),
    updateNoteValidator(),
    validate,
    updateNote
  )
  .delete(restrictProject([UserRoleEnum.ADMIN]), deleteNote);

export default noteRouter;
