function registerProduction(payload) {
  var user = requireActiveUser(payload);
  assertPermission(user, "can_register_entries");
  requireFields(payload, ["productId", "branchId", "quantity", "lotNumber", "expiresAt"]);
  assertBranchAccess(user, payload.branchId);
  var branch = getById("Branches", payload.branchId);
  if (!branch || branch.Type !== "Tienda central") throw new Error("La producción debe entrar a Central.");
  changeStock(payload.productId, payload.branchId, Number(payload.quantity), payload.lotNumber, payload.expiresAt, payload.notes);
  var row = { ID: nextId("Production", "PROD"), Date: nowIso(), User_ID: user.ID, Branch_ID: payload.branchId, Product_ID: payload.productId, Quantity: Number(payload.quantity), Unit_Cost: Number(payload.unitCost || 0), Lot_Number: payload.lotNumber || "", Expiration_Date: payload.expiresAt || "", Notes: payload.notes || "" };
  appendRow("Production", row);
  logAudit(user, "REGISTER_PRODUCTION", "Production", row.ID, null, row, "");
  return success({
    id: row.ID,
    date: row.Date,
    userId: row.User_ID,
    branchId: row.Branch_ID,
    branchName: branchName(row.Branch_ID),
    productId: row.Product_ID,
    productName: productName(row.Product_ID),
    quantity: Number(row.Quantity || 0),
    lotNumber: row.Lot_Number,
    expiresAt: row.Expiration_Date,
    notes: row.Notes
  }, "Producción registrada.");
}

function listProduction(payload) {
  var user = requireActiveUser(payload);
  var branches = user.Role === "Admin" ? null : userAssignedBranches(user.ID);
  return success(getRows("Production").filter(function(row) { return !branches || branches.indexOf(row.Branch_ID) > -1; }).map(function(row) {
    return { id: row.ID, date: row.Date, userId: row.User_ID, branchId: row.Branch_ID, branchName: branchName(row.Branch_ID), productId: row.Product_ID, productName: productName(row.Product_ID), quantity: Number(row.Quantity || 0), lotNumber: row.Lot_Number, expiresAt: row.Expiration_Date, notes: row.Notes };
  }));
}
