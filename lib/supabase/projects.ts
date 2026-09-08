import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ClientRow,
  ContactRow,
  ProjectRow,
  ProjectStatus,
  ProjectStep,
  ServiceId,
} from "@/types/database";

export type ProjectServiceDetail = {
  service_id: ServiceId;
  budget_share: number;
};

export type DashboardProjectRow = {
  id: string;
  title: string;
  status: ProjectStatus;
  current_step: ProjectStep;
  budget_share: number;
  client_name: string;
  client_company: string | null;
  client_email: string | null;
  updated_at: string;
};

export type ClientProjectRow = {
  id: string;
  title: string;
  status: ProjectStatus;
  current_step: ProjectStep;
  budget: number | null;
  deadline: string | null;
  updated_at: string;
  created_at: string;
  services: ProjectServiceDetail[];
};

export type ProjectCockpit = ProjectRow & {
  client: ClientRow;
  services: ProjectServiceDetail[];
};

export async function getProjectsByClientId(
  clientId: string
): Promise<ClientProjectRow[]> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        id,
        title,
        status,
        current_step,
        budget,
        deadline,
        updated_at,
        created_at,
        project_services (service_id, budget_share)
      `
      )
      .eq("client_id", clientId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[getProjectsByClientId]", error.message);
      return [];
    }

    type Row = {
      id: string;
      title: string;
      status: ProjectStatus;
      current_step: ProjectStep;
      budget: number | null;
      deadline: string | null;
      updated_at: string;
      created_at: string;
      project_services: ProjectServiceDetail[] | null;
    };

    return ((data ?? []) as Row[]).map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      current_step: row.current_step,
      budget: row.budget !== null ? Number(row.budget) : null,
      deadline: row.deadline,
      updated_at: row.updated_at,
      created_at: row.created_at,
      services: row.project_services ?? [],
    }));
  } catch (error) {
    console.error("[getProjectsByClientId]", error);
    return [];
  }
}

export async function getProjectCockpit(
  projectId: string
): Promise<ProjectCockpit | null> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        client:clients (*),
        project_services (service_id, budget_share)
      `
      )
      .eq("id", projectId)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error("[getProjectCockpit]", error.message);
      return null;
    }

    const { client, project_services, ...project } = data as ProjectRow & {
      client: ClientRow | null;
      project_services: ProjectServiceDetail[] | null;
    };

    if (!client) return null;

    return {
      ...project,
      client,
      services: project_services ?? [],
    };
  } catch (error) {
    console.error("[getProjectCockpit]", error);
    return null;
  }
}

export async function getProjectsByService(
  serviceId: ServiceId
): Promise<DashboardProjectRow[]> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("project_services")
      .select(
        `
        budget_share,
        project:projects (
          id,
          title,
          status,
          current_step,
          updated_at,
          client:clients (name, company, email)
        )
      `
      )
      .eq("service_id", serviceId);

    if (error) {
      console.error("[getProjectsByService]", error.message);
      return [];
    }

    type Row = {
      budget_share: number;
      project: {
        id: string;
        title: string;
        status: ProjectStatus;
        current_step: ProjectStep;
        updated_at: string;
        client: {
          name: string;
          company: string | null;
          email: string | null;
        } | null;
      } | null;
    };

    return ((data ?? []) as Row[])
      .filter((row) => row.project && row.project.client)
      .map((row) => ({
        id: row.project!.id,
        title: row.project!.title,
        status: row.project!.status,
        current_step: row.project!.current_step,
        budget_share: Number(row.budget_share ?? 0),
        client_name: row.project!.client!.name,
        client_company: row.project!.client!.company,
        client_email: row.project!.client!.email,
        updated_at: row.project!.updated_at,
      }))
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
  } catch (error) {
    console.error("[getProjectsByService]", error);
    return [];
  }
}

export async function getClientContactMessages(
  clientEmail: string | null,
  projectId: string
): Promise<ContactRow[]> {
  if (!clientEmail) return [];

  try {
    const supabase = createAdminClient();
    const normalizedEmail = clientEmail.trim().toLowerCase();

    const [byProject, byEmail] = await Promise.all([
      supabase
        .from("contact_submissions")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      supabase
        .from("contact_submissions")
        .select("*")
        .ilike("email", normalizedEmail)
        .order("created_at", { ascending: false }),
    ]);

    if (byProject.error) {
      console.error("[getClientContactMessages]", byProject.error.message);
    }
    if (byEmail.error) {
      console.error("[getClientContactMessages]", byEmail.error.message);
    }

    const combined = [...(byProject.data ?? []), ...(byEmail.data ?? [])];
    const seen = new Set<string>();

    return combined
      .filter((row) => {
        if (seen.has(row.id)) return false;
        seen.add(row.id);
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  } catch (error) {
    console.error("[getClientContactMessages]", error);
    return [];
  }
}

/** CRM lead IDs already converted into projects — hide from production inbox. */
export async function getImportedCrmLeadIds(): Promise<Set<string>> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("projects")
      .select("crm_lead_id")
      .not("crm_lead_id", "is", null);

    if (error) {
      console.error("[getImportedCrmLeadIds]", error.message);
      return new Set();
    }

    return new Set(
      (data ?? [])
        .map((row) => row.crm_lead_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    );
  } catch (error) {
    console.error("[getImportedCrmLeadIds]", error);
    return new Set();
  }
}
