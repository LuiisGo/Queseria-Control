import { allStorePermissions, emptyPermissions } from "@/lib/constants";
import type {
  Branch,
  Credit,
  DailyClosing,
  DashboardData,
  Distributor,
  InventoryItem,
  InventoryLot,
  Product,
  ProductionRecord,
  Sale,
  SessionUser,
  StoreSummary,
  Transfer,
  WasteRecord
} from "@/types";

const now = new Date().toISOString();

export const demoUsers: SessionUser[] = [
  {
    id: "USR001",
    name: "Admin San Antonio",
    username: "admin",
    role: "Admin",
    permissions: emptyPermissions,
    assignedBranches: ["BR001", "BR002"],
    active: true
  },
  {
    id: "USR002",
    name: "Central",
    username: "tienda",
    role: "Tienda",
    permissions: allStorePermissions,
    assignedBranches: ["BR001"],
    active: true
  }
];

export const demoPasswords: Record<string, string> = {
  admin: "admin123",
  tienda: "tienda123"
};

export const demoBranches: Branch[] = [
  { id: "BR001", name: "Central", type: "Tienda central", active: true, address: "Central", createdAt: now, updatedAt: now },
  { id: "BR002", name: "Agromarket 1", type: "Punto de venta / sucursal", active: true, address: "Agromarket 1", createdAt: now, updatedAt: now }
];

export const demoProducts: Product[] = [
  { id: "LSA001", code: "LSA001", name: "Queso grande", unit: "unidad", presentation: "Grande", category: "Quesos", finalPrice: 0, distributorPrice: 0, productionCost: 0, minStock: 10, active: true, createdAt: now, updatedAt: now },
  { id: "LSA002", code: "LSA002", name: "Queso pequeño", unit: "unidad", presentation: "Pequeño", category: "Quesos", finalPrice: 0, distributorPrice: 0, productionCost: 0, minStock: 12, active: true, createdAt: now, updatedAt: now },
  { id: "LSA003", code: "LSA003", name: "Queso mediano", unit: "unidad", presentation: "Mediano", category: "Quesos", finalPrice: 0, distributorPrice: 0, productionCost: 0, minStock: 10, active: true, createdAt: now, updatedAt: now },
  { id: "LSA004", code: "LSA004", name: "Crema vaso", unit: "unidad", presentation: "Vaso", category: "Cremas", finalPrice: 0, distributorPrice: 0, productionCost: 0, minStock: 18, active: true, createdAt: now, updatedAt: now },
  { id: "LSA005", code: "LSA005", name: "Crema bolsa", unit: "unidad", presentation: "Bolsa", category: "Cremas", finalPrice: 0, distributorPrice: 0, productionCost: 0, minStock: 18, active: true, createdAt: now, updatedAt: now }
];

export const demoDistributors: Distributor[] = [
  { id: "DIST001", name: "Mazate", phone: "", email: "", address: "", active: true, notes: "", createdAt: now },
  { id: "DIST002", name: "CAES", phone: "", email: "", address: "", active: true, notes: "", createdAt: now }
];

export const demoLots: InventoryLot[] = [
  { id: "LOT001", productId: "LSA001", branchId: "BR001", lotNumber: "001", expiresAt: "2026-05-12", quantity: 32 },
  { id: "LOT002", productId: "LSA002", branchId: "BR001", lotNumber: "002", expiresAt: "2026-05-14", quantity: 24 },
  { id: "LOT003", productId: "LSA003", branchId: "BR001", lotNumber: "003", expiresAt: "2026-05-14", quantity: 20 },
  { id: "LOT004", productId: "LSA004", branchId: "BR001", lotNumber: "004", expiresAt: "2026-05-10", quantity: 28 },
  { id: "LOT005", productId: "LSA005", branchId: "BR001", lotNumber: "005", expiresAt: "2026-05-11", quantity: 22 },
  { id: "LOT006", productId: "LSA004", branchId: "BR002", lotNumber: "004", expiresAt: "2026-05-10", quantity: 18 },
  { id: "LOT007", productId: "LSA005", branchId: "BR002", lotNumber: "005", expiresAt: "2026-05-11", quantity: 16 }
];

