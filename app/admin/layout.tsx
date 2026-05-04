import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getSession } from "@/lib/session";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = getSession();
  if (!user) redirect("/login");
  if (user.role !== "Admin") redirect("/tienda/inicio");
  return <AppShell user={user} mode="admin">{children}</AppShell>;
}
