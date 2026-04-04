import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminContent from "./AdminContent";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isValid = await verifyAdminSessionToken(token);

  if (!isValid) {
    redirect("/gestion-lk-2024/login");
  }

  return <AdminContent />;
}
