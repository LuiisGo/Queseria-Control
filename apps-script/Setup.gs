function setupSpreadsheet() {
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

  var salt = Utilities.getUuid();
  appendRow("Users", {
    ID: "USR001",
    Name: "Admin San Antonio",
    Username: CONFIG.DEFAULT_ADMIN_USER,
    Password_Hash: hashPassword(CONFIG.DEFAULT_ADMIN_PASSWORD, salt),
    Password_Salt: salt,
    Role: "Admin",
    Active: true,
    Created_At: nowIso(),
    Updated_At: nowIso()
  });
  appendRow("User_Branches", { ID: "UB001", User_ID: "USR001", Branch_ID: "AGM001", Created_At: nowIso() });
  appendRow("User_Branches", { ID: "UB002", User_ID: "USR001", Branch_ID: "AGM002", Created_At: nowIso() });

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
