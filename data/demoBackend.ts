import { allStorePermissions, emptyPermissions } from "@/lib/constants";
import { todayIso } from "@/lib/utils";
import type { ApiResponse, InventoryItem, Product, SaleItem, SessionUser } from "@/types";
import {
  buildDashboardData,
  buildStoreSummary,
  demoBranches,
  demoCredits,
  demoDistributors,
  demoInventory,
  demoPasswords,
  demoProducts,
  demoProduction,
  demoSales,
  demoTransfers,
  demoUsers,
  demoWaste
} from "@/data/mockData";

function nextId(prefix: string, currentLength: number) {
  return `${prefix}${String(currentLength + 1).padStart(3, "0")}`;
}

function success<T>(data: T, message = ""): ApiResponse<T> {
  return { success: true, data, message };
}

function error(message: string): ApiResponse<never> {
  return { success: false, error: message };
}

function currentUser(payload: Record<string, unknown>) {
  return payload.currentUser as SessionUser | undefined;
}

function assertAdmin(user?: SessionUser) {
  return user?.role === "Admin";
}

function getProduct(productId: string) {
  return demoProducts.find((product) => product.id === productId || product.code === productId);
}

function getBranch(branchId?: string) {
  return demoBranches.find((branch) => branch.id === branchId);
}

function getInventory(productId: string, branchId: string) {
  let item = demoInventory.find((inventory) => inventory.productId === productId && inventory.branchId === branchId);
  if (!item) {
    const product = getProduct(productId);
    const branch = getBranch(branchId);
    item = {
      id: nextId("INV", demoInventory.length),
      productId,
      productName: product?.name || productId,
      branchId,
      branchName: branch?.name || branchId,
      quantity: 0,
      minStock: product?.minStock || 0,
      lots: [],
      updatedAt: todayIso()
    };
    demoInventory.push(item);
  }
  return item;
}

function applyStock(productId: string, branchId: string, quantityDelta: number) {
  const item = getInventory(productId, branchId);
  if (item.quantity + quantityDelta < 0) {
    throw new Error(`Stock insuficiente para ${item.productName} en ${item.branchName}.`);
  }
  item.quantity += quantityDelta;
  item.updatedAt = todayIso();
  return item;
}

function normalizeItems(items: SaleItem[] = [], branchId: string, customerType?: string, distributorId?: string) {
  return items.map((item) => {
    const product = getProduct(item.productId);
    if (!product) throw new Error(`Producto no encontrado: ${item.productId}`);
    const distributor = demoDistributors.find((candidate) => candidate.id === distributorId);
    const price =
      item.price ||
      distributor?.specialPrices?.[product.id] ||
      (customerType === "Distribuidor/mayorista" ? product.distributorPrice : product.finalPrice);
    const subtotal = item.quantity * price - (item.discount || 0);
    return {
      ...item,
      productName: product.name,
      price,
      subtotal,
      discount: item.discount || 0,
      available: getInventory(product.id, branchId).quantity
    };
  });
}

function listBySession<T extends { branchId?: string }>(rows: T[], payload: Record<string, unknown>) {
  const user = currentUser(payload);
  if (!user || user.role === "Admin") return rows;
  return rows.filter((row) => !row.branchId || user.assignedBranches.includes(row.branchId));
}

