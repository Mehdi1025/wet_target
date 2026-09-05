import { notFound } from "next/navigation";

import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { AGENCY_DASHBOARDS, getDashboardById } from "@/lib/admin/dashboards";
import { getRecentContacts } from "@/lib/supabase/contacts";
import { getSupabaseHealth } from "@/lib/supabase/health";

type PageProps = {
  params: Promise<{ dashboardId: string }>;
};

export default async function DashboardPage({ params }: PageProps) {
  const { dashboardId } = await params;
  const dashboard = getDashboardById(dashboardId);

  if (!dashboard) {
    notFound();
  }

  const [health, contacts] = await Promise.all([
    getSupabaseHealth(),
    getRecentContacts(8),
  ]);

  return (
    <DashboardOverview
      dashboard={dashboard}
      contactCount={health.contactCount}
      contacts={contacts}
      supabaseConnected={health.connected}
    />
  );
}

export function generateStaticParams() {
  return AGENCY_DASHBOARDS.map((d) => ({ dashboardId: d.id }));
}
