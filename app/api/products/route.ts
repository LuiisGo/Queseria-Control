import { crudHandlers } from "@/lib/apiRoute";

export const { GET, POST } = crudHandlers({
  list: "LIST_PRODUCTS",
  create: "CREATE_PRODUCT",
  update: "UPDATE_PRODUCT"
});
