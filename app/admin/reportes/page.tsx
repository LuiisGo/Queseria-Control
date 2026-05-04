"use client";

import { ModulePage } from "@/components/ModulePage";
import { adminModules } from "@/lib/moduleConfigs";

export default function ReportesPage() {
  return <ModulePage {...adminModules.reportes} />;
}