export async function runDemoAction(action: string, payload: Record<string, unknown> = {}): Promise<ApiResponse> {
  try {
    switch (action) {
      case "AUTH_LOGIN": {
        const username = String(payload.username || "");
        const password = String(payload.password || "");
        const user = demoUsers.find((candidate) => candidate.username === username);
        if (!user || demoPasswords[username] !== password || !user.active) return error("Usuario o contraseña inválidos.");
        return success(user, "Bienvenido.");
      }
      case "GET_ME":
        return success(currentUser(payload) || null);
      case "LIST_USERS":
        return success(demoUsers);
      case "CREATE_USER": {
        if (!assertAdmin(currentUser(payload))) return error("Solo Admin puede crear usuarios.");
        const role = (payload.role as "Admin" | "Tienda") || "Tienda";
        const username = String(payload.username || "").trim();
        if (!username) return error("Usuario es obligatorio.");
        const user: SessionUser = {
          id: nextId("USR", demoUsers.length),
          name: String(payload.name || username),
          username,
          role,
          permissions: role === "Tienda" ? allStorePermissions : emptyPermissions,
          assignedBranches: Array.isArray(payload.assignedBranches) ? (payload.assignedBranches as string[]) : ["BR002"],
          active: true
        };
        demoUsers.push(user);
        demoPasswords[username] = String(payload.password || "cambiar123");
        return success(user, "Usuario creado.");
      }
      case "UPDATE_USER":
      case "DEACTIVATE_USER":
        return success(demoUsers, "Usuario actualizado.");
      case "LIST_BRANCHES":
        return success(demoBranches);
      case "CREATE_BRANCH": {
        if (!assertAdmin(currentUser(payload))) return error("Solo Admin puede crear ubicaciones.");
        const branch = {
          id: nextId("BR", demoBranches.length),
          name: String(payload.name || "Nueva ubicación"),
          type: (payload.type as never) || "Punto de venta / sucursal",
          active: true,
          address: String(payload.address || ""),
          notes: String(payload.notes || ""),
          createdAt: todayIso(),
          updatedAt: todayIso()
        };
        demoBranches.push(branch);
        return success(branch, "Ubicación creada.");
      }
      case "UPDATE_BRANCH":
        return success(demoBranches, "Ubicación actualizada.");
      case "LIST_PRODUCTS":
        return success(demoProducts);
      case "CREATE_PRODUCT": {
        if (!assertAdmin(currentUser(payload))) return error("Solo Admin puede crear productos.");
        const product: Product = {
          id: nextId("LSA", demoProducts.length),
          code: nextId("LSA", demoProducts.length),
          name: String(payload.name || "Nuevo producto"),
          imageUrl: String(payload.imageUrl || ""),
          unit: String(payload.unit || "unidad"),
          presentation: String(payload.presentation || ""),
          category: String(payload.category || ""),
          finalPrice: Number(payload.finalPrice || 0),
          distributorPrice: Number(payload.distributorPrice || 0),
          productionCost: Number(payload.productionCost || 0),
          minStock: Number(payload.minStock || 0),
          active: true,
          createdAt: todayIso(),
          updatedAt: todayIso()
        };
        demoProducts.push(product);
        return success(product, "Producto creado.");
      }
      case "UPDATE_PRODUCT":
        return success(demoProducts, "Producto actualizado.");
      case "SET_PRICE":
      case "GET_PRICE_HISTORY":
        return success(
          demoProducts.map((product) => ({
            productId: product.id,
            productName: product.name,
            finalPrice: product.finalPrice,
            distributorPrice: product.distributorPrice,
            updatedAt: product.updatedAt
          }))
        );
      case "LIST_INVENTORY":
        return success(listBySession(demoInventory, payload));
      case "REGISTER_PRODUCTION": {
        const user = currentUser(payload);
        if (!user) return error("Sesión requerida.");
        const productId = String(payload.productId);
        const branchId = String(payload.branchId || user.assignedBranches[0]);
        const product = getProduct(productId);
        if (!product) return error("Producto no encontrado.");
        const quantity = Number(payload.quantity || 0);
        if (quantity <= 0) return error("Cantidad inválida.");
        applyStock(product.id, branchId, quantity);
        const record = {
          id: nextId("PROD", demoProduction.length),
          date: todayIso(),
          userId: user.id,
          branchId,
          branchName: getBranch(branchId)?.name || branchId,
          productId: product.id,
          productName: product.name,
          quantity,
          unitCost: Number(payload.unitCost || product.productionCost),
          lotNumber: String(payload.lotNumber || ""),
          expiresAt: String(payload.expiresAt || ""),
          notes: String(payload.notes || "")
        };
        demoProduction.push(record);
        return success(record, "Producción registrada.");
      }
      case "REGISTER_TRANSFER": {
        const user = currentUser(payload);
        if (!user) return error("Sesión requerida.");
        const originBranchId = String(payload.originBranchId || "BR001");
        const destinationBranchId = String(payload.destinationBranchId || "");
        const items = normalizeItems((payload.items as SaleItem[]) || [], originBranchId);
        items.forEach((item) => {
          applyStock(item.productId, originBranchId, -item.quantity);
          applyStock(item.productId, destinationBranchId, item.quantity);
        });
        const transfer = {
          id: nextId("TRF", demoTransfers.length),
          date: todayIso(),
          userId: user.id,
          originBranchId,
          originBranchName: getBranch(originBranchId)?.name || originBranchId,
          destinationBranchId,
          destinationBranchName: getBranch(destinationBranchId)?.name || destinationBranchId,
          items,
          status: "Registrado" as const,
          notes: String(payload.notes || "")
        };
        demoTransfers.push(transfer);
        return success(transfer, "Envío registrado.");
      }
      case "REGISTER_SALE": {
        const user = currentUser(payload);
        if (!user) return error("Sesión requerida.");
        const branchId = String(payload.branchId || user.assignedBranches[0]);
        if (user.role === "Tienda" && !user.assignedBranches.includes(branchId)) return error("Ubicación no asignada.");
        if (user.role === "Tienda" && !user.permissions.can_register_sales) return error("No tiene permiso para registrar ventas.");
        const customerType = (payload.customerType as string) || "Cliente general";
        const distributorId = String(payload.distributorId || "");
        const items = normalizeItems((payload.items as SaleItem[]) || [], branchId, customerType, distributorId);
        items.forEach((item) => applyStock(item.productId, branchId, -item.quantity));
        const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const discountTotal = items.reduce((sum, item) => sum + item.discount, 0);
        const estimatedCost = items.reduce((sum, item) => sum + (getProduct(item.productId)?.productionCost || 0) * item.quantity, 0);
        const distributor = demoDistributors.find((candidate) => candidate.id === distributorId);
        const branch = getBranch(branchId);
        const sale = {
          id: nextId("SALE", demoSales.length),
          date: todayIso(),
          userId: user.id,
          userName: user.name,
          branchId,
          branchName: branch?.name || branchId,
          customerType: customerType as never,
          distributorId,
          distributorName: distributor?.name,
          paymentMethod: (payload.paymentMethod as never) || "Efectivo",
          items,
          subtotal,
          discountTotal,
          total: subtotal - discountTotal,
          estimatedCost,
          estimatedProfit: subtotal - discountTotal - estimatedCost,
          status: payload.paymentMethod === "Crédito" ? ("Crédito pendiente" as const) : ("Pagada" as const),
          notes: String(payload.notes || "")
        };
        demoSales.push(sale);
        if (sale.paymentMethod === "Crédito" && distributor) {
          demoCredits.push({
            id: nextId("CRD", demoCredits.length),
            distributorId: distributor.id,
            distributorName: distributor.name,
            saleId: sale.id,
            totalAmount: sale.total,
            paidAmount: 0,
            balance: sale.total,
            saleDate: sale.date,
            status: "Pendiente"
          });
        }
        return success(sale, "Venta registrada.");
      }
      case "LIST_SALES":
        return success(listBySession(demoSales, payload));
      case "LIST_PRODUCTION":
        return success(
          listBySession(demoProduction, payload).map((record) => ({
            ...record,
            branchName: getBranch(record.branchId)?.name || record.branchId
          }))
        );
      case "LIST_TRANSFERS":
        return success(
          demoTransfers.map((transfer) => ({
            ...transfer,
            originBranchName: getBranch(transfer.originBranchId)?.name || transfer.originBranchId,
            destinationBranchName: getBranch(transfer.destinationBranchId)?.name || transfer.destinationBranchId
          }))
        );
      case "LIST_WASTE":
        return success(
          listBySession(demoWaste, payload).map((record) => ({
            ...record,
            branchName: getBranch(record.branchId)?.name || record.branchId
          }))
        );
      case "REGISTER_WASTE": {
        const user = currentUser(payload);
        if (!user) return error("Sesión requerida.");
        const branchId = String(payload.branchId || user.assignedBranches[0]);
        const product = getProduct(String(payload.productId));
        if (!product) return error("Producto no encontrado.");
        const quantity = Number(payload.quantity || 0);
        applyStock(product.id, branchId, -quantity);
        const record = {
          id: nextId("WST", demoWaste.length),
          date: todayIso(),
          userId: user.id,
          branchId,
          branchName: getBranch(branchId)?.name || branchId,
          productId: product.id,
          productName: product.name,
          quantity,
          reason: (payload.reason as never) || "Otro",
          notes: String(payload.notes || "")
        };
        demoWaste.push(record);
        return success(record, "Merma registrada.");
      }
      case "REGISTER_RETURN":
        return success({ id: nextId("RET", 0), ...payload, date: todayIso() }, "Devolución registrada.");
      case "CREATE_DISTRIBUTOR": {
        const distributor = {
          id: nextId("DIST", demoDistributors.length),
          name: String(payload.name || "Nuevo distribuidor"),
          phone: String(payload.phone || ""),
          email: String(payload.email || ""),
          address: String(payload.address || ""),
          active: true,
          notes: String(payload.notes || ""),
          createdAt: todayIso()
        };
        demoDistributors.push(distributor);
        return success(distributor, "Distribuidor creado.");
      }
      case "UPDATE_DISTRIBUTOR":
        return success(demoDistributors, "Distribuidor actualizado.");
      case "LIST_DISTRIBUTORS":
        return success(demoDistributors);
      case "REGISTER_CREDIT_PAYMENT": {
        const credit = demoCredits.find((item) => item.id === payload.creditId);
        if (!credit) return error("Crédito no encontrado.");
        const amount = Number(payload.amount || 0);
        credit.paidAmount += amount;
        credit.balance = Math.max(0, credit.totalAmount - credit.paidAmount);
        credit.status = credit.balance <= 0 ? "Pagado" : "Parcial";
        return success(credit, "Abono registrado.");
      }
      case "LIST_CREDITS":
        return success(demoCredits);
      case "GET_ADMIN_DASHBOARD":
        if (!assertAdmin(currentUser(payload))) return error("Solo Admin puede ver el dashboard completo.");
        return success(buildDashboardData());
      case "GET_STORE_DAILY_SUMMARY": {
        const user = currentUser(payload);
        return success(buildStoreSummary(String(payload.branchId || user?.assignedBranches[0] || "BR002")));
      }
      case "CREATE_CORRECTION_REQUEST":
      case "REVIEW_CORRECTION_REQUEST":
        return success({ id: nextId("COR", 0), ...payload, status: action === "CREATE_CORRECTION_REQUEST" ? "Pendiente" : "Aprobada" });
      case "REGISTER_DAILY_CLOSING": {
        const systemTotal = Number(payload.systemTotal || 0);
        const reported = Number(payload.cashReported || 0) + Number(payload.transferReported || 0) + Number(payload.cardReported || 0) + Number(payload.creditReported || 0);
        return success({ id: nextId("CLS", 1), ...payload, difference: reported - systemTotal, status: "Cerrado" }, "Cierre registrado.");
      }
      case "EXPORT_REPORT_DATA":
        return success({ rows: demoSales, filename: "reporte-queseria.csv" });
      case "SETUP_SPREADSHEET":
        return success({ tabs: 25 }, "Demo: estructura simulada.");
      case "GET_SETTINGS":
        return success([
          { key: "adminEmails", value: "admin@queseriasanantonio.com" },
          { key: "allowNegativeStock", value: "No" },
          { key: "lowStockNotifications", value: "Activo" },
          { key: "currency", value: "GTQ" }
        ]);
      case "SET_SETTINGS":
        return success(payload, "Configuración guardada.");
      default:
        return error(`Acción demo no implementada: ${action}`);
    }
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Error demo inesperado.");
  }
}

export type { InventoryItem };
