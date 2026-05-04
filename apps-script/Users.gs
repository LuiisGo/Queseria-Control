function listUsers(payload) {
  requireAdmin(payload);
  return success(getRows("Users").map(mapUser));
}

function createUser(payload) {
  var admin = requireAdmin(payload);
  requireFields(payload, ["name", "username", "password", "role"]);
  var id = nextId("Users", "USR");
  var salt = Utilities.getUuid();
  var row = {
    ID: id,
    Name: payload.name,
    Username: payload.username,
    Password_Hash: hashPassword(payload.password, salt),
    Password_Salt: salt,
    Role: payload.role,
    Active: true,
    Created_At: nowIso(),
    Updated_At: nowIso()
  };
  appendRow("Users", row);
  (payload.assignedBranches || []).forEach(function(branchId) {
    appendRow("User_Branches", { ID: nextId("User_Branches", "UB"), User_ID: id, Branch_ID: branchId, Created_At: nowIso() });
  });
  Object.keys(payload.permissions || {}).forEach(function(permission) {
    appendRow("Permissions", { ID: nextId("Permissions", "PER"), User_ID: id, Permission: permission, Enabled: payload.permissions[permission], Updated_At: nowIso() });
  });
  logAudit(admin, "CREATE_USER", "Users", id, null, row, "");
  return success(mapUser(row), "Usuario creado.");
}

function updateUser(payload) {
  var admin = requireAdmin(payload);
  requireFields(payload, ["id"]);
  var old = getById("Users", payload.id);
  var row = updateRow("Users", payload.id, {
    Name: payload.name,
    Role: payload.role,
    Active: payload.active,
    Updated_At: nowIso()
  });
  logAudit(admin, "UPDATE_USER", "Users", payload.id, old, row, "");
  return success(mapUser(row), "Usuario actualizado.");
}

function deactivateUser(payload) {
  payload.active = false;
  return updateUser(payload);
}
