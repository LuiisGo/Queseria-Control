"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Boxes, PackagePlus, ReceiptText, ShoppingCart, Truck } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/StatCard";
import { formatCurrency } from "@/lib/utils";
import type { StoreSummary } from "@/types";

const actions = [
  { href: "/tienda/venta", label: "Registrar venta", icon: ShoppingCart },
  { href: "/tienda/entrada", label: "Registrar producción", icon: PackagePlus, centralOnly: true },
  { href: "/tienda/salida", label: "Enviar a sucursal", icon: Truck },
  { href: "/tienda/inventario", label: "Ver inventario", icon: Boxes },
  { href: "/tienda/cierre-dia", label: "Cierre del día", icon: ReceiptText }
];

export function StoreHome() {
  const [summary, setSummary] = useState<StoreSummary | null>(null);

  useEffect(() => {
    fetch("/api/reports/store-summary", { cache: "no-store" })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) setSummary(json.data);
        else toast.error(json.error);
      });
  }, []);

  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Tienda</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal">{summary?.branchName || "Mi ubicación"}</h1>
        <p className="mt-2 text-sm text-black/60">Flujos rápidos para operar desde celular.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {actions.filter((action) => !action.centralOnly || summary?.branchType === "Tienda central").map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="rounded-lg border border-black/10 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:bg-cream-100">
              <Icon className="h-7 w-7" />
              <p className="mt-4 text-lg font-semibold">{action.label}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Ventas del día" value={formatCurrency(summary?.salesToday || 0)} icon={ShoppingCart} tone="dark" />
        <StatCard label="Movimientos" value={String(summary?.movementsToday || 0)} icon={Truck} />
        <StatCard label="Cierre" value={summary?.closingStatus || "Pendiente"} icon={ReceiptText} />
      </section>

      <section className="panel p-4">
        <h2 className="font-semibold">Alertas propias</h2>
        <div className="mt-3 space-y-2">
          {(summary?.alerts?.length ? summary.alerts : ["Sin alertas críticas para esta ubicación."]).map((alert) => (
            <p key={alert} className="rounded-lg bg-cream-100 p-3 text-sm text-black/70">
              {alert}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
