import { TasksPageClient } from "@/components/admin/tasks/tasks-page-client";
import { getAdminSession } from "@/lib/admin/session";
import {
  getAllTasks,
  getProjectsForTaskPicker,
  getTaskStats,
} from "@/lib/supabase/project-tasks";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [tasks, stats, projects] = await Promise.all([
    getAllTasks(),
    getTaskStats(),
    getProjectsForTaskPicker(),
  ]);

  return (
    <TasksPageClient
      tasks={tasks}
      stats={stats}
      projects={projects}
      currentUsername={session.username}
    />
  );
}
