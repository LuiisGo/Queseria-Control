function registerWaste(payload) {
  var user = requireActiveUser(payload);
  assertPermission(user, "can_register_waste");
  requireFields(payload, ["branchId", "productId", "quantity", "reason"]);
  assertBranchAccess(user, payload.branchId);
  changeStock(payload.productId, payload.branchId, -Number(payload.quantity));
  var row = { ID: nextId("Waste", "WST"), Date: nowIso(), User_ID: user.ID, Branch_ID: payload.branchId, Product_ID: payload.productId, Lot_ID: payload.lotId || "", Quantity: Number(payload.quantity), Reason: payload.reason, Notes: payload.notes || "" };
  appendRow("Waste", row);
  logAudit(user, "REGISTER_WASTE", "Waste", row.ID, null, row, "");
  return success(row, "Pérdida registrada.");
}

function listWaste(payload) {
  var user = requireActiveUser(payload);
  var branches = user.Role === "Admin" ? null : userAssignedBranches(user.ID);
  return success(getRows("Waste").filter(function(row) { return !branches || branches.indexOf(row.Branch_ID) > -1; }).map(function(row) {
    return { id: row.ID, date: row.Date, userId: row.User_ID, branchId: row.Branch_ID, productId: row.Product_ID, productName: productName(row.Product_ID), lotId: row.Lot_ID, quantity: Number(row.Quantity || 0), reason: row.Reason, notes: row.Notes };
  }));
}

function registerReturn(payload) {
  var user = requireActiveUser(payload);
  assertPermission(user, "can_register_returns");
  requireFields(payload, ["branchId", "productId", "quantity", "reason", "reusable"]);
  assertBranchAccess(user, payload.branchId);
  var wasteId = "";
  if (String(payload.reusable) === "true" || payload.reusable === true) {
    changeStock(payload.productId, payload.branchId, Number(payload.quantity), payload.lotNumber || "", payload.expiresAt || "", "Devolución utilizable");
  } else {
    var waste = registerWaste(Object.assign({}, payload, { reason: "Devolución no utilizable" })).data;
    wasteId = waste.ID || waste.id;
  }
  var row = { ID: nextId("Returns", "RET"), Date: nowIso(), User_ID: user.ID, Branch_ID: payload.branchId, Product_ID: payload.productId, Quantity: Number(payload.quantity), Reason: payload.reason, Reusable: payload.reusable, Waste_ID: wasteId, Note: payload.note || "" };
  appendRow("Returns", row);
  logAudit(user, "REGISTER_RETURN", "Returns", row.ID, null, row, "");
  return success(row, "Devolución registrada.");
}
