"use client";

import { AlertCircle, CalendarCheck, ListTodo } from "lucide-react";

import type { TaskStats } from "@/lib/supabase/project-tasks";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TaskKpiGridProps = {
  stats: TaskStats;
  className?: string;
};

const KPI_ITEMS = [
  {
    key: "openCount" as const,
    title: "Ouvertes",
    subtitle: "Tâches non terminées",
    icon: ListTodo,
    accent: "text-sky-500",
  },
  {
    key: "overdueCount" as const,
    title: "En retard",
    subtitle: "Échéance dépassée",
    icon: AlertCircle,
    accent: "text-amber-500",
  },
  {
    key: "completedThisWeek" as const,
    title: "Terminées cette semaine",
    subtitle: "Clôturées depuis lundi",
    icon: CalendarCheck,
    accent: "text-emerald-500",
  },
];

export function TaskKpiGrid({ stats, className }: TaskKpiGridProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {KPI_ITEMS.map((item) => (
        <Card key={item.key} className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <item.icon className={cn("h-4 w-4", item.accent)} />
              {item.title}
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums">
              {stats[item.key]}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {item.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
