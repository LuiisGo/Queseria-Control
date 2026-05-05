"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, Edit3, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate, toInputDate } from "@/lib/utils";
import type { Credit } from "@/types";

type EditState = {
  credit: Credit;
  totalAmount: string;
  paidAmount: string;
  dueDate: string;
  status: string;
  notes: string;
};

export function AdminCreditsManager() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [payment, setPayment] = useState({ creditId: "", amount: "", paymentMethod: "Efectivo", note: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/credits", { cache: "no-store" });
    const json = await response.json();
    if (json.success) {
      setCredits(json.data || []);
      setPayment((current) => ({ ...current, creditId: current.creditId || json.data?.[0]?.id || "" }));
    } else {
      toast.error(json.error || "No se pudieron cargar créditos.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(credit: Credit) {
    setEdit({
      credit,
      totalAmount: String(credit.totalAmount || 0),
      paidAmount: String(credit.paidAmount || 0),
      dueDate: credit.dueDate ? toInputDate(credit.dueDate) : "",
      status: credit.status,
      notes: ""
    });
  }

  async function registerPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(payment.amount);
    if (!payment.creditId || !Number.isFinite(amount) || amount <= 0) return toast.error("Selecciona crédito y monto.");
    setSaving(true);
    const response = await fetch("/api/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payment, amount })
    });
    const json = await response.json();
    setSaving(false);
    if (!json.success) return toast.error(json.error || "No se pudo registrar abono.");
    toast.success("Abono registrado.");
    setPayment((current) => ({ ...current, amount: "", note: "" }));
    await load();
  }

  async function saveCredit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edit) return;
    const totalAmount = Number(edit.totalAmount);
    const paidAmount = Number(edit.paidAmount);
    if (!Number.isFinite(totalAmount) || totalAmount < 0) return toast.error("Total inválido.");
    if (!Number.isFinite(paidAmount) || paidAmount < 0) return toast.error("Pagado inválido.");

    setSaving(true);
    const response = await fetch("/api/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: edit.credit.id,
        totalAmount,
        paidAmount,
        dueDate: edit.dueDate,
        status: edit.status,
        notes: edit.notes
      })
    });
    const json = await response.json();
    setSaving(false);
    if (!json.success) return toast.error(json.error || "No se pudo actualizar crédito.");
    toast.success("Crédito actualizado.");
    setEdit(null);
    await load();
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Quesería San Antonio</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal">Créditos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">Cuentas por cobrar.</p>
        </div>
        <button className="btn-secondary" type="button" onClick={() => void load()}>
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Actualizar
        </button>
      </section>

      <form className="panel p-4" onSubmit={registerPayment}>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <h2 className="font-semibold">Registrar abono</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Crédito</span>
            <select className="field" value={payment.creditId} onChange={(event) => setPayment({ ...payment, creditId: event.target.value })} required>
              <option value="">Seleccionar</option>
              {credits.map((credit) => (
                <option key={credit.id} value={credit.id}>
                  {credit.id} · {credit.distributorName} · {formatCurrency(credit.balance)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Monto</span>
            <input className="field" type="number" min={0} step="0.01" value={payment.amount} onChange={(event) => setPayment({ ...payment, amount: event.target.value })} required />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Método</span>
            <select className="field" value={payment.paymentMethod} onChange={(event) => setPayment({ ...payment, paymentMethod: event.target.value })}>
              <option>Efectivo</option>
              <option>Transferencia</option>
            </select>
          </label>
          <button className="btn-primary mt-5 xl:mt-6" disabled={saving}>
            Guardar abono
          </button>
        </div>
      </form>

      <section className="panel overflow-hidden">
        <div className="border-b border-black/10 p-4">
          <h2 className="font-semibold">Lista de créditos</h2>
          <p className="text-sm text-black/55">{loading ? "Cargando..." : `${credits.length} registros`}</p>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-cream-100 text-xs uppercase tracking-[0.12em] text-black/55">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Distribuidor</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Pagado</th>
                <th className="px-4 py-3 font-semibold">Saldo</th>
                <th className="px-4 py-3 font-semibold">Vence</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Editar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {credits.map((credit) => (
                <tr key={credit.id} className="bg-white/70">
                  <td className="px-4 py-3 font-semibold">{credit.id}</td>
                  <td className="px-4 py-3">{credit.distributorName}</td>
                  <td className="px-4 py-3">{formatCurrency(credit.totalAmount)}</td>
                  <td className="px-4 py-3">{formatCurrency(credit.paidAmount)}</td>
                  <td className="px-4 py-3">{formatCurrency(credit.balance)}</td>
                  <td className="px-4 py-3">{formatDate(credit.dueDate)}</td>
                  <td className="px-4 py-3">{credit.status}</td>
                  <td className="px-4 py-3">
                    <button className="btn-secondary h-9 px-3" type="button" onClick={() => openEdit(credit)}>
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
          {credits.map((credit) => (
            <article key={credit.id} className="bg-white/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">{credit.id}</p>
                  <p className="mt-1 font-semibold">{credit.distributorName}</p>
                  <p className="text-sm text-black/55">{credit.status}</p>
                </div>
                <button className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white" type="button" onClick={() => openEdit(credit)} aria-label="Editar crédito">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <Metric label="Total" value={formatCurrency(credit.totalAmount)} />
                <Metric label="Pagado" value={formatCurrency(credit.paidAmount)} />
                <Metric label="Saldo" value={formatCurrency(credit.balance)} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {edit ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/30 p-0 sm:place-items-center sm:p-4">
          <form className="w-full rounded-t-2xl bg-milk p-4 shadow-soft sm:max-w-lg sm:rounded-xl" onSubmit={saveCredit}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-black/45">{edit.credit.id}</p>
                <h2 className="mt-1 text-2xl font-semibold">{edit.credit.distributorName}</h2>
              </div>
              <button className="btn-secondary h-10 px-3" type="button" onClick={() => setEdit(null)}>
                Cerrar
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Total</span>
                <input className="field" type="number" min={0} step="0.01" value={edit.totalAmount} onChange={(event) => setEdit({ ...edit, totalAmount: event.target.value })} required />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Pagado</span>
                <input className="field" type="number" min={0} step="0.01" value={edit.paidAmount} onChange={(event) => setEdit({ ...edit, paidAmount: event.target.value })} required />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Vencimiento</span>
                <input className="field" type="date" value={edit.dueDate} onChange={(event) => setEdit({ ...edit, dueDate: event.target.value })} />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Estado</span>
                <select className="field" value={edit.status} onChange={(event) => setEdit({ ...edit, status: event.target.value })}>
                  <option>Pendiente</option>
                  <option>Parcial</option>
                  <option>Pagado</option>
                  <option>Vencido</option>
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Nota</span>
                <textarea className="field h-20 py-3" value={edit.notes} onChange={(event) => setEdit({ ...edit, notes: event.target.value })} />
              </label>
            </div>
            <button className="btn-primary mt-4 w-full" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar crédito"}
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
