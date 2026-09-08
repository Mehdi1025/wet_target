import type { ServiceId } from "@/types/database";
import { AGENCY_DASHBOARDS } from "@/lib/admin/dashboards";

export const SERVICE_IDS = AGENCY_DASHBOARDS.map((d) => d.id) as ServiceId[];

export function isServiceId(value: string): value is ServiceId {
  return SERVICE_IDS.includes(value as ServiceId);
}

export const PROJECT_STATUS_LABELS: Record<
  import("@/types/database").ProjectStatus,
  string
> = {
  pending: "En attente",
  active: "En cours",
  review: "En revue",
  completed: "Terminé",
};

export const PROJECT_STEP_LABELS: Record<
  import("@/types/database").ProjectStep,
  string
> = {
  discovery: "Découverte",
  strategy: "Stratégie",
  creation: "Création",
  launch: "Lancement",
};

export const PROJECT_STEPS: import("@/types/database").ProjectStep[] = [
  "discovery",
  "strategy",
  "creation",
  "launch",
];

export const SERVICE_CLASSIFICATION_OPTIONS: {
  id: ServiceId;
  label: string;
}[] = [
  { id: "branding", label: "Branding & Identité" },
  { id: "sites-web", label: "Sites Web" },
  { id: "reseaux-sociaux", label: "Réseaux Sociaux" },
  { id: "publicite", label: "Acquisition & Publicité" },
  { id: "automatisation", label: "Automatisation & IA" },
];
export function getNextStep(
  step: import("@/types/database").ProjectStep
): import("@/types/database").ProjectStep | null {
  const index = PROJECT_STEPS.indexOf(step);
  if (index === -1 || index === PROJECT_STEPS.length - 1) return null;
  return PROJECT_STEPS[index + 1];
}

export function getProjectStatusVariant(
  status: import("@/types/database").ProjectStatus
): "success" | "processing" | "secondary" | "outline" {
  const map = {
    pending: "processing" as const,
    active: "success" as const,
    review: "secondary" as const,
    completed: "outline" as const,
  };
  return map[status];
}

export function getServiceLabel(serviceId: ServiceId): string {
  return (
    SERVICE_CLASSIFICATION_OPTIONS.find((option) => option.id === serviceId)
      ?.label ?? serviceId
  );
}
