"use client";

import {
  CheckCircle2,
  FolderKanban,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { formatCurrency } from "@/lib/admin/budget-allocation";
import type { ClientHubStats } from "@/lib/supabase/client-stats";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ClientKpiGridProps = {
  stats: ClientHubStats;
  trueNetCash: number;
  className?: string;
};

type KpiItem = {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  accent?: string;
};

function ClientKpiCard({
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

export function ClientKpiGrid({
  stats,
  trueNetCash,
  className,
}: ClientKpiGridProps) {
  const kpis: KpiItem[] = [
    {
      title: "Lifetime Value (LTV)",
      value: formatCurrency(stats.ltv),
      subtitle: "Somme des budgets contractuels HT",
      icon: Wallet,
      accent: "text-emerald-500",
    },
    {
      title: "Projets actifs",
      value: String(stats.activeProjects),
      subtitle: `${stats.totalProjects} projet(s) au total`,
      icon: FolderKanban,
      accent: "text-sky-500",
    },
    {
      title: "Projets livrés",
      value: String(stats.completedProjects),
      subtitle: "Statut terminé",
      icon: CheckCircle2,
      accent: "text-violet-500",
    },
    {
      title: "True Net Cash",
      value: formatCurrency(trueNetCash),
      subtitle: "Estimation nette après coûts & charges",
      icon: TrendingUp,
      accent: "text-amber-500",
    },
  ];

  return (
    <div
      className={cn(
        "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
        className
      )}
    >
      {kpis.map((kpi) => (
        <ClientKpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
