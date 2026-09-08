import { createAdminClient } from "@/lib/supabase/admin";
import type { ExternalCostStatus, ExternalCostType } from "@/types/database";

export type ExternalCostRow = {
  id: string;
  project_id: string;
  cost_type: ExternalCostType;
  freelance_name: string | null;
  role: string;
  cost_amount: number;
  status: ExternalCostStatus;
  created_at: string;
};

export async function getProjectExternalCosts(
  projectId: string
): Promise<ExternalCostRow[]> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("project_external_costs")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[getProjectExternalCosts]", error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      ...row,
      cost_type: row.cost_type ?? "contractor",
      cost_amount: Number(row.cost_amount),
    })) as ExternalCostRow[];
  } catch (error) {
    console.error("[getProjectExternalCosts]", error);
    return [];
  }
}

export function sumExternalCosts(costs: ExternalCostRow[]): number {
  return costs.reduce((sum, cost) => sum + cost.cost_amount, 0);
}
