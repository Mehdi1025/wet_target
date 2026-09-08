"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar, Download, Plus } from "lucide-react";

import { useManualProjectLaunch } from "@/components/admin/projects/manual-project-launch-context";
import type { AgencyDashboard } from "@/lib/admin/dashboards";
import {
  getDashboardMetrics,
  TEAM_MEMBERS,
} from "@/lib/admin/dashboard-data";
import type { DashboardProjectRow } from "@/lib/supabase/projects";
import type { FinancialBreakdown } from "@/lib/finance/calculator";
import type { OperationalStats } from "@/lib/supabase/operational-stats";
import type { ServiceId } from "@/types/database";
import { DashboardProjectsTable } from "@/components/admin/dashboard-projects-table";
import { CfoVaultSection } from "@/components/admin/finance/cfo-vault-section";
import { OperationalKpiGrid } from "@/components/admin/operational-kpi-grid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const CHART_1 = "hsl(12 76% 61%)";
const CHART_2 = "hsl(173 58% 39%)";
const CHART_5 = "hsl(27 87% 67%)";

export function DashboardOverview({
  dashboard,
  projects,
  financeBreakdown,
  operationalStats,
}: {
  dashboard: AgencyDashboard;
  projects: DashboardProjectRow[];
  financeBreakdown: FinancialBreakdown;
  operationalStats: OperationalStats;
}) {
  const metrics = getDashboardMetrics(dashboard.id);
  const { openManualProjectSheet } = useManualProjectLaunch();
  const activeProjects = projects.filter(
    (project) => project.status !== "completed"
  );
  const gradientId = `grad-${dashboard.id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dashboard.label}</h1>
          <p className="text-muted-foreground">{dashboard.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="h-9"
            onClick={() =>
              openManualProjectSheet({
                defaultServiceId: dashboard.id as ServiceId,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Projet
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Calendar className="mr-2 h-4 w-4" />
            Choisir une date
          </Button>
          <Button size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-9 bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Rapports
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <OperationalKpiGrid
            stats={operationalStats}
            clientsKpiLabel={`Clients actifs (${dashboard.shortLabel})`}
          />

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Fiches Projet 360</CardTitle>
              <CardDescription>
                Projets {dashboard.shortLabel} en cours — accès au cockpit de
                production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardProjectsTable
                projects={activeProjects}
                serviceLabel={dashboard.shortLabel}
              />
            </CardContent>
          </Card>

          <Separator className="my-10" />

          <CfoVaultSection
            breakdown={financeBreakdown}
            scopeLabel={dashboard.shortLabel}
            description={`Cascade financière — part ${dashboard.shortLabel} (budget_share)`}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="col-span-4 shadow-sm">
              <CardHeader>
                <CardTitle>{metrics.chartMainTitle}</CardTitle>
                <CardDescription>{metrics.chartMainSubtitle}</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px] pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.monthlyData}>
                    <defs>
                      <linearGradient id={`${gradientId}-a`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_1} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={CHART_1} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id={`${gradientId}-b`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_2} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={CHART_2} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(240 5.9% 90%)" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(240 3.8% 46.1%)", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(240 3.8% 46.1%)", fontSize: 12 }}
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="desktop"
                      stroke={CHART_1}
                      fill={`url(#${gradientId}-a)`}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="mobile"
                      stroke={CHART_2}
                      fill={`url(#${gradientId}-b)`}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="col-span-3 flex flex-col gap-4">
              <Card className="flex-1 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{metrics.chartBarTitle}</CardTitle>
                  <CardDescription>{metrics.chartBarSubtitle}</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(240 5.9% 90%)" />
                      <XAxis dataKey="month" hide />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey="mobile" fill={CHART_2} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="desktop" fill={CHART_5} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Membres de l&apos;équipe</CardTitle>
              <CardDescription>
                Équipe dédiée — {dashboard.shortLabel}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-muted text-xs">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {member.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <select
                    defaultValue={member.role}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="Member">Membre</option>
                    <option value="Owner">Propriétaire</option>
                  </select>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Rapports — {dashboard.shortLabel}</CardTitle>
              <CardDescription>Exports PDF et CSV par activité.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Fonctionnalité à venir.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Alertes pour {dashboard.shortLabel.toLowerCase()}.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Aucune notification pour le moment.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
