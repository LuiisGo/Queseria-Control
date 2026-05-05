function listBranches(payload) {
  requireActiveUser(payload);
  return success(getRows("Branches").map(function(row) {
    return { id: row.ID, name: row.Name, type: row.Type, address: row.Address, active: String(row.Active) !== "FALSE", notes: row.Notes, createdAt: row.Created_At, updatedAt: row.Updated_At };
  }));
}

function createBranch(payload) {
  var admin = requireAdmin(payload);
  requireFields(payload, ["name", "type"]);
  var row = { ID: nextId("Branches", "AGM"), Name: payload.name, Type: payload.type, Address: payload.address || "", Active: true, Notes: payload.notes || "", Created_At: nowIso(), Updated_At: nowIso() };
  appendRow("Branches", row);
  logAudit(admin, "CREATE_BRANCH", "Branches", row.ID, null, row, "");
  return success(row, "Ubicación creada.");
}

function updateBranch(payload) {
  var admin = requireAdmin(payload);
  requireFields(payload, ["id"]);
  var old = getById("Branches", payload.id);
  var row = updateRow("Branches", payload.id, { Name: payload.name, Type: payload.type, Address: payload.address, Active: payload.active, Notes: payload.notes, Updated_At: nowIso() });
  logAudit(admin, "UPDATE_BRANCH", "Branches", payload.id, old, row, "");
  return success(row, "Ubicación actualizada.");
}