export const demoInventory: InventoryItem[] = [
  { id: "INV001", productId: "LSA001", productName: "Queso grande", branchId: "BR001", branchName: "Central", quantity: 32, minStock: 10, lots: [demoLots[0]], updatedAt: now },
  { id: "INV002", productId: "LSA002", productName: "Queso pequeño", branchId: "BR001", branchName: "Central", quantity: 24, minStock: 12, lots: [demoLots[1]], updatedAt: now },
  { id: "INV003", productId: "LSA003", productName: "Queso mediano", branchId: "BR001", branchName: "Central", quantity: 20, minStock: 10, lots: [demoLots[2]], updatedAt: now },
  { id: "INV004", productId: "LSA004", productName: "Crema vaso", branchId: "BR001", branchName: "Central", quantity: 28, minStock: 18, lots: [demoLots[3]], updatedAt: now },
  { id: "INV005", productId: "LSA005", productName: "Crema bolsa", branchId: "BR001", branchName: "Central", quantity: 22, minStock: 18, lots: [demoLots[4]], updatedAt: now },
  { id: "INV006", productId: "LSA004", productName: "Crema vaso", branchId: "BR002", branchName: "Agromarket 1", quantity: 18, minStock: 18, lots: [demoLots[5]], updatedAt: now },
  { id: "INV007", productId: "LSA005", productName: "Crema bolsa", branchId: "BR002", branchName: "Agromarket 1", quantity: 16, minStock: 18, lots: [demoLots[6]], updatedAt: now }
];

export const demoSales: Sale[] = [
  {
    id: "SALE001",
    date: now,
    userId: "USR002",
    userName: "Agromarket 1",
    branchId: "BR002",
    branchName: "Agromarket 1",
    customerType: "Cliente general",
    paymentMethod: "Efectivo",
    items: [{ productId: "LSA004", productName: "Crema vaso", quantity: 3, price: 0, discount: 0, subtotal: 0 }],
    subtotal: 0,
    discountTotal: 0,
    total: 0,
    estimatedCost: 0,
    estimatedProfit: 0,
    status: "Pagada"
  },
  {
    id: "SALE002",
    date: now,
    userId: "USR001",
    userName: "Admin San Antonio",
    branchId: "BR001",
    branchName: "Central",
    customerType: "Distribuidor/mayorista",
    distributorId: "DIST001",
    distributorName: "Mazate",
    paymentMethod: "Crédito",
    items: [{ productId: "LSA001", productName: "Queso grande", quantity: 8, price: 0, discount: 0, subtotal: 0 }],
    subtotal: 0,
    discountTotal: 0,
    total: 0,
    estimatedCost: 0,
    estimatedProfit: 0,
    status: "Crédito pendiente"
  }
];

export const demoCredits: Credit[] = [
  { id: "CRD001", distributorId: "DIST001", distributorName: "Mazate", saleId: "SALE002", totalAmount: 0, paidAmount: 0, balance: 0, saleDate: now, dueDate: "2026-05-20", status: "Pagado" },
  { id: "CRD002", distributorId: "DIST002", distributorName: "CAES", saleId: "SALE000", totalAmount: 0, paidAmount: 0, balance: 0, saleDate: now, dueDate: "2026-05-20", status: "Pagado" }
];

export const demoProduction: ProductionRecord[] = [
  { id: "PROD001", date: now, userId: "USR001", branchId: "BR001", productId: "LSA001", productName: "Queso grande", quantity: 40, unitCost: 0, lotNumber: "L-0501-A", expiresAt: "2026-05-12", notes: "Producción inicial demo" }
];

export const demoTransfers: Transfer[] = [
  { id: "TRF001", date: now, userId: "USR001", originBranchId: "BR001", destinationBranchId: "BR002", items: [{ productId: "LSA004", productName: "Crema vaso", quantity: 12, price: 0, discount: 0, subtotal: 0 }], status: "Registrado", notes: "Reabastecimiento demo" }
];

export const demoWaste: WasteRecord[] = [
  { id: "WST001", date: now, userId: "USR002", branchId: "BR002", productId: "LSA005", productName: "Crema bolsa", quantity: 2, reason: "Vencido", notes: "Producto fuera de fecha" }
];

