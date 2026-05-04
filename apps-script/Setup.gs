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

  appendRow("Branches", { ID: "BR001", Name: "Producción", Type: "Producción", Active: true, Created_At: nowIso(), Updated_At: nowIso() });
  appendRow("Branches", { ID: "BR002", Name: "Tienda Central", Type: "Tienda central", Active: true, Created_At: nowIso(), Updated_At: nowIso() });

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
  appendRow("User_Branches", { ID: "UB001", User_ID: "USR001", Branch_ID: "BR001", Created_At: nowIso() });
  appendRow("User_Branches", { ID: "UB002", User_ID: "USR001", Branch_ID: "BR002", Created_At: nowIso() });

  return success({ spreadsheetId: spreadsheet.getId(), sheets: Object.keys(SHEETS) }, "Spreadsheet configurado.");
}
