"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createProjectTask,
  updateProjectTask,
} from "@/lib/actions/project-tasks";
import { PROJECT_STEP_LABELS } from "@/lib/admin/project-constants";
import {
  guessAssigneeFromUsername,
  TASK_ASSIGNEE_OPTIONS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "@/lib/admin/task-constants";
import type { ProjectTaskRow, TaskPickerProject } from "@/lib/supabase/project-tasks";
import type { ProjectStep, TaskPriority, TaskStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: TaskPickerProject[];
  currentUsername: string;
  task?: ProjectTaskRow | null;
  defaultProjectId?: string;
  defaultStep?: ProjectStep | null;
};

const EMPTY_FORM = {
  projectId: "",
  title: "",
  description: "",
  status: "todo" as TaskStatus,
  priority: "normal" as TaskPriority,
  assignee: "",
  dueDate: "",
  step: "" as string,
};

export function TaskFormDialog({
  open,
  onOpenChange,
  projects,
  currentUsername,
  task,
  defaultProjectId,
  defaultStep,
}: TaskFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;

    if (task) {
      setForm({
        projectId: task.project_id,
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        assignee: task.assignee ?? "",
        dueDate: task.due_date ?? "",
        step: task.step ?? "",
      });
      return;
    }

    const guessedAssignee = guessAssigneeFromUsername(currentUsername);
    setForm({
      ...EMPTY_FORM,
      projectId: defaultProjectId ?? projects[0]?.id ?? "",
      assignee: guessedAssignee ?? "",
      step: defaultStep ?? "",
    });
  }, [open, task, defaultProjectId, defaultStep, projects, currentUsername]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.projectId) {
      toast.error("Sélectionnez un projet.");
      return;
    }

    startTransition(async () => {
      const payload = {
        projectId: form.projectId,
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assignee: form.assignee || null,
        dueDate: form.dueDate || null,
        step: (form.step || null) as ProjectStep | null,
      };

      const result = task
        ? await updateProjectTask(task.id, payload)
        : await createProjectTask(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(task ? "Tâche mise à jour" : "Tâche créée");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Modifier la tâche" : "Nouvelle tâche"}</DialogTitle>
          <DialogDescription>
            Rattachée à un projet — étape optionnelle.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Titre</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Valider maquettes Figma"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-project">Projet</Label>
            <select
              id="task-project"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
              value={form.projectId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, projectId: event.target.value }))
              }
              required
            >
              <option value="">Sélectionner…</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-step">Étape</Label>
              <select
                id="task-step"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                value={form.step}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, step: event.target.value }))
                }
              >
                <option value="">Aucune</option>
                {Object.entries(PROJECT_STEP_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assignee">Assigné</Label>
              <select
                id="task-assignee"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                value={form.assignee}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, assignee: event.target.value }))
                }
              >
                <option value="">Non assigné</option>
                {TASK_ASSIGNEE_OPTIONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priorité</Label>
              <select
                id="task-priority"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                value={form.priority}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    priority: event.target.value as TaskPriority,
                  }))
                }
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {TASK_PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-status">Statut</Label>
              <select
                id="task-status"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as TaskStatus,
                  }))
                }
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due">Échéance</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, dueDate: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={3}
              placeholder="Détails, liens, contexte…"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement…
                </>
              ) : task ? (
                "Enregistrer"
              ) : (
                "Créer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
