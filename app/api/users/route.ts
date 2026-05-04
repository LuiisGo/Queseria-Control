import { crudHandlers } from "@/lib/apiRoute";

export const { GET, POST } = crudHandlers({
  list: "LIST_USERS",
  create: "CREATE_USER",
  update: "UPDATE_USER"
});
