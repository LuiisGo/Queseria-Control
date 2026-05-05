function listInventory(payload) {
  var user = requireActiveUser(payload);
  var branches = user.Role === "Admin" ? null : userAssignedBranches(user.ID);
  var rows = getRows("Inventory").filter(function(row) {
    return !branches || branches.indexOf(row.Branch_ID) > -1;
  }).map(function(row) {
    return {
      id: row.ID,
      productId: row.Product_ID,
      productName: productName(row.Product_ID),
      branchId: row.Branch_ID,
      branchName: branchName(row.Branch_ID),
      quantity: Number(row.Quantity || 0),
      minStock: Number(row.Min_Stock || 0),
      lots: availableLots(row.Product_ID, row.Branch_ID).map(mapLot),
      updatedAt: row.Updated_At
    };
  });
  return success(rows);
}

function getInventoryRow(productId, branchId) {
  var row = getRows("Inventory").find(function(candidate) { return candidate.Product_ID === productId && candidate.Branch_ID === branchId; });
  if (row) return row;
  var product = getById("Products", productId);
  return appendRow("Inventory", { ID: nextId("Inventory", "INV"), Product_ID: productId, Branch_ID: branchId, Quantity: 0, Min_Stock: product ? product.Min_Stock : 0, Updated_At: nowIso() });
}

function availableLots(productId, branchId) {
  return getRows("Inventory_Lots")
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
  var next = Number(row.Quantity || 0) + Number(delta);
  var allowNegative = String(getSettingValue("allow_negative_stock", "false")) === "true";
  if (next < 0 && !allowNegative) throw new Error("Stock insuficiente para " + productName(productId) + " en " + branchName(branchId));
  var allocations = [];
  if (delta < 0 && !allowNegative) allocations = consumeLotsFifo(productId, branchId, Math.abs(Number(delta)));
  updateRow("Inventory", row.ID, { Quantity: next, Updated_At: nowIso() });
  if (delta > 0 && lotNumber) {
    addLotStock(productId, branchId, Number(delta), lotNumber, expirationDate, notes);
  }
  return allocations;
}
