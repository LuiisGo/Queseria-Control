function createCreditFromSale(sale) {
  appendRow("Credits", { ID: nextId("Credits", "CRD"), Distributor_ID: sale.Distributor_ID, Sale_ID: sale.ID, Total_Amount: sale.Total, Paid_Amount: 0, Balance: sale.Total, Sale_Date: sale.Date, Due_Date: "", Status: "Pendiente" });
}

function listCredits(payload) {
  requireActiveUser(payload);
  return success(getRows("Credits").map(function(row) {
    var distributor = getById("Distributors", row.Distributor_ID);
    return { id: row.ID, distributorId: row.Distributor_ID, distributorName: distributor ? distributor.Name : row.Distributor_ID, saleId: row.Sale_ID, totalAmount: Number(row.Total_Amount || 0), paidAmount: Number(row.Paid_Amount || 0), balance: Number(row.Balance || 0), saleDate: row.Sale_Date, dueDate: row.Due_Date, status: row.Status };
  }));
}

function registerCreditPayment(payload) {
  var user = requireActiveUser(payload);
  requireFields(payload, ["creditId", "amount", "paymentMethod"]);
  var credit = getById("Credits", payload.creditId);
  if (!credit) throw new Error("Crédito no encontrado.");
  var paid = Number(credit.Paid_Amount || 0) + Number(payload.amount);
  var balance = Math.max(0, Number(credit.Total_Amount || 0) - paid);
  var status = balance <= 0 ? "Pagado" : "Parcial";
  updateRow("Credits", credit.ID, { Paid_Amount: paid, Balance: balance, Status: status });
  var payment = { ID: nextId("Credit_Payments", "CP"), Credit_ID: credit.ID, Date: nowIso(), User_ID: user.ID, Amount: Number(payload.amount), Payment_Method: payload.paymentMethod, Note: payload.note || "" };
  appendRow("Credit_Payments", payment);
  logAudit(user, "REGISTER_CREDIT_PAYMENT", "Credits", credit.ID, credit, payment, "");
  return success(payment, "Abono registrado.");
}
