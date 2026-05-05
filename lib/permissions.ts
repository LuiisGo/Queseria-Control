import { allStorePermissions, emptyPermissions } from "@/lib/constants";
import type { PermissionKey, PermissionMap, SessionUser } from "@/types";
import { tiendaPermissionKeys } from "@/types";

export const permissionLabels: Record<PermissionKey, string> = {
  can_register_sales: "Registrar ventas",
  can_register_entries: "Registrar producción / entradas",
  can_register_exits: "Registrar salidas",
  can_register_transfers: "Enviar a tiendas",
  can_register_waste: "Registrar pérdida",
  can_register_returns: "Registrar devoluciones",
  can_apply_discounts: "Aplicar descuentos",
  can_view_daily_summary: "Ver resumen y cierre del día",
  can_view_inventory: "Ver inventario",
  can_export_own_day: "Exportar su día",
  can_request_corrections: "Solicitar correcciones"
};

export const permissionDescriptions: Record<PermissionKey, string> = {
  can_register_sales: "Ventas de su ubicación.",
  can_register_entries: "Producción autorizada.",
  can_register_exits: "Salidas internas.",
  can_register_transfers: "Envíos desde Central.",
  can_register_waste: "Producto perdido o vencido.",
  can_register_returns: "Permite registrar devoluciones.",
  can_apply_discounts: "Descuentos en ventas.",
  can_view_daily_summary: "Resumen y cierre diario.",
  can_view_inventory: "Stock, lotes y vencimientos.",
  can_export_own_day: "CSV del día.",
  can_request_corrections: "Solicitar cambios."
};

export const permissionGroups: Array<{ title: string; keys: PermissionKey[] }> = [
  {
    title: "Ventas y caja",
    keys: ["can_register_sales", "can_apply_discounts", "can_view_daily_summary", "can_export_own_day"]
  },
  {
    title: "Inventario y producto",
    keys: ["can_view_inventory", "can_register_entries", "can_register_exits", "can_register_transfers", "can_register_waste", "can_register_returns"]
  },
  {
    title: "Control",
    keys: ["can_request_corrections"]
  }
];

export const permissionPresets: Array<{ id: string; label: string; permissions: PermissionMap }> = [
  {
    id: "basic",
    label: "Tienda básica",
    permissions: {
      ...emptyPermissions,
      can_register_sales: true,
      can_register_waste: true,
      can_view_daily_summary: true,
      can_view_inventory: true,
      can_request_corrections: true
    }
  },
  {
    id: "sales",
    label: "Solo ventas",
    permissions: {
      ...emptyPermissions,
      can_register_sales: true,
      can_view_daily_summary: true,
      can_request_corrections: true
    }
  },
  {
    id: "inventory",
    label: "Inventario",
    permissions: {
      ...emptyPermissions,
      can_view_inventory: true,
      can_register_entries: true,
      can_register_waste: true,
      can_register_returns: true,
      can_request_corrections: true
    }
  },
  {
    id: "central",
    label: "Central completa",
    permissions: {
      ...allStorePermissions,
      can_register_transfers: true
    }
  },
  {
    id: "none",
    label: "Sin permisos",
    permissions: emptyPermissions
  }
];

export function normalizePermissions(input?: Partial<PermissionMap>): PermissionMap {
  return Object.fromEntries(tiendaPermissionKeys.map((key) => [key, Boolean(input?.[key])])) as PermissionMap;
}

export function hasPermission(user: SessionUser | null | undefined, permission: PermissionKey) {
  if (!user) return false;
  if (user.role === "Admin") return true;
  return Boolean(user.permissions?.[permission]);
}
