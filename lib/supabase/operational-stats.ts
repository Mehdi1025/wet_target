import { getPendingInboxLeadCount } from "@/lib/crm/fetch-won-leads";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ServiceId } from "@/types/database";

export type OperationalStats = {
  activeProjects: number;
  pendingInboxLeads: number | null;
  grossRevenueHt: number;
  completionRate: number;
  completedProjects: number;
  totalProjects: number;
  uniqueClients: number;
};

function computeCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export async function getAgencyOperationalStats(): Promise<OperationalStats> {
  try {
    const supabase = createAdminClient();

    const [{ data: projects, error: projectsError }, pendingInboxLeads] =
      await Promise.all([
        supabase.from("projects").select("status, budget, client_id"),
        getPendingInboxLeadCount(),
      ]);

    if (projectsError) {
      console.error("[getAgencyOperationalStats]", projectsError.message);
    }

    const rows = projects ?? [];
    const totalProjects = rows.length;
    const completedProjects = rows.filter(
      (row) => row.status === "completed"
    ).length;
    const activeProjects = rows.filter(
      (row) => row.status !== "completed"
    ).length;
    const grossRevenueHt = rows.reduce(
      (sum, row) => sum + Number(row.budget ?? 0),
      0
    );
    const uniqueClients = new Set(
      rows.map((row) => row.client_id).filter(Boolean)
    ).size;

    return {
      activeProjects,
      pendingInboxLeads,
      grossRevenueHt,
      completionRate: computeCompletionRate(completedProjects, totalProjects),
      completedProjects,
      totalProjects,
      uniqueClients,
    };
  } catch (error) {
    console.error("[getAgencyOperationalStats]", error);
    return {
      activeProjects: 0,
      pendingInboxLeads: null,
      grossRevenueHt: 0,
      completionRate: 0,
      completedProjects: 0,
      totalProjects: 0,
      uniqueClients: 0,
    };
  }
}

export async function getServiceOperationalStats(
  serviceId: ServiceId
): Promise<OperationalStats> {
  try {
    const supabase = createAdminClient();

    const [{ data, error }, pendingInboxLeads] = await Promise.all([
      supabase
        .from("project_services")
        .select(
          `
          budget_share,
          project:projects ( id, status, budget, client_id )
        `
        )
        .eq("service_id", serviceId),
      getPendingInboxLeadCount(),
    ]);

    if (error) {
      console.error("[getServiceOperationalStats]", error.message);
      return {
        activeProjects: 0,
        pendingInboxLeads,
        grossRevenueHt: 0,
        completionRate: 0,
        completedProjects: 0,
        totalProjects: 0,
        uniqueClients: 0,
      };
    }

    type Row = {
      budget_share: number;
      project: {
        id: string;
        status: string;
        budget: number | null;
        client_id: string;
      } | null;
    };

    const rows = (data ?? []) as Row[];
    const projectMap = new Map<
      string,
      { status: string; budget_share: number; client_id: string }
    >();

    for (const row of rows) {
      if (!row.project) continue;
      projectMap.set(row.project.id, {
        status: row.project.status,
        budget_share: Number(row.budget_share ?? 0),
        client_id: row.project.client_id,
      });
    }

    const projects = [...projectMap.values()];
    const totalProjects = projects.length;
    const completedProjects = projects.filter(
      (project) => project.status === "completed"
    ).length;
    const activeProjects = projects.filter(
      (project) => project.status !== "completed"
    ).length;
    const grossRevenueHt = projects.reduce(
      (sum, project) => sum + project.budget_share,
      0
    );
    const uniqueClients = new Set(projects.map((project) => project.client_id))
      .size;

    return {
      activeProjects,
      pendingInboxLeads,
      grossRevenueHt,
      completionRate: computeCompletionRate(completedProjects, totalProjects),
      completedProjects,
      totalProjects,
      uniqueClients,
    };
  } catch (error) {
    console.error("[getServiceOperationalStats]", error);
    return {
      activeProjects: 0,
      pendingInboxLeads: null,
      grossRevenueHt: 0,
      completionRate: 0,
      completedProjects: 0,
      totalProjects: 0,
      uniqueClients: 0,
    };
  }
}
