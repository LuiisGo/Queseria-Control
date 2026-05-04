"use client";

import { ModulePage } from "@/components/ModulePage";
import { adminModules } from "@/lib/moduleConfigs";

export default function StoreEntryPage() {
  return (
    <ModulePage
      {...adminModules.produccion}
      title="Registrar entrada"
      description="Entrada de producto con lote y vencimiento para la ubicación asignada."
    />
  );
}
