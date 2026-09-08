"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/admin/session";
import {
  isExternalCostStatus,
  isExternalCostType,
} from "@/lib/admin/external-cost-constants";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExternalCostRow } from "@/lib/supabase/external-costs";
import type { ExternalCostStatus, ExternalCostType } from "@/types/database";

export type FreelanceMutationResult =
  | { success: true; cost?: ExternalCostRow }
  | { success: false; error: string };

function projectCockpitPath(projectId: string) {
  return `/admin/projects/${projectId}`;
}

async function requireAdminSession(): Promise<FreelanceMutationResult | null> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Session admin requise." };
  }
  return null;
}

function parseCostAmount(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().replace(",", ".");
  if (!normalized) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
}

export async function addExternalCost(
  projectId: string,
  formData: FormData
): Promise<FreelanceMutationResult> {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const costTypeRaw = String(formData.get("cost_type") ?? "contractor");
  const costType: ExternalCostType = isExternalCostType(costTypeRaw)
    ? costTypeRaw
    : "contractor";
  const freelanceName = String(formData.get("freelance_name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const costAmount = parseCostAmount(formData.get("cost_amount"));

  if (costType === "contractor" && freelanceName.length < 2) {
    return { success: false, error: "Indiquez le nom du prestataire." };
  }
  if (role.length < 2) {
    return {
      success: false,
      error:
        costType === "contractor"
          ? "Indiquez le rôle ou la mission."
          : "Indiquez la nature de la charge (ex. hébergement).",
    };
  }
  if (costAmount === null) {
    return { success: false, error: "Montant invalide." };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("project_external_costs")
      .insert({
        project_id: projectId,
        cost_type: costType,
        freelance_name: costType === "contractor" ? freelanceName : null,
        role,
        cost_amount: costAmount,
        status: "pending",
      })
      .select("*")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Impossible d'ajouter le coût.",
      };
    }

    revalidatePath(projectCockpitPath(projectId));

    return {
      success: true,
      cost: {
        ...data,
        cost_amount: Number(data.cost_amount),
      } as ExternalCostRow,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

export async function deleteExternalCost(
  costId: string,
  projectId: string
): Promise<FreelanceMutationResult> {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("project_external_costs")
      .delete()
      .eq("id", costId)
      .eq("project_id", projectId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(projectCockpitPath(projectId));
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

export async function updateExternalCostStatus(
  costId: string,
  projectId: string,
  status: ExternalCostStatus
): Promise<FreelanceMutationResult> {
  const authError = await requireAdminSession();
  if (authError) return authError;

  if (!isExternalCostStatus(status)) {
    return { success: false, error: "Statut invalide." };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("project_external_costs")
      .update({ status })
      .eq("id", costId)
      .eq("project_id", projectId)
      .select("*")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Impossible de mettre à jour le statut.",
      };
    }

    revalidatePath(projectCockpitPath(projectId));

    return {
      success: true,
      cost: {
        ...data,
        cost_type: data.cost_type ?? "contractor",
        cost_amount: Number(data.cost_amount),
      } as ExternalCostRow,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}
