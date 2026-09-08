"use server";

import { getAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getActiveTimeLogForUser,
  syncProjectSpentTime,
  type TimeLogRow,
} from "@/lib/supabase/time-logs";

export type TimeTrackerResult =
  | { success: true; log?: TimeLogRow }
  | { success: false; error: string };

async function requireAdminUsername(): Promise<
  { username: string } | TimeTrackerResult
> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Session admin requise." };
  }
  return { username: session.username };
}

export async function startTimer(projectId: string): Promise<TimeTrackerResult> {
  const auth = await requireAdminUsername();
  if ("success" in auth) {
    return auth;
  }

  try {
    const existing = await getActiveTimeLogForUser(projectId, auth.username);
    if (existing) {
      return {
        success: false,
        error: "Votre chronomètre est déjà en cours sur ce projet.",
      };
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("time_logs")
      .insert({
        project_id: projectId,
        admin_username: auth.username,
        start_time: new Date().toISOString(),
        end_time: null,
      })
      .select("*")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Impossible de démarrer le chronomètre.",
      };
    }

    return { success: true, log: data as TimeLogRow };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}

export async function stopTimer(
  logId: string,
  projectId: string
): Promise<TimeTrackerResult> {
  const auth = await requireAdminUsername();
  if ("success" in auth) {
    return auth;
  }

  try {
    const supabase = createAdminClient();

    const { data: log, error: fetchError } = await supabase
      .from("time_logs")
      .select("*")
      .eq("id", logId)
      .eq("project_id", projectId)
      .eq("admin_username", auth.username)
      .is("end_time", null)
      .maybeSingle();

    if (fetchError || !log) {
      return {
        success: false,
        error: "Votre chronomètre actif est introuvable.",
      };
    }

    const endTime = new Date();
    const startTime = new Date(log.start_time);
    const durationSeconds = Math.max(
      1,
      Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    );

    const { error: updateError } = await supabase
      .from("time_logs")
      .update({
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq("id", logId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await syncProjectSpentTime(projectId);

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    return { success: false, error: message };
  }
}
