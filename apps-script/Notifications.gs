function createNotification(type, title, message, targetRole, targetUserId) {
  var row = { ID: nextId("Notifications", "NOT"), Date: nowIso(), Type: type, Title: title, Message: message, Target_Role: targetRole || "Admin", Target_User_ID: targetUserId || "", Read: false, Email_Sent: false };
  appendRow("Notifications", row);
  var emails = getSettingValue("admin_emails", "");
  if (emails) {
    MailApp.sendEmail(emails, title, message);
    updateRow("Notifications", row.ID, { Email_Sent: true });
  }
  return row;
}

function createNotificationOnce(type, title, message, targetRole, targetUserId) {
  var exists = getRows("Notifications").some(function(row) {
    return row.Type === type && row.Message === message && row.Target_Role === (targetRole || "Admin") && row.Target_User_ID === (targetUserId || "");
  });
  if (exists) return null;
  return createNotification(type, title, message, targetRole, targetUserId);
}

function checkExpirationNotifications() {
  if (String(getSettingValue("notification_expiring_lots", "true")) !== "true") return [];
  var created = [];
  getRows("Inventory_Lots").forEach(function(lot) {
    if (Number(lot.Quantity || 0) <= 0 || !lot.Expiration_Date) return;
    var days = daysUntil(lot.Expiration_Date);
    if (days < 0 || days > 2) return;
    var message = "El lote " + lot.Lot_Number + " de " + productName(lot.Product_ID) + " vence el " + lot.Expiration_Date + " y tiene " + Number(lot.Quantity || 0) + " unidades en " + branchName(lot.Branch_ID) + ".";
    var notification = createNotificationOnce("LOT_EXPIRING", "Producto por vencer", message, "Admin", "");
    if (notification) created.push(notification);
  });
  return created;
}

function runDailyNotificationChecks() {
  return checkExpirationNotifications();
}

function installDailyNotificationTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === "runDailyNotificationChecks") ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger("runDailyNotificationChecks").timeBased().everyDays(1).atHour(7).create();
  return success({}, "Trigger diario de vencimientos instalado.");
}

function daysUntil(dateValue) {
  var today = new Date(dateOnly(nowIso()) + "T00:00:00");
  var target = new Date(dateOnly(dateValue) + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getSettings(payload) {
  requireActiveUser(payload);
  return success(getRows("Settings").map(function(row) { return { key: row.Key, value: row.Value, description: row.Description, updatedAt: row.Updated_At }; }));
}

function setSettings(payload) {
  var admin = requireAdmin(payload);
  Object.keys(payload).forEach(function(key) {
    if (key === "currentUser") return;
    var existing = getRows("Settings").find(function(row) { return row.Key === key; });
    if (existing) {
      getSheet("Settings").getRange(existing._rowNumber, 2).setValue(payload[key]);
      getSheet("Settings").getRange(existing._rowNumber, 4).setValue(nowIso());
    } else {
      appendRow("Settings", { Key: key, Value: payload[key], Description: "", Updated_At: nowIso() });
    }
  });
  logAudit(admin, "SET_SETTINGS", "Settings", "Settings", null, payload, "");
  return success(payload, "Configuración guardada.");
}

function getSettingValue(key, fallback) {
  var row = getRows("Settings").find(function(candidate) { return candidate.Key === key; });
  return row ? row.Value : fallback;
}
