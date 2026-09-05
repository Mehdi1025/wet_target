"use client";

import Link from "next/link";
import {
  Calendar,
  Download,
  FolderKanban,
  Mail,
  Percent,
  Wallet,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  AGENCY_GLOBAL_KPIS,
  MONTHLY_REVENUE_TOTAL,
  REVENUE_BY_ACTIVITY,
} from "@/lib/admin/agency-overview-data";
import { AGENCY_DASHBOARDS, getDashboardPath } from "@/lib/admin/dashboards";
import type { ContactStats } from "@/lib/supabase/contacts";
import { KpiCard } from "@/components/admin/kpi-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AgencyOverviewProps = {
  contactStats: ContactStats;
  supabaseConnected: boolean;
};

export function AgencyOverview({
  contactStats,
  supabaseConnected,
}: AgencyOverviewProps) {
  const conversionDisplay =
    contactStats.conversionRate !== null
      ? `${contactStats.conversionRate}%`
      : "—";

  const leadsDisplay = supabaseConnected
    ? String(contactStats.total)
    : "—";

  const conversionPositive =
    contactStats.conversionRate !== null
      ? contactStats.conversionRate >= 15
      : true;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vue globale</h1>
          <p className="text-muted-foreground">
            Résumé agence Target — toutes activités confondues
          </p>
        </div>
        <div className="flex gap-2">
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
            value="activities"
            className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Par activité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="CA total du mois"
              icon={Wallet}
              value={MONTHLY_REVENUE_TOTAL.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              })}
              change={AGENCY_GLOBAL_KPIS.revenueGrowth}
              positive
              sparkData={AGENCY_GLOBAL_KPIS.sparkRevenue}
            />
            <KpiCard
              title="Projets en cours"
              icon={FolderKanban}
              value={String(AGENCY_GLOBAL_KPIS.projectsInProgress)}
              change={AGENCY_GLOBAL_KPIS.projectsGrowth}
              positive
              sparkData={AGENCY_GLOBAL_KPIS.sparkProjects}
            />
            <KpiCard
              title="Leads contact"
              icon={Mail}
              value={leadsDisplay}
              change={
                supabaseConnected
                  ? `${contactStats.new} nouveau(x)`
                  : "Hors ligne"
              }
              positive={supabaseConnected}
              sparkData={AGENCY_GLOBAL_KPIS.sparkLeads}
            />
            <KpiCard
              title="Conversion lead → client"
              icon={Percent}
              value={conversionDisplay}
              change={AGENCY_GLOBAL_KPIS.conversionGrowth}
              positive={conversionPositive}
              sparkData={AGENCY_GLOBAL_KPIS.sparkConversion}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="col-span-4 shadow-sm">
              <CardHeader>
                <CardTitle>Répartition du CA par activité</CardTitle>
                <CardDescription>
                  Part du chiffre d&apos;affaires mensuel par pôle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                  <div className="h-[280px] w-full max-w-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={REVENUE_BY_ACTIVITY}
                          dataKey="share"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={2}
                          strokeWidth={0}
                        >
                          {REVENUE_BY_ACTIVITY.map((entry) => (
                            <Cell key={entry.id} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, _name, item) => {
                            const entry = item?.payload as
                              | (typeof REVENUE_BY_ACTIVITY)[0]
                              | undefined;
                            if (!entry || value == null) return ["", ""];
                            return [
                              `${value}% · ${entry.amount.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                                maximumFractionDigits: 0,
                              })}`,
                              entry.label,
                            ];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full flex-1 space-y-3">
                    {REVENUE_BY_ACTIVITY.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div>
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.share}% du CA
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold tabular-nums">
                          {item.amount.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 shadow-sm">
              <CardHeader>
                <CardTitle>Accès rapides</CardTitle>
                <CardDescription>
                  Ouvrir le dashboard d&apos;une activité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {AGENCY_DASHBOARDS.map((dashboard) => {
                  const revenue = REVENUE_BY_ACTIVITY.find(
                    (r) => r.id === dashboard.id
                  );
                  return (
                    <Link
                      key={dashboard.id}
                      href={getDashboardPath(dashboard.id)}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {dashboard.shortLabel}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dashboard.description}
                        </p>
                      </div>
                      {revenue ? (
                        <span className="text-xs font-medium text-muted-foreground">
                          {revenue.share}%
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {supabaseConnected ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Leads contact — Supabase</CardTitle>
                <CardDescription>
                  {contactStats.total} message(s) · {contactStats.new} non lu(s)
                  · {contactStats.replied} traité(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Le taux de conversion est calculé sur les leads marqués
                &quot;Répondu&quot; ou &quot;Archivé&quot; sur le total des
                messages reçus.
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="activities">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {AGENCY_DASHBOARDS.map((dashboard) => {
              const revenue = REVENUE_BY_ACTIVITY.find(
                (r) => r.id === dashboard.id
              );
              return (
                <Card key={dashboard.id} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {dashboard.label}
                    </CardTitle>
                    <CardDescription>{dashboard.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {revenue?.amount.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                          maximumFractionDigits: 0,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {revenue?.share}% du CA mensuel
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={getDashboardPath(dashboard.id)}>
                        Ouvrir
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
