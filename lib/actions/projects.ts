"use server";

import {
  BUDGET_TOLERANCE,
  type ServiceBudgetAllocation,
} from "@/lib/admin/budget-allocation";
import { getAdminSession } from "@/lib/admin/session";
import { isServiceId } from "@/lib/admin/project-constants";
import { getNextStep } from "@/lib/admin/project-constants";
import type { CrmWonLead } from "@/lib/crm/types";
import {
  manualProjectSchema,
  type ManualProjectInput,
} from "@/lib/schemas/manual-project";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ServiceId } from "@/types/database";
import type { ProjectStep } from "@/types/database";

export type ProjectMutationResult =
  | { success: true }
  | { success: false; error: string };

export type CreateProjectFromCrmResult =
  | { success: true; projectId: string }
  | { success: false; error: string };

export type CreateManualProjectResult =
  | { success: true; projectId: string }
  | { success: false; error: string };

export type { ServiceBudgetAllocation };

function validateServiceBudgetAllocations(
  totalBudget: number,
  allocations: ServiceBudgetAllocation[]
): string | null {
  if (allocations.length === 0) {
    return "Sélectionnez au moins un pôle d'activité.";
  }

  const services = allocations.map((entry) => entry.serviceId);
  if (services.some((serviceId) => !isServiceId(serviceId))) {
    return "Pôle d'activité invalide.";
  }

  if (new Set(services).size !== services.length) {
    return "Chaque pôle ne peut être sélectionné qu'une seule fois.";
  }

  const allocatedTotal = allocations.reduce(
    (sum, entry) => sum + entry.budgetShare,
    0
  );

  if (Math.abs(allocatedTotal - totalBudget) > BUDGET_TOLERANCE) {
    return "La ventilation doit être égale au budget total du projet.";
  }

  if (allocations.some((entry) => entry.budgetShare < 0)) {
    return "Les parts de budget ne peuvent pas être négatives.";
  }

  return null;
}

async function upsertClientByEmail(input: {
  email: string;
  name: string;
  company: string;
}): Promise<{ clientId: string } | { error: string }> {
  const supabase = createAdminClient();
  const normalizedEmail = input.email.trim().toLowerCase();

  const { data: upsertedClient, error: upsertError } = await supabase
    .from("clients")
    .upsert(
      {
        name: input.name.trim(),
        company: input.company.trim(),
        email: normalizedEmail,
      },
      { onConflict: "email", ignoreDuplicates: false }
    )
    .select("id")
    .maybeSingle();

  if (!upsertError && upsertedClient) {
    return { clientId: upsertedClient.id };
  }

  const { data: existingClient } = await supabase
    .from("clients")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingClient) {
    const { error: updateError } = await supabase
      .from("clients")
      .update({
        name: input.name.trim(),
        company: input.company.trim(),
      })
      .eq("id", existingClient.id);

    if (updateError) {
      return { error: updateError.message };
    }

    return { clientId: existingClient.id };
  }

  const { data: newClient, error: clientError } = await supabase
    .from("clients")
    .insert({
      name: input.name.trim(),
      company: input.company.trim(),
      email: normalizedEmail,
    })
    .select("id")
    .single();

  if (clientError || !newClient) {
    return {
      error: clientError?.message ?? "Impossible de créer le client.",
    };
  }

  return { clientId: newClient.id };
}

async function attachProjectServices(
  projectId: string,
  allocations: ServiceBudgetAllocation[]
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const serviceRows = allocations.map(({ serviceId, budgetShare }) => ({
    project_id: projectId,
    service_id: serviceId,
    budget_share: budgetShare,
  }));

  const { error: servicesError } = await supabase
    .from("project_services")
    .insert(serviceRows);

  if (servicesError) {
    await supabase.from("projects").delete().eq("id", projectId);
    return {
      error: servicesError.message ?? "Impossible d'associer les services.",
    };
  }

  return {};
}

