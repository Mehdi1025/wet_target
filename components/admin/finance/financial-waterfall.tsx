"use client";

import { Equal, Ghost, Info, Minus } from "lucide-react";

import { formatCurrency } from "@/lib/admin/budget-allocation";
import {
  IS_RATE,
  URSSAF_RATE,
  type FinancialBreakdown,
} from "@/lib/finance/calculator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type FinancialWaterfallProps = {
  breakdown: FinancialBreakdown;
  title?: string;
  description?: string;
  scopeLabel?: string;
  sensitiveHidden?: boolean;
  embedded?: boolean;
};

function MaskedValue({
  hidden,
  children,
  className,
}: {
  hidden: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (!hidden) {
    return <>{children}</>;
  }

  return (
    <span
      className={cn(
        "inline-block select-none blur-md",
        className
      )}
      aria-hidden
    >
      •••••
    </span>
  );
}

function WaterfallOperator({
  icon: Icon,
  className,
}: {
  icon: typeof Minus;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center self-center",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-muted/40">
        <Icon className="h-4 w-4" strokeWidth={2.5} />
      </div>
    </div>
  );
}

function WaterfallBlock({
  label,
  value,
  valueClassName,
  badge,
  hint,
  tooltip,
  highlight,
  hidden,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  badge?: React.ReactNode;
  hint?: string;
  tooltip?: React.ReactNode;
  highlight?: boolean;
  hidden?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-[140px] flex-1 flex-col justify-center rounded-xl border px-4 py-4 md:min-w-[160px] md:px-5 md:py-5",
        highlight
          ? "border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_40px_-12px_rgba(16,185,129,0.45)]"
          : "border-border/60 bg-card/60"
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Détails"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-left">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      {badge ? <div className="mb-2">{badge}</div> : null}

      <p
        className={cn(
          "text-2xl font-bold tabular-nums tracking-tight md:text-3xl",
          valueClassName,
          hidden && "text-muted-foreground"
        )}
      >
        <MaskedValue hidden={Boolean(hidden)}>{value}</MaskedValue>
      </p>

      {hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FinancialWaterfall({
  breakdown,
  title = "CFO Fantôme",
  description = "Cascade financière — devis HT jusqu'au cash réellement disponible",
  scopeLabel,
  sensitiveHidden = false,
  embedded = false,
}: FinancialWaterfallProps) {
  const {
    caHt,
    tvaCollectee,
    externalCosts,
    grossMargin,
    isProvision,
    urssafProvision,
    taxes,
    trueNetCash,
  } = breakdown;

  const grossMarginTone =
    grossMargin >= 0 ? "text-sky-400" : "text-destructive";
  const netTone =
    trueNetCash >= 0 ? "text-emerald-400" : "text-destructive";

  return (
    <TooltipProvider delayDuration={150}>
      <Card
        className={cn(
          "w-full overflow-hidden shadow-sm",
          embedded
            ? "border-border/40 bg-background/40 shadow-none"
            : "border-border/60 bg-gradient-to-br from-card via-card to-muted/20"
        )}
      >
        {!embedded ? (
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Ghost className="h-5 w-5 text-muted-foreground" />
                  {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
              {scopeLabel ? (
                <Badge variant="outline" className="shrink-0">
                  {scopeLabel}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
        ) : null}

        <CardContent className={cn("space-y-4", embedded && "p-0")}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-2">
            <WaterfallBlock
              label="Prix initial"
              value={formatCurrency(caHt)}
              hint="CA HT contractuel"
              badge={
                <Badge variant="secondary" className="font-normal tabular-nums">
                  TVA collectée : +{formatCurrency(tvaCollectee)}
                </Badge>
              }
            />

            <WaterfallOperator
              icon={Minus}
              className="text-orange-500 lg:rotate-0"
            />

            <WaterfallBlock
              label="Sous-traitance"
              value={`− ${formatCurrency(externalCosts)}`}
              valueClassName="text-orange-500"
              hint="Freelances & charges projet"
            />

            <WaterfallOperator icon={Equal} className="text-muted-foreground" />

            <WaterfallBlock
              label="Marge brute"
              value={formatCurrency(grossMargin)}
              valueClassName={grossMarginTone}
              hint="CA HT − coûts externes"
            />

            <WaterfallOperator
              icon={Minus}
              className="text-muted-foreground"
            />

            <WaterfallBlock
              label="Provisions fiscales"
              value={`− ${formatCurrency(taxes)}`}
              valueClassName="text-muted-foreground"
              hint="IS + URSSAF provisionnés"
              hidden={sensitiveHidden}
              tooltip={
                sensitiveHidden ? undefined : (
                <div className="space-y-2">
                  <p className="font-medium">Répartition des provisions</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>
                      IS ({Math.round(IS_RATE * 100)} %) :{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(isProvision)}
                      </span>
                    </li>
                    <li>
                      URSSAF ({Math.round(URSSAF_RATE * 100)} %) :{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(urssafProvision)}
                      </span>
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Calculées sur la marge brute positive.
                  </p>
                </div>
                )
              }
            />

            <WaterfallOperator icon={Equal} className="text-emerald-500" />

            <WaterfallBlock
              label="True Net Cash"
              value={formatCurrency(trueNetCash)}
              valueClassName={netTone}
              hint="Cash disponible"
              highlight
              hidden={sensitiveHidden}
            />
          </div>

          <Separator />

          <p className="text-center text-xs text-muted-foreground md:text-left">
            {formatCurrency(caHt)} − {formatCurrency(externalCosts)} ={" "}
            {formatCurrency(grossMargin)} −{" "}
            {sensitiveHidden ? (
              <span className="blur-sm select-none">•••••</span>
            ) : (
              formatCurrency(taxes)
            )}{" "}
            ={" "}
            {sensitiveHidden ? (
              <span className="blur-sm select-none font-semibold">•••••</span>
            ) : (
              <span className="font-semibold text-emerald-400">
                {formatCurrency(trueNetCash)}
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
