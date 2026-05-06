import assert from "node:assert/strict";
import test from "node:test";

function allocateFifo(lots, quantity) {
  let remaining = quantity;
  const allocations = [];
  const ordered = [...lots]
    .filter((lot) => lot.quantity > 0)
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime() || a.lotNumber.localeCompare(b.lotNumber));

  for (const lot of ordered) {
    if (remaining <= 0) break;
    const used = Math.min(lot.quantity, remaining);
    remaining -= used;
    allocations.push({ lotNumber: lot.lotNumber, quantity: used });
  }
  if (remaining > 0) throw new Error("Stock insuficiente");
  return allocations;
}

function resolvePrice({ product, customerType, distributorPrice, branchPrice }) {
  if (distributorPrice !== undefined) return distributorPrice;
  if (branchPrice !== undefined) return branchPrice;
  return customerType === "Distribuidor/mayorista" ? product.distributorPrice : product.finalPrice;
}

function validateSale(items, stockByProduct) {
  const demand = new Map();
  for (const item of items) {
    demand.set(item.productId, (demand.get(item.productId) || 0) + item.quantity);
  }
  for (const [productId, quantity] of demand) {
    if ((stockByProduct[productId] || 0) < quantity) throw new Error(`Stock insuficiente: ${productId}`);
  }
  return true;
}

test("FIFO usa primero el lote que vence antes", () => {
  const result = allocateFifo(
    [
      { lotNumber: "002", expiresAt: "2026-05-20", quantity: 5 },
      { lotNumber: "001", expiresAt: "2026-05-10", quantity: 4 }
    ],
    6
  );

  assert.deepEqual(result, [
    { lotNumber: "001", quantity: 4 },
    { lotNumber: "002", quantity: 2 }
  ]);
});

test("precio especial tiene prioridad sobre precio base", () => {
  const product = { finalPrice: 10, distributorPrice: 8 };

  assert.equal(resolvePrice({ product, customerType: "Cliente general", branchPrice: 9 }), 9);
  assert.equal(resolvePrice({ product, customerType: "Distribuidor/mayorista", distributorPrice: 7 }), 7);
  assert.equal(resolvePrice({ product, customerType: "Distribuidor/mayorista" }), 8);
});

test("venta valida demanda agregada antes de escribir", () => {
  assert.throws(
    () =>
      validateSale(
        [
          { productId: "QG260504", quantity: 3 },
          { productId: "QG260504", quantity: 4 }
        ],
        { QG260504: 6 }
      ),
    /Stock insuficiente/
  );
  assert.equal(validateSale([{ productId: "QG260504", quantity: 6 }], { QG260504: 6 }), true);
});
