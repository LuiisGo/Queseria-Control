import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BrandMark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-black/10 bg-white">
        <Image src="/brand/logo-lsa.jpg" alt="Logo San Antonio" fill sizes="48px" className="object-cover" priority />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold tracking-normal">{APP_NAME}</p>
          <p className="text-xs uppercase tracking-[0.22em] text-black/55">Control operativo</p>
        </div>
      )}
    </div>
  );
}
