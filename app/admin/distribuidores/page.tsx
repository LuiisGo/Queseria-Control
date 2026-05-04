"use client";

import { ModulePage } from "@/components/ModulePage";
import { adminModules } from "@/lib/moduleConfigs";

export default function DistribuidoresPage() {
  return <ModulePage {...adminModules.distribuidores} />;
}