export const demoClosings: DailyClosing[] = [
  { id: "CLS001", date: now.slice(0, 10), branchId: "BR001", userId: "USR002", systemTotal: 0, cashReported: 0, transferReported: 0, creditReported: 0, difference: 0, status: "Cerrado" }
];

export function buildDashboardData(): DashboardData {
  const totalSales = demoSales.reduce((sum, sale) => sum + sale.total, 0);
  const profit = demoSales.reduce((sum, sale) => sum + sale.estimatedProfit, 0);
  return {
    kpis: {
      todaySales: totalSales,
      weekSales: totalSales,
      monthSales: totalSales,
      estimatedProfit: profit,
      pendingCredits: demoCredits.reduce((sum, credit) => sum + credit.balance, 0),
      lowStockCount: demoInventory.filter((item) => item.quantity <= item.minStock).length,
      wasteTotal: demoWaste.reduce((sum, item) => sum + item.quantity, 0),
      productionTotal: demoProduction.reduce((sum, item) => sum + item.quantity, 0)
    },
    salesByBranch: [
      { name: "Central", total: 0 },
      { name: "Agromarket 1", total: 0 }
    ],
    salesByProduct: [
      { name: "Queso", total: 0 },
      { name: "Crema", total: 0 }
    ],
    salesByPaymentMethod: [
      { name: "Efectivo", total: 0 },
      { name: "Transferencia", total: 0 },
      { name: "Crédito", total: 0 }
    ],
    monthlyComparison: [
      { month: "Ene", sales: 0, profit: 0 },
      { month: "Feb", sales: 0, profit: 0 },
      { month: "Mar", sales: 0, profit: 0 },
      { month: "Abr", sales: 0, profit: 0 },
      { month: "May", sales: 0, profit: 0 }
    ],
    topProducts: [
      { name: "Queso grande", units: 0 },
      { name: "Queso pequeño", units: 0 },
      { name: "Queso mediano", units: 0 },
      { name: "Crema vaso", units: 0 },
      { name: "Crema bolsa", units: 0 }
    ],
    topDistributors: [
      { name: "Mazate", total: 0 },
      { name: "CAES", total: 0 }
    ],
    lowStock: demoInventory.filter((item) => item.quantity <= item.minStock),
    expiringLots: demoLots.filter((lot) => lot.expiresAt),
    pendingCredits: demoCredits.filter((credit) => credit.balance > 0)
  };
}

export function buildStoreSummary(branchId = "BR001"): StoreSummary {
  const branch = demoBranches.find((item) => item.id === branchId) || demoBranches[1];
  const branchSales = demoSales.filter((sale) => sale.branchId === branch.id);
  const inventory = demoInventory.filter((item) => item.branchId === branch.id);
  const expiringAlerts = demoLots
    .filter((lot) => lot.branchId === branch.id && lot.quantity > 0 && isExpiringSoon(lot.expiresAt))
    .map((lot) => {
      const product = demoProducts.find((item) => item.id === lot.productId);
      return `El lote ${lot.lotNumber} de ${product?.name || lot.productId} vence el ${lot.expiresAt} y tiene ${lot.quantity} unidades en ${branch.name}.`;
    });
  return {
    branchName: branch.name,
    branchType: branch.type,
    salesToday: branchSales.reduce((sum, sale) => sum + sale.total, 0),
    productsSold: branchSales.flatMap((sale) => sale.items).map((item) => ({ name: item.productName || item.productId, units: item.quantity })),
    inventory,
    movementsToday: branchSales.length + demoWaste.filter((waste) => waste.branchId === branch.id).length,
    closingStatus: demoClosings.find((closing) => closing.branchId === branch.id)?.status || "Pendiente",
    alerts: [
      ...inventory.filter((item) => item.quantity <= item.minStock).map((item) => `Stock bajo: ${item.productName}`),
      ...expiringAlerts
    ]
  };
}

function isExpiringSoon(expiresAt?: string) {
  if (!expiresAt) return false;
  const days = (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 10;
}
