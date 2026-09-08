"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Calendar, Plus, User } from "lucide-react";

import { TaskFormDialog } from "@/components/admin/tasks/task-form-dialog";
import {
  getTaskPriorityVariant,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/admin/task-constants";
import { PROJECT_STEP_LABELS } from "@/lib/admin/project-constants";
import {
  isTaskOverdue,
  type ProjectTaskRow,
  type TaskPickerProject,
} from "@/lib/supabase/project-tasks";
import type { ProjectStep } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TasksBlockProps = {
  projectId: string;
  projectTitle: string;
  currentStep: ProjectStep;
  tasks: ProjectTaskRow[];
  projects: TaskPickerProject[];
  currentUsername: string;
};

function formatDueDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function TasksBlock({
  projectId,
  projectTitle,
  currentStep,
  tasks,
  projects,
  currentUsername,
}: TasksBlockProps) {
  const [formOpen, setFormOpen] = useState(false);
  const openTasks = tasks.filter((task) => task.status !== "done");

  return (
    <>
      <Card className="shadow-sm md:col-span-2">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Tâches ouvertes</CardTitle>
            <CardDescription>
              {openTasks.length} tâche(s) en cours sur {projectTitle}
            </CardDescription>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="outline" className="gap-2" asChild>
              <Link href="/admin/tasks">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Tâche
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {openTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucune tâche ouverte — créez-en une pour piloter la production.
            </p>
          ) : (
            <div className="divide-y rounded-lg border">
              {openTasks.slice(0, 8).map((task) => {
                const overdue = isTaskOverdue(task);
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                      overdue && "bg-amber-500/5"
                    )}
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          {TASK_STATUS_LABELS[task.status]}
                        </Badge>
                        <Badge
                          variant={getTaskPriorityVariant(task.priority)}
                          className="text-[10px]"
                        >
                          {TASK_PRIORITY_LABELS[task.priority]}
                        </Badge>
                        {task.step ? (
                          <span>{PROJECT_STEP_LABELS[task.step]}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {task.assignee ? (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {task.assignee.split(" ")[0]}
                        </span>
                      ) : null}
                      {task.due_date ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 tabular-nums",
                            overdue && "font-medium text-amber-600 dark:text-amber-400"
                          )}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDueDate(task.due_date)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        projects={projects}
        currentUsername={currentUsername}
        defaultProjectId={projectId}
        defaultStep={currentStep}
      />
    </>
  );
}
