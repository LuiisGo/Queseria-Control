function getAdminDashboard(payload) {
  requireAdmin(payload);
  checkExpirationNotifications();
  var sales = getRows("Sales");
  var inventory = listInventory(payload).data;
  var credits = listCredits(payload).data;
  var production = getRows("Production");
  var waste = getRows("Waste");
  var total = sales.reduce(function(sum, row) { return sum + Number(row.Total || 0); }, 0);
  return success({
    kpis: {
      todaySales: total,
      weekSales: total,
      monthSales: total,
      estimatedProfit: sales.reduce(function(sum, row) { return sum + Number(row.Estimated_Profit || 0); }, 0),
      pendingCredits: credits.reduce(function(sum, row) { return sum + Number(row.balance || 0); }, 0),
      lowStockCount: inventory.filter(function(row) { return row.quantity <= row.minStock; }).length,
      wasteTotal: waste.reduce(function(sum, row) { return sum + Number(row.Quantity || 0); }, 0),
      productionTotal: production.reduce(function(sum, row) { return sum + Number(row.Quantity || 0); }, 0)
    },
    salesByBranch: aggregateSalesBy("Branch_ID", sales, branchName),
    salesByProduct: aggregateSaleUnitsByProduct(),
    salesByPaymentMethod: aggregateCountBy("Payment_Method", sales, function(value) { return value || "Sin método"; }),
    monthlyComparison: monthlySalesComparison(sales),
    productionTrend: monthlyProductionWaste(production, waste),
    inventoryByBranch: aggregateInventoryByBranch(inventory),
    wasteByReason: aggregateRowsByQuantity("Reason", waste, function(value) { return value || "Sin motivo"; }),
    topProducts: aggregateSaleUnitsByProduct().map(function(row) { return { name: row.name, units: row.total }; }),
    topDistributors: aggregateSalesBy("Distributor_ID", sales.filter(function(row) { return row.Distributor_ID; }), distributorName),
    lowStock: inventory.filter(function(row) { return row.quantity <= row.minStock; }),
    expiringLots: getRows("Inventory_Lots").filter(function(lot) { return Number(lot.Quantity || 0) > 0; }).map(mapLot),
    pendingCredits: credits.filter(function(row) { return row.balance > 0; })
  });
}

function aggregateCountBy(key, rows, labelFn) {
  var map = {};
  rows.forEach(function(row) {
    var label = labelFn(row[key] || "");
    map[label] = (map[label] || 0) + 1;
  });
  return Object.keys(map).map(function(name) { return { name: name, total: map[name] }; });
}

function aggregateRowsByQuantity(key, rows, labelFn) {
  var map = {};
  rows.forEach(function(row) {
    var label = labelFn(row[key] || "");
    map[label] = (map[label] || 0) + Number(row.Quantity || 0);
  });
  return Object.keys(map).map(function(name) { return { name: name, total: map[name] }; });
}

function aggregateSaleUnitsByProduct() {
  var saleItems = getRows("Sale_Items");
  var map = {};
  saleItems.forEach(function(item) {
    var label = productName(item.Product_ID);
    map[label] = (map[label] || 0) + Number(item.Quantity || 0);
  });
  return Object.keys(map).map(function(name) { return { name: name, total: map[name] }; });
}

function aggregateInventoryByBranch(inventory) {
  var map = {};
  inventory.forEach(function(item) {
    map[item.branchName] = (map[item.branchName] || 0) + Number(item.quantity || 0);
  });
  return Object.keys(map).map(function(name) { return { name: name, quantity: map[name] }; });
}

function monthlySalesComparison(sales) {
  var months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  var map = {};
  sales.forEach(function(row) {
    var date = new Date(row.Date);
    if (isNaN(date.getTime())) return;
    var key = months[date.getMonth()];
    if (!map[key]) map[key] = { month: key, sales: 0, profit: 0 };
    map[key].sales += Number(row.Total || 0);
    map[key].profit += Number(row.Estimated_Profit || 0);
  });
  return Object.keys(map).map(function(key) { return map[key]; });
}

function monthlyProductionWaste(production, waste) {
  var months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  var map = {};
  production.forEach(function(row) {
    var date = new Date(row.Date);
    if (isNaN(date.getTime())) return;
    var key = months[date.getMonth()];
    if (!map[key]) map[key] = { month: key, production: 0, waste: 0 };
    map[key].production += Number(row.Quantity || 0);
  });
  waste.forEach(function(row) {
    var date = new Date(row.Date);
    if (isNaN(date.getTime())) return;
    var key = months[date.getMonth()];
    if (!map[key]) map[key] = { month: key, production: 0, waste: 0 };
    map[key].waste += Number(row.Quantity || 0);
  });
  return Object.keys(map).map(function(key) { return map[key]; });
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
  checkExpirationNotifications();
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
  return days >= 0 && days <= 2;
}

function exportReportData(payload) {
  requireAdmin(payload);
  return success({ rows: getRows(payload.sheetName || "Sales"), filename: "reporte.csv" });
}
