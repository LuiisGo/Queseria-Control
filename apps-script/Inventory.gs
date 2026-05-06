function listInventory(payload) {
  var user = requireActiveUser(payload);
  var branches = user.Role === "Admin" ? null : userAssignedBranches(user.ID);
  var lots = getRows("Inventory_Lots");
  var rows = getRows("Inventory").filter(function(row) {
    return !branches || branches.indexOf(row.Branch_ID) > -1;
  }).map(function(row) {
    var rowLots = availableLotsFromRows(row.Product_ID, row.Branch_ID, lots);
    return {
      id: row.ID,
      productId: row.Product_ID,
      productName: productName(row.Product_ID),
      branchId: row.Branch_ID,
      branchName: branchName(row.Branch_ID),
      quantity: sumLotQuantity(rowLots),
      minStock: Number(row.Min_Stock || 0),
      lots: rowLots.map(mapLot),
      updatedAt: row.Updated_At
    };
  });
  return success(rows);
}

function adjustInventory(payload) {
  var admin = requireAdmin(payload);
  requireFields(payload, ["productId", "branchId", "newQuantity"]);
  var product = getById("Products", payload.productId);
  var branch = getById("Branches", payload.branchId);
  if (!product) throw new Error("Producto no encontrado.");
  if (!branch) throw new Error("Ubicación no encontrada.");

  var current = getInventoryRow(payload.productId, payload.branchId);
  var oldQuantity = availableLotQuantity(payload.productId, payload.branchId);
  var newQuantity = Number(payload.newQuantity);
  var minStock = payload.minStock !== undefined && payload.minStock !== "" ? Number(payload.minStock) : Number(current.Min_Stock || 0);
  if (isNaN(newQuantity) || newQuantity < 0) throw new Error("Cantidad inválida.");
  if (isNaN(minStock) || minStock < 0) throw new Error("Stock mínimo inválido.");

  var delta = newQuantity - oldQuantity;
  var reason = payload.reason || "Ajuste manual";
  var generatedLot = "AJ" + dateCode(nowIso()) + String(getRows("Inventory_Lots").length + 1).padStart(2, "0");
  var lotNumber = payload.lotNumber || (delta > 0 ? generatedLot : "");
  var expirationDate = payload.expirationDate || (delta > 0 ? addDaysDate(nowIso(), 16) : "");
  var lotsUsed = [];

  if (delta !== 0) {
    lotsUsed = changeStock(payload.productId, payload.branchId, delta, lotNumber, expirationDate, reason);
  }

  var updated = updateRow("Inventory", current.ID, {
    Quantity: newQuantity,
    Min_Stock: minStock,
    Updated_At: nowIso()
  });
  var adjustment = appendRow("Stock_Adjustments", {
    ID: nextId("Stock_Adjustments", "ADJ"),
    Date: nowIso(),
    User_ID: admin.ID,
    Branch_ID: payload.branchId,
    Product_ID: payload.productId,
    Old_Quantity: oldQuantity,
    New_Quantity: newQuantity,
    Reason: reason,
    Notes: payload.notes || ""
  });

  logAudit(admin, "ADJUST_INVENTORY", "Inventory", updated.ID, current, {
    inventory: updated,
    adjustment: adjustment,
    lotNumber: lotNumber,
    expirationDate: expirationDate,
    lotsUsed: lotsUsed
  }, reason);
  return success({
    id: updated.ID,
    productId: updated.Product_ID,
    productName: productName(updated.Product_ID),
    branchId: updated.Branch_ID,
    branchName: branchName(updated.Branch_ID),
    quantity: Number(updated.Quantity || 0),
    minStock: Number(updated.Min_Stock || 0),
    lots: availableLots(updated.Product_ID, updated.Branch_ID).map(mapLot),
    updatedAt: updated.Updated_At
  }, "Inventario ajustado.");
}

function getInventoryRow(productId, branchId) {
  var row = getRows("Inventory").find(function(candidate) { return candidate.Product_ID === productId && candidate.Branch_ID === branchId; });
  if (row) return row;
  var product = getById("Products", productId);
  return appendRow("Inventory", { ID: nextId("Inventory", "INV"), Product_ID: productId, Branch_ID: branchId, Quantity: 0, Min_Stock: product ? product.Min_Stock : 0, Updated_At: nowIso() });
}

function availableLots(productId, branchId) {
  return availableLotsFromRows(productId, branchId, getRows("Inventory_Lots"));
}

