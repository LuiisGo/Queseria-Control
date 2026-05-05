export type Role = "Admin" | "Tienda";

export type PermissionKey =
  | "can_register_sales"
  | "can_register_entries"
  | "can_register_exits"
  | "can_register_transfers"
  | "can_register_waste"
  | "can_register_returns"
  | "can_apply_discounts"
  | "can_view_daily_summary"
  | "can_view_inventory"
  | "can_export_own_day"
  | "can_request_corrections";

export type PermissionMap = Record<PermissionKey, boolean>;

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  role: Role;
  permissions: PermissionMap;
  assignedBranches: string[];
  active: boolean;
};

export type BranchType = "Producción" | "Tienda central" | "Punto de venta / sucursal";

export type Branch = {
  id: string;
  name: string;
  type: BranchType;
  active: boolean;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  code: string;
  name: string;
  imageData?: string;
  unit: string;
  presentation?: string;
  category?: string;
  finalPrice: number;
  distributorPrice: number;
  productionCost: number;
  minStock: number;
  branchMinStock?: Record<string, number>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Distributor = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
  notes?: string;
  specialPrices?: Record<string, number>;
  createdAt: string;
};

export type InventoryItem = {
  id: string;
  productId: string;
  productName: string;
  branchId: string;
  branchName: string;
  quantity: number;
  minStock: number;
  lots: InventoryLot[];
  updatedAt: string;
};

export type InventoryLot = {
  id: string;
  productId: string;
  branchId: string;
  lotNumber: string;
  expiresAt?: string;
  quantity: number;
  notes?: string;
};

export type SaleItem = {
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
  lotId?: string;
  lotsUsed?: Array<{
    lotId: string;
    lotNumber: string;
    expiresAt?: string;
    quantity: number;
  }>;
};

export type PaymentMethod = "Efectivo" | "Transferencia" | "Crédito";
export type SaleStatus = "Pagada" | "Crédito pendiente" | "Crédito pagado parcialmente" | "Crédito pagado" | "Anulada por Admin";

export type Sale = {
  id: string;
  date: string;
  userId: string;
  userName: string;
  branchId: string;
  branchName: string;
  customerType: "Cliente general" | "Distribuidor/mayorista";
  distributorId?: string;
  distributorName?: string;
  paymentMethod: PaymentMethod;
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  estimatedCost: number;
  estimatedProfit: number;
  status: SaleStatus;
  notes?: string;
};

export type Credit = {
  id: string;
  distributorId: string;
  distributorName: string;
  saleId: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  saleDate: string;
  dueDate?: string;
  status: "Pendiente" | "Parcial" | "Pagado" | "Vencido";
};

export type ProductionRecord = {
  id: string;
  date: string;
  userId: string;
  branchId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost?: number;
  lotNumber?: string;
  expiresAt?: string;
  notes?: string;
};

export type Transfer = {
  id: string;
  date: string;
  userId: string;
  originBranchId: string;
  destinationBranchId: string;
  items: SaleItem[];
  status: "Registrado" | "Con diferencia" | "Cerrado";
  differenceNote?: string;
  notes?: string;
};

export type WasteRecord = {
  id: string;
  date: string;
  userId: string;
  branchId: string;
  productId: string;
  productName: string;
  lotId?: string;
  quantity: number;
  reason: "Vencido" | "Dañado" | "Pérdida" | "Devolución no utilizable" | "Otro";
  notes?: string;
};

export type DailyClosing = {
  id: string;
  date: string;
  branchId: string;
  userId: string;
  systemTotal: number;
  cashReported: number;
  transferReported: number;
  creditReported: number;
  difference: number;
  status: "Pendiente" | "Cerrado" | "Revisado por Admin";
  notes?: string;
};

export type DashboardData = {
  kpis: {
    todaySales: number;
    weekSales: number;
    monthSales: number;
    estimatedProfit: number;
    pendingCredits: number;
    lowStockCount: number;
    wasteTotal: number;
    productionTotal: number;
  };
  salesByBranch: Array<{ name: string; total: number }>;
  salesByProduct: Array<{ name: string; total: number }>;
  salesByPaymentMethod: Array<{ name: string; total: number }>;
  monthlyComparison: Array<{ month: string; sales: number; profit: number }>;
  productionTrend?: Array<{ month: string; production: number; waste: number }>;
  inventoryByBranch?: Array<{ name: string; quantity: number }>;
  wasteByReason?: Array<{ name: string; total: number }>;
  topProducts: Array<{ name: string; units: number }>;
  topDistributors: Array<{ name: string; total: number }>;
  lowStock: InventoryItem[];
  expiringLots: InventoryLot[];
  pendingCredits: Credit[];
};

export type StoreSummary = {
  branchName: string;
  branchType?: BranchType;
  salesToday: number;
  productsSold: Array<{ name: string; units: number }>;
  inventory: InventoryItem[];
  movementsToday: number;
  closingStatus: "Pendiente" | "Cerrado" | "Revisado por Admin";
  alerts: string[];
};

export type ApiResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

export const tiendaPermissionKeys: PermissionKey[] = [
  "can_register_sales",
  "can_register_entries",
  "can_register_exits",
  "can_register_transfers",
  "can_register_waste",
  "can_register_returns",
  "can_apply_discounts",
  "can_view_daily_summary",
  "can_view_inventory",
  "can_export_own_day",
  "can_request_corrections"
];
