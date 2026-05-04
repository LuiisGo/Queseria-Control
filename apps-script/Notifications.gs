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
