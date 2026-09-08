"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

import {
  addExternalCost,
  deleteExternalCost,
  updateExternalCostStatus,
} from "@/lib/actions/freelances";
import {
  EXTERNAL_COST_STATUS_LABELS,
  EXTERNAL_COST_TYPE_LABELS,
  getExternalCostDisplayTitle,
  getExternalCostSubtitle,
  getNextExternalCostStatus,
} from "@/lib/admin/external-cost-constants";
import { formatCurrency } from "@/lib/admin/budget-allocation";
import type { ExternalCostRow } from "@/lib/supabase/external-costs";
import type { ExternalCostType } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FreelancesBlockProps = {
  projectId: string;
  costs: ExternalCostRow[];
  totalExternalCosts: number;
};

const COST_TYPES: ExternalCostType[] = ["contractor", "project_charge"];

function StatusToggle({
  status,
  disabled,
  onToggle,
}: {
  status: ExternalCostRow["status"];
  disabled: boolean;
  onToggle: () => void;
}) {
  const nextStatus = getNextExternalCostStatus(status);
  const nextLabel = EXTERNAL_COST_STATUS_LABELS[nextStatus];

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      title={`Cliquer pour passer à « ${nextLabel} »`}
      className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
    >
      {status === "paid" ? (
        <Badge variant="success">Payé</Badge>
      ) : (
        <Badge variant="processing">En attente</Badge>
      )}
    </button>
  );
}

function typeBadge(costType: ExternalCostType) {
  if (costType === "project_charge") {
    return <Badge variant="outline">Charge projet</Badge>;
  }
  return null;
}

export function FreelancesBlock({
  projectId,
  costs,
  totalExternalCosts,
}: FreelancesBlockProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(
    null
  );
  const [costType, setCostType] = useState<ExternalCostType>("contractor");

  function handleAdd(formData: FormData) {
    formData.set("cost_type", costType);

    startTransition(async () => {
      const result = await addExternalCost(projectId, formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Coût ajouté");
      setDialogOpen(false);
      setCostType("contractor");
      router.refresh();
    });
  }

  function handleToggleStatus(cost: ExternalCostRow) {
    const nextStatus = getNextExternalCostStatus(cost.status);
    setUpdatingStatusId(cost.id);

    startTransition(async () => {
      const result = await updateExternalCostStatus(
        cost.id,
        projectId,
        nextStatus
      );
      setUpdatingStatusId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        nextStatus === "paid" ? "Marqué comme payé" : "Remis en attente"
      );
      router.refresh();
    });
  }

  function handleDelete(costId: string) {
    setDeletingId(costId);
    startTransition(async () => {
      const result = await deleteExternalCost(costId, projectId);
      setDeletingId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Coût retiré");
      router.refresh();
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            Coûts externes
          </CardTitle>
          <CardDescription>
            Prestataires et charges projet (hébergement, domaines, outils…)
          </CardDescription>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setCostType("contractor");
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un coût
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau coût externe</DialogTitle>
              <DialogDescription>
                Prestataire freelance ou charge liée au projet.
              </DialogDescription>
            </DialogHeader>

            <form action={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {COST_TYPES.map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={costType === type ? "default" : "outline"}
                      className={cn(
                        "h-auto py-2.5 text-left",
                        costType === type && "ring-2 ring-primary/30"
                      )}
                      onClick={() => setCostType(type)}
                      disabled={isPending}
                    >
                      <span className="block text-sm font-medium">
                        {EXTERNAL_COST_TYPE_LABELS[type]}
                      </span>
                    </Button>
                  ))}
                </div>
                <input type="hidden" name="cost_type" value={costType} />
              </div>

              {costType === "contractor" ? (
                <div className="space-y-2">
                  <Label htmlFor="freelance_name">Nom du prestataire</Label>
                  <Input
                    id="freelance_name"
                    name="freelance_name"
                    placeholder="Jean Dupont"
                    required
                    disabled={isPending}
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="role">
                  {costType === "contractor"
                    ? "Rôle / Mission"
                    : "Nature de la charge"}
                </Label>
                <Input
                  id="role"
                  name="role"
                  placeholder={
                    costType === "contractor"
                      ? "Intégrateur Tailwind, Motion Designer…"
                      : "Hébergement, domaine, licences…"
                  }
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_amount">Montant (€)</Label>
                <Input
                  id="cost_amount"
                  name="cost_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="450"
                  required
                  disabled={isPending}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-4">
        {costs.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            Aucun coût externe sur ce projet.
          </div>
        ) : (
          <ul className="divide-y rounded-lg border">
            {costs.map((cost) => {
              const title = getExternalCostDisplayTitle(cost);
              const subtitle = getExternalCostSubtitle(cost);

              return (
                <li
                  key={cost.id}
                  className="flex items-start justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{title}</p>
                      {typeBadge(cost.cost_type)}
                      <StatusToggle
                        status={cost.status}
                        disabled={isPending && updatingStatusId === cost.id}
                        onToggle={() => handleToggleStatus(cost)}
                      />
                    </div>
                    {subtitle ? (
                      <p className="text-sm text-muted-foreground">{subtitle}</p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <p className="font-semibold tabular-nums">
                      {formatCurrency(cost.cost_amount)}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(cost.id)}
                      disabled={isPending && deletingId === cost.id}
                      aria-label={`Supprimer ${title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Total des coûts externes
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
            {formatCurrency(totalExternalCosts)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
