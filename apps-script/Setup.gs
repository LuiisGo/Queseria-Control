function setupSpreadsheet(setupPasswordsOverride) {
  var spreadsheet = getSpreadsheet();
  Object.keys(SHEETS).forEach(function(name) {
    var sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
    ensureHeaders(sheet, SHEETS[name]);
    sheet.setFrozenRows(1);
  });

  seedSettingIfMissing("allow_negative_stock", "false", "Permite vender sin stock disponible");
  seedSettingIfMissing("admin_emails", "", "Correos separados por coma para notificaciones");
  seedSettingIfMissing("notification_low_stock", "true", "Notificación stock bajo");
  seedSettingIfMissing("notification_expiring_lots", "true", "Notificación 2 días antes del vencimiento de lote");

  seedBranchIfMissing("AGM001", "Central", "Tienda central");
  seedBranchIfMissing("AGM002", "Agromarket 1", "Punto de venta / sucursal");

  var setupPasswords = setupPasswordsOverride || null;
  if (!setupPasswords && (!getById("Users", "USR001") || !getById("Users", "USR002") || !getById("Users", "USR003"))) {
    setupPasswords = getSetupPasswords();
  }
  if (!getById("Users", "USR001")) seedUser("USR001", "Admin San Antonio", CONFIG.DEFAULT_ADMIN_USER, setupPasswords.admin, "Admin");
  if (!getById("Users", "USR002")) seedUser("USR002", "Central", "tienda", setupPasswords.central, "Tienda");
  if (!getById("Users", "USR003")) seedUser("USR003", "Agromarket 1", "agromarket1", setupPasswords.agromarket, "Tienda");

  seedUserBranchIfMissing("USR001", "AGM001");
  seedUserBranchIfMissing("USR001", "AGM002");
  seedUserBranchIfMissing("USR002", "AGM001");
  seedUserBranchIfMissing("USR003", "AGM002");

  seedPermissionsIfMissing("USR002", {
    can_register_sales: true,
    can_register_entries: true,
    can_register_exits: true,
    can_register_transfers: true,
    can_register_waste: true,
    can_register_returns: true,
    can_apply_discounts: false,
    can_view_daily_summary: true,
    can_view_inventory: true,
    can_export_own_day: true,
    can_request_corrections: true
  });
  seedPermissionsIfMissing("USR003", {
    can_register_sales: true,
    can_register_entries: false,
    can_register_exits: false,
    can_register_transfers: false,
    can_register_waste: true,
    can_register_returns: true,
    can_apply_discounts: false,
    can_view_daily_summary: true,
    can_view_inventory: true,
    can_export_own_day: true,
    can_request_corrections: true
  });

  seedProductIfMissing("QG260504", "Queso grande", "Grande", "Quesos", 10);
  seedProductIfMissing("QP260504", "Queso pequeño", "Pequeño", "Quesos", 12);
  seedProductIfMissing("QM260504", "Queso mediano", "Mediano", "Quesos", 10);
  seedProductIfMissing("CV260504", "Crema vaso", "Vaso", "Cremas", 18);
  seedProductIfMissing("CB260504", "Crema bolsa", "Bolsa", "Cremas", 18);

  seedDistributorIfMissing("ALIS001", "Mazate");
  seedDistributorIfMissing("ALIS002", "CAES");

  return success({ spreadsheetId: spreadsheet.getId(), sheets: Object.keys(SHEETS) }, "Spreadsheet configurado.");
}

function resetSpreadsheetDangerously(payload) {
  requireAdmin(payload);
  if (payload.confirm !== "BORRAR TODO") throw new Error("Confirmación requerida para borrar todo.");
  var setupPasswords = getSetupPasswords();
  var spreadsheet = getSpreadsheet();
  Object.keys(SHEETS).forEach(function(name) {
    var sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
    sheet.clear();
    ensureHeaders(sheet, SHEETS[name]);
    sheet.setFrozenRows(1);
  });
  return setupSpreadsheet(setupPasswords);
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }
  var existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  if (!existing.some(function(header) { return header; })) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }
  headers.forEach(function(header) {
    if (existing.indexOf(header) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      existing.push(header);
    }
  });
}

function seedSettingIfMissing(key, value, description) {
  if (getRows("Settings").some(function(row) { return row.Key === key; })) return;
  appendRow("Settings", { Key: key, Value: value, Description: description, Updated_At: nowIso() });
}

function seedBranchIfMissing(id, name, type) {
  if (getById("Branches", id)) return;
  appendRow("Branches", { ID: id, Name: name, Type: type, Address: name, Active: true, Created_At: nowIso(), Updated_At: nowIso() });
}

function seedUserBranchIfMissing(userId, branchId) {
  if (getRows("User_Branches").some(function(row) { return row.User_ID === userId && row.Branch_ID === branchId; })) return;
  appendRow("User_Branches", { ID: nextId("User_Branches", "UB"), User_ID: userId, Branch_ID: branchId, Created_At: nowIso() });
}

function seedProductIfMissing(id, name, presentation, category, minStock) {
  if (getById("Products", id)) return;
  seedProduct(id, name, presentation, category, minStock);
}

function seedDistributorIfMissing(id, name) {
  if (getById("Distributors", id)) return;
  appendRow("Distributors", { ID: id, Name: name, Active: true, Special_Prices_JSON: "{}", Created_At: nowIso(), Updated_At: nowIso() });
}

function seedProduct(id, name, presentation, category, minStock) {
  appendRow("Products", {
    ID: id,
    Code: id,
    Name: name,
    Image_Url: "",
    Image_Data: "",
    Unit: "unidad",
    Presentation: presentation,
    Category: category,
    Final_Price: 0,
    Distributor_Price: 0,
    Production_Cost: 0,
    Min_Stock: minStock,
    Branch_Min_Stock_JSON: "{}",
    Active: true,
    Created_At: nowIso(),
    Updated_At: nowIso()
  });
}

function seedUser(id, name, username, password, role) {
  var salt = Utilities.getUuid();
  appendRow("Users", {
    ID: id,
    Name: name,
    Username: username,
    Password_Hash: hashPassword(password, salt),
    Password_Salt: salt,
    Role: role,
    Active: true,
    Created_At: nowIso(),
    Updated_At: nowIso()
  });
}

function seedPermissions(userId, permissions) {
  Object.keys(permissions).forEach(function(permission) {
    appendRow("Permissions", {
      ID: nextId("Permissions", "PER"),
      User_ID: userId,
      Permission: permission,
      Enabled: permissions[permission],
      Updated_At: nowIso()
    });
  });
}

function seedPermissionsIfMissing(userId, permissions) {
  var existing = getRows("Permissions").filter(function(row) { return row.User_ID === userId; }).map(function(row) { return row.Permission; });
  Object.keys(permissions).forEach(function(permission) {
    if (existing.indexOf(permission) > -1) return;
    appendRow("Permissions", {
      ID: nextId("Permissions", "PER"),
      User_ID: userId,
      Permission: permission,
      Enabled: permissions[permission],
      Updated_At: nowIso()
    });
  });
}

function getSetupPasswords() {
  return {
    admin: requiredScriptProperty(CONFIG.DEFAULT_ADMIN_PASSWORD_PROPERTY),
    central: requiredScriptProperty(CONFIG.CENTRAL_PASSWORD_PROPERTY),
    agromarket: requiredScriptProperty(CONFIG.AGROMARKET_PASSWORD_PROPERTY)
  };
}

function requiredScriptProperty(name) {
  var value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) throw new Error("Falta Script Property requerida para setup: " + name);
  return value;
}
