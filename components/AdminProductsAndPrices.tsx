"use client";

import Link from "next/link";
import { ArrowRight, Package, WalletCards } from "lucide-react";
import { AdminPriceManager } from "@/components/AdminPriceManager";
import { ModulePage } from "@/components/ModulePage";
import { adminModules } from "@/lib/moduleConfigs";

export function AdminProductsAndPrices() {
  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Admin</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal">Productos y precios</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">
          Catálogo con SKU visible, imagen, presentación, stock mínimo y precios base.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/admin/productos#catalogo" className="rounded-lg border border-ink bg-ink p-4 text-white">
          <Package className="h-7 w-7" />
          <p className="mt-4 text-lg font-semibold">Catálogo de productos</p>
          <p className="mt-1 text-sm text-white/70">Crear producto, subir imagen y ver SKU.</p>
        </Link>
        <Link href="/admin/productos#precios" className="group rounded-lg border border-black/10 bg-white p-4 transition hover:bg-cream-100">
          <div className="flex items-start justify-between gap-3">
            <WalletCards className="h-7 w-7" />
            <ArrowRight className="h-4 w-4 text-black/35 transition group-hover:translate-x-1" />
          </div>
          <p className="mt-4 text-lg font-semibold">Actualizar precios</p>
          <p className="mt-1 text-sm text-black/55">Final, distribuidor y precios especiales.</p>
        </Link>
      </section>

      <div id="catalogo">
        <ModulePage {...adminModules.productos} title="Catálogo" description="Productos con SKU, presentación, imagen, precios base y estado." />
      </div>

      <div id="precios">
        <AdminPriceManager />
      </div>
    </div>
  );
}
