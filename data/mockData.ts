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
    assignedBranches: ["BR001", "BR002", "BR003", "BR004", "BR005"],
    active: true
  },
  {
    id: "USR002",
    name: "Tienda Central",
    username: "tienda",
    role: "Tienda",
    permissions: allStorePermissions,
    assignedBranches: ["BR002"],
    active: true
  }
];

export const demoPasswords: Record<string, string> = {
  admin: "admin123",
  tienda: "tienda123"
};

export const demoBranches: Branch[] = [
  { id: "BR001", name: "Producción", type: "Producción", active: true, address: "Planta San Antonio", createdAt: now, updatedAt: now },
  { id: "BR002", name: "Tienda Central", type: "Tienda central", active: true, address: "Centro", createdAt: now, updatedAt: now },
  { id: "BR003", name: "Sucursal Norte", type: "Punto de venta / sucursal", active: true, createdAt: now, updatedAt: now },
  { id: "BR004", name: "Sucursal Mercado", type: "Punto de venta / sucursal", active: true, createdAt: now, updatedAt: now },
  { id: "BR005", name: "Sucursal Sur", type: "Punto de venta / sucursal", active: true, createdAt: now, updatedAt: now }
];

export const demoProducts: Product[] = [
  { id: "LSA001", code: "LSA001", name: "Queso fresco pequeño", unit: "unidad", presentation: "Pequeño", category: "Quesos", finalPrice: 22, distributorPrice: 18, productionCost: 12, minStock: 12, active: true, createdAt: now, updatedAt: now },
  { id: "LSA002", code: "LSA002", name: "Queso fresco grande", unit: "unidad", presentation: "Grande", category: "Quesos", finalPrice: 42, distributorPrice: 35, productionCost: 24, minStock: 10, active: true, createdAt: now, updatedAt: now },
  { id: "LSA003", code: "LSA003", name: "Crema 250 ml", unit: "unidad", presentation: "250 ml", category: "Cremas", finalPrice: 12, distributorPrice: 9.5, productionCost: 6, minStock: 18, active: true, createdAt: now, updatedAt: now },
  { id: "LSA004", code: "LSA004", name: "Crema 500 ml", unit: "unidad", presentation: "500 ml", category: "Cremas", finalPrice: 21, distributorPrice: 17, productionCost: 11, minStock: 16, active: true, createdAt: now, updatedAt: now },
  { id: "LSA005", code: "LSA005", name: "Crema 1 litro", unit: "unidad", presentation: "1 litro", category: "Cremas", finalPrice: 38, distributorPrice: 31, productionCost: 20, minStock: 8, active: true, createdAt: now, updatedAt: now },
  { id: "LSA006", code: "LSA006", name: "Requesón familiar", unit: "unidad", presentation: "Familiar", category: "Quesos", finalPrice: 28, distributorPrice: 23, productionCost: 15, minStock: 8, active: true, createdAt: now, updatedAt: now },
  { id: "LSA007", code: "LSA007", name: "Quesillo artesanal", unit: "unidad", presentation: "Libra", category: "Quesos", finalPrice: 32, distributorPrice: 27, productionCost: 18, minStock: 10, active: true, createdAt: now, updatedAt: now },
  { id: "LSA008", code: "LSA008", name: "Yogurt natural", unit: "unidad", presentation: "500 ml", category: "Yogurt", finalPrice: 18, distributorPrice: 14, productionCost: 8, minStock: 12, active: true, createdAt: now, updatedAt: now }
];

export const demoDistributors: Distributor[] = [
  { id: "DIST001", name: "Distribuidora El Valle", phone: "5550-1001", email: "compras@elvalle.gt", address: "Zona 1", active: true, notes: "Compra semanal", specialPrices: { LSA002: 33 }, createdAt: now },
  { id: "DIST002", name: "Abarrotería La Bendición", phone: "5550-1002", active: true, notes: "Crédito 15 días", createdAt: now },
  { id: "DIST003", name: "Mini Súper San Miguel", phone: "5550-1003", active: true, createdAt: now }
];

