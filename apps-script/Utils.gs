function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function success(data, message) {
  return { success: true, data: data || {}, message: message || "" };
}

function failure(message) {
  return { success: false, error: message || "Error inesperado" };
}

function nowIso() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function getSpreadsheet() {
  var id = PropertiesService.getScriptProperties().getProperty(CONFIG.SPREADSHEET_ID_PROPERTY);
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  var spreadsheet = getSpreadsheet();
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) throw new Error("No existe la pestaña " + name + ". Ejecuta setupSpreadsheet().");
  return sheet;
}

function getRows(name) {
  var sheet = getSheet(name);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  return values.slice(1).filter(function(row) {
    return row.some(function(cell) { return cell !== ""; });
  }).map(function(row, index) {
    var object = { _rowNumber: index + 2 };
    headers.forEach(function(header, columnIndex) {
      object[header] = row[columnIndex];
    });
    return object;
  });
}

function appendRow(name, object) {
  var sheet = getSheet(name);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map(function(header) { return object[header] !== undefined ? object[header] : ""; }));
  return object;
}

function updateRow(name, id, object) {
  var sheet = getSheet(name);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rows = getRows(name);
  var row = rows.find(function(candidate) { return candidate.ID === id; });
  if (!row) throw new Error("Registro no encontrado: " + id);
  headers.forEach(function(header, index) {
    if (object[header] !== undefined) sheet.getRange(row._rowNumber, index + 1).setValue(object[header]);
  });
  return Object.assign(row, object);
}

function deleteRowsWhere(name, predicate) {
  var sheet = getSheet(name);
  var rows = getRows(name);
  for (var index = rows.length - 1; index >= 0; index--) {
    if (predicate(rows[index])) sheet.deleteRow(rows[index]._rowNumber);
  }
}

function getById(name, id) {
  return getRows(name).find(function(row) { return row.ID === id; });
}

function nextId(sheetName, prefix) {
  var count = getRows(sheetName).length + 1;
  return prefix + String(count).padStart(3, "0");
}

function productPrefix(name) {
  var normalized = String(name || "").toLowerCase();
  if (normalized.indexOf("queso grande") > -1) return "QG";
  if (normalized.indexOf("queso pequeño") > -1 || normalized.indexOf("queso pequeno") > -1) return "QP";
  if (normalized.indexOf("queso mediano") > -1) return "QM";
  if (normalized.indexOf("crema vaso") > -1) return "CV";
  if (normalized.indexOf("crema bolsa") > -1) return "CB";
  var parts = normalized.split(/\s+/).filter(function(part) { return part; });
  var prefix = parts.map(function(part) { return part.charAt(0); }).join("").toUpperCase();
  return (prefix || "PR").slice(0, 4).padEnd(2, "X");
}

function dateCode(value) {
  var date = parseLocalDate(value);
  if (isNaN(date.getTime())) date = new Date();
  return Utilities.formatDate(date, CONFIG.TIMEZONE, "yyMMdd");
}

function dateOnly(value) {
  var date = parseLocalDate(value);
  if (isNaN(date.getTime())) date = new Date();
  return Utilities.formatDate(date, CONFIG.TIMEZONE, "yyyy-MM-dd");
}

function addDaysDate(value, days) {
  var date = parseLocalDate(value);
  if (isNaN(date.getTime())) date = new Date();
  date.setDate(date.getDate() + Number(days || 0));
  return Utilities.formatDate(date, CONFIG.TIMEZONE, "yyyy-MM-dd");
}

function parseLocalDate(value) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    var parts = String(value).split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  return value ? new Date(value) : new Date();
}

function nextProductSku(name, productionDate) {
  var base = (productPrefix(name) + dateCode(productionDate)).slice(0, 10);
  var matches = getRows("Products").filter(function(product) {
    return String(product.ID || "").indexOf(base) === 0 || String(product.Code || "").indexOf(base) === 0;
  });
  if (!matches.length) return base;
  return (base + String(matches.length + 1).padStart(2, "0")).slice(0, 12);
}

function parseJson(value, fallback) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch (error) { return fallback; }
}

function requireFields(payload, fields) {
  fields.forEach(function(field) {
    if (payload[field] === undefined || payload[field] === "") throw new Error("Campo obligatorio: " + field);
  });
}

function validateSecret(secret) {
  var expected = PropertiesService.getScriptProperties().getProperty(CONFIG.SECRET_PROPERTY);
  if (!expected) throw new Error("APP_SECRET no configurado en Script Properties.");
  if (secret !== expected) throw new Error("APP_SECRET inválido.");
}

function sha256(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value)
    .map(function(byte) {
      var normalized = byte < 0 ? byte + 256 : byte;
      return ("0" + normalized.toString(16)).slice(-2);
    })
    .join("");
}

function hashPassword(password, salt) {
  return sha256(String(password) + ":" + String(salt));
}

function getCurrentUser(payload) {
  if (payload.currentUser && payload.currentUser.id) {
    var user = getById("Users", payload.currentUser.id);
    if (user && String(user.Active) !== "FALSE") return user;
  }
  return null;
}

function requireActiveUser(payload) {
  var user = getCurrentUser(payload);
  if (!user) throw new Error("Usuario activo requerido.");
  return user;
}

function requireAdmin(payload) {
  var user = requireActiveUser(payload);
  if (user.Role !== "Admin") throw new Error("Solo Admin puede ejecutar esta acción.");
  return user;
}

function userAssignedBranches(userId) {
  return getRows("User_Branches").filter(function(row) { return row.User_ID === userId; }).map(function(row) { return row.Branch_ID; });
}

function userPermissions(userId) {
  var result = {};
  getRows("Permissions").filter(function(row) { return row.User_ID === userId; }).forEach(function(row) {
    result[row.Permission] = String(row.Enabled) === "TRUE" || row.Enabled === true;
  });
  return result;
}

function assertBranchAccess(user, branchId) {
  if (user.Role === "Admin") return;
  if (userAssignedBranches(user.ID).indexOf(branchId) === -1) throw new Error("Ubicación no asignada al usuario.");
}

function assertPermission(user, permission) {
  if (user.Role === "Admin") return;
  if (!userPermissions(user.ID)[permission]) throw new Error("Permiso requerido: " + permission);
}

function mapUser(row) {
  return {
    id: row.ID,
    name: row.Name,
    username: row.Username,
    role: row.Role,
    active: String(row.Active) !== "FALSE",
    permissions: userPermissions(row.ID),
    assignedBranches: userAssignedBranches(row.ID)
  };
}

function productName(productId) {
  var product = getById("Products", productId);
  return product ? product.Name : productId;
}

function branchName(branchId) {
  var branch = getById("Branches", branchId);
  return branch ? branch.Name : branchId;
}

function branchType(branchId) {
  var branch = getById("Branches", branchId);
  return branch ? branch.Type : "";
}

function distributorName(distributorId) {
  var distributor = getById("Distributors", distributorId);
  return distributor ? distributor.Name : distributorId;
}
