function logAudit(user, action, moduleName, recordId, oldData, newData, note) {
  appendRow("Audit_Log", {
    ID: nextId("Audit_Log", "AUD"),
    Date: nowIso(),
    User_ID: user ? user.ID : "",
    Role: user ? user.Role : "",
    Action: action,
    Module: moduleName,
    Record_ID: recordId || "",
    Old_Data_JSON: oldData ? JSON.stringify(oldData) : "",
    New_Data_JSON: newData ? JSON.stringify(newData) : "",
    IP: "",
    User_Agent: "",
    Note: note || ""
  });
}
