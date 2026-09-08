"use client";

import { useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";

import { TaskFormDialog } from "@/components/admin/tasks/task-form-dialog";
import { TaskKpiGrid } from "@/components/admin/tasks/task-kpi-grid";
import { TasksKanban } from "@/components/admin/tasks/tasks-kanban";
import { TasksList } from "@/components/admin/tasks/tasks-list";
import type {
  ProjectTaskRow,
  ProjectTaskWithProject,
  TaskPickerProject,
  TaskStats,
} from "@/lib/supabase/project-tasks";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TasksPageClientProps = {
  tasks: ProjectTaskWithProject[];
  stats: TaskStats;
  projects: TaskPickerProject[];
  currentUsername: string;
};

export function TasksPageClient({
  tasks,
  stats,
  projects,
  currentUsername,
}: TasksPageClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTaskRow | null>(null);

  function handleEditTask(task: ProjectTaskWithProject) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
    if (!open) {
      setEditingTask(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tâches</h1>
          <p className="mt-1 text-muted-foreground">
            Mission Control — Kanban et liste par projet.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle tâche
        </Button>
      </div>

      <TaskKpiGrid stats={stats} />

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Liste
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <TasksKanban tasks={tasks} onEditTask={handleEditTask} />
        </TabsContent>

        <TabsContent value="list">
          <TasksList
            tasks={tasks}
            currentUsername={currentUsername}
            onEditTask={handleEditTask}
          />
        </TabsContent>
      </Tabs>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        projects={projects}
        currentUsername={currentUsername}
        task={editingTask}
      />
    </div>
  );
}
