"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";
import { toast } from "sonner";

import { deleteProjectTask } from "@/lib/actions/project-tasks";
import { PROJECT_STEP_LABELS } from "@/lib/admin/project-constants";
import {
  getTaskPriorityVariant,
  isTaskAssignedToUser,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/admin/task-constants";
import {
  isTaskDueThisWeek,
  isTaskOverdue,
  type ProjectTaskWithProject,
} from "@/lib/supabase/project-tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type TaskListFilter =
  | "all"
  | "mine"
  | "project"
  | "overdue"
  | "this_week";

type TasksListProps = {
  tasks: ProjectTaskWithProject[];
  currentUsername: string;
  onEditTask: (task: ProjectTaskWithProject) => void;
};

const FILTER_OPTIONS: { id: TaskListFilter; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "mine", label: "Mes tâches" },
  { id: "project", label: "Par projet" },
  { id: "overdue", label: "En retard" },
  { id: "this_week", label: "Cette semaine" },
];

function formatDueDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function TasksList({
  tasks,
  currentUsername,
  onEditTask,
}: TasksListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<TaskListFilter>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const task of tasks) {
      map.set(task.project_id, task.project_title);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "fr")
    );
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    switch (filter) {
      case "mine":
        result = result.filter((task) =>
          isTaskAssignedToUser(task.assignee, currentUsername)
        );
        break;
      case "overdue":
        result = result.filter((task) => isTaskOverdue(task));
        break;
      case "this_week":
        result = result.filter((task) => isTaskDueThisWeek(task));
        break;
      case "project":
        if (projectFilter !== "all") {
          result = result.filter((task) => task.project_id === projectFilter);
        }
        break;
      default:
        break;
    }

    return result;
  }, [tasks, filter, projectFilter, currentUsername]);

  const groupedByProject = useMemo(() => {
    if (filter !== "project") return null;

    const groups = new Map<string, ProjectTaskWithProject[]>();
    for (const task of filteredTasks) {
      const list = groups.get(task.project_id) ?? [];
      list.push(task);
      groups.set(task.project_id, list);
    }

    return Array.from(groups.entries()).map(([projectId, projectTasks]) => ({
      projectId,
      projectTitle: projectTasks[0]?.project_title ?? "Projet",
      tasks: projectTasks,
    }));
  }, [filter, filteredTasks]);

  function handleDelete(taskId: string) {
    startTransition(async () => {
      const result = await deleteProjectTask(taskId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Tâche supprimée");
      router.refresh();
    });
  }

  function renderTaskRow(task: ProjectTaskWithProject) {
    const overdue = isTaskOverdue(task);

    return (
      <div
        key={task.id}
        className={cn(
          "grid grid-cols-1 gap-3 border-b px-4 py-3 last:border-b-0 md:grid-cols-[1fr_160px_120px_100px_120px_40px] md:items-center",
          overdue && task.status !== "done" && "bg-amber-500/5"
        )}
      >
        <div className="min-w-0 space-y-1">
          <p className="font-medium">{task.title}</p>
          <Link
            href={`/admin/projects/${task.project_id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {task.project_title}
          </Link>
        </div>

        <div className="text-sm">
          <Badge variant="outline">{TASK_STATUS_LABELS[task.status]}</Badge>
        </div>

        <div>
          <Badge variant={getTaskPriorityVariant(task.priority)}>
            {TASK_PRIORITY_LABELS[task.priority]}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground">
          {task.assignee ? (
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {task.assignee.split(" ")[0]}
            </span>
          ) : (
            "—"
          )}
        </div>

        <div
          className={cn(
            "text-sm tabular-nums",
            overdue && "font-medium text-amber-600 dark:text-amber-400"
          )}
        >
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDueDate(task.due_date)}
          </span>
        </div>

        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditTask(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(task.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <Button
              key={option.id}
              size="sm"
              variant={filter === option.id ? "default" : "outline"}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {filter === "project" ? (
          <select
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
          >
            <option value="all">Tous les projets</option>
            {projectOptions.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="hidden border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[1fr_160px_120px_100px_120px_40px]">
          <span>Tâche</span>
          <span>Statut</span>
          <span>Priorité</span>
          <span>Assigné</span>
          <span>Échéance</span>
          <span />
        </div>

        {filteredTasks.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            Aucune tâche pour ce filtre.
          </p>
        ) : filter === "project" && groupedByProject ? (
          groupedByProject.map((group) => (
            <div key={group.projectId}>
              <div className="border-b bg-muted/20 px-4 py-2">
                <Link
                  href={`/admin/projects/${group.projectId}`}
                  className="text-sm font-semibold hover:underline"
                >
                  {group.projectTitle}
                </Link>
                {group.tasks[0]?.step ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    · {PROJECT_STEP_LABELS[group.tasks[0].step!]}
                  </span>
                ) : null}
              </div>
              {group.tasks.map(renderTaskRow)}
            </div>
          ))
        ) : (
          filteredTasks.map(renderTaskRow)
        )}
      </div>
    </div>
  );
}
