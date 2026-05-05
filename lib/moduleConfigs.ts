import { createElement } from "react";
import type { Column } from "@/components/DataTable";
import type { FieldConfig } from "@/components/ModulePage";
import { formatCurrency } from "@/lib/utils";

type ModuleConfig = {
  title: string;
  description: string;
  endpoint: string;
  columns: Column<Record<string, unknown>>[];
  fields?: FieldConfig[];
  editFields?: FieldConfig[];
  formTitle?: string;
  editable?: boolean;
  transformSubmit?: (values: Record<string, string>) => Record<string, unknown>;
  transformEditSubmit?: (values: Record<string, string>) => Record<string, unknown>;
};

const money = (key: string) => (row: Record<string, unknown>) => formatCurrency(Number(row[key] || 0));
const active = (row: Record<string, unknown>) => (row.active === false ? "Inactivo" : "Activo");
const imageThumb = (row: Record<string, unknown>) =>
  typeof row.imageData === "string" && row.imageData
    ? createElement("img", {
        src: row.imageData,
        alt: String(row.name || "Producto"),
        className: "h-12 w-12 rounded-md border border-black/10 object-cover"
      })
    : "Sin imagen";

export const adminModules: Record<string, ModuleConfig> = {
  productos: {
    title: "Productos",
    description: "Catálogo de productos.",
    endpoint: "/api/products",
    columns: [
      { key: "imageData", label: "Imagen", render: imageThumb },
      { key: "code", label: "SKU" },
      { key: "name", label: "Producto" },
      { key: "presentation", label: "Presentación" },
      { key: "category", label: "Categoría" },
      { key: "finalPrice", label: "Precio final", render: money("finalPrice") },
      { key: "distributorPrice", label: "Distribuidor", render: money("distributorPrice") },
      { key: "active", label: "Estado", render: active }
    ],
    fields: [
      { name: "name", label: "Nombre", required: true },
      { name: "presentation", label: "Presentación" },
      { name: "category", label: "Categoría" },
      { name: "unit", label: "Unidad", placeholder: "unidad" },
      { name: "finalPrice", label: "Precio final", type: "number", defaultValue: "0", required: true },
      { name: "distributorPrice", label: "Precio distribuidor", type: "number" },
      { name: "productionCost", label: "Costo producción", type: "number" },
      { name: "minStock", label: "Stock mínimo", type: "number" },
      { name: "imageData", label: "Imagen del producto", type: "file", accept: "image/*" },
      { name: "active", label: "Estado", type: "select", options: ["Activo", "Inactivo"], defaultValue: "Activo" }
    ],
    transformSubmit: (values) => ({
      ...values,
      finalPrice: Number(values.finalPrice),
      distributorPrice: Number(values.distributorPrice),
      productionCost: Number(values.productionCost),
      minStock: Number(values.minStock),
      active: values.active !== "Inactivo"
    })
  },
  ubicaciones: {
    title: "Ubicaciones",
    description: "Central y tiendas.",
    endpoint: "/api/branches",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Nombre" },
      { key: "type", label: "Tipo" },
      { key: "address", label: "Dirección" },
      { key: "active", label: "Estado", render: active }
    ],
    fields: [
      { name: "name", label: "Nombre", required: true },
      { name: "type", label: "Tipo", type: "select", options: ["Producción", "Tienda central", "Punto de venta / sucursal"], required: true },
      { name: "address", label: "Dirección" },
      { name: "active", label: "Estado", type: "select", options: ["Activo", "Inactivo"], defaultValue: "Activo" },
      { name: "notes", label: "Notas", type: "textarea" }
    ],
    transformSubmit: (values) => ({ ...values, active: values.active !== "Inactivo" })
  },
  usuarios: {
    title: "Usuarios",
    description: "Accesos y permisos.",
    endpoint: "/api/users",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Nombre" },
      { key: "username", label: "Usuario" },
      { key: "role", label: "Rol" },
      { key: "assignedBranches", label: "Ubicaciones", render: (row) => (row.assignedBranches as string[])?.join(", ") },
      { key: "active", label: "Estado", render: active }
    ],
    fields: [
      { name: "name", label: "Nombre", required: true },
      { name: "username", label: "Usuario", required: true },
      { name: "password", label: "Contraseña", required: true },
      { name: "role", label: "Rol", type: "select", options: ["Admin", "Tienda"], required: true }
    ]
  },
  precios: {
    title: "Precios",
    description: "Precios vigentes.",
    endpoint: "/api/prices",
    columns: [
      { key: "productName", label: "Producto" },
      { key: "finalPrice", label: "Final", render: money("finalPrice") },
      { key: "distributorPrice", label: "Distribuidor", render: money("distributorPrice") },
      { key: "updatedAt", label: "Actualizado" }
    ],
    fields: [
      { name: "productId", label: "Producto", type: "select", optionSource: "products", required: true },
      { name: "priceType", label: "Tipo", type: "select", options: ["Precio venta final", "Precio distribuidor", "Precio especial por sucursal", "Precio especial por distribuidor"], required: true },
      { name: "price", label: "Precio", type: "number", defaultValue: "0", required: true },
      { name: "scopeBranchId", label: "Sucursal especial", type: "select", optionSource: "branches" },
      { name: "scopeDistributorId", label: "Distribuidor especial", type: "select", optionSource: "distributors" },
      { name: "notes", label: "Notas", type: "textarea" }
    ],
    transformSubmit: (values) => ({ ...values, scopeId: values.scopeDistributorId || values.scopeBranchId, price: Number(values.price) })
  },
  inventario: {
    title: "Inventario",
    description: "Existencias por producto.",
    endpoint: "/api/inventory",
    columns: [
      { key: "productName", label: "Producto" },
      { key: "branchName", label: "Ubicación" },
      { key: "quantity", label: "Stock" },
      { key: "minStock", label: "Mínimo" },
      { key: "lots", label: "Lotes", render: (row) => `${(row.lots as unknown[])?.length || 0} lote(s)` },
      { key: "updatedAt", label: "Actualizado" }
    ]
  },
  produccion: {
    title: "Producción",
    description: "Producto terminado.",
    endpoint: "/api/production",
    columns: [
      { key: "id", label: "ID" },
      { key: "productName", label: "Producto" },
      { key: "branchName", label: "Destino" },
      { key: "quantity", label: "Cantidad" },
      { key: "lotNumber", label: "Código de lote" },
      { key: "expiresAt", label: "Vence automático" }
    ],
    fields: [
      { name: "productId", label: "Producto", type: "select", optionSource: "products", required: true },
      { name: "branchId", label: "Destino", type: "select", optionSource: "branches", optionFilter: "central", defaultValue: "AGM001", required: true },
      { name: "quantity", label: "Cantidad", type: "number", required: true },
      { name: "unitCost", label: "Costo unitario", type: "number" },
      { name: "lotNumber", label: "Código de lote" },
      { name: "notes", label: "Notas", type: "textarea" }
    ],
    editFields: [
      { name: "lotNumber", label: "Código de lote" },
      { name: "expiresAt", label: "Vencimiento", type: "date" },
      { name: "notes", label: "Notas", type: "textarea" }
    ],
    transformSubmit: (values) => ({ ...values, quantity: Number(values.quantity), unitCost: Number(values.unitCost) }),
    transformEditSubmit: (values) => values
  },
  envios: {
    title: "Envíos",
    description: "Salidas desde Central.",
    endpoint: "/api/transfers",
    columns: [
      { key: "id", label: "ID" },
      { key: "originBranchName", label: "Sale de" },
      { key: "destinationBranchName", label: "Enviar a" },
      { key: "status", label: "Estado" },
      { key: "notes", label: "Notas" }
    ],
    fields: [
      { name: "originBranchId", label: "Sale de", type: "select", optionSource: "branches", optionFilter: "central", defaultValue: "AGM001", required: true },
      { name: "destinationBranchId", label: "Enviar a", type: "select", optionSource: "branches", optionFilter: "subbranches", defaultValue: "AGM002", required: true },
      { name: "productId", label: "Producto", type: "select", optionSource: "products", required: true },
      { name: "quantity", label: "Cantidad", type: "number", required: true },
      { name: "notes", label: "Notas", type: "textarea" }
    ],
    editFields: [
      { name: "status", label: "Estado", type: "select", options: ["Registrado", "Con diferencia", "Cerrado"] },
      { name: "differenceNote", label: "Diferencia", type: "textarea" },
      { name: "notes", label: "Notas", type: "textarea" }
    ],
    transformSubmit: (values) => ({
      originBranchId: values.originBranchId,
      destinationBranchId: values.destinationBranchId,
      items: [{ productId: values.productId, quantity: Number(values.quantity), price: 0, discount: 0, subtotal: 0 }],
      notes: values.notes
    }),
    transformEditSubmit: (values) => values
  },
  ventas: {
    title: "Ventas",
    description: "Ventas registradas.",
    endpoint: "/api/sales",
    columns: [
      { key: "id", label: "ID" },
      { key: "branchName", label: "Ubicación" },
      { key: "customerType", label: "Cliente" },
      { key: "paymentMethod", label: "Pago" },
      { key: "total", label: "Total", render: money("total") },
      { key: "status", label: "Estado" }
    ],
    fields: [
      { name: "branchId", label: "Ubicación", type: "select", optionSource: "branches", optionFilter: "assigned", defaultValue: "AGM001", required: true },
      { name: "customerType", label: "Cliente", type: "select", options: ["Cliente general", "Distribuidor/mayorista"], required: true },
      { name: "distributorId", label: "Distribuidor", type: "select", optionSource: "distributors" },
      { name: "productId", label: "Producto", type: "select", optionSource: "products", required: true },
      { name: "quantity", label: "Cantidad", type: "number", required: true },
      { name: "paymentMethod", label: "Pago", type: "select", options: ["Efectivo", "Transferencia", "Crédito"], required: true },
      { name: "notes", label: "Notas", type: "textarea" }
    ],
    transformSubmit: (values) => ({
      branchId: values.branchId,
      customerType: values.customerType,
      distributorId: values.distributorId,
      paymentMethod: values.paymentMethod,
      items: [{ productId: values.productId, quantity: Number(values.quantity), price: 0, discount: 0, subtotal: 0 }],
      notes: values.notes
    })
  },
  distribuidores: {
    title: "Clientes distribuidores",
    description: "Clientes mayoristas.",
    endpoint: "/api/distributors",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Nombre" },
      { key: "phone", label: "Teléfono" },
      { key: "email", label: "Email" },
      { key: "active", label: "Estado", render: active }
    ],
    fields: [
      { name: "name", label: "Nombre", required: true },
      { name: "phone", label: "Teléfono" },
      { name: "email", label: "Email" },
      { name: "address", label: "Dirección" },
      { name: "active", label: "Estado", type: "select", options: ["Activo", "Inactivo"], defaultValue: "Activo" },
      { name: "notes", label: "Notas", type: "textarea" }
    ],
    transformSubmit: (values) => ({ ...values, active: values.active !== "Inactivo" })
  },
  creditos: {
    title: "Créditos",
    description: "Cuentas por cobrar.",
    endpoint: "/api/credits",
    columns: [
      { key: "id", label: "ID" },
      { key: "distributorName", label: "Distribuidor" },
      { key: "totalAmount", label: "Total", render: money("totalAmount") },
      { key: "paidAmount", label: "Pagado", render: money("paidAmount") },
      { key: "balance", label: "Saldo", render: money("balance") },
      { key: "status", label: "Estado" }
    ],
    fields: [
      { name: "creditId", label: "Crédito", type: "select", optionSource: "credits", required: true },
      { name: "amount", label: "Monto", type: "number", required: true },
      { name: "paymentMethod", label: "Método", type: "select", options: ["Efectivo", "Transferencia"], required: true },
      { name: "note", label: "Nota", type: "textarea" }
    ],
    transformSubmit: (values) => ({ ...values, amount: Number(values.amount) })
  },
  mermas: {
    title: "Pérdidas",
    description: "Pérdidas registradas.",
    endpoint: "/api/waste",
    columns: [
      { key: "id", label: "ID" },
      { key: "productName", label: "Producto" },
      { key: "branchName", label: "Ubicación" },
      { key: "quantity", label: "Cantidad" },
      { key: "reason", label: "Motivo" },
      { key: "notes", label: "Notas" }
    ],
    fields: [
      { name: "branchId", label: "Ubicación", type: "select", optionSource: "branches", optionFilter: "assigned", defaultValue: "AGM001", required: true },
      { name: "productId", label: "Producto", type: "select", optionSource: "products", required: true },
      { name: "quantity", label: "Cantidad", type: "number", required: true },
      { name: "reason", label: "Motivo", type: "select", options: ["Vencido", "Dañado", "Pérdida", "Devolución no utilizable", "Otro"], required: true },
      { name: "notes", label: "Notas", type: "textarea" }
    ],
    editFields: [
      { name: "reason", label: "Motivo", type: "select", options: ["Vencido", "Dañado", "Pérdida", "Devolución no utilizable", "Otro"], required: true },
      { name: "notes", label: "Notas", type: "textarea" }
    ],
    transformSubmit: (values) => ({ ...values, quantity: Number(values.quantity) }),
    transformEditSubmit: (values) => values
  },
  reportes: {
    title: "Reportes",
    description: "Reportes y CSV.",
    endpoint: "/api/sales",
    columns: [
      { key: "id", label: "Venta" },
      { key: "date", label: "Fecha" },
      { key: "branchName", label: "Ubicación" },
      { key: "paymentMethod", label: "Método" },
      { key: "total", label: "Total", render: money("total") },
      { key: "estimatedProfit", label: "Ganancia", render: money("estimatedProfit") }
    ]
  },
  configuracion: {
    title: "Configuración",
    description: "Ajustes generales.",
    endpoint: "/api/settings",
    columns: [
      { key: "name", label: "Ubicación" },
      { key: "type", label: "Tipo" },
      { key: "active", label: "Estado", render: active }
    ],
    editable: false,
    fields: [
      { name: "adminEmails", label: "Emails admin", placeholder: "admin@empresa.com" },
      { name: "allowNegativeStock", label: "Stock negativo", type: "select", options: ["No", "Sí"] },
      { name: "lowStockNotifications", label: "Stock bajo", type: "select", options: ["Activo", "Inactivo"] },
      { name: "companyNotes", label: "Notas empresa", type: "textarea" }
    ]
  }
};
