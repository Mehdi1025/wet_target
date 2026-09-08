"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, FolderKanban } from "lucide-react";

import {
  getProjectStatusVariant,
  getServiceLabel,
  PROJECT_STATUS_LABELS,
  PROJECT_STEP_LABELS,
  PROJECT_STEPS,
} from "@/lib/admin/project-constants";
import { formatCurrency } from "@/lib/admin/budget-allocation";
import type { ClientProjectRow } from "@/lib/supabase/projects";
import type { ProjectStatus, ProjectStep } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ClientProjectsGridProps = {
  projects: ClientProjectRow[];
  emptyTitle: string;
  emptyDescription: string;
};

function getProjectProgress(
  status: ProjectStatus,
  step: ProjectStep
): number {
  if (status === "completed") return 100;
  const index = PROJECT_STEPS.indexOf(step);
  if (index === -1) return 0;
  return Math.round(((index + 1) / PROJECT_STEPS.length) * 100);
}

export function ClientProjectsGrid({
  projects,
  emptyTitle,
  emptyDescription,
}: ClientProjectsGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <FolderKanban className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium">{emptyTitle}</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => {
        const progress = getProjectProgress(project.status, project.current_step);

        return (
          <Link
            key={project.id}
            href={`/admin/projects/${project.id}`}
            className="group block"
          >
            <Card className="h-full shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/20">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="truncate text-base group-hover:text-primary">
                      {project.title}
                    </CardTitle>
                    <CardDescription>
                      MAJ{" "}
                      {new Date(project.updated_at).toLocaleDateString("fr-FR")}
                    </CardDescription>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getProjectStatusVariant(project.status)}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {PROJECT_STEP_LABELS[project.current_step]}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium tabular-nums">{progress} %</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold tabular-nums">
                    {project.budget !== null
                      ? formatCurrency(project.budget)
                      : "—"}
                  </span>
                  {project.deadline ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(project.deadline).toLocaleDateString("fr-FR")}
                    </span>
                  ) : null}
                </div>

                {project.services.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {project.services.map((service) => (
                      <Badge
                        key={service.service_id}
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {getServiceLabel(service.service_id)}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
