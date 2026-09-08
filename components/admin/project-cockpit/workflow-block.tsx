"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

import { advanceProjectStep } from "@/lib/actions/projects";
import {
  getNextStep,
  PROJECT_STEP_LABELS,
  PROJECT_STEPS,
} from "@/lib/admin/project-constants";
import type { ProjectStep } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WorkflowBlockProps = {
  projectId: string;
  currentStep: ProjectStep;
};

export function WorkflowBlock({ projectId, currentStep }: WorkflowBlockProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentIndex = PROJECT_STEPS.indexOf(currentStep);
  const nextStep = getNextStep(currentStep);

  function handleAdvance() {
    startTransition(async () => {
      const result = await advanceProjectStep(projectId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Étape mise à jour");
      router.refresh();
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Workflow production</CardTitle>
        <CardDescription>
          Tracker des 4 étapes — actuellement{" "}
          <span className="font-medium text-foreground">
            {PROJECT_STEP_LABELS[currentStep]}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3">
          {PROJECT_STEPS.map((step, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = step === currentStep;
            const isUpcoming = index > currentIndex;

            return (
              <div
                key={step}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  isCurrent && "border-primary bg-primary/5",
                  isComplete && "border-emerald-500/30 bg-emerald-500/5",
                  isUpcoming && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    isCurrent &&
                      "border-primary bg-primary text-primary-foreground",
                    isComplete &&
                      "border-emerald-500 bg-emerald-500 text-white",
                    isUpcoming && "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {PROJECT_STEP_LABELS[step]}
                  </p>
                  {isCurrent ? (
                    <p className="text-xs text-primary">Étape en cours</p>
                  ) : isComplete ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Terminée
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">À venir</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Button
          className="w-full"
          onClick={handleAdvance}
          disabled={isPending || !nextStep}
        >
          {nextStep ? (
            <>
              Passer à l&apos;étape suivante
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Projet au stade final"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
