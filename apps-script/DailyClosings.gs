function registerDailyClosing(payload) {
  var user = requireActiveUser(payload);
  assertPermission(user, "can_view_daily_summary");
  var branchId = payload.branchId || userAssignedBranches(user.ID)[0];
  assertBranchAccess(user, branchId);
  var systemTotal = Number(payload.systemTotal || calculateSystemTotalForBranch(branchId));
  var reported = Number(payload.cashReported || 0) + Number(payload.transferReported || 0) + Number(payload.cardReported || 0) + Number(payload.creditReported || 0);
  var row = {
    ID: nextId("Daily_Closings", "CLS"),
    Date: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd"),
    Branch_ID: branchId,
    User_ID: user.ID,
    System_Total: systemTotal,
    Cash_Reported: Number(payload.cashReported || 0),
    Transfer_Reported: Number(payload.transferReported || 0),
    Card_Reported: Number(payload.cardReported || 0),
    Credit_Reported: Number(payload.creditReported || 0),
    Difference: reported - systemTotal,
    Status: "Cerrado",
    Notes: payload.notes || ""
  };
  appendRow("Daily_Closings", row);
  logAudit(user, "REGISTER_DAILY_CLOSING", "Daily_Closings", row.ID, null, row, "");
  return success(row, "Cierre registrado.");
}

function calculateSystemTotalForBranch(branchId) {
  var today = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd");
  return getRows("Sales").filter(function(row) {
    return row.Branch_ID === branchId && String(row.Date).slice(0, 10) === today;
  }).reduce(function(sum, row) {
    return sum + Number(row.Total || 0);
  }, 0);
}
