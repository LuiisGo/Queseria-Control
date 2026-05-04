"use client";

import { ModulePage } from "@/components/ModulePage";
import { adminModules } from "@/lib/moduleConfigs";

export default function VentasPage() {
  return <ModulePage {...adminModules.ventas} />;
}
