import type { ExternalCostStatus, ExternalCostType } from "@/types/database";

export const EXTERNAL_COST_TYPE_LABELS: Record<ExternalCostType, string> = {
  contractor: "Prestataire",
  project_charge: "Charge projet",
};

export function getExternalCostDisplayTitle(input: {
  cost_type: ExternalCostType;
  freelance_name: string | null;
  role: string;
}): string {
  if (input.cost_type === "contractor" && input.freelance_name) {
    return input.freelance_name;
  }
  return input.role;
}

export function getExternalCostSubtitle(input: {
  cost_type: ExternalCostType;
  freelance_name: string | null;
  role: string;
}): string | null {
  if (input.cost_type === "contractor") {
    return input.role;
  }
  return null;
}

export function isExternalCostType(value: string): value is ExternalCostType {
  return value === "contractor" || value === "project_charge";
}

export const EXTERNAL_COST_STATUS_LABELS: Record<ExternalCostStatus, string> =
  {
    pending: "En attente",
    paid: "Payé",
  };

export function isExternalCostStatus(
  value: string
): value is ExternalCostStatus {
  return value === "pending" || value === "paid";
}

export function getNextExternalCostStatus(
  current: ExternalCostStatus
): ExternalCostStatus {
  return current === "paid" ? "pending" : "paid";
}
