import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getSession } from "@/lib/session";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const user = getSession();
  if (!user) redirect("/login");
  return <AppShell user={user} mode="store">{children}</AppShell>;
}
