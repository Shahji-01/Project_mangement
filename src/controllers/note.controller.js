import AsyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Note from "../models/note.model.js";


const createNote = AsyncHandler(async (req, res) => {
  const { content } = req.body;
  const { projectId } = req.params;

  const note = await Note.create({
    content,
    project: projectId,
    createdBy: req.user._id,
  });

  if (!note) {
    throw new ApiError(500, "Error while creating note");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, note, "Note created successfully"));
});

const getProjectNotes = AsyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const notes = await Note.find({ project: projectId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

const getNoteById = AsyncHandler(async (req, res) => {
  const { noteId, projectId } = req.params;

  const note = await Note.findOne({ _id: noteId, project: projectId });

  if (!note) {
    throw new ApiError(404, "Note not found in this project");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note fetched successfully"));
});

const updateNote = AsyncHandler(async (req, res) => {
  const { noteId, projectId } = req.params;
  const { content } = req.body;

  const note = await Note.findOneAndUpdate(
    { _id: noteId, project: projectId },
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!note) {
    throw new ApiError(404, "Note not found in this project");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note updated successfully"));
});


const deleteNote = AsyncHandler(async (req, res) => {
  const { noteId, projectId } = req.params;

  const note = await Note.findOneAndDelete({ _id: noteId, project: projectId });

  if (!note) {
    throw new ApiError(404, "Note not found in this project");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note deleted successfully"));
});

export { createNote, getProjectNotes, getNoteById, updateNote, deleteNote };
