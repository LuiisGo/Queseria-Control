"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit3, Plus, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Branch, Distributor, Product } from "@/types";

type PriceRow = {
  id?: string;
  productId: string;
  productName: string;
  sku?: string;
  finalPrice: number;
  distributorPrice: number;
  updatedAt?: string;
};

type EditState = {
  row: PriceRow;
  finalPrice: string;
  distributorPrice: string;
  notes: string;
};

export function AdminPriceManager() {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [special, setSpecial] = useState({
    productId: "",
    priceType: "Precio especial por sucursal",
    scopeBranchId: "",
    scopeDistributorId: "",
    price: "0",
    notes: ""
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [priceResponse, productResponse, branchResponse, distributorResponse] = await Promise.all([
      fetch("/api/prices", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/products", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/branches", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/distributors", { cache: "no-store" }).then((response) => response.json())
    ]);
    if (priceResponse.success) setRows(priceResponse.data || []);
    else toast.error(priceResponse.error || "No se pudieron cargar precios.");
    if (productResponse.success) setProducts(productResponse.data || []);
    if (branchResponse.success) setBranches(branchResponse.data || []);
    if (distributorResponse.success) setDistributors(distributorResponse.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(row: PriceRow) {
    setEdit({
      row,
      finalPrice: String(row.finalPrice || 0),
      distributorPrice: String(row.distributorPrice || 0),
      notes: ""
    });
  }

  async function saveBasePrices(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edit) return;
    const finalPrice = Number(edit.finalPrice);
    const distributorPrice = Number(edit.distributorPrice);
    if (!Number.isFinite(finalPrice) || finalPrice < 0) return toast.error("Precio final inválido.");
    if (!Number.isFinite(distributorPrice) || distributorPrice < 0) return toast.error("Precio distribuidor inválido.");

    setSaving(true);
    const requests = [];
    if (finalPrice !== edit.row.finalPrice) {
      requests.push(savePrice(edit.row.productId, "Precio venta final", finalPrice, "", edit.notes));
    }
    if (distributorPrice !== edit.row.distributorPrice) {
      requests.push(savePrice(edit.row.productId, "Precio distribuidor", distributorPrice, "", edit.notes));
    }
    if (!requests.length) {
      setSaving(false);
      return toast.message("No hay cambios por guardar.");
    }
    const results = await Promise.all(requests);
    setSaving(false);
    const failed = results.find((result) => !result.success);
    if (failed) return toast.error(failed.error || "No se pudo actualizar precio.");
    toast.success("Precios actualizados.");
    setEdit(null);
    await load();
  }

  async function saveSpecialPrice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number(special.price);
    const scopeId = special.priceType.includes("sucursal") ? special.scopeBranchId : special.scopeDistributorId;
    if (!special.productId || !scopeId) return toast.error("Selecciona producto y destino.");
    if (!Number.isFinite(price) || price < 0) return toast.error("Precio inválido.");
    setSaving(true);
    const result = await savePrice(special.productId, special.priceType, price, scopeId, special.notes);
    setSaving(false);
    if (!result.success) return toast.error(result.error || "No se pudo guardar precio especial.");
    toast.success("Precio especial guardado.");
    setSpecial((current) => ({ ...current, price: "0", notes: "" }));
    await load();
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Quesería San Antonio</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal">Precios</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">Precios vigentes.</p>
        </div>
        <button className="btn-secondary" type="button" onClick={() => void load()}>
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Actualizar
        </button>
      </section>

      <section className="panel p-4">
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          <h2 className="font-semibold">Precio especial</h2>
        </div>
        <form className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5" onSubmit={saveSpecialPrice}>
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Producto</span>
            <select className="field" value={special.productId} onChange={(event) => setSpecial({ ...special, productId: event.target.value })} required>
              <option value="">Seleccionar</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  SKU {product.code || product.id} · {product.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Tipo</span>
            <select className="field" value={special.priceType} onChange={(event) => setSpecial({ ...special, priceType: event.target.value })}>
              <option>Precio especial por sucursal</option>
              <option>Precio especial por distribuidor</option>
            </select>
          </label>
          {special.priceType.includes("sucursal") ? (
            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Sucursal</span>
              <select className="field" value={special.scopeBranchId} onChange={(event) => setSpecial({ ...special, scopeBranchId: event.target.value })} required>
                <option value="">Seleccionar</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.id} · {branch.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Distribuidor</span>
              <select className="field" value={special.scopeDistributorId} onChange={(event) => setSpecial({ ...special, scopeDistributorId: event.target.value })} required>
                <option value="">Seleccionar</option>
                {distributors.map((distributor) => (
                  <option key={distributor.id} value={distributor.id}>
                    {distributor.id} · {distributor.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Precio</span>
            <input className="field" type="number" min={0} step="0.01" value={special.price} onChange={(event) => setSpecial({ ...special, price: event.target.value })} required />
          </label>
          <button className="btn-primary mt-5 xl:mt-6" disabled={saving}>
            Guardar
          </button>
        </form>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-black/10 p-4">
          <h2 className="font-semibold">Lista de precios</h2>
          <p className="text-sm text-black/55">{loading ? "Cargando..." : `${rows.length} productos`}</p>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-cream-100 text-xs uppercase tracking-[0.12em] text-black/55">
              <tr>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Final</th>
                <th className="px-4 py-3 font-semibold">Distribuidor</th>
                <th className="px-4 py-3 font-semibold">Actualizado</th>
                <th className="px-4 py-3 font-semibold">Editar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {rows.map((row) => (
                <tr key={row.productId} className="bg-white/70">
                  <td className="px-4 py-3 font-semibold">{row.sku || row.productId}</td>
                  <td className="px-4 py-3">{row.productName}</td>
                  <td className="px-4 py-3">{formatCurrency(row.finalPrice)}</td>
                  <td className="px-4 py-3">{formatCurrency(row.distributorPrice)}</td>
                  <td className="px-4 py-3">{formatDate(row.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <button className="btn-secondary h-9 px-3" type="button" onClick={() => openEdit(row)}>
                      <Edit3 className="h-4 w-4" />
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-black/10 md:hidden">
          {rows.map((row) => (
            <article key={row.productId} className="bg-white/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">{row.sku || row.productId}</p>
                  <p className="mt-1 font-semibold">{row.productName}</p>
                </div>
                <button className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white" type="button" onClick={() => openEdit(row)} aria-label="Editar precio">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-cream-100 p-2">
                  <p className="text-xs text-black/45">Final</p>
                  <p className="font-semibold">{formatCurrency(row.finalPrice)}</p>
                </div>
                <div className="rounded-lg bg-cream-100 p-2">
                  <p className="text-xs text-black/45">Distribuidor</p>
                  <p className="font-semibold">{formatCurrency(row.distributorPrice)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {edit ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/30 p-0 sm:place-items-center sm:p-4">
          <form className="w-full rounded-t-2xl bg-milk p-4 shadow-soft sm:max-w-lg sm:rounded-xl" onSubmit={saveBasePrices}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-black/45">{edit.row.sku || edit.row.productId}</p>
                <h2 className="mt-1 text-2xl font-semibold">{edit.row.productName}</h2>
              </div>
              <button className="btn-secondary h-10 px-3" type="button" onClick={() => setEdit(null)}>
                Cerrar
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Precio final</span>
                <input className="field" type="number" min={0} step="0.01" value={edit.finalPrice} onChange={(event) => setEdit({ ...edit, finalPrice: event.target.value })} required />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Distribuidor</span>
                <input className="field" type="number" min={0} step="0.01" value={edit.distributorPrice} onChange={(event) => setEdit({ ...edit, distributorPrice: event.target.value })} required />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Nota</span>
                <textarea className="field h-20 py-3" value={edit.notes} onChange={(event) => setEdit({ ...edit, notes: event.target.value })} />
              </label>
            </div>
            <button className="btn-primary mt-4 w-full" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar precios"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

async function savePrice(productId: string, priceType: string, price: number, scopeId = "", notes = "") {
  const response = await fetch("/api/prices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, priceType, price, scopeId, notes })
  });
  return response.json();
}
