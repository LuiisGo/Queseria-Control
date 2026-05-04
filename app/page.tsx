import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default function HomePage() {
  const user = getSession();
  redirect(user?.role === "Admin" ? "/admin/dashboard" : user ? "/tienda/inicio" : "/login");
}
