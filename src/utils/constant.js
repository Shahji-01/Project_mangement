export const UserRoleEnum = {
  ADMIN: "admin",
  PORJECT_ADMIN: "project_admin",
  MEMBER: "member",
};

export const AvailableUserRole = Object.values(UserRoleEnum);

export const taskStatusEnum = {
  TODO: "todo",
  INPROGRESS: "inprogress",
  DONE: "done",
};
export const AvailableTaskStatusEnum = Object.values(taskStatusEnum);
