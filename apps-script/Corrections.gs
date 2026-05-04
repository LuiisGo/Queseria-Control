function createCorrectionRequest(payload) {
  var user = requireActiveUser(payload);
  assertPermission(user, "can_request_corrections");
  requireFields(payload, ["recordId", "recordType", "reason", "currentValue", "requestedValue"]);
  var row = {
    ID: nextId("Correction_Requests", "COR"),
    Record_ID: payload.recordId,
    Record_Type: payload.recordType,
    Reason: payload.reason,
    Current_Value_JSON: JSON.stringify(payload.currentValue),
    Requested_Value_JSON: JSON.stringify(payload.requestedValue),
    User_ID: user.ID,
    Date: nowIso(),
    Status: "Pendiente",
    Reviewed_By: "",
    Reviewed_At: "",
    Review_Note: ""
  };
  appendRow("Correction_Requests", row);
  createNotification("correction_request", "Solicitud de corrección pendiente", "Hay una corrección pendiente para " + payload.recordType, "Admin", "");
  logAudit(user, "CREATE_CORRECTION_REQUEST", "Correction_Requests", row.ID, null, row, "");
  return success(row, "Solicitud enviada.");
}

function reviewCorrectionRequest(payload) {
  var admin = requireAdmin(payload);
  requireFields(payload, ["id", "decision"]);
  var request = getById("Correction_Requests", payload.id);
  if (!request) throw new Error("Solicitud no encontrada.");
  var status = payload.decision === "approve" ? "Aprobada" : "Rechazada";
  var row = updateRow("Correction_Requests", payload.id, { Status: status, Reviewed_By: admin.ID, Reviewed_At: nowIso(), Review_Note: payload.note || "" });
  logAudit(admin, "REVIEW_CORRECTION_REQUEST", "Correction_Requests", payload.id, request, row, "MVP registra aprobación; aplicar cambios complejos por tipo queda centralizado aquí.");
  return success(row, "Solicitud revisada.");
}
