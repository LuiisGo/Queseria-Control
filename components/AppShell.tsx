"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Building2,
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
  WalletCards,
  Wheat
} from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/ubicaciones", label: "Ubicaciones", icon: Building2 },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/precios", label: "Precios", icon: WalletCards },
  { href: "/admin/inventario", label: "Inventario", icon: Boxes },
  { href: "/admin/produccion", label: "Producción", icon: Wheat },
  { href: "/admin/envios", label: "Envíos", icon: Truck },
  { href: "/admin/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/admin/distribuidores", label: "Distribuidores", icon: Store },
  { href: "/admin/creditos", label: "Créditos", icon: CreditCard },
  { href: "/admin/mermas", label: "Mermas", icon: ClipboardList },
  { href: "/admin/reportes", label: "Reportes", icon: ReceiptText },
  { href: "/admin/configuracion", label: "Config", icon: Settings }
];

const storeNav = [
  { href: "/tienda/inicio", label: "Inicio", icon: Home },
  { href: "/tienda/venta", label: "Venta", icon: ShoppingCart },
  { href: "/tienda/inventario", label: "Inventario", icon: Boxes },
  { href: "/tienda/merma", label: "Merma", icon: ClipboardList },
  { href: "/tienda/cierre-dia", label: "Cierre", icon: ReceiptText },
  { href: "/tienda/entrada", label: "Producción", icon: Wheat },
  { href: "/tienda/salida", label: "Envíos", icon: Truck }
];

export function AppShell({ children, user, mode }: { children: React.ReactNode; user: SessionUser; mode: "admin" | "store" }) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = mode === "admin" ? adminNav : storeNav;

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

      <main className="px-4 pb-28 pt-5 lg:ml-72 lg:px-8 lg:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 gap-1 border-t border-black/10 bg-milk/95 px-2 py-2 backdrop-blur lg:hidden">
        {nav.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold text-black/55", active && "bg-ink text-white")}
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
