"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Edit3, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { downloadCsv, formatCurrency, formatDate } from "@/lib/utils";
import type { Sale } from "@/types";

type EditState = {
  sale: Sale;
  paymentMethod: string;
  status: string;
  notes: string;
};

export function AdminSalesRecords({ title = "Ventas", description = "Ventas registradas." }: { title?: string; description?: string }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<EditState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/sales", { cache: "no-store" });
    const json = await response.json();
    if (json.success) setSales(json.data || []);
    else toast.error(json.error || "No se pudieron cargar ventas.");
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(sale: Sale) {
    setEdit({
      sale,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      notes: sale.notes || ""
    });
  }

  async function saveSale(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edit) return;
    setSaving(true);
    const response = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: edit.sale.id,
        paymentMethod: edit.paymentMethod,
        status: edit.status,
        notes: edit.notes
      })
    });
    const json = await response.json();
    setSaving(false);
    if (!json.success) return toast.error(json.error || "No se pudo actualizar venta.");
    toast.success("Venta actualizada.");
    setEdit(null);
    await load();
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Quesería San Antonio</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">{description}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" type="button" onClick={() => downloadCsv("ventas.csv", sales as unknown as Record<string, unknown>[])}>
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button className="btn-secondary" type="button" onClick={() => void load()}>
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-black/10 p-4">
          <h2 className="font-semibold">Listado</h2>
          <p className="text-sm text-black/55">{loading ? "Cargando..." : `${sales.length} registros`}</p>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-cream-100 text-xs uppercase tracking-[0.12em] text-black/55">
              <tr>
                <th className="px-4 py-3 font-semibold">Venta</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Ubicación</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Método</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Editar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {sales.map((sale) => (
                <tr key={sale.id} className="bg-white/70">
                  <td className="px-4 py-3 font-semibold">{sale.id}</td>
                  <td className="px-4 py-3">{formatDate(sale.date)}</td>
                  <td className="px-4 py-3">{sale.branchName}</td>
                  <td className="px-4 py-3">{sale.distributorName || sale.customerType}</td>
                  <td className="px-4 py-3">{sale.paymentMethod}</td>
                  <td className="px-4 py-3">{formatCurrency(sale.total)}</td>
                  <td className="px-4 py-3">{sale.status}</td>
                  <td className="px-4 py-3">
                    <button className="btn-secondary h-9 px-3" type="button" onClick={() => openEdit(sale)}>
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
          {sales.map((sale) => (
            <article key={sale.id} className="bg-white/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">{sale.id}</p>
                  <p className="mt-1 font-semibold">{sale.branchName}</p>
                  <p className="text-sm text-black/55">{sale.paymentMethod} · {sale.status}</p>
                </div>
                <button className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white" type="button" onClick={() => openEdit(sale)} aria-label="Editar venta">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Metric label="Total" value={formatCurrency(sale.total)} />
                <Metric label="Ganancia" value={formatCurrency(sale.estimatedProfit)} />
              </div>
            </article>
          ))}
        </div>
        {!sales.length && <div className="p-8 text-center text-sm text-black/55">No hay registros para mostrar.</div>}
      </section>

      {edit ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/30 p-0 sm:place-items-center sm:p-4">
          <form className="w-full rounded-t-2xl bg-milk p-4 shadow-soft sm:max-w-lg sm:rounded-xl" onSubmit={saveSale}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-black/45">{edit.sale.id}</p>
                <h2 className="mt-1 text-2xl font-semibold">{edit.sale.branchName}</h2>
              </div>
              <button className="btn-secondary h-10 px-3" type="button" onClick={() => setEdit(null)}>
                Cerrar
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Método</span>
                <select className="field" value={edit.paymentMethod} onChange={(event) => setEdit({ ...edit, paymentMethod: event.target.value })}>
                  <option>Efectivo</option>
                  <option>Transferencia</option>
                  <option>Crédito</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Estado</span>
                <select className="field" value={edit.status} onChange={(event) => setEdit({ ...edit, status: event.target.value })}>
                  <option>Pagada</option>
                  <option>Crédito pendiente</option>
                  <option>Crédito pagado parcialmente</option>
                  <option>Crédito pagado</option>
                  <option>Anulada por Admin</option>
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Notas</span>
                <textarea className="field h-24 py-3" value={edit.notes} onChange={(event) => setEdit({ ...edit, notes: event.target.value })} />
              </label>
            </div>
            <button className="btn-primary mt-4 w-full" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar venta"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-cream-100 p-2">
      <p className="text-xs text-black/45">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