function clientDisplayName(lead: CrmWonLead): string {
  const parts = [lead.prenom, lead.nom].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : lead.entreprise;
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function createProjectFromCrmLead(
  lead: CrmWonLead,
  allocations: ServiceBudgetAllocation[]
): Promise<CreateProjectFromCrmResult> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Session admin requise." };
  }

  const validationError = validateServiceBudgetAllocations(
    lead.deal_amount,
    allocations
  );
  if (validationError) {
    return { success: false, error: validationError };
  }

  if (!isValidUuid(lead.id)) {
    return {
      success: false,
      error: "Identifiant CRM invalide (UUID attendu).",
    };
  }

  try {
    const supabase = createAdminClient();

    const { data: existingProject } = await supabase
      .from("projects")
      .select("id")
      .eq("crm_lead_id", lead.id)
      .maybeSingle();

    if (existingProject) {
      return {
        success: false,
        error: "Un projet existe déjà pour ce deal CRM.",
      };
    }

    const normalizedEmail = lead.email.trim().toLowerCase();
    const clientResult = await upsertClientByEmail({
      email: normalizedEmail,
      name: clientDisplayName(lead),
      company: lead.entreprise,
    });

    if ("error" in clientResult) {
      return { success: false, error: clientResult.error };
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        title: lead.entreprise,
        description: lead.notes,
        client_id: clientResult.clientId,
        status: "pending",
        budget: lead.deal_amount,
        crm_lead_id: lead.id,
      })
      .select("id")
      .single();

    if (projectError || !project) {
      return {
        success: false,
        error: projectError?.message ?? "Impossible de créer le projet.",
      };
    }

    const servicesResult = await attachProjectServices(project.id, allocations);
    if (servicesResult.error) {
      return { success: false, error: servicesResult.error };
    }

    return { success: true, projectId: project.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

export async function createManualProject(
  data: ManualProjectInput
): Promise<CreateManualProjectResult> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Session admin requise." };
  }

  const parsed = manualProjectSchema.safeParse(data);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message;
    return {
      success: false,
      error: firstIssue ?? "Données du formulaire invalides.",
    };
  }

  const input = parsed.data;
  const budget = input.budget;
  const allocations: ServiceBudgetAllocation[] = input.serviceBudgets.filter(
    (entry) => input.selectedServices.includes(entry.serviceId)
  );

  const validationError = validateServiceBudgetAllocations(
    budget,
    allocations
  );
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const supabase = createAdminClient();
    let clientId = input.clientId ?? null;

    if (clientId) {
      const { data: existingClient, error: clientLookupError } = await supabase
        .from("clients")
        .select("id")
        .eq("id", clientId)
        .maybeSingle();

      if (clientLookupError || !existingClient) {
        return { success: false, error: "Client sélectionné introuvable." };
      }
    } else {
      const clientResult = await upsertClientByEmail({
        email: input.clientEmail!.trim().toLowerCase(),
        name: input.clientName!,
        company: input.clientCompany!,
      });

      if ("error" in clientResult) {
        return { success: false, error: clientResult.error };
      }

      clientId = clientResult.clientId;
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        title: input.title,
        description: input.description?.trim() || null,
        client_id: clientId,
        status: "pending",
        current_step: "discovery",
        budget,
        allocated_days: input.allocatedDays ?? 0,
        deadline: input.deadline?.trim() || null,
        crm_lead_id: null,
      })
      .select("id")
      .single();

    if (projectError || !project) {
      return {
        success: false,
        error: projectError?.message ?? "Impossible de créer le projet.",
      };
    }

    const servicesResult = await attachProjectServices(project.id, allocations);
    if (servicesResult.error) {
      return { success: false, error: servicesResult.error };
    }

    return { success: true, projectId: project.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

function normalizeOptionalUrl(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function requireAdminSession(): Promise<ProjectMutationResult | null> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Session admin requise." };
  }
  return null;
}

export async function updateProjectAssets(
  projectId: string,
  assets: {
    figma_url: string;
    drive_url: string;
    staging_url: string;
  }
): Promise<ProjectMutationResult> {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("projects")
      .update({
        figma_url: normalizeOptionalUrl(assets.figma_url),
        drive_url: normalizeOptionalUrl(assets.drive_url),
        staging_url: normalizeOptionalUrl(assets.staging_url),
      })
      .eq("id", projectId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

export async function advanceProjectStep(
  projectId: string
): Promise<ProjectMutationResult> {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();

    const { data: project, error: fetchError } = await supabase
      .from("projects")
      .select("current_step")
      .eq("id", projectId)
      .maybeSingle();

    if (fetchError || !project) {
      return { success: false, error: "Projet introuvable." };
    }

    const nextStep = getNextStep(project.current_step as ProjectStep);
    if (!nextStep) {
      return { success: false, error: "Le projet est déjà à la dernière étape." };
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({ current_step: nextStep })
      .eq("id", projectId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}
