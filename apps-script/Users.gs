function listUsers(payload) {
  requireAdmin(payload);
  return success(getRows("Users").map(mapUser));
}

function createUser(payload) {
  var admin = requireAdmin(payload);
  requireFields(payload, ["name", "username", "password", "role"]);
  var existing = getRows("Users").find(function(row) {
    return String(row.Username).toLowerCase() === String(payload.username).toLowerCase();
  });
  if (existing) throw new Error("Ese usuario ya existe.");
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
  if (!old) throw new Error("Usuario no encontrado.");
  var existing = getRows("Users").find(function(row) {
    return row.ID !== payload.id && String(row.Username).toLowerCase() === String(payload.username || old.Username).toLowerCase();
  });
  if (existing) throw new Error("Ese usuario ya existe.");
  var update = {
    Name: payload.name,
    Username: payload.username,
    Role: payload.role,
    Active: payload.active,
    Updated_At: nowIso()
  };
  if (payload.password) {
    var salt = Utilities.getUuid();
    update.Password_Hash = hashPassword(payload.password, salt);
    update.Password_Salt = salt;
  }
  var row = updateRow("Users", payload.id, update);
  if (payload.assignedBranches) {
    deleteRowsWhere("User_Branches", function(candidate) { return candidate.User_ID === payload.id; });
    payload.assignedBranches.forEach(function(branchId) {
      appendRow("User_Branches", { ID: nextId("User_Branches", "UB"), User_ID: payload.id, Branch_ID: branchId, Created_At: nowIso() });
    });
  }
  if (payload.permissions) {
    deleteRowsWhere("Permissions", function(candidate) { return candidate.User_ID === payload.id; });
    Object.keys(payload.permissions).forEach(function(permission) {
      appendRow("Permissions", { ID: nextId("Permissions", "PER"), User_ID: payload.id, Permission: permission, Enabled: payload.permissions[permission], Updated_At: nowIso() });
    });
  }
  logAudit(admin, "UPDATE_USER", "Users", payload.id, old, row, "");
  return success(mapUser(row), "Usuario actualizado.");
}

function deactivateUser(payload) {
  payload.active = false;
  return updateUser(payload);
}
