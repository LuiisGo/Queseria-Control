function registerSale(payload) {
  var user = requireActiveUser(payload);
  assertPermission(user, "can_register_sales");
  requireFields(payload, ["branchId", "customerType", "paymentMethod", "items"]);
  assertBranchAccess(user, payload.branchId);
  var prepared = prepareSaleLines(payload, user);
  var saleId = nextId("Sales", "SALE");
  var subtotal = 0;
  var discountTotal = 0;
  var estimatedCost = 0;
  var responseItems = [];
  prepared.lines.forEach(function(line) {
    var lotsUsed = changeStock(line.productId, payload.branchId, -line.quantity);
    appendRow("Sale_Items", { ID: nextId("Sale_Items", "SI"), Sale_ID: saleId, Product_ID: line.productId, Quantity: line.quantity, Price: line.price, Discount: line.discount, Subtotal: line.subtotal, Lot_ID: lotsUsed[0] ? lotsUsed[0].lotId : "" });
    responseItems.push({
      productId: line.productId,
      productName: line.productName,
      quantity: line.quantity,
      price: line.price,
      discount: line.discount,
      subtotal: line.subtotal,
      lotsUsed: lotsUsed,
      lotId: lotsUsed[0] ? lotsUsed[0].lotId : ""
    });
    subtotal += line.quantity * line.price;
    discountTotal += line.discount;
    estimatedCost += line.estimatedCost;
  });
  var total = subtotal - discountTotal;
  var row = { ID: saleId, Date: nowIso(), User_ID: user.ID, Branch_ID: payload.branchId, Customer_Type: payload.customerType, Distributor_ID: payload.distributorId || "", Payment_Method: payload.paymentMethod, Subtotal: subtotal, Discount_Total: discountTotal, Total: total, Estimated_Cost: estimatedCost, Estimated_Profit: total - estimatedCost, Status: payload.paymentMethod === "Crédito" ? "Crédito pendiente" : "Pagada", Notes: payload.notes || "" };
  appendRow("Sales", row);
  if (payload.paymentMethod === "Crédito" && payload.distributorId) createCreditFromSale(row);
  logAudit(user, "REGISTER_SALE", "Sales", saleId, null, row, "");
  return success({ id: row.ID, date: row.Date, userId: row.User_ID, userName: user.Name, branchId: row.Branch_ID, branchName: branchName(row.Branch_ID), customerType: row.Customer_Type, distributorId: row.Distributor_ID, distributorName: row.Distributor_ID ? distributorName(row.Distributor_ID) : "", paymentMethod: row.Payment_Method, items: responseItems, subtotal: subtotal, discountTotal: discountTotal, total: total, estimatedCost: estimatedCost, estimatedProfit: total - estimatedCost, status: row.Status, notes: row.Notes }, "Venta registrada.");
}

function prepareSaleLines(payload, user) {
  if (!Array.isArray(payload.items) || !payload.items.length) throw new Error("La venta debe tener productos.");
  var demand = {};
  var lines = payload.items.map(function(item) {
    if (!item.productId) throw new Error("Producto obligatorio.");
    var quantity = Number(item.quantity || 0);
    if (isNaN(quantity) || quantity <= 0) throw new Error("Cantidad inválida para " + item.productId);
    var product = getById("Products", item.productId);
    if (!product) throw new Error("Producto no encontrado: " + item.productId);
    if (String(product.Active) === "FALSE") throw new Error("Producto inactivo: " + product.Name);
    var price = resolvePrice(item.productId, payload.customerType, payload.distributorId, payload.branchId);
    var discount = Number(item.discount || 0);
    if (discount > 0) assertPermission(user, "can_apply_discounts");
    var lineSubtotal = quantity * price - discount;
    if (lineSubtotal < 0) throw new Error("Descuento inválido para " + product.Name);
    demand[item.productId] = Number(demand[item.productId] || 0) + quantity;
    return {
      productId: item.productId,
      productName: product.Name,
      quantity: quantity,
      price: price,
      discount: discount,
      subtotal: lineSubtotal,
      estimatedCost: Number(product.Production_Cost || 0) * quantity
    };
  });
  if (String(getSettingValue("allow_negative_stock", "false")) !== "true") {
    Object.keys(demand).forEach(function(productId) {
      var available = availableLotQuantity(productId, payload.branchId);
      if (available < demand[productId]) throw new Error("Stock insuficiente para " + productName(productId) + " en " + branchName(payload.branchId));
    });
  }
  return { lines: lines, demand: demand };
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
  var offset = Math.max(0, Number(payload.offset || 0));
  var limit = Math.min(1000, Math.max(1, Number(payload.limit || 500)));
  var rows = getRows("Sales").filter(function(row) { return !branches || branches.indexOf(row.Branch_ID) > -1; }).sort(function(a, b) {
    return new Date(b.Date).getTime() - new Date(a.Date).getTime();
  });
  return success(rows.slice(offset, offset + limit).map(function(row) {
    return mapSale(row);
  }));
}

function updateSale(payload) {
  var admin = requireAdmin(payload);
  requireFields(payload, ["id"]);
  var old = getById("Sales", payload.id);
  if (!old) throw new Error("Venta no encontrada.");
  var row = updateRow("Sales", payload.id, {
    Payment_Method: payload.paymentMethod || old.Payment_Method,
    Status: payload.status || old.Status,
    Notes: payload.notes !== undefined ? payload.notes : old.Notes
  });
  logAudit(admin, "UPDATE_SALE", "Sales", payload.id, old, row, payload.note || "");
  return success(mapSale(row), "Venta actualizada.");
}

function mapSale(row) {
  return {
    id: row.ID,
    date: row.Date,
    branchId: row.Branch_ID,
    branchName: branchName(row.Branch_ID),
    customerType: row.Customer_Type,
    distributorId: row.Distributor_ID,
    distributorName: row.Distributor_ID ? distributorName(row.Distributor_ID) : "",
    paymentMethod: row.Payment_Method,
    subtotal: Number(row.Subtotal || 0),
    discountTotal: Number(row.Discount_Total || 0),
    total: Number(row.Total || 0),
    estimatedCost: Number(row.Estimated_Cost || 0),
    estimatedProfit: Number(row.Estimated_Profit || 0),
    status: row.Status,
    notes: row.Notes
  };
}
