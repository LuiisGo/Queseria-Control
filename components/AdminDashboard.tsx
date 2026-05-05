"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Boxes, CreditCard, HandCoins, PackageCheck, ShoppingCart, TrendingUp, Truck, Users, Wheat } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { StatCard } from "@/components/StatCard";
import { formatCurrency } from "@/lib/utils";
import type { DashboardData } from "@/types";

const colors = ["#171615", "#dec48f", "#8f7652", "#c5a269", "#f1dfbd"];

const adminActions = [
  { href: "/admin/operar", label: "Operar ahora", helper: "Producción, envío, venta y pérdida", icon: Wheat },
  { href: "/admin/productos", label: "Productos y precios", helper: "SKU, imagen, stock mínimo y precios", icon: PackageCheck },
  { href: "/admin/usuarios", label: "Usuarios y permisos", helper: "Accesos por tienda y rol", icon: Users },
  { href: "/admin/reportes", label: "Exportar reportes", helper: "Ventas, inventario y créditos", icon: ShoppingCart }
];

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/reports/dashboard", { cache: "no-store" })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) setData(json.data);
        else toast.error(json.error);
      });
  }, []);

  if (!data) {
    return <div className="panel p-8 text-center text-sm text-black/55">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Panel administrativo</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal">Resumen administrativo</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">Ventas, inventario, producción, créditos y alertas críticas de la quesería.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {adminActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="group rounded-lg border border-black/10 bg-white p-4 transition hover:-translate-y-0.5 hover:bg-cream-100">
              <div className="flex items-start justify-between gap-3">
                <Icon className="h-7 w-7" />
                <ArrowRight className="h-4 w-4 text-black/35 transition group-hover:translate-x-1" />
              </div>
              <p className="mt-4 text-lg font-semibold">{action.label}</p>
              <p className="mt-1 text-sm leading-5 text-black/55">{action.helper}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ventas de hoy" value={formatCurrency(data.kpis.todaySales)} icon={HandCoins} tone="dark" />
        <StatCard label="Ventas del mes" value={formatCurrency(data.kpis.monthSales)} icon={TrendingUp} />
        <StatCard label="Ganancia estimada" value={formatCurrency(data.kpis.estimatedProfit)} icon={PackageCheck} />
        <StatCard label="Créditos pendientes" value={formatCurrency(data.kpis.pendingCredits)} icon={CreditCard} />
        <StatCard label="Stock bajo" value={String(data.kpis.lowStockCount)} icon={AlertTriangle} />
        <StatCard label="Pérdidas" value={`${data.kpis.wasteTotal} uds`} icon={Boxes} />
        <StatCard label="Producción" value={`${data.kpis.productionTotal} uds`} icon={Wheat} />
        <StatCard label="Envíos activos" value="1" icon={Truck} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-4">
          <h2 className="font-semibold">Comparación mensual</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eadbc3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="sales" stroke="#171615" strokeWidth={3} />
                <Line type="monotone" dataKey="profit" stroke="#b18a52" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-4">
          <h2 className="font-semibold">Ventas por método</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.salesByPaymentMethod} dataKey="total" nameKey="name" outerRadius={92} label>
                  {data.salesByPaymentMethod.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="panel p-4">
        <h2 className="font-semibold">Ventas por sucursal</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.salesByBranch}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eadbc3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="total" fill="#171615" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <DataTable title="Stock bajo" rows={data.lowStock as unknown as Record<string, unknown>[]} columns={[
          { key: "productName", label: "Producto" },
          { key: "branchName", label: "Ubicación" },
          { key: "quantity", label: "Stock" },
          { key: "minStock", label: "Mínimo" }
        ]} />
        <DataTable title="Créditos pendientes" rows={data.pendingCredits as unknown as Record<string, unknown>[]} columns={[
          { key: "id", label: "ID" },
          { key: "distributorName", label: "Distribuidor" },
          { key: "balance", label: "Saldo", render: (row) => formatCurrency(Number(row.balance)) },
          { key: "status", label: "Estado" }
        ]} />
      </div>
    </div>
  );
}
