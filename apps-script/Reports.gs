function getAdminDashboard(payload) {
  requireAdmin(payload);
  var sales = getRows("Sales");
  var inventory = listInventory(payload).data;
  var credits = listCredits(payload).data;
  var total = sales.reduce(function(sum, row) { return sum + Number(row.Total || 0); }, 0);
  return success({
    kpis: {
      todaySales: total,
      weekSales: total,
      monthSales: total,
      estimatedProfit: sales.reduce(function(sum, row) { return sum + Number(row.Estimated_Profit || 0); }, 0),
      pendingCredits: credits.reduce(function(sum, row) { return sum + Number(row.balance || 0); }, 0),
      lowStockCount: inventory.filter(function(row) { return row.quantity <= row.minStock; }).length,
      wasteTotal: getRows("Waste").reduce(function(sum, row) { return sum + Number(row.Quantity || 0); }, 0),
      productionTotal: getRows("Production").reduce(function(sum, row) { return sum + Number(row.Quantity || 0); }, 0)
    },
    salesByBranch: aggregateSalesBy("Branch_ID", sales, branchName),
    salesByProduct: [],
    salesByPaymentMethod: aggregateSalesBy("Payment_Method", sales, function(value) { return value; }),
    monthlyComparison: [],
    topProducts: [],
    topDistributors: [],
    lowStock: inventory.filter(function(row) { return row.quantity <= row.minStock; }),
    expiringLots: getRows("Inventory_Lots").filter(function(lot) { return Number(lot.Quantity || 0) > 0; }).map(mapLot),
    pendingCredits: credits.filter(function(row) { return row.balance > 0; })
  });
}

function aggregateSalesBy(key, sales, labelFn) {
  var map = {};
  sales.forEach(function(row) {
    var label = labelFn(row[key] || "");
    map[label] = (map[label] || 0) + Number(row.Total || 0);
  });
  return Object.keys(map).map(function(name) { return { name: name, total: map[name] }; });
}

function getStoreDailySummary(payload) {
  var user = requireActiveUser(payload);
  var branchId = payload.branchId || userAssignedBranches(user.ID)[0];
  assertBranchAccess(user, branchId);
  var sales = getRows("Sales").filter(function(row) { return row.Branch_ID === branchId; });
  var inventory = listInventory(Object.assign({}, payload, { currentUser: { id: user.ID } })).data;
  var expiringAlerts = [];
  inventory.forEach(function(item) {
    (item.lots || []).forEach(function(lot) {
      if (isExpiringSoon(lot.expiresAt)) expiringAlerts.push("El lote " + lot.lotNumber + " de " + item.productName + " vence el " + lot.expiresAt + " y tiene " + lot.quantity + " unidades en " + branchName(branchId) + ".");
    });
  });
  return success({ branchName: branchName(branchId), branchType: branchType(branchId), salesToday: sales.reduce(function(sum, row) { return sum + Number(row.Total || 0); }, 0), productsSold: [], inventory: inventory, movementsToday: sales.length, closingStatus: "Pendiente", alerts: inventory.filter(function(row) { return row.quantity <= row.minStock; }).map(function(row) { return "Stock bajo: " + row.productName; }).concat(expiringAlerts) });
}

function isExpiringSoon(expiresAt) {
  if (!expiresAt) return false;
  var days = (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 10;
}

function exportReportData(payload) {
  requireAdmin(payload);
  return success({ rows: getRows(payload.sheetName || "Sales"), filename: "reporte.csv" });
}
