import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ProjectStep,
  TaskPriority,
  TaskStatus,
} from "@/types/database";

export type ProjectTaskRow = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  due_date: string | null;
  step: ProjectStep | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectTaskWithProject = ProjectTaskRow & {
  project_title: string;
  project_status: string;
};

export type TaskPickerProject = {
  id: string;
  title: string;
  current_step: ProjectStep;
};

export type TaskStats = {
  openCount: number;
  overdueCount: number;
  completedThisWeek: number;
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getOpenTaskCount(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("project_tasks")
      .select("id", { count: "exact", head: true })
      .neq("status", "done");

    if (error) {
      console.error("[getOpenTaskCount]", error.message);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.error("[getOpenTaskCount]", error);
    return 0;
  }
}

export async function getTaskStats(): Promise<TaskStats> {
  try {
    const supabase = createAdminClient();
    const today = toDateString(new Date());
    const weekStart = toDateString(startOfWeek(new Date()));
    const weekEnd = toDateString(endOfWeek(new Date()));

    const [{ count: openCount }, { data: overdueRows }, { count: completedThisWeek }] =
      await Promise.all([
        supabase
          .from("project_tasks")
          .select("id", { count: "exact", head: true })
          .neq("status", "done"),
        supabase
          .from("project_tasks")
          .select("id")
          .neq("status", "done")
          .not("due_date", "is", null)
          .lt("due_date", today),
        supabase
          .from("project_tasks")
          .select("id", { count: "exact", head: true })
          .eq("status", "done")
          .gte("updated_at", `${weekStart}T00:00:00`)
          .lte("updated_at", `${weekEnd}T23:59:59`),
      ]);

    return {
      openCount: openCount ?? 0,
      overdueCount: overdueRows?.length ?? 0,
      completedThisWeek: completedThisWeek ?? 0,
    };
  } catch (error) {
    console.error("[getTaskStats]", error);
    return { openCount: 0, overdueCount: 0, completedThisWeek: 0 };
  }
}

export async function getAllTasks(): Promise<ProjectTaskWithProject[]> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("project_tasks")
      .select(
        `
        *,
        project:projects ( title, status )
      `
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAllTasks]", error.message);
      return [];
    }

    type Row = ProjectTaskRow & {
      project: { title: string; status: string } | null;
    };

    return ((data ?? []) as Row[])
      .filter((row) => row.project)
      .map((row) => ({
        ...row,
        project_title: row.project!.title,
        project_status: row.project!.status,
      }));
  } catch (error) {
    console.error("[getAllTasks]", error);
    return [];
  }
}

export async function getProjectTasks(
  projectId: string
): Promise<ProjectTaskRow[]> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getProjectTasks]", error.message);
      return [];
    }

    return (data ?? []) as ProjectTaskRow[];
  } catch (error) {
    console.error("[getProjectTasks]", error);
    return [];
  }
}

export async function getProjectsForTaskPicker(): Promise<TaskPickerProject[]> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("projects")
      .select("id, title, current_step")
      .neq("status", "completed")
      .order("title", { ascending: true });

    if (error) {
      console.error("[getProjectsForTaskPicker]", error.message);
      return [];
    }

    return (data ?? []) as TaskPickerProject[];
  } catch (error) {
    console.error("[getProjectsForTaskPicker]", error);
    return [];
  }
}

export function isTaskOverdue(task: ProjectTaskRow): boolean {
  if (task.status === "done" || !task.due_date) return false;
  const today = toDateString(new Date());
  return task.due_date < today;
}

export function isTaskDueThisWeek(task: ProjectTaskRow): boolean {
  if (!task.due_date) return false;
  const due = new Date(`${task.due_date}T12:00:00`);
  const start = startOfWeek(new Date());
  const end = endOfWeek(new Date());
  return due >= start && due <= end;
}
