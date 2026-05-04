"use client";

import { ModulePage } from "@/components/ModulePage";
import { adminModules } from "@/lib/moduleConfigs";

export default function StoreExitPage() {
  return (
    <ModulePage
      {...adminModules.envios}
      title="Registrar salida"
      description="Salida o envío autorizado con producto, cantidad, destino o motivo."
    />
  );
}
