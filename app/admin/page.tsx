import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminDashboard, { type Lead } from "./AdminDashboard";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminDashboard leads={(data as Lead[]) ?? []} userEmail={user.email ?? ""} />
  );
}