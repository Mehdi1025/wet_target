"use client";

import Link from "next/link";
import {
  Calendar,
  Download,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { CfoVaultSection } from "@/components/admin/finance/cfo-vault-section";
import { InternalHub } from "@/components/admin/arsenal/internal-hub";
import { OperationalKpiGrid } from "@/components/admin/operational-kpi-grid";
import { ProductionInbox } from "@/components/admin/production-inbox";
import { REVENUE_BY_ACTIVITY } from "@/lib/admin/agency-overview-data";
import type { FinancialBreakdown } from "@/lib/finance/calculator";
import { AGENCY_DASHBOARDS, getDashboardPath } from "@/lib/admin/dashboards";
import type {
  ArsenalDrawerWithLinks,
  ArsenalLinkRow,
} from "@/lib/supabase/arsenal";
import type { OperationalStats } from "@/lib/supabase/operational-stats";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AgencyOverviewProps = {
  operationalStats: OperationalStats;
  financeBreakdown: FinancialBreakdown;
  arsenalDrawers: ArsenalDrawerWithLinks[];
  arsenalPreviewLinks: (ArsenalLinkRow & { drawerTitle: string })[];
};

export function AgencyOverview({
  operationalStats,
  financeBreakdown,
  arsenalDrawers,
  arsenalPreviewLinks,
}: AgencyOverviewProps) {
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

        <TabsContent value="overview" className="mt-0 space-y-6">
          <OperationalKpiGrid
            stats={operationalStats}
            clientsKpiLabel="Clients de l'agence"
          />

          <ProductionInbox />

          <InternalHub
            drawers={arsenalDrawers}
            previewLinks={arsenalPreviewLinks}
            variant="preview"
          />

          <Separator className="my-10" />

          <CfoVaultSection
            breakdown={financeBreakdown}
            scopeLabel="Tous les projets"
            description="Cascade financière consolidée — tous pôles confondus"
          />
        </TabsContent>

        <TabsContent value="activities">
          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="col-span-4 shadow-sm">
              <CardHeader>
                <CardTitle>Répartition du CA par activité</CardTitle>
                <CardDescription>
                  Part du chiffre d&apos;affaires par pôle
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
