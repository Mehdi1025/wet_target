"use client";

import { SERVICE_CLASSIFICATION_OPTIONS } from "@/lib/admin/project-constants";
import {
  formatCurrency,
  isBudgetBalanced,
  splitBudgetEvenly,
  sumBudgetShares,
} from "@/lib/admin/budget-allocation";
import type { ServiceId } from "@/types/database";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ServiceBudgetFieldsProps = {
  totalBudget: number;
  selectedServices: ServiceId[];
  budgetShares: Partial<Record<ServiceId, number>>;
  onSelectedServicesChange: (services: ServiceId[]) => void;
  onBudgetSharesChange: (shares: Partial<Record<ServiceId, number>>) => void;
  disabled?: boolean;
  autoSplitOnToggle?: boolean;
  computedTotalLabel?: string;
};

export function ServiceBudgetFields({
  totalBudget,
  selectedServices,
  budgetShares,
  onSelectedServicesChange,
  onBudgetSharesChange,
  disabled = false,
  autoSplitOnToggle = true,
  computedTotalLabel,
}: ServiceBudgetFieldsProps) {
  const allocatedTotal = sumBudgetShares(budgetShares, selectedServices);
  const displayTotal = computedTotalLabel ? allocatedTotal : totalBudget;
  const balanced = computedTotalLabel
    ? allocatedTotal > 0
    : isBudgetBalanced(totalBudget, budgetShares, selectedServices);

  function handleToggle(serviceId: ServiceId, checked: boolean) {
    const nextServices = checked
      ? [...selectedServices, serviceId]
      : selectedServices.filter((id) => id !== serviceId);

    onSelectedServicesChange(nextServices);

    if (autoSplitOnToggle) {
      onBudgetSharesChange(splitBudgetEvenly(totalBudget, nextServices));
      return;
    }

    if (checked) {
      onBudgetSharesChange({
        ...budgetShares,
        [serviceId]: budgetShares[serviceId] ?? 0,
      });
    } else {
      const nextShares = { ...budgetShares };
      delete nextShares[serviceId];
      onBudgetSharesChange(nextShares);
    }
  }

  function handleShareChange(serviceId: ServiceId, rawValue: string) {
    const amount = rawValue === "" ? 0 : Number(rawValue);
    onBudgetSharesChange({
      ...budgetShares,
      [serviceId]: Number.isFinite(amount) ? amount : 0,
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Pôles d&apos;activité</p>
        {selectedServices.length > 0 ? (
          <p
            className={cn(
              "text-xs tabular-nums",
              balanced ? "text-muted-foreground" : "text-destructive"
            )}
          >
            {computedTotalLabel ? (
              <>
                {computedTotalLabel} :{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(allocatedTotal)}
                </span>
              </>
            ) : (
              <>
                Total ventilé : {formatCurrency(allocatedTotal)} /{" "}
                {formatCurrency(displayTotal)}
              </>
            )}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        {SERVICE_CLASSIFICATION_OPTIONS.map((service) => {
          const checked = selectedServices.includes(service.id);
          const checkboxId = `service-budget-${service.id}`;

          return (
            <div
              key={service.id}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <Checkbox
                id={checkboxId}
                checked={checked}
                onCheckedChange={(value) =>
                  handleToggle(service.id, value === true)
                }
                disabled={disabled}
              />
              <Label
                htmlFor={checkboxId}
                className="min-w-0 flex-1 cursor-pointer font-normal"
              >
                {service.label}
              </Label>
              {checked ? (
                <div className="flex w-28 shrink-0 items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={budgetShares[service.id] ?? 0}
                    onChange={(event) =>
                      handleShareChange(service.id, event.target.value)
                    }
                    disabled={disabled}
                    className="h-8 text-right tabular-nums"
                    aria-label={`Budget ${service.label}`}
                  />
                  <span className="text-xs text-muted-foreground">€</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {selectedServices.length > 0 && !balanced ? (
        <p className="text-xs text-destructive">
          {computedTotalLabel
            ? "Indiquez un montant pour au moins un pôle sélectionné."
            : "La somme des parts doit être égale au budget total du projet."}
        </p>
      ) : null}
    </div>
  );
}
