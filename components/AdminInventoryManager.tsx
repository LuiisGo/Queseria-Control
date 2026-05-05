"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { downloadCsv, formatDate } from "@/lib/utils";
import type { InventoryItem } from "@/types";

type EditState = {
  item: InventoryItem;
  quantity: string;
  minStock: string;
  lotNumber: string;
  expirationDate: string;
  reason: string;
  notes: string;
};

export function AdminInventoryManager() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<EditState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/inventory", { cache: "no-store" });
    const json = await response.json();
    if (json.success) setItems(json.data || []);
    else toast.error(json.error || "No se pudo cargar inventario.");
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        lotsCount: item.lots?.length || 0,
        lowStock: item.quantity <= item.minStock
      })),
    [items]
  );

  function startEdit(item: InventoryItem) {
    setEdit({
      item,
      quantity: String(item.quantity),
      minStock: String(item.minStock),
      lotNumber: "",
      expirationDate: "",
      reason: "Ajuste manual",
      notes: ""
    });
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edit) return;
    const newQuantity = Number(edit.quantity);
    const minStock = Number(edit.minStock);
    if (!Number.isFinite(newQuantity) || newQuantity < 0) return toast.error("Cantidad inválida.");
    if (!Number.isFinite(minStock) || minStock < 0) return toast.error("Mínimo inválido.");

    setSaving(true);
    const response = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: edit.item.productId,
        branchId: edit.item.branchId,
        newQuantity,
        minStock,
        lotNumber: edit.lotNumber.trim() || undefined,
        expirationDate: edit.expirationDate || undefined,
        reason: edit.reason.trim() || "Ajuste manual",
        notes: edit.notes.trim() || undefined
      })
    });
    const json = await response.json();
    setSaving(false);
    if (json.success) {
      toast.success("Inventario actualizado.");
      setEdit(null);
      await load();
    } else {
      toast.error(json.error || "No se pudo actualizar inventario.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Quesería San Antonio</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal">Inventario</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">Existencias por producto.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" type="button" onClick={() => downloadCsv("inventario.csv", rows)}>
            Exportar CSV
          </button>
          <button className="btn-secondary" type="button" onClick={() => void load()}>
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-black/10 p-4">
          <h2 className="font-semibold">Inventario</h2>
          <p className="text-sm text-black/55">{loading ? "Cargando..." : `${items.length} registros`}</p>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-cream-100 text-xs uppercase tracking-[0.12em] text-black/55">
              <tr>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Ubicación</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Mínimo</th>
                <th className="px-4 py-3 font-semibold">Lotes</th>
                <th className="px-4 py-3 font-semibold">Actualizado</th>
                <th className="px-4 py-3 font-semibold">Editar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {rows.map((item) => (
                <tr key={item.id} className="bg-white/70">
                  <td className="px-4 py-3 font-semibold">{item.productName}</td>
                  <td className="px-4 py-3">{item.branchName}</td>
                  <td className="px-4 py-3">
                    <span className={item.lowStock ? "font-semibold text-red-700" : ""}>{item.quantity}</span>
                  </td>
                  <td className="px-4 py-3">{item.minStock}</td>
                  <td className="px-4 py-3">{item.lotsCount} lote(s)</td>
                  <td className="px-4 py-3">{formatDate(item.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <button className="btn-secondary h-9 px-3" type="button" onClick={() => startEdit(item)}>
                      <Edit3 className="h-4 w-4" />
                      Ajustar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-black/10 md:hidden">
          {rows.map((item) => (
            <article key={item.id} className="bg-white/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-black/55">{item.branchName}</p>
                </div>
                <button className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white" type="button" onClick={() => startEdit(item)} aria-label="Editar inventario">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg bg-cream-100 p-2">
                  <p className="text-xs text-black/45">Stock</p>
                  <p className={item.lowStock ? "font-semibold text-red-700" : "font-semibold"}>{item.quantity}</p>
                </div>
                <div className="rounded-lg bg-cream-100 p-2">
                  <p className="text-xs text-black/45">Mínimo</p>
                  <p className="font-semibold">{item.minStock}</p>
                </div>
                <div className="rounded-lg bg-cream-100 p-2">
                  <p className="text-xs text-black/45">Lotes</p>
                  <p className="font-semibold">{item.lotsCount}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!items.length && <div className="p-8 text-center text-sm text-black/55">No hay inventario para mostrar.</div>}
      </section>

      {edit ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/30 p-0 sm:place-items-center sm:p-4">
          <form className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-milk p-4 shadow-soft sm:max-w-xl sm:rounded-xl" onSubmit={saveEdit}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-black/45">Ajuste manual</p>
                <h2 className="mt-1 text-2xl font-semibold">{edit.item.productName}</h2>
                <p className="text-sm text-black/55">{edit.item.branchName}</p>
              </div>
              <button className="btn-secondary h-10 px-3" type="button" onClick={() => setEdit(null)}>
                Cerrar
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Nueva cantidad</span>
                <input className="field" type="number" min={0} value={edit.quantity} onChange={(event) => setEdit({ ...edit, quantity: event.target.value })} required />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Stock mínimo</span>
                <input className="field" type="number" min={0} value={edit.minStock} onChange={(event) => setEdit({ ...edit, minStock: event.target.value })} required />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Código de lote</span>
                <input className="field" value={edit.lotNumber} onChange={(event) => setEdit({ ...edit, lotNumber: event.target.value })} placeholder="Opcional si sube stock" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Vencimiento</span>
                <input className="field" type="date" value={edit.expirationDate} onChange={(event) => setEdit({ ...edit, expirationDate: event.target.value })} />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Motivo</span>
                <input className="field" value={edit.reason} onChange={(event) => setEdit({ ...edit, reason: event.target.value })} required />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Nota</span>
                <textarea className="field h-20 py-3" value={edit.notes} onChange={(event) => setEdit({ ...edit, notes: event.target.value })} />
              </label>
            </div>

            <button className="btn-primary mt-4 w-full" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar ajuste"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