export const demoLots: InventoryLot[] = [
  { id: "LOT001", productId: "LSA001", branchId: "BR002", lotNumber: "L-0501-A", expiresAt: "2026-05-12", quantity: 32 },
  { id: "LOT002", productId: "LSA002", branchId: "BR002", lotNumber: "L-0501-B", expiresAt: "2026-05-14", quantity: 18 },
  { id: "LOT003", productId: "LSA003", branchId: "BR002", lotNumber: "C-0502-A", expiresAt: "2026-05-09", quantity: 46 },
  { id: "LOT004", productId: "LSA004", branchId: "BR003", lotNumber: "C-0502-B", expiresAt: "2026-05-10", quantity: 8 },
  { id: "LOT005", productId: "LSA007", branchId: "BR004", lotNumber: "Q-0503-A", expiresAt: "2026-05-16", quantity: 7 }
];

export const demoInventory: InventoryItem[] = [
  { id: "INV001", productId: "LSA001", productName: "Queso fresco pequeño", branchId: "BR002", branchName: "Tienda Central", quantity: 32, minStock: 12, lots: [demoLots[0]], updatedAt: now },
  { id: "INV002", productId: "LSA002", productName: "Queso fresco grande", branchId: "BR002", branchName: "Tienda Central", quantity: 18, minStock: 10, lots: [demoLots[1]], updatedAt: now },
  { id: "INV003", productId: "LSA003", productName: "Crema 250 ml", branchId: "BR002", branchName: "Tienda Central", quantity: 46, minStock: 18, lots: [demoLots[2]], updatedAt: now },
  { id: "INV004", productId: "LSA004", productName: "Crema 500 ml", branchId: "BR003", branchName: "Sucursal Norte", quantity: 8, minStock: 16, lots: [demoLots[3]], updatedAt: now },
  { id: "INV005", productId: "LSA007", productName: "Quesillo artesanal", branchId: "BR004", branchName: "Sucursal Mercado", quantity: 7, minStock: 10, lots: [demoLots[4]], updatedAt: now },
  { id: "INV006", productId: "LSA005", productName: "Crema 1 litro", branchId: "BR005", branchName: "Sucursal Sur", quantity: 14, minStock: 8, lots: [], updatedAt: now }
];

export const demoSales: Sale[] = [
  {
    id: "SALE001",
    date: now,
    userId: "USR002",
    userName: "Tienda Central",
    branchId: "BR002",
    branchName: "Tienda Central",
    customerType: "Cliente general",
    paymentMethod: "Efectivo",
    items: [{ productId: "LSA001", productName: "Queso fresco pequeño", quantity: 3, price: 22, discount: 0, subtotal: 66 }],
    subtotal: 66,
    discountTotal: 0,
    total: 66,
    estimatedCost: 36,
    estimatedProfit: 30,
    status: "Pagada"
  },
  {
    id: "SALE002",
    date: now,
    userId: "USR001",
    userName: "Admin San Antonio",
    branchId: "BR002",
    branchName: "Tienda Central",
    customerType: "Distribuidor/mayorista",
    distributorId: "DIST001",
    distributorName: "Distribuidora El Valle",
    paymentMethod: "Crédito",
    items: [{ productId: "LSA002", productName: "Queso fresco grande", quantity: 8, price: 33, discount: 0, subtotal: 264 }],
    subtotal: 264,
    discountTotal: 0,
    total: 264,
    estimatedCost: 192,
    estimatedProfit: 72,
    status: "Crédito pendiente"
  }
];

export const demoCredits: Credit[] = [
  { id: "CRD001", distributorId: "DIST001", distributorName: "Distribuidora El Valle", saleId: "SALE002", totalAmount: 264, paidAmount: 80, balance: 184, saleDate: now, dueDate: "2026-05-20", status: "Parcial" },
  { id: "CRD002", distributorId: "DIST002", distributorName: "Abarrotería La Bendición", saleId: "SALE000", totalAmount: 410, paidAmount: 0, balance: 410, saleDate: "2026-04-18T10:00:00.000Z", dueDate: "2026-05-01", status: "Vencido" }
];

export const demoProduction: ProductionRecord[] = [
  { id: "PROD001", date: now, userId: "USR001", branchId: "BR002", productId: "LSA001", productName: "Queso fresco pequeño", quantity: 40, unitCost: 12, lotNumber: "L-0501-A", expiresAt: "2026-05-12", notes: "Producción inicial demo" }
];

