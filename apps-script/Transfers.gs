function registerTransfer(payload) {
  var user = requireActiveUser(payload);
  assertPermission(user, "can_register_transfers");
  requireFields(payload, ["originBranchId", "destinationBranchId", "items"]);
  assertBranchAccess(user, payload.originBranchId);
  var origin = getById("Branches", payload.originBranchId);
  var destination = getById("Branches", payload.destinationBranchId);
  if (!origin || !destination) throw new Error("Origen o destino inválido.");
  if (origin.Type !== "Tienda central") throw new Error("En MVP los envíos salen desde tienda central.");
  if (destination.Type === "Producción") throw new Error("Destino inválido para envío.");
  var transfer = { ID: nextId("Transfers", "TRF"), Date: nowIso(), User_ID: user.ID, Origin_Branch_ID: payload.originBranchId, Destination_Branch_ID: payload.destinationBranchId, Status: "Registrado", Difference_Note: "", Notes: payload.notes || "" };
  appendRow("Transfers", transfer);
  var responseItems = [];
  payload.items.forEach(function(item) {
    var lotsUsed = changeStock(item.productId, payload.originBranchId, -Number(item.quantity));
    lotsUsed.forEach(function(lot) {
      changeStock(item.productId, payload.destinationBranchId, Number(lot.quantity), lot.lotNumber, lot.expiresAt || "", "Envío " + transfer.ID);
    });
    appendRow("Transfer_Items", { ID: nextId("Transfer_Items", "TRFI"), Transfer_ID: transfer.ID, Product_ID: item.productId, Quantity: Number(item.quantity), Lot_ID: lotsUsed[0] ? lotsUsed[0].lotId : "", Sent_Quantity: Number(item.quantity), Received_Quantity: Number(item.quantity), Difference: 0 });
    responseItems.push({ productId: item.productId, productName: productName(item.productId), quantity: Number(item.quantity), lotsUsed: lotsUsed, lotId: lotsUsed[0] ? lotsUsed[0].lotId : "" });
  });
  logAudit(user, "REGISTER_TRANSFER", "Transfers", transfer.ID, null, payload, "");
  return success({ id: transfer.ID, date: transfer.Date, userId: transfer.User_ID, originBranchId: transfer.Origin_Branch_ID, originBranchName: branchName(transfer.Origin_Branch_ID), destinationBranchId: transfer.Destination_Branch_ID, destinationBranchName: branchName(transfer.Destination_Branch_ID), status: transfer.Status, notes: transfer.Notes, items: responseItems }, "Envío registrado.");
}

function listTransfers(payload) {
  requireActiveUser(payload);
  return success(getRows("Transfers").map(function(row) {
    return mapTransfer(row);
  }));
}

function updateTransfer(payload) {
  var admin = requireAdmin(payload);
  requireFields(payload, ["id"]);
  var old = getById("Transfers", payload.id);
  if (!old) throw new Error("Envío no encontrado.");
  var row = updateRow("Transfers", payload.id, {
    Status: payload.status || old.Status,
    Difference_Note: payload.differenceNote !== undefined ? payload.differenceNote : old.Difference_Note,
    Notes: payload.notes !== undefined ? payload.notes : old.Notes
  });
  logAudit(admin, "UPDATE_TRANSFER", "Transfers", payload.id, old, row, "");
  return success(mapTransfer(row), "Envío actualizado.");
}

function mapTransfer(row) {
  return { id: row.ID, date: row.Date, userId: row.User_ID, originBranchId: row.Origin_Branch_ID, originBranchName: branchName(row.Origin_Branch_ID), destinationBranchId: row.Destination_Branch_ID, destinationBranchName: branchName(row.Destination_Branch_ID), status: row.Status, differenceNote: row.Difference_Note, notes: row.Notes };
}
