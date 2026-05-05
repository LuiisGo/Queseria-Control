function setPrice(payload) {
  var admin = requireAdmin(payload);
  requireFields(payload, ["productId", "priceType", "price"]);
  var scopeType = payload.scopeId ? (payload.priceType.indexOf("sucursal") > -1 ? "Branch" : "Distributor") : "Global";
  var existing = getRows("Product_Prices").find(function(row) {
    return row.Product_ID === payload.productId && row.Price_Type === payload.priceType && row.Scope_ID === (payload.scopeId || "");
  });
  var oldPrice = existing ? existing.Price : "";
  if (existing) {
    updateRow("Product_Prices", existing.ID, { Price: Number(payload.price), Updated_At: nowIso() });
  } else {
    appendRow("Product_Prices", { ID: nextId("Product_Prices", "PRI"), Product_ID: payload.productId, Price_Type: payload.priceType, Scope_Type: scopeType, Scope_ID: payload.scopeId || "", Price: Number(payload.price), Active: true, Updated_At: nowIso() });
  }
  if (scopeType === "Global" && payload.priceType === "Precio venta final") {
    updateRow("Products", payload.productId, { Final_Price: Number(payload.price), Updated_At: nowIso() });
  }
  if (scopeType === "Global" && payload.priceType === "Precio distribuidor") {
    updateRow("Products", payload.productId, { Distributor_Price: Number(payload.price), Updated_At: nowIso() });
  }
  appendRow("Price_History", { ID: nextId("Price_History", "PH"), Product_ID: payload.productId, Price_Type: payload.priceType, Scope_Type: scopeType, Scope_ID: payload.scopeId || "", Old_Price: oldPrice, New_Price: Number(payload.price), User_ID: admin.ID, Changed_At: nowIso(), Notes: payload.notes || "" });
  logAudit(admin, "SET_PRICE", "Prices", payload.productId, { price: oldPrice }, payload, "");
  return success({}, "Precio actualizado.");
}

function getPriceHistory(payload) {
  requireActiveUser(payload);
  return success(getRows("Products").map(function(row) {
    return { id: row.ID, productId: row.ID, productName: row.Name, sku: row.Code, finalPrice: Number(row.Final_Price || 0), distributorPrice: Number(row.Distributor_Price || 0), updatedAt: row.Updated_At };
  }));
}
