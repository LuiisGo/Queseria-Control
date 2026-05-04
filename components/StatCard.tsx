import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, icon: Icon, tone = "light" }: { label: string; value: string; icon: LucideIcon; tone?: "light" | "dark" }) {
  return (
    <div className={cn("rounded-lg border p-4", tone === "dark" ? "border-ink bg-ink text-white" : "border-black/10 bg-white")}>
      <div className="flex items-center justify-between gap-4">
        <p className={cn("text-sm", tone === "dark" ? "text-white/70" : "text-black/55")}>{label}</p>
        <Icon className="h-5 w-5 opacity-70" />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-normal">{value}</p>
    </div>
  );
}
