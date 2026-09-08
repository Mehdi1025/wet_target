"use client";

import { AlertTriangle } from "lucide-react";

import { formatCurrency } from "@/lib/admin/budget-allocation";
import {
  formatTrackedSummary,
  WORK_DAY_SECONDS,
} from "@/lib/admin/time-tracker";
import {
  LiveTimer,
  useProjectLiveTime,
} from "@/components/admin/project-cockpit/live-timer";
import type { TimeLogRow } from "@/lib/supabase/time-logs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ProfitabilityBlockProps = {
  projectId: string;
  budget: number | null;
  allocatedDays: number;
  completedSeconds: number;
  activeLogs: TimeLogRow[];
  currentUsername: string;
  totalExternalCosts: number;
};

export function ProfitabilityBlock({
  projectId,
  budget,
  allocatedDays,
  completedSeconds,
  activeLogs,
  currentUsername,
  totalExternalCosts,
}: ProfitabilityBlockProps) {
  const { totalSeconds } = useProjectLiveTime(activeLogs, completedSeconds);

  const budgetValue = budget ?? 0;
  const netMargin = budget !== null ? budgetValue - totalExternalCosts : null;
  const marginPercent =
    netMargin !== null && budgetValue > 0
      ? Math.round((netMargin / budgetValue) * 100)
      : null;
  const isNegativeMargin = netMargin !== null && netMargin < 0;

  const allocatedSeconds = allocatedDays * WORK_DAY_SECONDS;
  const isOverBudget =
    allocatedSeconds > 0 && totalSeconds > allocatedSeconds;
  const progressValue =
    allocatedSeconds > 0
      ? Math.min(100, Math.round((totalSeconds / allocatedSeconds) * 100))
      : totalSeconds > 0
        ? 100
        : 0;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Rentabilité & Temps</CardTitle>
        <CardDescription>
          Budget, chronomètre et consommation du temps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <LiveTimer
          projectId={projectId}
          activeLogs={activeLogs}
          completedSeconds={completedSeconds}
          currentUsername={currentUsername}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Budget contractuel
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">
              {budget !== null ? formatCurrency(budget) : "—"}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Coûts externes
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-amber-600 dark:text-amber-400">
              − {formatCurrency(totalExternalCosts)}
            </p>
          </div>
        </div>

        {netMargin !== null ? (
          <div
            className={cn(
              "rounded-lg border p-4",
              isNegativeMargin
                ? "border-destructive/30 bg-destructive/5"
                : "border-emerald-500/30 bg-emerald-500/5"
            )}
          >
            <p className="text-sm font-medium text-muted-foreground">
              Marge nette agence
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p
                className={cn(
                  "text-3xl font-bold tabular-nums tracking-tight",
                  isNegativeMargin
                    ? "text-destructive"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {formatCurrency(netMargin)}
              </p>
              {marginPercent !== null ? (
                <p
                  className={cn(
                    "text-lg font-semibold tabular-nums",
                    isNegativeMargin
                      ? "text-destructive"
                      : "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {marginPercent} %
                </p>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Budget total − sous-traitance externe
            </p>
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Temps consommé</p>
            <p
              className={cn(
                "text-sm font-semibold tabular-nums",
                isOverBudget && "text-destructive"
              )}
            >
              {formatTrackedSummary(totalSeconds)}
              {allocatedDays > 0 ? ` / ${allocatedDays} j` : null}
            </p>
          </div>

          <Progress
            value={progressValue}
            className={isOverBudget ? "bg-destructive/20" : undefined}
            indicatorClassName={isOverBudget ? "bg-destructive" : undefined}
          />

          {isOverBudget ? (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Dépassement du quota alloué ({allocatedDays} j × 8 h).
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {allocatedDays > 0
                ? `${Math.max(allocatedSeconds - totalSeconds, 0) > 0 ? formatTrackedSummary(Math.max(allocatedSeconds - totalSeconds, 0)) : "0 min"} restant(s) sur ${allocatedDays} j alloué(s)`
                : "Aucun jour alloué — définissez un quota pour suivre la rentabilité."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
