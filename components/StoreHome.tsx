"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Boxes, PackagePlus, ReceiptText, ShoppingCart, Truck } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/StatCard";
import { hasPermission } from "@/lib/permissions";
import { formatCurrency } from "@/lib/utils";
import type { PermissionKey, SessionUser, StoreSummary } from "@/types";

const actions = [
  { href: "/tienda/venta", label: "Vender", icon: ShoppingCart, permission: "can_register_sales" },
  { href: "/tienda/inventario", label: "Ver inventario", icon: Boxes, permission: "can_view_inventory" },
  { href: "/tienda/merma", label: "Registrar pérdida", icon: AlertTriangle, permission: "can_register_waste" },
  { href: "/tienda/cierre-dia", label: "Cierre del día", icon: ReceiptText, permission: "can_view_daily_summary" },
  { href: "/tienda/entrada", label: "Registrar producción", icon: PackagePlus, centralOnly: true, permission: "can_register_entries" },
  { href: "/tienda/salida", label: "Enviar a tienda", icon: Truck, centralOnly: true, permission: "can_register_transfers" }
] satisfies Array<{ href: string; label: string; icon: typeof ShoppingCart; centralOnly?: boolean; permission: PermissionKey }>;

export function StoreHome() {
  const [summary, setSummary] = useState<StoreSummary | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);

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

  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Tienda</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal">{summary?.branchName || "Mi ubicación"}</h1>
        <p className="mt-2 text-sm text-black/60">Botones grandes y pasos cortos para operar desde celular.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {actions.filter((action) => (!action.centralOnly || summary?.branchType === "Tienda central") && hasPermission(user, action.permission)).map((action) => {
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
