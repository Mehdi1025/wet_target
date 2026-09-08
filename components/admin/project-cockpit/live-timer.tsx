"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Square } from "lucide-react";
import { toast } from "sonner";

import { startTimer, stopTimer } from "@/lib/actions/time-tracker";
import { formatElapsed } from "@/lib/admin/time-tracker";
import type { TimeLogRow } from "@/lib/supabase/time-logs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LiveTimerProps = {
  projectId: string;
  activeLogs: TimeLogRow[];
  completedSeconds: number;
  currentUsername: string;
};

function elapsedSince(startTimeIso: string, nowMs: number): number {
  const startMs = new Date(startTimeIso).getTime();
  return Math.max(0, Math.floor((nowMs - startMs) / 1000));
}

export function useProjectLiveTime(
  activeLogs: TimeLogRow[],
  completedSeconds: number
) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const activeElapsed = useMemo(
    () =>
      activeLogs.map((log) => ({
        log,
        seconds: elapsedSince(log.start_time, nowMs),
      })),
    [activeLogs, nowMs]
  );

  const liveActiveSeconds = activeElapsed.reduce(
    (sum, entry) => sum + entry.seconds,
    0
  );

  return {
    activeElapsed,
    liveActiveSeconds,
    totalSeconds: completedSeconds + liveActiveSeconds,
  };
}

function displayName(username: string | null): string {
  if (!username) return "Équipe";
  return username.charAt(0).toUpperCase() + username.slice(1);
}

export function LiveTimer({
  projectId,
  activeLogs,
  completedSeconds,
  currentUsername,
}: LiveTimerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [logs, setLogs] = useState(activeLogs);

  useEffect(() => {
    setLogs(activeLogs);
  }, [activeLogs]);

  const { activeElapsed, totalSeconds } = useProjectLiveTime(
    logs,
    completedSeconds
  );

  const myActive = logs.find(
    (log) => log.admin_username === currentUsername
  );

  function handleStart() {
    startTransition(async () => {
      const result = await startTimer(projectId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (result.log) {
        setLogs((current) => [...current, result.log!]);
      }
      toast.success("Chronomètre démarré");
      router.refresh();
    });
  }

  function handleStop() {
    if (!myActive) return;

    startTransition(async () => {
      const result = await stopTimer(myActive.id, projectId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setLogs((current) => current.filter((log) => log.id !== myActive.id));
      toast.success("Temps enregistré");
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Chronomètre en direct</p>
        {logs.length > 0 ? (
          <Badge variant="success" className="animate-pulse">
            {logs.length} actif{logs.length > 1 ? "s" : ""}
          </Badge>
        ) : (
          <Badge variant="outline">Arrêté</Badge>
        )}
      </div>

      <div className="mb-4 rounded-md border bg-background/80 p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total tracé (live)
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-4xl font-bold tabular-nums tracking-wider",
            logs.length > 0 && "text-primary"
          )}
        >
          {formatElapsed(totalSeconds)}
        </p>

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">
              {formatElapsed(completedSeconds)}
            </span>{" "}
            enregistré
          </p>
          {activeElapsed.length > 0 ? (
            <p className="font-mono tabular-nums">
              {activeElapsed.map((entry, index) => (
                <span key={entry.log.id}>
                  {index > 0 ? (
                    <span className="mx-1 font-sans font-semibold text-primary">
                      +
                    </span>
                  ) : null}
                  <span className="text-foreground">
                    {displayName(entry.log.admin_username)}{" "}
                    {formatElapsed(entry.seconds)}
                  </span>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>

      {myActive ? (
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleStop}
          disabled={isPending}
        >
          <Square className="mr-2 h-4 w-4 fill-current" />
          {isPending ? "Arrêt…" : "Arrêter mon chrono"}
        </Button>
      ) : (
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          onClick={handleStart}
          disabled={isPending}
        >
          <Play className="mr-2 h-4 w-4" />
          {isPending ? "Démarrage…" : "Lancer mon chronomètre"}
        </Button>
      )}

      {logs.length > 0 && !myActive ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          D&apos;autres membres travaillent en parallèle — vous pouvez lancer
          le vôtre.
        </p>
      ) : null}
    </div>
  );
}
