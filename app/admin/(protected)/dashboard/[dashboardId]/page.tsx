import { notFound } from "next/navigation";

import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { AGENCY_DASHBOARDS, getDashboardById } from "@/lib/admin/dashboards";
import { computeFinancialBreakdown } from "@/lib/finance/calculator";
import { getServiceFinanceInputs } from "@/lib/supabase/finance-stats";
import { getServiceOperationalStats } from "@/lib/supabase/operational-stats";
import { getProjectsByService } from "@/lib/supabase/projects";
import type { ServiceId } from "@/types/database";

type PageProps = {
  params: Promise<{ dashboardId: string }>;
};

export default async function DashboardPage({ params }: PageProps) {
  const { dashboardId } = await params;
  const dashboard = getDashboardById(dashboardId);

  if (!dashboard) {
    notFound();
  }

  const serviceId = dashboardId as ServiceId;

  const [financeInputs, operationalStats, projects] = await Promise.all([
    getServiceFinanceInputs(serviceId),
    getServiceOperationalStats(serviceId),
    getProjectsByService(serviceId),
  ]);

  const financeBreakdown = computeFinancialBreakdown(financeInputs);

  return (
    <DashboardOverview
      dashboard={dashboard}
      projects={projects}
      financeBreakdown={financeBreakdown}
      operationalStats={operationalStats}
    />
  );
}

export function generateStaticParams() {
  return AGENCY_DASHBOARDS.map((d) => ({ dashboardId: d.id }));
}
