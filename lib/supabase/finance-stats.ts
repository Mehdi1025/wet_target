import { createAdminClient } from "@/lib/supabase/admin";
import type { ServiceId } from "@/types/database";

export type FinanceInputs = {
  caHt: number;
  externalCosts: number;
};

export async function getAgencyFinanceInputs(): Promise<FinanceInputs> {
  try {
    const supabase = createAdminClient();

    const [{ data: projects, error: projectsError }, { data: costs, error: costsError }] =
      await Promise.all([
        supabase.from("projects").select("budget"),
        supabase.from("project_external_costs").select("cost_amount"),
      ]);

    if (projectsError) {
      console.error("[getAgencyFinanceInputs] projects", projectsError.message);
    }
    if (costsError) {
      console.error("[getAgencyFinanceInputs] costs", costsError.message);
    }

    const caHt = (projects ?? []).reduce(
      (sum, row) => sum + Number(row.budget ?? 0),
      0
    );
    const externalCosts = (costs ?? []).reduce(
      (sum, row) => sum + Number(row.cost_amount ?? 0),
      0
    );

    return { caHt, externalCosts };
  } catch (error) {
    console.error("[getAgencyFinanceInputs]", error);
    return { caHt: 0, externalCosts: 0 };
  }
}

export async function getServiceFinanceInputs(
  serviceId: ServiceId
): Promise<FinanceInputs> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("project_services")
      .select(
        `
        budget_share,
        project:projects ( id, budget )
      `
      )
      .eq("service_id", serviceId);

    if (error) {
      console.error("[getServiceFinanceInputs]", error.message);
      return { caHt: 0, externalCosts: 0 };
    }

    type Row = {
      budget_share: number;
      project: { id: string; budget: number | null } | null;
    };

    const rows = (data ?? []) as Row[];
    const projectIds = [
      ...new Set(
        rows
          .map((row) => row.project?.id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const externalByProject = new Map<string, number>();

    if (projectIds.length > 0) {
      const { data: costRows, error: costsError } = await supabase
        .from("project_external_costs")
        .select("project_id, cost_amount")
        .in("project_id", projectIds);

      if (costsError) {
        console.error("[getServiceFinanceInputs] costs", costsError.message);
      } else {
        for (const row of costRows ?? []) {
          const current = externalByProject.get(row.project_id) ?? 0;
          externalByProject.set(
            row.project_id,
            current + Number(row.cost_amount ?? 0)
          );
        }
      }
    }

    let caHt = 0;
    let externalCosts = 0;

    for (const row of rows) {
      if (!row.project) continue;

      const budgetShare = Number(row.budget_share ?? 0);
      caHt += budgetShare;

      const projectBudget = Number(row.project.budget ?? 0);
      const projectExternal = externalByProject.get(row.project.id) ?? 0;

      if (projectBudget > 0 && projectExternal > 0) {
        externalCosts += projectExternal * (budgetShare / projectBudget);
      }
    }

    return { caHt, externalCosts };
  } catch (error) {
    console.error("[getServiceFinanceInputs]", error);
    return { caHt: 0, externalCosts: 0 };
  }
}

export async function getClientFinanceInputs(
  clientId: string
): Promise<FinanceInputs> {
  try {
    const supabase = createAdminClient();

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, budget")
      .eq("client_id", clientId);

    if (projectsError) {
      console.error("[getClientFinanceInputs] projects", projectsError.message);
      return { caHt: 0, externalCosts: 0 };
    }

    const projectRows = projects ?? [];
    const projectIds = projectRows.map((row) => row.id);

    const caHt = projectRows.reduce(
      (sum, row) => sum + Number(row.budget ?? 0),
      0
    );

    if (projectIds.length === 0) {
      return { caHt, externalCosts: 0 };
    }

    const { data: costs, error: costsError } = await supabase
      .from("project_external_costs")
      .select("cost_amount")
      .in("project_id", projectIds);

    if (costsError) {
      console.error("[getClientFinanceInputs] costs", costsError.message);
      return { caHt, externalCosts: 0 };
    }

    const externalCosts = (costs ?? []).reduce(
      (sum, row) => sum + Number(row.cost_amount ?? 0),
      0
    );

    return { caHt, externalCosts };
  } catch (error) {
    console.error("[getClientFinanceInputs]", error);
    return { caHt: 0, externalCosts: 0 };
  }
}
