"use client";

import { Info, Triangle } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SPARKLINE_COLOR = "#F87171";

function Sparkline({ data }: { data: number[] }) {
  const chartData = data.map((value, i) => ({ i, value }));

  return (
    <div className="h-14 w-[100px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
          <Line
            type="linear"
            dataKey="value"
            stroke={SPARKLINE_COLOR}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KpiCard({
  title,
  icon: Icon,
  value,
  change,
  positive,
  sparkData,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  change: string;
  positive: boolean;
  sparkData: number[];
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {title}
          </div>
          <button
            type="button"
            className="rounded-full text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Plus d'informations"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-3xl font-bold tracking-tight">{value}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Depuis la semaine dernière
            </p>
          </div>
          <Sparkline data={sparkData} />
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <button
            type="button"
            className="text-sm font-semibold hover:underline"
          >
            Détails
          </button>
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              positive ? "text-emerald-600" : "text-red-500"
            )}
          >
            {change}
            <Triangle
              className={cn("h-2.5 w-2.5 fill-current", !positive && "rotate-180")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
