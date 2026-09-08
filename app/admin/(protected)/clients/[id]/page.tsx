import { notFound } from "next/navigation";

import { ClientHubOverview } from "@/components/admin/client-hub/client-hub-overview";
import { computeFinancialBreakdown } from "@/lib/finance/calculator";
import { getAdminSession } from "@/lib/admin/session";
import { computeClientHubStats } from "@/lib/supabase/client-stats";
import { getClientById } from "@/lib/supabase/clients";
import { getClientFinanceInputs } from "@/lib/supabase/finance-stats";
import { getProjectsByClientId } from "@/lib/supabase/projects";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientHubPage({ params }: PageProps) {
  const { id } = await params;

  const session = await getAdminSession();
  if (!session) {
    notFound();
  }

  const [client, projects, financeInputs] = await Promise.all([
    getClientById(id),
    getProjectsByClientId(id),
    getClientFinanceInputs(id),
  ]);

  if (!client) {
    notFound();
  }

  const stats = computeClientHubStats(projects);
  const financeBreakdown = computeFinancialBreakdown(financeInputs);

  return (
    <ClientHubOverview
      client={client}
      projects={projects}
      stats={stats}
      trueNetCash={financeBreakdown.trueNetCash}
    />
  );
}
