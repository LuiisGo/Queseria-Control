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
const demoProductionDateCode = "260504";
const SKU_QG = `QG${demoProductionDateCode}`;
const SKU_QP = `QP${demoProductionDateCode}`;
const SKU_QM = `QM${demoProductionDateCode}`;
const SKU_CV = `CV${demoProductionDateCode}`;
const SKU_CB = `CB${demoProductionDateCode}`;
const BR_CENTRAL = "AGM001";
const BR_AGROMARKET_1 = "AGM002";
const DIST_MAZATE = "ALIS001";
const DIST_CAES = "ALIS002";

export const demoUsers: SessionUser[] = [
  {
    id: "USR001",
    name: "Admin San Antonio",
    username: "admin",
    role: "Admin",
    permissions: emptyPermissions,
    assignedBranches: [BR_CENTRAL, BR_AGROMARKET_1],
    active: true
  },
  {
    id: "USR002",
    name: "Central",
    username: "tienda",
    role: "Tienda",
    permissions: allStorePermissions,
    assignedBranches: [BR_CENTRAL],
    active: true
  },
  {
    id: "USR003",
    name: "Agromarket 1",
    username: "agromarket1",
    role: "Tienda",
    permissions: allStorePermissions,
    assignedBranches: [BR_AGROMARKET_1],
    active: true
  }
];

export const demoPasswords: Record<string, string> = {
  admin: "admin123",
  tienda: "tienda123",
  agromarket1: "agromarket123"
};

export const demoBranches: Branch[] = [
  { id: BR_CENTRAL, name: "Central", type: "Tienda central", active: true, address: "Central", createdAt: now, updatedAt: now },
  { id: BR_AGROMARKET_1, name: "Agromarket 1", type: "Punto de venta / sucursal", active: true, address: "Agromarket 1", createdAt: now, updatedAt: now }
];

export const demoProducts: Product[] = [
  { id: SKU_QG, code: SKU_QG, name: "Queso grande", unit: "unidad", presentation: "Grande", category: "Quesos", finalPrice: 0, distributorPrice: 0, productionCost: 0, minStock: 10, active: true, createdAt: now, updatedAt: now },
  { id: SKU_QP, code: SKU_QP, name: "Queso pequeño", unit: "unidad", presentation: "Pequeño", category: "Quesos", finalPrice: 0, distributorPrice: 0, productionCost: 0, minStock: 12, active: true, createdAt: now, updatedAt: now },
  { id: SKU_QM, code: SKU_QM, name: "Queso mediano", unit: "unidad", presentation: "Mediano", category: "Quesos", finalPrice: 0, distributorPrice: 0, productionCost: 0, minStock: 10, active: true, createdAt: now, updatedAt: now },
  { id: SKU_CV, code: SKU_CV, name: "Crema vaso", unit: "unidad", presentation: "Vaso", category: "Cremas", finalPrice: 0, distributorPrice: 0, productionCost: 0, minStock: 18, active: true, createdAt: now, updatedAt: now },
  { id: SKU_CB, code: SKU_CB, name: "Crema bolsa", unit: "unidad", presentation: "Bolsa", category: "Cremas", finalPrice: 0, distributorPrice: 0, productionCost: 0, minStock: 18, active: true, createdAt: now, updatedAt: now }
];

export const demoDistributors: Distributor[] = [
  { id: DIST_MAZATE, name: "Mazate", phone: "", email: "", address: "", active: true, notes: "", createdAt: now },
  { id: DIST_CAES, name: "CAES", phone: "", email: "", address: "", active: true, notes: "", createdAt: now }
];

export const demoLots: InventoryLot[] = [
  { id: "LOT001", productId: SKU_QG, branchId: BR_CENTRAL, lotNumber: "001", expiresAt: "2026-05-12", quantity: 32 },
  { id: "LOT002", productId: SKU_QP, branchId: BR_CENTRAL, lotNumber: "002", expiresAt: "2026-05-14", quantity: 24 },
  { id: "LOT003", productId: SKU_QM, branchId: BR_CENTRAL, lotNumber: "003", expiresAt: "2026-05-14", quantity: 20 },
  { id: "LOT004", productId: SKU_CV, branchId: BR_CENTRAL, lotNumber: "004", expiresAt: "2026-05-10", quantity: 28 },
  { id: "LOT005", productId: SKU_CB, branchId: BR_CENTRAL, lotNumber: "005", expiresAt: "2026-05-11", quantity: 22 },
  { id: "LOT006", productId: SKU_CV, branchId: BR_AGROMARKET_1, lotNumber: "004", expiresAt: "2026-05-10", quantity: 18 },
  { id: "LOT007", productId: SKU_CB, branchId: BR_AGROMARKET_1, lotNumber: "005", expiresAt: "2026-05-11", quantity: 16 }
];

