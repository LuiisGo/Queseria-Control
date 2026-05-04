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
      lots: getRows("Inventory_Lots").filter(function(lot) { return lot.Product_ID === row.Product_ID && lot.Branch_ID === row.Branch_ID; }),
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

function changeStock(productId, branchId, delta, lotNumber, expirationDate, notes) {
  var row = getInventoryRow(productId, branchId);
  var next = Number(row.Quantity || 0) + Number(delta);
  var allowNegative = String(getSettingValue("allow_negative_stock", "false")) === "true";
  if (next < 0 && !allowNegative) throw new Error("Stock insuficiente para " + productName(productId) + " en " + branchName(branchId));
  updateRow("Inventory", row.ID, { Quantity: next, Updated_At: nowIso() });
  if (delta > 0 && lotNumber) {
    appendRow("Inventory_Lots", { ID: nextId("Inventory_Lots", "LOT"), Product_ID: productId, Branch_ID: branchId, Lot_Number: lotNumber, Expiration_Date: expirationDate || "", Quantity: delta, Notes: notes || "", Created_At: nowIso(), Updated_At: nowIso() });
  }
  return next;
}
