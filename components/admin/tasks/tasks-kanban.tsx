"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteProjectTask,
  updateProjectTaskStatus,
} from "@/lib/actions/project-tasks";
import { PROJECT_STEP_LABELS } from "@/lib/admin/project-constants";
import {
  getTaskPriorityVariant,
  TASK_STATUSES,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from "@/lib/admin/task-constants";
import {
  isTaskOverdue,
  type ProjectTaskWithProject,
} from "@/lib/supabase/project-tasks";
import type { TaskStatus } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type TasksKanbanProps = {
  tasks: ProjectTaskWithProject[];
  onEditTask: (task: ProjectTaskWithProject) => void;
};

function formatDueDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function TaskCard({
  task,
  onEditTask,
  onDragStart,
}: {
  task: ProjectTaskWithProject;
  onEditTask: (task: ProjectTaskWithProject) => void;
  onDragStart: (taskId: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const overdue = isTaskOverdue(task);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProjectTask(task.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Tâche supprimée");
      router.refresh();
    });
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      className={cn(
        "group cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow active:cursor-grabbing hover:shadow-md",
        overdue && task.status !== "done" && "border-amber-400/60"
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug">{task.title}</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
                  disabled={isPending}
                >
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
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Link
            href={`/admin/projects/${task.project_id}`}
            className="block truncate text-xs text-muted-foreground hover:text-foreground"
          >
            {task.project_title}
          </Link>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={getTaskPriorityVariant(task.priority)} className="text-[10px]">
              {TASK_PRIORITY_LABELS[task.priority]}
            </Badge>
            {task.step ? (
              <Badge variant="outline" className="text-[10px]">
                {PROJECT_STEP_LABELS[task.step]}
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {task.assignee ? (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {task.assignee.split(" ")[0]}
              </span>
            ) : null}
            {task.due_date ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  overdue && "font-medium text-amber-600 dark:text-amber-400"
                )}
              >
                <Calendar className="h-3 w-3" />
                {formatDueDate(task.due_date)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TasksKanban({ tasks, onEditTask }: TasksKanbanProps) {
  const router = useRouter();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const tasksByStatus = useMemo(() => {
    const grouped = Object.fromEntries(
      TASK_STATUSES.map((status) => [status, [] as ProjectTaskWithProject[]])
    ) as Record<TaskStatus, ProjectTaskWithProject[]>;

    for (const task of tasks) {
      grouped[task.status].push(task);
    }

    return grouped;
  }, [tasks]);

  function handleDrop(status: TaskStatus) {
    if (!draggingId) return;

    const task = tasks.find((item) => item.id === draggingId);
    setDraggingId(null);

    if (!task || task.status === status) return;

    startTransition(async () => {
      const result = await updateProjectTaskStatus(draggingId, status);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
        isPending && "opacity-70"
      )}
    >
      {TASK_STATUSES.map((status) => (
        <div
          key={status}
          className={cn(
            "flex min-h-[420px] flex-col rounded-xl border p-3",
            TASK_STATUS_COLORS[status]
          )}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleDrop(status)}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold">{TASK_STATUS_LABELS[status]}</h3>
            <Badge variant="secondary" className="tabular-nums">
              {tasksByStatus[status].length}
            </Badge>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            {tasksByStatus[status].length === 0 ? (
              <p className="px-1 py-8 text-center text-xs text-muted-foreground">
                Glissez une tâche ici
              </p>
            ) : (
              tasksByStatus[status].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEditTask={onEditTask}
                  onDragStart={setDraggingId}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
