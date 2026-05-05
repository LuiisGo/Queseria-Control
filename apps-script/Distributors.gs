function listDistributors(payload) {
  requireActiveUser(payload);
  return success(getRows("Distributors").map(function(row) {
    return { id: row.ID, name: row.Name, phone: row.Phone, email: row.Email, address: row.Address, active: String(row.Active) !== "FALSE", notes: row.Notes, specialPrices: parseJson(row.Special_Prices_JSON, {}), createdAt: row.Created_At };
  }));
}

function createDistributor(payload) {
  var user = requireActiveUser(payload);
  requireFields(payload, ["name"]);
  var row = { ID: nextId("Distributors", "ALIS"), Name: payload.name, Phone: payload.phone || "", Email: payload.email || "", Address: payload.address || "", Active: true, Special_Prices_JSON: JSON.stringify(payload.specialPrices || {}), Notes: payload.notes || "", Created_At: nowIso(), Updated_At: nowIso() };
  appendRow("Distributors", row);
  logAudit(user, "CREATE_DISTRIBUTOR", "Distributors", row.ID, null, row, "");
  return success(row, "Distribuidor creado.");
}

function updateDistributor(payload) {
  var user = requireActiveUser(payload);
  requireFields(payload, ["id"]);
  var old = getById("Distributors", payload.id);
  var row = updateRow("Distributors", payload.id, { Name: payload.name, Phone: payload.phone, Email: payload.email, Address: payload.address, Active: payload.active, Special_Prices_JSON: JSON.stringify(payload.specialPrices || {}), Notes: payload.notes, Updated_At: nowIso() });
  logAudit(user, "UPDATE_DISTRIBUTOR", "Distributors", payload.id, old, row, "");
  return success(row, "Distribuidor actualizado.");
}
