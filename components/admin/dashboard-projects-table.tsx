"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FolderKanban } from "lucide-react";

import {
  getProjectStatusVariant,
  PROJECT_STATUS_LABELS,
  PROJECT_STEP_LABELS,
} from "@/lib/admin/project-constants";
import { formatCurrency } from "@/lib/admin/budget-allocation";
import type { DashboardProjectRow } from "@/lib/supabase/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DashboardProjectsTableProps = {
  projects: DashboardProjectRow[];
  serviceLabel: string;
};

export function DashboardProjectsTable({
  projects,
  serviceLabel,
}: DashboardProjectsTableProps) {
  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return projects;

    return projects.filter((project) => {
      const haystack = [
        project.title,
        project.client_name,
        project.client_company ?? "",
        project.client_email ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [projects, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrer les projets…"
          className="max-w-sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className="ml-auto text-xs text-muted-foreground">
          {filteredProjects.length} fiche{filteredProjects.length > 1 ? "s" : ""}{" "}
          360
        </p>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <FolderKanban className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium">Aucun projet {serviceLabel.toLowerCase()}</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Créez un projet via « Nouveau Projet » ou importez un deal depuis
            l&apos;Inbox de Production.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="p-3 text-left font-medium">Projet</th>
                <th className="p-3 text-left font-medium">Client</th>
                <th className="p-3 text-left font-medium">Statut</th>
                <th className="p-3 text-left font-medium">Étape</th>
                <th className="p-3 text-right font-medium">Part budget</th>
                <th className="w-28 p-3 text-right font-medium">Fiche 360</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="p-3">
                    <p className="font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground">
                      MAJ{" "}
                      {new Date(project.updated_at).toLocaleDateString("fr-FR")}
                    </p>
                  </td>
                  <td className="p-3">
                    <p>{project.client_company ?? project.client_name}</p>
                    {project.client_email ? (
                      <p className="text-xs text-muted-foreground">
                        {project.client_email}
                      </p>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <Badge variant={getProjectStatusVariant(project.status)}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {PROJECT_STEP_LABELS[project.current_step]}
                  </td>
                  <td className="p-3 text-right tabular-nums font-medium">
                    {formatCurrency(project.budget_share)}
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/projects/${project.id}`}>
                        Ouvrir
                        <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
