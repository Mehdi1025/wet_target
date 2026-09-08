"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { FinancialWaterfall } from "@/components/admin/finance/financial-waterfall";
import type { FinancialBreakdown } from "@/lib/finance/calculator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CfoVaultSectionProps = {
  breakdown: FinancialBreakdown;
  scopeLabel?: string;
  description?: string;
};

export function CfoVaultSection({
  breakdown,
  scopeLabel,
  description,
}: CfoVaultSectionProps) {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-muted/40 via-background to-muted/20",
        "p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] md:p-8"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_55%)]" />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold tracking-tight">
                Intelligence Financière & Vrai Net
              </h2>
              {scopeLabel ? (
                <Badge variant="outline" className="font-normal">
                  {scopeLabel}
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              Zone CFO Fantôme — analyse de rentabilité et cash réel
            </p>
          </div>

          <Button
            type="button"
            variant={unlocked ? "secondary" : "outline"}
            size="sm"
            onClick={() => setUnlocked((current) => !current)}
            className="shrink-0"
          >
            {unlocked ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Masquer les détails fiscaux
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Déverrouiller
              </>
            )}
          </Button>
        </div>

        <FinancialWaterfall
          breakdown={breakdown}
          scopeLabel={scopeLabel}
          description={description}
          sensitiveHidden={!unlocked}
          embedded
        />
      </div>
    </section>
  );
}
