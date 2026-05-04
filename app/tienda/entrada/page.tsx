"use client";

import { ModulePage } from "@/components/ModulePage";
import { adminModules } from "@/lib/moduleConfigs";

export default function StoreEntryPage() {
  return (
    <ModulePage
      {...adminModules.produccion}
      title="Registrar producción"
      description="Central registra producción con código de lote y vencimiento. Las subsucursales reciben inventario automáticamente cuando Central hace un envío."
    />
  );
}
