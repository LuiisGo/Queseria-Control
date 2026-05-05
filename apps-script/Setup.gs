function setupSpreadsheet() {
  var setupPasswords = getSetupPasswords();
  var spreadsheet = getSpreadsheet();
  Object.keys(SHEETS).forEach(function(name) {
    var sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
    var headers = SHEETS[name];
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  });

  appendRow("Settings", { Key: "allow_negative_stock", Value: "false", Description: "Permite vender sin stock disponible", Updated_At: nowIso() });
  appendRow("Settings", { Key: "admin_emails", Value: "", Description: "Correos separados por coma para notificaciones", Updated_At: nowIso() });
  appendRow("Settings", { Key: "notification_low_stock", Value: "true", Description: "Notificación stock bajo", Updated_At: nowIso() });
  appendRow("Settings", { Key: "notification_expiring_lots", Value: "true", Description: "Notificación 2 días antes del vencimiento de lote", Updated_At: nowIso() });

  appendRow("Branches", { ID: "AGM001", Name: "Central", Type: "Tienda central", Address: "Central", Active: true, Created_At: nowIso(), Updated_At: nowIso() });
  appendRow("Branches", { ID: "AGM002", Name: "Agromarket 1", Type: "Punto de venta / sucursal", Address: "Agromarket 1", Active: true, Created_At: nowIso(), Updated_At: nowIso() });

  seedUser("USR001", "Admin San Antonio", CONFIG.DEFAULT_ADMIN_USER, setupPasswords.admin, "Admin");
  seedUser("USR002", "Central", "tienda", setupPasswords.central, "Tienda");
  seedUser("USR003", "Agromarket 1", "agromarket1", setupPasswords.agromarket, "Tienda");

  appendRow("User_Branches", { ID: "UB001", User_ID: "USR001", Branch_ID: "AGM001", Created_At: nowIso() });
  appendRow("User_Branches", { ID: "UB002", User_ID: "USR001", Branch_ID: "AGM002", Created_At: nowIso() });
  appendRow("User_Branches", { ID: "UB003", User_ID: "USR002", Branch_ID: "AGM001", Created_At: nowIso() });
  appendRow("User_Branches", { ID: "UB004", User_ID: "USR003", Branch_ID: "AGM002", Created_At: nowIso() });

  seedPermissions("USR002", {
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
  seedPermissions("USR003", {
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

  seedProduct("QG260504", "Queso grande", "Grande", "Quesos", 10);
  seedProduct("QP260504", "Queso pequeño", "Pequeño", "Quesos", 12);
  seedProduct("QM260504", "Queso mediano", "Mediano", "Quesos", 10);
  seedProduct("CV260504", "Crema vaso", "Vaso", "Cremas", 18);
  seedProduct("CB260504", "Crema bolsa", "Bolsa", "Cremas", 18);

  appendRow("Distributors", { ID: "ALIS001", Name: "Mazate", Active: true, Special_Prices_JSON: "{}", Created_At: nowIso(), Updated_At: nowIso() });
  appendRow("Distributors", { ID: "ALIS002", Name: "CAES", Active: true, Special_Prices_JSON: "{}", Created_At: nowIso(), Updated_At: nowIso() });

  return success({ spreadsheetId: spreadsheet.getId(), sheets: Object.keys(SHEETS) }, "Spreadsheet configurado.");
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