export const demoInventory: InventoryItem[] = [
  { id: "INV001", productId: "QG260504", productName: "Queso grande", branchId: "AGM001", branchName: "Central", quantity: 32, minStock: 10, lots: [demoLots[0]], updatedAt: now },
  { id: "INV002", productId: "QP260504", productName: "Queso pequeño", branchId: "AGM001", branchName: "Central", quantity: 24, minStock: 12, lots: [demoLots[1]], updatedAt: now },
  { id: "INV003", productId: "QM260504", productName: "Queso mediano", branchId: "AGM001", branchName: "Central", quantity: 20, minStock: 10, lots: [demoLots[2]], updatedAt: now },
  { id: "INV004", productId: "CV260504", productName: "Crema vaso", branchId: "AGM001", branchName: "Central", quantity: 28, minStock: 18, lots: [demoLots[3]], updatedAt: now },
  { id: "INV005", productId: "CB260504", productName: "Crema bolsa", branchId: "AGM001", branchName: "Central", quantity: 22, minStock: 18, lots: [demoLots[4]], updatedAt: now },
  { id: "INV006", productId: "CV260504", productName: "Crema vaso", branchId: "AGM002", branchName: "Agromarket 1", quantity: 18, minStock: 18, lots: [demoLots[5]], updatedAt: now },
  { id: "INV007", productId: "CB260504", productName: "Crema bolsa", branchId: "AGM002", branchName: "Agromarket 1", quantity: 16, minStock: 18, lots: [demoLots[6]], updatedAt: now }
];

export const demoSales: Sale[] = [
  {
    id: "SALE001",
    date: now,
    userId: "USR002",
    userName: "Agromarket 1",
    branchId: "AGM002",
    branchName: "Agromarket 1",
    customerType: "Cliente general",
    paymentMethod: "Efectivo",
    items: [{ productId: "CV260504", productName: "Crema vaso", quantity: 3, price: 0, discount: 0, subtotal: 0 }],
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
    branchId: "AGM001",
    branchName: "Central",
    customerType: "Distribuidor/mayorista",
    distributorId: "ALIS001",
    distributorName: "Mazate",
    paymentMethod: "Crédito",
    items: [{ productId: "QG260504", productName: "Queso grande", quantity: 8, price: 0, discount: 0, subtotal: 0 }],
    subtotal: 0,
    discountTotal: 0,
    total: 0,
    estimatedCost: 0,
    estimatedProfit: 0,
    status: "Crédito pendiente"
  }
];

export const demoCredits: Credit[] = [
  { id: "CRD001", distributorId: "ALIS001", distributorName: "Mazate", saleId: "SALE002", totalAmount: 0, paidAmount: 0, balance: 0, saleDate: now, dueDate: "2026-05-20", status: "Pagado" },
  { id: "CRD002", distributorId: "ALIS002", distributorName: "CAES", saleId: "SALE000", totalAmount: 0, paidAmount: 0, balance: 0, saleDate: now, dueDate: "2026-05-20", status: "Pagado" }
];

export const demoProduction: ProductionRecord[] = [
  { id: "PROD001", date: now, userId: "USR001", branchId: "AGM001", productId: "QG260504", productName: "Queso grande", quantity: 40, unitCost: 0, lotNumber: "L-0501-A", expiresAt: "2026-05-12", notes: "Producción inicial demo" }
];

export const demoTransfers: Transfer[] = [
  { id: "TRF001", date: now, userId: "USR001", originBranchId: "AGM001", destinationBranchId: "AGM002", items: [{ productId: "CV260504", productName: "Crema vaso", quantity: 12, price: 0, discount: 0, subtotal: 0 }], status: "Registrado", notes: "Reabastecimiento demo" }
];

