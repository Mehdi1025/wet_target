import type { ClientProjectRow } from "@/lib/supabase/projects";

export type ClientHubStats = {
  ltv: number;
  activeProjects: number;
  completedProjects: number;
  totalProjects: number;
};

export function computeClientHubStats(
  projects: ClientProjectRow[]
): ClientHubStats {
  const ltv = projects.reduce(
    (sum, project) => sum + Number(project.budget ?? 0),
    0
  );
  const completedProjects = projects.filter(
    (project) => project.status === "completed"
  ).length;
  const activeProjects = projects.length - completedProjects;

  return {
    ltv,
    activeProjects,
    completedProjects,
    totalProjects: projects.length,
  };
}
