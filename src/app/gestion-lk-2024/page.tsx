import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminContent from "./AdminContent";

const SESSION_TOKEN = "lokilla-admin-ok";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth")?.value;

  if (token !== SESSION_TOKEN) {
    redirect("/gestion-lk-2024/login");
  }

  return <AdminContent />;
}
