import { createAdminClient } from "@/lib/supabase/admin";
import type { ServiceId } from "@/types/database";

export async function getServiceBudgetTotal(
  serviceId: ServiceId
): Promise<number | null> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("project_services")
      .select("budget_share")
      .eq("service_id", serviceId);

    if (error) {
      console.error("[getServiceBudgetTotal]", error.message);
      return null;
    }

    return (data ?? []).reduce(
      (sum, row) => sum + Number(row.budget_share ?? 0),
      0
    );
  } catch (error) {
    console.error("[getServiceBudgetTotal]", error);
    return null;
  }
}

export async function getServiceProjectCount(
  serviceId: ServiceId
): Promise<number | null> {
  try {
    const supabase = createAdminClient();

    const { count, error } = await supabase
      .from("project_services")
      .select("*", { count: "exact", head: true })
      .eq("service_id", serviceId);

    if (error) {
      console.error("[getServiceProjectCount]", error.message);
      return null;
    }

    return count ?? 0;
  } catch (error) {
    console.error("[getServiceProjectCount]", error);
    return null;
  }
}
