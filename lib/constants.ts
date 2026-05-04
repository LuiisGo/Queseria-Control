import type { PermissionMap } from "@/types";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Quesería San Antonio";
export const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
export const SESSION_COOKIE = "lsa_session";

export const allStorePermissions: PermissionMap = {
  can_register_sales: true,
  can_register_entries: true,
  can_register_exits: true,
  can_register_transfers: true,
  can_register_waste: true,
  can_register_returns: true,
  can_apply_discounts: false,
  can_view_daily_summary: true,
  can_view_inventory: true,
  can_export_own_day: true,
  can_request_corrections: true
};

export const emptyPermissions: PermissionMap = {
  can_register_sales: false,
  can_register_entries: false,
  can_register_exits: false,
  can_register_transfers: false,
  can_register_waste: false,
  can_register_returns: false,
  can_apply_discounts: false,
  can_view_daily_summary: false,
  can_view_inventory: false,
  can_export_own_day: false,
  can_request_corrections: false
};
