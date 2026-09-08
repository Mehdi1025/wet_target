import { AgencyOverview } from "@/components/admin/agency-overview";
import { computeFinancialBreakdown } from "@/lib/finance/calculator";
import { getArsenalDrawers, getArsenalPreviewLinks } from "@/lib/supabase/arsenal";
import { getAgencyFinanceInputs } from "@/lib/supabase/finance-stats";
import { getAgencyOperationalStats } from "@/lib/supabase/operational-stats";

export default async function AdminIndexPage() {
  const [financeInputs, operationalStats, arsenalDrawers] = await Promise.all([
    getAgencyFinanceInputs(),
    getAgencyOperationalStats(),
    getArsenalDrawers(),
  ]);

  const financeBreakdown = computeFinancialBreakdown(financeInputs);
  const arsenalPreviewLinks = getArsenalPreviewLinks(arsenalDrawers);

  return (
    <AgencyOverview
      operationalStats={operationalStats}
      financeBreakdown={financeBreakdown}
      arsenalDrawers={arsenalDrawers}
      arsenalPreviewLinks={arsenalPreviewLinks}
    />
  );
}