function availableLotsFromRows(productId, branchId, rows) {
  return rows
    .filter(function(lot) {
      return lot.Product_ID === productId && lot.Branch_ID === branchId && Number(lot.Quantity || 0) > 0;
    })
    .sort(function(a, b) {
      var aDate = a.Expiration_Date ? new Date(a.Expiration_Date).getTime() : 9999999999999;
      var bDate = b.Expiration_Date ? new Date(b.Expiration_Date).getTime() : 9999999999999;
      if (aDate !== bDate) return aDate - bDate;
      return String(a.Lot_Number || "").localeCompare(String(b.Lot_Number || ""));
    });
}

function sumLotQuantity(lots) {
  return lots.reduce(function(sum, lot) {
    return sum + Number(lot.Quantity || 0);
  }, 0);
}

function availableLotQuantity(productId, branchId) {
  return sumLotQuantity(availableLots(productId, branchId));
}

function mapLot(lot) {
  return {
    id: lot.ID,
    productId: lot.Product_ID,
    branchId: lot.Branch_ID,
    lotNumber: lot.Lot_Number,
    expiresAt: lot.Expiration_Date,
    quantity: Number(lot.Quantity || 0),
    notes: lot.Notes || ""
  };
}

function addLotStock(productId, branchId, quantity, lotNumber, expirationDate, notes) {
  if (!lotNumber) return null;
  var existing = getRows("Inventory_Lots").find(function(lot) {
    return lot.Product_ID === productId && lot.Branch_ID === branchId && String(lot.Lot_Number) === String(lotNumber);
  });
  if (existing) {
    updateRow("Inventory_Lots", existing.ID, {
      Quantity: Number(existing.Quantity || 0) + Number(quantity),
      Expiration_Date: expirationDate || existing.Expiration_Date || "",
      Notes: notes || existing.Notes || "",
      Updated_At: nowIso()
    });
    return existing.ID;
  }
  return appendRow("Inventory_Lots", {
    ID: nextId("Inventory_Lots", "LOT"),
    Product_ID: productId,
    Branch_ID: branchId,
    Lot_Number: lotNumber,
    Expiration_Date: expirationDate || "",
    Quantity: Number(quantity),
    Notes: notes || "",
    Created_At: nowIso(),
    Updated_At: nowIso()
  }).ID;
}

function consumeLotsFifo(productId, branchId, quantity) {
  var remaining = Number(quantity);
  var allocations = [];
  availableLots(productId, branchId).forEach(function(lot) {
    if (remaining <= 0) return;
    var used = Math.min(Number(lot.Quantity || 0), remaining);
    remaining -= used;
    updateRow("Inventory_Lots", lot.ID, { Quantity: Number(lot.Quantity || 0) - used, Updated_At: nowIso() });
    allocations.push({
      lotId: lot.ID,
      lotNumber: lot.Lot_Number,
      expiresAt: lot.Expiration_Date,
      quantity: used
    });
  });
  if (remaining > 0) throw new Error("No hay lotes suficientes para " + productName(productId) + " en " + branchName(branchId));
  return allocations;
}

function changeStock(productId, branchId, delta, lotNumber, expirationDate, notes) {
  var row = getInventoryRow(productId, branchId);
  var deltaNumber = Number(delta);
  var allowNegative = String(getSettingValue("allow_negative_stock", "false")) === "true";
  var current = allowNegative ? Number(row.Quantity || 0) : availableLotQuantity(productId, branchId);
  var next = current + deltaNumber;
  if (next < 0 && !allowNegative) throw new Error("Stock insuficiente para " + productName(productId) + " en " + branchName(branchId));
  var allocations = [];
  if (deltaNumber < 0 && !allowNegative) allocations = consumeLotsFifo(productId, branchId, Math.abs(deltaNumber));
  if (deltaNumber > 0) {
    var incomingLot = lotNumber || ("AUTO" + dateCode(nowIso()) + String(getRows("Inventory_Lots").length + 1).padStart(2, "0"));
    addLotStock(productId, branchId, deltaNumber, incomingLot, expirationDate || addDaysDate(nowIso(), 16), notes);
  }
  var quantity = allowNegative ? next : availableLotQuantity(productId, branchId);
  updateRow("Inventory", row.ID, { Quantity: quantity, Updated_At: nowIso() });
  return allocations;
}
