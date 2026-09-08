import type { ProjectStep, TaskPriority, TaskStatus } from "@/types/database";

export const TASK_STATUSES: TaskStatus[] = [
  "todo",
  "in_progress",
  "blocked",
  "done",
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "À faire",
  in_progress: "En cours",
  blocked: "Bloqué",
  done: "Terminé",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50",
  in_progress:
    "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30",
  blocked:
    "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
  done: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
};

export const TASK_PRIORITIES: TaskPriority[] = ["high", "normal", "low"];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "Haute",
  normal: "Normale",
  low: "Basse",
};

export function getTaskPriorityVariant(
  priority: TaskPriority
): "destructive" | "secondary" | "outline" {
  const map = {
    high: "destructive" as const,
    normal: "secondary" as const,
    low: "outline" as const,
  };
  return map[priority];
}

export const TASK_ASSIGNEE_OPTIONS = [
  "Adam Fisli",
  "Mahdi Benali",
  "Sophie Leroy",
] as const;

export function guessAssigneeFromUsername(username: string): string | null {
  const normalized = username.trim().toLowerCase();
  if (!normalized) return null;

  return (
    TASK_ASSIGNEE_OPTIONS.find((name) =>
      name.toLowerCase().includes(normalized)
    ) ?? null
  );
}

export function isTaskAssignedToUser(
  assignee: string | null,
  username: string
): boolean {
  if (!assignee) return false;
  const normalized = username.trim().toLowerCase();
  return assignee.toLowerCase().includes(normalized);
}
