import { AdminDashboard } from "@/components/AdminDashboard";
import { callBackend } from "@/lib/appsScriptClient";
import { getSession } from "@/lib/session";
import type { DashboardData } from "@/types";

export default async function AdminDashboardPage() {
  const response = await callBackend<DashboardData>("GET_ADMIN_DASHBOARD", { currentUser: getSession() });
  return <AdminDashboard initialData={response.success ? response.data : null} initialError={response.success ? "" : response.error} />;
}
