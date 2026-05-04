"use client";

import { ModulePage } from "@/components/ModulePage";
import { adminModules } from "@/lib/moduleConfigs";

export default function StoreSalePage() {
  return (
    <ModulePage
      {...adminModules.ventas}
      title="Venta rápida"
      description="Busca producto por código, registra cantidad, método de pago y guarda la venta de tu ubicación."
    />
  );
}