export const demoTransfers: Transfer[] = [
  { id: "TRF001", date: now, userId: "USR001", originBranchId: "BR002", destinationBranchId: "BR003", items: [{ productId: "LSA004", productName: "Crema 500 ml", quantity: 12, price: 0, discount: 0, subtotal: 0 }], status: "Registrado", notes: "Reabastecimiento demo" }
];

export const demoWaste: WasteRecord[] = [
  { id: "WST001", date: now, userId: "USR002", branchId: "BR003", productId: "LSA004", productName: "Crema 500 ml", quantity: 2, reason: "Vencido", notes: "Producto fuera de fecha" }
];

export const demoClosings: DailyClosing[] = [
  { id: "CLS001", date: now.slice(0, 10), branchId: "BR002", userId: "USR002", systemTotal: 66, cashReported: 66, transferReported: 0, cardReported: 0, creditReported: 0, difference: 0, status: "Cerrado" }
];

export function buildDashboardData(): DashboardData {
  const totalSales = demoSales.reduce((sum, sale) => sum + sale.total, 0);
  const profit = demoSales.reduce((sum, sale) => sum + sale.estimatedProfit, 0);
  return {
    kpis: {
      todaySales: totalSales,
      weekSales: totalSales + 980,
      monthSales: totalSales + 7240,
      estimatedProfit: profit + 2120,
      pendingCredits: demoCredits.reduce((sum, credit) => sum + credit.balance, 0),
      lowStockCount: demoInventory.filter((item) => item.quantity <= item.minStock).length,
      wasteTotal: demoWaste.reduce((sum, item) => sum + item.quantity, 0),
      productionTotal: demoProduction.reduce((sum, item) => sum + item.quantity, 0)
    },
    salesByBranch: [
      { name: "Central", total: 3280 },
      { name: "Norte", total: 1640 },
      { name: "Mercado", total: 2130 },
      { name: "Sur", total: 1320 }
    ],
    salesByProduct: [
      { name: "Queso fresco", total: 3120 },
      { name: "Crema", total: 2200 },
      { name: "Quesillo", total: 1320 }
    ],
    salesByPaymentMethod: [
      { name: "Efectivo", total: 3820 },
      { name: "Transferencia", total: 1830 },
      { name: "Tarjeta", total: 940 },
      { name: "Crédito", total: 1720 }
    ],
    monthlyComparison: [
      { month: "Ene", sales: 16200, profit: 6020 },
      { month: "Feb", sales: 17400, profit: 6580 },
      { month: "Mar", sales: 18900, profit: 7110 },
      { month: "Abr", sales: 21100, profit: 8200 },
      { month: "May", sales: 8370, profit: 3240 }
    ],
    topProducts: [
      { name: "Queso fresco grande", units: 180 },
      { name: "Crema 500 ml", units: 142 },
      { name: "Queso fresco pequeño", units: 130 },
      { name: "Crema 250 ml", units: 118 },
      { name: "Quesillo artesanal", units: 84 }
    ],
    topDistributors: [
      { name: "El Valle", total: 2340 },
      { name: "La Bendición", total: 1820 },
      { name: "San Miguel", total: 1210 }
    ],
    lowStock: demoInventory.filter((item) => item.quantity <= item.minStock),
    expiringLots: demoLots.filter((lot) => lot.expiresAt),
    pendingCredits: demoCredits.filter((credit) => credit.balance > 0)
  };
}

export function buildStoreSummary(branchId = "BR002"): StoreSummary {
  const branch = demoBranches.find((item) => item.id === branchId) || demoBranches[1];
  const branchSales = demoSales.filter((sale) => sale.branchId === branch.id);
  const inventory = demoInventory.filter((item) => item.branchId === branch.id);
  return {
    branchName: branch.name,
    salesToday: branchSales.reduce((sum, sale) => sum + sale.total, 0),
    productsSold: branchSales.flatMap((sale) => sale.items).map((item) => ({ name: item.productName || item.productId, units: item.quantity })),
    inventory,
    movementsToday: branchSales.length + demoWaste.filter((waste) => waste.branchId === branch.id).length,
    closingStatus: demoClosings.find((closing) => closing.branchId === branch.id)?.status || "Pendiente",
    alerts: inventory.filter((item) => item.quantity <= item.minStock).map((item) => `Stock bajo: ${item.productName}`)
  };
}
