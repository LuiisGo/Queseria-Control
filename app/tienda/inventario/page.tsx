"use client";

import { ModulePage } from "@/components/ModulePage";
import { adminModules } from "@/lib/moduleConfigs";

export default function StoreInventoryPage() {
  return (
    <ModulePage
      {...adminModules.inventario}
      title="Inventario de tienda"
      description="Existencias disponibles, mínimos y lotes de la ubicación asignada."
    />
  );
}
