function registerSale(payload) {
  var user = requireActiveUser(payload);
  assertPermission(user, "can_register_sales");
  requireFields(payload, ["branchId", "customerType", "paymentMethod", "items"]);
  assertBranchAccess(user, payload.branchId);
  var saleId = nextId("Sales", "SALE");
  var subtotal = 0;
  var discountTotal = 0;
  var estimatedCost = 0;
  payload.items.forEach(function(item) {
    var product = getById("Products", item.productId);
    if (!product) throw new Error("Producto no encontrado: " + item.productId);
    var price = resolvePrice(item.productId, payload.customerType, payload.distributorId, payload.branchId);
    var discount = Number(item.discount || 0);
    if (discount > 0) assertPermission(user, "can_apply_discounts");
    var lineSubtotal = Number(item.quantity) * price - discount;
    changeStock(item.productId, payload.branchId, -Number(item.quantity));
    appendRow("Sale_Items", { ID: nextId("Sale_Items", "SI"), Sale_ID: saleId, Product_ID: item.productId, Quantity: Number(item.quantity), Price: price, Discount: discount, Subtotal: lineSubtotal, Lot_ID: item.lotId || "" });
    subtotal += Number(item.quantity) * price;
    discountTotal += discount;
    estimatedCost += Number(product.Production_Cost || 0) * Number(item.quantity);
  });
  var total = subtotal - discountTotal;
  var row = { ID: saleId, Date: nowIso(), User_ID: user.ID, Branch_ID: payload.branchId, Customer_Type: payload.customerType, Distributor_ID: payload.distributorId || "", Payment_Method: payload.paymentMethod, Subtotal: subtotal, Discount_Total: discountTotal, Total: total, Estimated_Cost: estimatedCost, Estimated_Profit: total - estimatedCost, Status: payload.paymentMethod === "Crédito" ? "Crédito pendiente" : "Pagada", Notes: payload.notes || "" };
  appendRow("Sales", row);
  if (payload.paymentMethod === "Crédito" && payload.distributorId) createCreditFromSale(row);
  logAudit(user, "REGISTER_SALE", "Sales", saleId, null, row, "");
  return success(row, "Venta registrada.");
}

function resolvePrice(productId, customerType, distributorId, branchId) {
  var product = getById("Products", productId);
  var rows = getRows("Product_Prices");
  var specialDistributor = rows.find(function(row) { return row.Product_ID === productId && row.Scope_Type === "Distributor" && row.Scope_ID === distributorId && String(row.Active) !== "FALSE"; });
  if (specialDistributor) return Number(specialDistributor.Price);
  var specialBranch = rows.find(function(row) { return row.Product_ID === productId && row.Scope_Type === "Branch" && row.Scope_ID === branchId && String(row.Active) !== "FALSE"; });
  if (specialBranch) return Number(specialBranch.Price);
  return customerType === "Distribuidor/mayorista" ? Number(product.Distributor_Price || 0) : Number(product.Final_Price || 0);
}

function listSales(payload) {
  var user = requireActiveUser(payload);
  var branches = user.Role === "Admin" ? null : userAssignedBranches(user.ID);
  return success(getRows("Sales").filter(function(row) { return !branches || branches.indexOf(row.Branch_ID) > -1; }).map(function(row) {
    return { id: row.ID, date: row.Date, branchName: branchName(row.Branch_ID), customerType: row.Customer_Type, paymentMethod: row.Payment_Method, total: Number(row.Total || 0), estimatedProfit: Number(row.Estimated_Profit || 0), status: row.Status };
  }));
}
