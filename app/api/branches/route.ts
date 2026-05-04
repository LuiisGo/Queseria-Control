import { crudHandlers } from "@/lib/apiRoute";

export const { GET, POST } = crudHandlers({
  list: "LIST_BRANCHES",
  create: "CREATE_BRANCH",
  update: "UPDATE_BRANCH"
});
