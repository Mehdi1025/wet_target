"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/admin/session";
import type { Database, ProjectStep, TaskPriority, TaskStatus } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";

type ProjectTaskUpdate =
  Database["public"]["Tables"]["project_tasks"]["Update"];

export type TaskMutationResult =
  | { success: true; taskId?: string }
  | { success: false; error: string };

export type TaskInput = {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string | null;
  dueDate?: string | null;
  step?: ProjectStep | null;
};

function revalidateTasks(projectId?: string) {
  revalidatePath("/admin/tasks");
  revalidatePath("/admin");
  if (projectId) {
    revalidatePath(`/admin/projects/${projectId}`);
  }
}

async function requireAdmin(): Promise<TaskMutationResult | null> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Session admin requise." };
  }
  return null;
}

export async function createProjectTask(
  input: TaskInput
): Promise<TaskMutationResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const title = input.title.trim();
  if (!title) {
    return { success: false, error: "Le titre est requis." };
  }

  try {
    const supabase = createAdminClient();

    const { data: lastTask } = await supabase
      .from("project_tasks")
      .select("sort_order")
      .eq("status", input.status ?? "todo")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder = (lastTask?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from("project_tasks")
      .insert({
        project_id: input.projectId,
        title,
        description: input.description?.trim() || null,
        status: input.status ?? "todo",
        priority: input.priority ?? "normal",
        assignee: input.assignee?.trim() || null,
        due_date: input.dueDate?.trim() || null,
        step: input.step ?? null,
        sort_order: sortOrder,
      })
      .select("id")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Impossible de créer la tâche.",
      };
    }

    revalidateTasks(input.projectId);
    return { success: true, taskId: data.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

export async function updateProjectTask(
  taskId: string,
  input: Partial<TaskInput>
): Promise<TaskMutationResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();

    const payload: ProjectTaskUpdate = {};
    if (input.title !== undefined) payload.title = input.title.trim();
    if (input.description !== undefined) {
      payload.description = input.description.trim() || null;
    }
    if (input.status !== undefined) payload.status = input.status;
    if (input.priority !== undefined) payload.priority = input.priority;
    if (input.assignee !== undefined) {
      payload.assignee = input.assignee?.trim() || null;
    }
    if (input.dueDate !== undefined) {
      payload.due_date = input.dueDate?.trim() || null;
    }
    if (input.step !== undefined) payload.step = input.step;
    if (input.projectId !== undefined) payload.project_id = input.projectId;

    const { data, error } = await supabase
      .from("project_tasks")
      .update(payload)
      .eq("id", taskId)
      .select("project_id")
      .single();

    if (error || !data) {
      return { success: false, error: error?.message ?? "Mise à jour échouée." };
    }

    revalidateTasks(data.project_id);
    return { success: true, taskId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

export async function updateProjectTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<TaskMutationResult> {
  return updateProjectTask(taskId, { status });
}

export async function deleteProjectTask(
  taskId: string
): Promise<TaskMutationResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();

    const { data: task } = await supabase
      .from("project_tasks")
      .select("project_id")
      .eq("id", taskId)
      .maybeSingle();

    const { error } = await supabase
      .from("project_tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateTasks(task?.project_id);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}
