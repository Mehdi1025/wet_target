import { AgencyOverview } from "@/components/admin/agency-overview";
import { getContactStats } from "@/lib/supabase/contacts";
import { getSupabaseHealth } from "@/lib/supabase/health";

export default async function AdminIndexPage() {
  const [health, contactStats] = await Promise.all([
    getSupabaseHealth(),
    getContactStats(),
  ]);

  return (
    <AgencyOverview
      contactStats={contactStats}
      supabaseConnected={health.connected}
    />
  );
}
