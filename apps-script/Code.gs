function doPost(e) {
  var lock = null;
  var lockAcquired = false;
  try {
    var request = JSON.parse(e.postData.contents || "{}");
    validateSecret(request.secret);
    var action = request.action;
    var payload = request.payload || {};

    if (actionRequiresLock(action)) {
      lock = LockService.getScriptLock();
      if (!lock.tryLock(15000)) throw new Error("El sistema está ocupado guardando otro movimiento. Intenta de nuevo en unos segundos.");
      lockAcquired = true;
    }

    return jsonResponse(dispatchAction(action, payload));
  } catch (error) {
    return jsonResponse(failure(error.message));
  } finally {
    if (lock && lockAcquired) lock.releaseLock();
  }
}

function actionRequiresLock(action) {
  return !/^(LIST_|GET_|EXPORT_)/.test(String(action || ""));
}

function dispatchAction(action, payload) {
  switch (action) {
    case "AUTH_LOGIN": return authLogin(payload);
    case "GET_ME": return success(payload.currentUser || null);
    case "CREATE_USER": return createUser(payload);
    case "UPDATE_USER": return updateUser(payload);
    case "DEACTIVATE_USER": return deactivateUser(payload);
    case "LIST_USERS": return listUsers(payload);
    case "CREATE_BRANCH": return createBranch(payload);
    case "UPDATE_BRANCH": return updateBranch(payload);
    case "LIST_BRANCHES": return listBranches(payload);
    case "CREATE_PRODUCT": return createProduct(payload);
    case "UPDATE_PRODUCT": return updateProduct(payload);
    case "LIST_PRODUCTS": return listProducts(payload);
    case "SET_PRICE": return setPrice(payload);
    case "GET_PRICE_HISTORY": return getPriceHistory(payload);
    case "LIST_INVENTORY": return listInventory(payload);
    case "ADJUST_INVENTORY": return adjustInventory(payload);
    case "REGISTER_PRODUCTION": return registerProduction(payload);
    case "UPDATE_PRODUCTION": return updateProduction(payload);
    case "LIST_PRODUCTION": return listProduction(payload);
    case "REGISTER_TRANSFER": return registerTransfer(payload);
    case "UPDATE_TRANSFER": return updateTransfer(payload);
    case "LIST_TRANSFERS": return listTransfers(payload);
    case "REGISTER_SALE": return registerSale(payload);
    case "UPDATE_SALE": return updateSale(payload);
    case "LIST_SALES": return listSales(payload);
    case "REGISTER_WASTE": return registerWaste(payload);
    case "UPDATE_WASTE": return updateWaste(payload);
    case "LIST_WASTE": return listWaste(payload);
    case "REGISTER_RETURN": return registerReturn(payload);
    case "CREATE_DISTRIBUTOR": return createDistributor(payload);
    case "UPDATE_DISTRIBUTOR": return updateDistributor(payload);
    case "LIST_DISTRIBUTORS": return listDistributors(payload);
    case "UPDATE_CREDIT": return updateCredit(payload);
    case "REGISTER_CREDIT_PAYMENT": return registerCreditPayment(payload);
    case "LIST_CREDITS": return listCredits(payload);
    case "GET_ADMIN_DASHBOARD": return getAdminDashboard(payload);
    case "GET_STORE_DAILY_SUMMARY": return getStoreDailySummary(payload);
    case "CREATE_CORRECTION_REQUEST": return createCorrectionRequest(payload);
    case "REVIEW_CORRECTION_REQUEST": return reviewCorrectionRequest(payload);
    case "REGISTER_DAILY_CLOSING": return registerDailyClosing(payload);
    case "EXPORT_REPORT_DATA": return exportReportData(payload);
    case "SETUP_SPREADSHEET": return setupSpreadsheet();
    case "RESET_SPREADSHEET_DANGEROUSLY": return resetSpreadsheetDangerously(payload);
    case "GET_SETTINGS": return getSettings(payload);
    case "SET_SETTINGS": return setSettings(payload);
    case "RUN_NOTIFICATION_CHECKS":
      requireAdmin(payload);
      return success(runDailyNotificationChecks());
    case "INSTALL_NOTIFICATION_TRIGGER": return installDailyNotificationTrigger(payload);
    default: throw new Error("Acción no soportada: " + action);
  }
}
