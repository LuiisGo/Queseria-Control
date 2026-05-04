"use client";

import { useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import { toast } from "sonner";
import { hasPermission } from "@/lib/permissions";
import { formatCurrency } from "@/lib/utils";
import type { SessionUser, StoreSummary } from "@/types";

export function DailyClosingForm() {
  const [summary, setSummary] = useState<StoreSummary | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [values, setValues] = useState({
    cashReported: "0",
    transferReported: "0",
    creditReported: "0",
    notes: ""
  });
  const systemTotal = summary?.salesToday || 0;
  const reported = Number(values.cashReported) + Number(values.transferReported) + Number(values.creditReported);
  const difference = reported - systemTotal;

  useEffect(() => {
    Promise.all([
      fetch("/api/reports/store-summary", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/auth/me", { cache: "no-store" }).then((response) => response.json())
    ]).then(([summaryJson, userJson]) => {
      if (summaryJson.success) setSummary(summaryJson.data);
      else toast.error(summaryJson.error);
      if (userJson.success) setUser(userJson.data);
    });
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/daily-closings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemTotal,
        cashReported: Number(values.cashReported),
        transferReported: Number(values.transferReported),
        creditReported: Number(values.creditReported),
        notes: values.notes
      })
    });
    const json = await response.json();
    if (json.success) toast.success("Cierre registrado.");
    else toast.error(json.error || "No se pudo registrar el cierre.");
  }

  if (user && !hasPermission(user, "can_view_daily_summary")) {
    return (
      <div className="space-y-5">
        <section>
          <h1 className="font-display text-3xl font-semibold tracking-normal">Cierre del día</h1>
          <p className="mt-2 text-sm text-black/60">Tu usuario no tiene permiso para ver resumen o registrar cierre del día.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Tienda</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal">Cierre del día</h1>
        <p className="mt-2 text-sm text-black/60">Compara el total del sistema con los montos reportados por método de pago.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-ink bg-ink p-4 text-white">
          <p className="text-sm text-white/65">Total sistema</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(systemTotal)}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <p className="text-sm text-black/55">Reportado</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(reported)}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <p className="text-sm text-black/55">Diferencia</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(difference)}</p>
        </div>
      </section>

      <form className="panel p-4" onSubmit={submit}>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <h2 className="font-semibold">Montos reportados</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["cashReported", "Efectivo"],
            ["transferReported", "Transferencia"],
            ["creditReported", "Crédito"]
          ].map(([key, label]) => (
            <label key={key}>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">{label}</span>
              <input className="field" type="number" value={values[key as keyof typeof values]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} />
            </label>
          ))}
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Notas</span>
          <textarea className="field h-24 py-3" value={values.notes} onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))} />
        </label>
        <button className="btn-primary mt-4 w-full sm:w-auto">Guardar cierre</button>
      </form>
    </div>
  );
}
