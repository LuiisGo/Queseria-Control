function listProducts(payload) {
  requireActiveUser(payload);
  return success(getRows("Products").map(function(row) {
    return {
      id: row.ID,
      code: row.Code,
      name: row.Name,
      imageUrl: row.Image_Url,
      imageData: row.Image_Data || row.Image_Url || "",
      unit: row.Unit,
      presentation: row.Presentation,
      category: row.Category,
      finalPrice: Number(row.Final_Price || 0),
      distributorPrice: Number(row.Distributor_Price || 0),
      productionCost: Number(row.Production_Cost || 0),
      minStock: Number(row.Min_Stock || 0),
      branchMinStock: parseJson(row.Branch_Min_Stock_JSON, {}),
      active: String(row.Active) !== "FALSE",
      createdAt: row.Created_At,
      updatedAt: row.Updated_At
    };
  }));
}

function createProduct(payload) {
  var admin = requireAdmin(payload);
  requireFields(payload, ["name"]);
  var id = nextProductSku(payload.name, payload.productionDate || payload.createdAt || "");
  var row = {
    ID: id,
    Code: id,
    Name: payload.name,
    Image_Url: payload.imageUrl || "",
    Image_Data: payload.imageData || "",
    Unit: payload.unit || "unidad",
    Presentation: payload.presentation || "",
    Category: payload.category || "",
    Final_Price: Number(payload.finalPrice || 0),
    Distributor_Price: Number(payload.distributorPrice || 0),
    Production_Cost: Number(payload.productionCost || 0),
    Min_Stock: Number(payload.minStock || 0),
    Branch_Min_Stock_JSON: JSON.stringify(payload.branchMinStock || {}),
    Active: true,
    Created_At: nowIso(),
    Updated_At: nowIso()
  };
  appendRow("Products", row);
  logAudit(admin, "CREATE_PRODUCT", "Products", id, null, row, "");
  return success(row, "Producto creado.");
}

function updateProduct(payload) {
  var admin = requireAdmin(payload);
  requireFields(payload, ["id"]);
  var old = getById("Products", payload.id);
  var row = updateRow("Products", payload.id, {
    Name: payload.name,
    Image_Url: payload.imageUrl,
    Image_Data: payload.imageData,
    Unit: payload.unit,
    Presentation: payload.presentation,
    Category: payload.category,
    Final_Price: payload.finalPrice,
    Distributor_Price: payload.distributorPrice,
    Production_Cost: payload.productionCost,
    Min_Stock: payload.minStock,
    Active: payload.active,
    Updated_At: nowIso()
  });
  logAudit(admin, "UPDATE_PRODUCT", "Products", payload.id, old, row, "");
  return success(row, "Producto actualizado.");
}
