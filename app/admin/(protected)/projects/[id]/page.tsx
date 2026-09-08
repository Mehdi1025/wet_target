import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Mail } from "lucide-react";

import {
  getProjectStatusVariant,
  getServiceLabel,
  PROJECT_STATUS_LABELS,
} from "@/lib/admin/project-constants";
import { formatCurrency } from "@/lib/admin/budget-allocation";
import { getDashboardPath } from "@/lib/admin/dashboards";
import { getAdminSession } from "@/lib/admin/session";
import {
  getClientContactMessages,
  getProjectCockpit,
} from "@/lib/supabase/projects";
import {
  getProjectExternalCosts,
  sumExternalCosts,
} from "@/lib/supabase/external-costs";
import {
  getProjectTasks,
  getProjectsForTaskPicker,
} from "@/lib/supabase/project-tasks";
import { getActiveTimeLogs } from "@/lib/supabase/time-logs";
import { FreelancesBlock } from "@/components/admin/project-cockpit/freelances-block";
import { JournalBlock } from "@/components/admin/project-cockpit/journal-block";
import { ProfitabilityBlock } from "@/components/admin/project-cockpit/profitability-block";
import { ScopeAssetsBlock } from "@/components/admin/project-cockpit/scope-assets-block";
import { TasksBlock } from "@/components/admin/project-cockpit/tasks-block";
import { WorkflowBlock } from "@/components/admin/project-cockpit/workflow-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectCockpitPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getProjectCockpit(id);

  if (!project) {
    notFound();
  }

  const session = await getAdminSession();
  if (!session) {
    notFound();
  }

  const messages = await getClientContactMessages(
    project.client.email,
    project.id
  );

  const [activeLogs, externalCosts, projectTasks, taskProjects] =
    await Promise.all([
      getActiveTimeLogs(project.id),
      getProjectExternalCosts(project.id),
      getProjectTasks(project.id),
      getProjectsForTaskPicker(),
    ]);
  const completedSeconds = Number(project.spent_seconds ?? 0);
  const totalExternalCosts = sumExternalCosts(externalCosts);

  const backHref =
    project.services.length > 0
      ? getDashboardPath(project.services[0].service_id)
      : "/admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit px-0" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au dashboard
          </Link>
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {project.title}
              </h1>
              <Badge variant={getProjectStatusVariant(project.status)}>
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <Link
                href={`/admin/clients/${project.client.id}`}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Building2 className="h-4 w-4" />
                {project.client.company ?? project.client.name}
              </Link>
              {project.client.email ? (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {project.client.email}
                </span>
              ) : null}
            </div>
            {project.services.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {project.services.map((service) => (
                  <Badge key={service.service_id} variant="outline">
                    {getServiceLabel(service.service_id)} ·{" "}
                    {formatCurrency(Number(service.budget_share))}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border bg-muted/30 px-4 py-3 text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Fiche Projet 360
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {project.budget !== null
                ? formatCurrency(Number(project.budget))
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ScopeAssetsBlock
          projectId={project.id}
          description={project.description}
          figmaUrl={project.figma_url}
          driveUrl={project.drive_url}
          stagingUrl={project.staging_url}
        />

        <WorkflowBlock
          projectId={project.id}
          currentStep={project.current_step}
        />

        <ProfitabilityBlock
          projectId={project.id}
          budget={project.budget}
          allocatedDays={project.allocated_days}
          completedSeconds={completedSeconds}
          activeLogs={activeLogs}
          currentUsername={session.username}
          totalExternalCosts={totalExternalCosts}
        />

        <FreelancesBlock
          projectId={project.id}
          costs={externalCosts}
          totalExternalCosts={totalExternalCosts}
        />

        <JournalBlock messages={messages} />

        <TasksBlock
          projectId={project.id}
          projectTitle={project.title}
          currentStep={project.current_step}
          tasks={projectTasks}
          projects={taskProjects}
          currentUsername={session.username}
        />
      </div>
    </div>
  );
}