export const demoWaste: WasteRecord[] = [
  { id: "WST001", date: now, userId: "USR002", branchId: "AGM002", productId: "CB260504", productName: "Crema bolsa", quantity: 2, reason: "Vencido", notes: "Producto fuera de fecha" }
];

export const demoClosings: DailyClosing[] = [
  { id: "CLS001", date: now.slice(0, 10), branchId: "AGM001", userId: "USR002", systemTotal: 0, cashReported: 0, transferReported: 0, creditReported: 0, difference: 0, status: "Cerrado" }
];

export function buildDashboardData(): DashboardData {
  const totalSales = demoSales.reduce((sum, sale) => sum + sale.total, 0);
  const profit = demoSales.reduce((sum, sale) => sum + sale.estimatedProfit, 0);
  const unitsByProduct = aggregateSaleUnitsByProduct();
  const salesByMethod = ["Efectivo", "Transferencia", "Crédito"].map((method) => ({
    name: method,
    total: demoSales.filter((sale) => sale.paymentMethod === method).length
  }));
  return {
    kpis: {
      todaySales: totalSales,
      weekSales: totalSales,
      monthSales: totalSales,
      estimatedProfit: profit,
      pendingCredits: demoCredits.reduce((sum, credit) => sum + credit.balance, 0),
      lowStockCount: demoInventory.filter((item) => item.quantity <= item.minStock).length,
      wasteTotal: demoWaste.reduce((sum, item) => sum + item.quantity, 0),
      productionTotal: demoProduction.reduce((sum, item) => sum + item.quantity, 0),
      activeTransfers: demoTransfers.filter((transfer) => transfer.status !== "Cerrado").length
    },
    salesByBranch: [
      { name: "Central", total: 0 },
      { name: "Agromarket 1", total: 0 }
    ],
    salesByProduct: unitsByProduct,
    salesByPaymentMethod: salesByMethod,
    monthlyComparison: [
      { month: "Ene", sales: 0, profit: 0 },
      { month: "Feb", sales: 0, profit: 0 },
      { month: "Mar", sales: 0, profit: 0 },
      { month: "Abr", sales: 0, profit: 0 },
      { month: "May", sales: 0, profit: 0 }
    ],
    productionTrend: [
      { month: "Ene", production: 0, waste: 0 },
      { month: "Feb", production: 0, waste: 0 },
      { month: "Mar", production: 0, waste: 0 },
      { month: "Abr", production: 12, waste: 1 },
      { month: "May", production: demoProduction.reduce((sum, item) => sum + item.quantity, 0), waste: demoWaste.reduce((sum, item) => sum + item.quantity, 0) }
    ],
    inventoryByBranch: demoBranches.map((branch) => ({
      name: branch.name,
      quantity: demoInventory.filter((item) => item.branchId === branch.id).reduce((sum, item) => sum + item.quantity, 0)
    })),
    wasteByReason: ["Vencido", "Dañado", "Pérdida", "Otro"].map((reason) => ({
      name: reason,
      total: demoWaste.filter((item) => item.reason === reason).reduce((sum, item) => sum + item.quantity, 0)
    })),
    topProducts: unitsByProduct.map((item) => ({ name: item.name, units: item.total })),
    topDistributors: [
      { name: "Mazate", total: 0 },
      { name: "CAES", total: 0 }
    ],
    lowStock: demoInventory.filter((item) => item.quantity <= item.minStock),
    expiringLots: demoLots.filter((lot) => lot.expiresAt),
    pendingCredits: demoCredits.filter((credit) => credit.balance > 0)
  };
}

function aggregateSaleUnitsByProduct() {
  const totals = new Map<string, number>();
  demoSales.flatMap((sale) => sale.items).forEach((item) => {
    totals.set(item.productName || item.productId, (totals.get(item.productName || item.productId) || 0) + item.quantity);
  });
  const rows = Array.from(totals, ([name, total]) => ({ name, total }));
  return rows.length ? rows : demoProducts.map((product) => ({ name: product.name, total: 0 }));
}

export function buildStoreSummary(branchId = "AGM001"): StoreSummary {
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
  return days >= 0 && days <= 2;
}
