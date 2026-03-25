import mongoose from "mongoose";
import { AvailableUserRole, UserRoleEnum } from "../utils/constant.js";
const projectMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    role: {
      type: String,
      enum: AvailableUserRole,
      default: UserRoleEnum.MEMBER,
    },
  },
  {
    timestamps: true,
  },
);

const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema);

export default ProjectMember;
