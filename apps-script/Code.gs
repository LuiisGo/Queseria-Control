function doPost(e) {
  try {
    var request = JSON.parse(e.postData.contents || "{}");
    validateSecret(request.secret);
    var action = request.action;
    var payload = request.payload || {};
    var data;

    switch (action) {
      case "AUTH_LOGIN": data = authLogin(payload); break;
      case "GET_ME": data = success(payload.currentUser || null); break;
      case "CREATE_USER": data = createUser(payload); break;
      case "UPDATE_USER": data = updateUser(payload); break;
      case "DEACTIVATE_USER": data = deactivateUser(payload); break;
      case "LIST_USERS": data = listUsers(payload); break;
      case "CREATE_BRANCH": data = createBranch(payload); break;
      case "UPDATE_BRANCH": data = updateBranch(payload); break;
      case "LIST_BRANCHES": data = listBranches(payload); break;
      case "CREATE_PRODUCT": data = createProduct(payload); break;
      case "UPDATE_PRODUCT": data = updateProduct(payload); break;
      case "LIST_PRODUCTS": data = listProducts(payload); break;
      case "SET_PRICE": data = setPrice(payload); break;
      case "GET_PRICE_HISTORY": data = getPriceHistory(payload); break;
      case "LIST_INVENTORY": data = listInventory(payload); break;
      case "REGISTER_PRODUCTION": data = registerProduction(payload); break;
      case "LIST_PRODUCTION": data = listProduction(payload); break;
      case "REGISTER_TRANSFER": data = registerTransfer(payload); break;
      case "LIST_TRANSFERS": data = listTransfers(payload); break;
      case "REGISTER_SALE": data = registerSale(payload); break;
      case "LIST_SALES": data = listSales(payload); break;
      case "REGISTER_WASTE": data = registerWaste(payload); break;
      case "LIST_WASTE": data = listWaste(payload); break;
      case "REGISTER_RETURN": data = registerReturn(payload); break;
      case "CREATE_DISTRIBUTOR": data = createDistributor(payload); break;
      case "UPDATE_DISTRIBUTOR": data = updateDistributor(payload); break;
      case "LIST_DISTRIBUTORS": data = listDistributors(payload); break;
      case "REGISTER_CREDIT_PAYMENT": data = registerCreditPayment(payload); break;
      case "LIST_CREDITS": data = listCredits(payload); break;
      case "GET_ADMIN_DASHBOARD": data = getAdminDashboard(payload); break;
      case "GET_STORE_DAILY_SUMMARY": data = getStoreDailySummary(payload); break;
      case "CREATE_CORRECTION_REQUEST": data = createCorrectionRequest(payload); break;
      case "REVIEW_CORRECTION_REQUEST": data = reviewCorrectionRequest(payload); break;
      case "REGISTER_DAILY_CLOSING": data = registerDailyClosing(payload); break;
      case "EXPORT_REPORT_DATA": data = exportReportData(payload); break;
      case "SETUP_SPREADSHEET": data = setupSpreadsheet(); break;
      case "GET_SETTINGS": data = getSettings(payload); break;
      case "SET_SETTINGS": data = setSettings(payload); break;
      default: throw new Error("Acción no soportada: " + action);
    }

    return jsonResponse(data);
  } catch (error) {
    return jsonResponse(failure(error.message));
  }
}
