"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  Home,
  LogOut,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Wheat
} from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { hasPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { PermissionKey, SessionUser, StoreSummary } from "@/types";

const adminNav = [
  { href: "/admin/dashboard", label: "Resumen", icon: BarChart3 },
  { href: "/admin/operar", label: "Operar", icon: Wheat },
  { href: "/admin/inventario", label: "Inventario", icon: Boxes },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/distribuidores", label: "Clientes", icon: Store },
  { href: "/admin/creditos", label: "Créditos", icon: CreditCard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/reportes", label: "Reportes", icon: ReceiptText },
  { href: "/admin/configuracion", label: "Config", icon: Settings }
];

const storeNav = [
  { href: "/tienda/inicio", label: "Inicio", icon: Home },
  { href: "/tienda/venta", label: "Venta", icon: ShoppingCart, permission: "can_register_sales" },
  { href: "/tienda/inventario", label: "Inventario", icon: Boxes, permission: "can_view_inventory" },
  { href: "/tienda/merma", label: "Pérdida", icon: ClipboardList, permission: "can_register_waste" },
  { href: "/tienda/cierre-dia", label: "Cierre", icon: ReceiptText, permission: "can_view_daily_summary" },
  { href: "/tienda/entrada", label: "Producción", icon: Wheat, permission: "can_register_entries", centralOnly: true },
  { href: "/tienda/salida", label: "Envíos", icon: Truck, permission: "can_register_transfers", centralOnly: true }
] satisfies Array<{ href: string; label: string; icon: typeof Home; permission?: PermissionKey; centralOnly?: boolean }>;

export function AppShell({ children, user, mode }: { children: React.ReactNode; user: SessionUser; mode: "admin" | "store" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [storeSummary, setStoreSummary] = useState<StoreSummary | null>(null);
  const nav = useMemo(() => {
    if (mode === "admin") return adminNav;
    return storeNav.filter((item) => {
      if (item.permission && !hasPermission(user, item.permission)) return false;
      if (item.centralOnly && storeSummary?.branchType !== "Tienda central") return false;
      return true;
    });
  }, [mode, storeSummary?.branchType, user]);

  useEffect(() => {
    if (mode !== "store") return;
    fetch("/api/reports/store-summary", { cache: "no-store" })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) setStoreSummary(json.data);
      });
  }, [mode]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sesión cerrada");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-black/10 bg-milk/95 px-4 py-5 lg:block">
        <BrandMark />
        <nav className="mt-8 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-black/68 transition hover:bg-cream-100 hover:text-ink",
                  active && "bg-ink text-white hover:bg-ink hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <header className="sticky top-0 z-10 border-b border-black/10 bg-milk/90 px-4 py-3 backdrop-blur lg:ml-72">
        <div className="flex items-center justify-between gap-3">
          <BrandMark compact className="lg:hidden" />
          <div className="hidden lg:block">
            <p className="text-sm text-black/55">Sesión activa</p>
            <p className="font-semibold">{user.name}</p>
          </div>
          <button className="btn-secondary h-10" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      </header>

      <main className="px-4 pb-32 pt-5 lg:ml-72 lg:px-8 lg:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-black/10 bg-milk/95 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[78px] shrink-0 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold text-black/55",
                active && "bg-ink text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
