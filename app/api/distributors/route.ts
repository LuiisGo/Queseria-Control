import { crudHandlers } from "@/lib/apiRoute";

export const { GET, POST } = crudHandlers({
  list: "LIST_DISTRIBUTORS",
  create: "CREATE_DISTRIBUTOR",
  update: "UPDATE_DISTRIBUTOR"
});
