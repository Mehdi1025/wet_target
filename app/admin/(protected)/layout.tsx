import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/sonner";
import { getAdminSession } from "@/lib/admin/session";
import { getClientsForPicker } from "@/lib/supabase/clients";
import { getOpenTaskCount } from "@/lib/supabase/project-tasks";
import { redirect } from "next/navigation";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const clients = await getClientsForPicker();
  const openTaskCount = await getOpenTaskCount();

  return (
    <>
      <AdminShell
        username={session.username}
        clients={clients}
        openTaskCount={openTaskCount}
      >
        {children}
      </AdminShell>
      <Toaster richColors position="top-right" />
    </>
  );
}
