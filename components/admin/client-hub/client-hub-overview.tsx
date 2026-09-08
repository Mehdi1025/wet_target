"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Mail, Phone, Plus } from "lucide-react";

import { useManualProjectLaunch } from "@/components/admin/projects/manual-project-launch-context";
import { ClientKpiGrid } from "@/components/admin/client-hub/client-kpi-grid";
import { ClientNotesTab } from "@/components/admin/client-hub/client-notes-tab";
import { ClientProjectsGrid } from "@/components/admin/client-hub/client-projects-grid";
import type { ClientHubStats } from "@/lib/supabase/client-stats";
import type { ClientProjectRow } from "@/lib/supabase/projects";
import type { ClientRow } from "@/types/database";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ClientHubOverviewProps = {
  client: ClientRow;
  projects: ClientProjectRow[];
  stats: ClientHubStats;
  trueNetCash: number;
};

function getClientInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ClientHubOverview({
  client,
  projects,
  stats,
  trueNetCash,
}: ClientHubOverviewProps) {
  const { openManualProjectSheet } = useManualProjectLaunch();

  const activeProjects = projects.filter(
    (project) => project.status !== "completed"
  );
  const completedProjects = projects.filter(
    (project) => project.status === "completed"
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="w-fit px-0" asChild>
        <Link href="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l&apos;agence
        </Link>
      </Button>

      <div className="rounded-xl border bg-muted/20 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <Avatar className="h-16 w-16 border bg-background text-lg">
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {getClientInitials(client.name)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fiche Client 360
                </p>
                <h1 className="text-3xl font-bold tracking-tight">
                  {client.name}
                </h1>
                {client.company ? (
                  <p className="text-lg text-muted-foreground">
                    {client.company}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {client.company ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {client.company}
                  </span>
                ) : null}
                {client.email ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </span>
                ) : null}
                {client.phone ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <Button
            className="shrink-0"
            onClick={() =>
              openManualProjectSheet({ defaultClientId: client.id })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Projet d&apos;Upsell
          </Button>
        </div>
      </div>

      <ClientKpiGrid stats={stats} trueNetCash={trueNetCash} />

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="h-9 bg-transparent p-0">
          <TabsTrigger
            value="active"
            className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Projets en cours ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Historique / Livrés ({completedProjects.length})
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Notes & Appels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-0 space-y-4">
          <ClientProjectsGrid
            projects={activeProjects}
            emptyTitle="Aucun projet en cours"
            emptyDescription="Lancez un upsell ou importez un deal CRM pour démarrer une nouvelle mission avec ce client."
          />
        </TabsContent>

        <TabsContent value="history" className="mt-0 space-y-4">
          <ClientProjectsGrid
            projects={completedProjects}
            emptyTitle="Aucun projet livré"
            emptyDescription="Les projets clôturés apparaîtront ici une fois leur statut passé à Terminé."
          />
        </TabsContent>

        <TabsContent value="notes" className="mt-0 space-y-4">
          <ClientNotesTab
            clientId={client.id}
            initialNotes={client.account_notes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
