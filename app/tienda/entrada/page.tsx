"use client";

import { ModulePage } from "@/components/ModulePage";
import { adminModules } from "@/lib/moduleConfigs";

export default function StoreEntryPage() {
  return (
    <ModulePage
      {...adminModules.produccion}
      title="Entrada a Central"
      description="Solo Central registra entradas con código de lote y vencimiento. Las subsucursales reciben inventario automáticamente cuando se hace un envío desde Central."
    />
  );
}
