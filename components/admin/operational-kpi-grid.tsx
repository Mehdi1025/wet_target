"use client";

import {
  CheckCircle2,
  FolderKanban,
  Inbox,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { formatCurrency } from "@/lib/admin/budget-allocation";
import type { OperationalStats } from "@/lib/supabase/operational-stats";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type OperationalKpiGridProps = {
  stats: OperationalStats;
  className?: string;
  clientsKpiLabel?: string;
};

type KpiItem = {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  accent?: string;
};

function OperationalKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
}: KpiItem) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className={cn("h-4 w-4", accent)} />
          {title}
        </div>
        <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export function OperationalKpiGrid({
  stats,
  className,
  clientsKpiLabel = "Clients uniques",
}: OperationalKpiGridProps) {
  const kpis: KpiItem[] = [
    {
      title: clientsKpiLabel,
      value: String(stats.uniqueClients),
      subtitle: "Entités avec au moins un projet",
      icon: Users,
      accent: "text-indigo-500",
    },
    {
      title: "Projets actifs",
      value: String(stats.activeProjects),
      subtitle: `${stats.totalProjects} projet(s) au total`,
      icon: FolderKanban,
      accent: "text-sky-500",
    },
    {
      title: "Nouveaux leads (Inbox)",
      value:
        stats.pendingInboxLeads !== null
          ? String(stats.pendingInboxLeads)
          : "—",
      subtitle:
        stats.pendingInboxLeads !== null
          ? "En attente de classification CRM"
          : "CRM non configuré",
      icon: Inbox,
      accent: "text-amber-500",
    },
    {
      title: "Chiffre d'affaires brut",
      value: formatCurrency(stats.grossRevenueHt),
      subtitle: "CA HT — sans déduction fiscale",
      icon: Wallet,
      accent: "text-emerald-500",
    },
    {
      title: "Taux de complétion",
      value: `${stats.completionRate} %`,
      subtitle: `${stats.completedProjects} projet(s) terminé(s)`,
      icon: CheckCircle2,
      accent: "text-violet-500",
    },
  ];

  return (
    <div
      className={cn(
        "grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5",
        className
      )}
    >
      {kpis.map((kpi) => (
        <OperationalKpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
