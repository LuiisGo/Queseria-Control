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
  payload.items.forEach(function(item) {
    changeStock(item.productId, payload.originBranchId, -Number(item.quantity));
    changeStock(item.productId, payload.destinationBranchId, Number(item.quantity), item.lotNumber || "", item.expiresAt || "", "Envío " + transfer.ID);
    appendRow("Transfer_Items", { ID: nextId("Transfer_Items", "TRFI"), Transfer_ID: transfer.ID, Product_ID: item.productId, Quantity: Number(item.quantity), Lot_ID: item.lotId || "", Sent_Quantity: Number(item.quantity), Received_Quantity: Number(item.quantity), Difference: 0 });
  });
  logAudit(user, "REGISTER_TRANSFER", "Transfers", transfer.ID, null, payload, "");
  return success(transfer, "Envío registrado.");
}

function listTransfers(payload) {
  requireActiveUser(payload);
  return success(getRows("Transfers"));
}
