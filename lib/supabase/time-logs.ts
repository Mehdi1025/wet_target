import { secondsToSpentDays } from "@/lib/admin/time-tracker";
import { createAdminClient } from "@/lib/supabase/admin";

export type TimeLogRow = {
  id: string;
  project_id: string;
  user_id: string | null;
  admin_username: string | null;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  created_at: string;
};

export async function getActiveTimeLogs(projectId: string): Promise<TimeLogRow[]> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("time_logs")
      .select("*")
      .eq("project_id", projectId)
      .is("end_time", null)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("[getActiveTimeLogs]", error.message);
      return [];
    }

    return (data ?? []) as TimeLogRow[];
  } catch (error) {
    console.error("[getActiveTimeLogs]", error);
    return [];
  }
}

/** @deprecated Use getActiveTimeLogs — kept for compatibility */
export async function getActiveTimeLog(
  projectId: string
): Promise<TimeLogRow | null> {
  const logs = await getActiveTimeLogs(projectId);
  return logs[0] ?? null;
}

export async function getActiveTimeLogForUser(
  projectId: string,
  adminUsername: string
): Promise<TimeLogRow | null> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("time_logs")
      .select("*")
      .eq("project_id", projectId)
      .eq("admin_username", adminUsername)
      .is("end_time", null)
      .maybeSingle();

    if (error) {
      console.error("[getActiveTimeLogForUser]", error.message);
      return null;
    }

    return data as TimeLogRow | null;
  } catch (error) {
    console.error("[getActiveTimeLogForUser]", error);
    return null;
  }
}

export async function getCompletedTrackedSeconds(
  projectId: string
): Promise<number> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("time_logs")
      .select("duration_seconds")
      .eq("project_id", projectId)
      .not("end_time", "is", null);

    if (error) {
      console.error("[getCompletedTrackedSeconds]", error.message);
      return 0;
    }

    return (data ?? []).reduce(
      (sum, row) => sum + Number(row.duration_seconds ?? 0),
      0
    );
  } catch (error) {
    console.error("[getCompletedTrackedSeconds]", error);
    return 0;
  }
}

export async function syncProjectSpentTime(projectId: string): Promise<void> {
  const supabase = createAdminClient();
  const totalSeconds = await getCompletedTrackedSeconds(projectId);

  await supabase
    .from("projects")
    .update({
      spent_seconds: totalSeconds,
      spent_days: secondsToSpentDays(totalSeconds),
    })
    .eq("id", projectId);
}
