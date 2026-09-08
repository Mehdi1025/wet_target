import { ArsenalPageClient } from "@/components/admin/arsenal/arsenal-page-client";
import { getArsenalDrawers } from "@/lib/supabase/arsenal";

export default async function ArsenalPage() {
  const drawers = await getArsenalDrawers();

  return <ArsenalPageClient initialDrawers={drawers} />;
}
