"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Zap } from "lucide-react";
import { toast } from "sonner";

import { createManualProject } from "@/lib/actions/projects";
import {
  ClientSelector,
} from "@/components/admin/clients/client-selector";
import {
  formatCurrency,
  isBudgetBalanced,
  splitBudgetEvenly,
  toServiceBudgetAllocations,
} from "@/lib/admin/budget-allocation";
import {
  manualProjectSchema,
  type ManualProjectInput,
} from "@/lib/schemas/manual-project";
import type { ClientPickerOption } from "@/lib/supabase/clients";
import type { ServiceId } from "@/types/database";
import { ServiceBudgetFields } from "@/components/admin/service-budget-fields";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type ManualProjectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientPickerOption[];
  defaultServiceId?: ServiceId;
  defaultClientId?: string;
};

function SectionTitle({
  step,
  title,
}: {
  step: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {step}
      </span>
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
    </div>
  );
}

export function ManualProjectSheet({
  open,
  onOpenChange,
  clients,
  defaultServiceId,
  defaultClientId,
}: ManualProjectSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [selectedServices, setSelectedServices] = useState<ServiceId[]>(
    defaultServiceId ? [defaultServiceId] : []
  );
  const [budgetShares, setBudgetShares] = useState<
    Partial<Record<ServiceId, number>>
  >({});

  const form = useForm<ManualProjectInput>({
    resolver: zodResolver(manualProjectSchema),
    defaultValues: {
      clientId: null,
      clientName: "",
      clientEmail: "",
      clientCompany: "",
      title: "",
      description: "",
      deadline: null,
      budget: 0,
      allocatedDays: 0,
      selectedServices: defaultServiceId ? [defaultServiceId] : [],
      serviceBudgets: [],
    },
  });

  const budget = form.watch("budget");
  const lockedClient = defaultClientId
    ? clients.find((client) => client.id === defaultClientId)
    : undefined;

  useEffect(() => {
    if (selectedServices.length > 0 && budget > 0) {
      setBudgetShares(splitBudgetEvenly(budget, selectedServices));
    }
  }, [budget, selectedServices]);

  useEffect(() => {
    form.setValue("selectedServices", selectedServices, { shouldValidate: true });
    form.setValue(
      "serviceBudgets",
      toServiceBudgetAllocations(budgetShares, selectedServices),
      { shouldValidate: true }
    );
  }, [selectedServices, budgetShares, form]);

  useEffect(() => {
    if (!open) return;

    const services = defaultServiceId ? [defaultServiceId] : [];
    setIsCreatingClient(false);
    setSelectedServices(services);
    setBudgetShares({});

    form.reset({
      clientId: defaultClientId ?? null,
      clientName: "",
      clientEmail: "",
      clientCompany: "",
      title: "",
      description: "",
      deadline: null,
      budget: 0,
      allocatedDays: 0,
      selectedServices: services,
      serviceBudgets: [],
    });
  }, [open, defaultServiceId, defaultClientId, form]);

  function handleInvalidSubmit() {
    const firstError = Object.values(form.formState.errors)[0]?.message;
    toast.error(
      typeof firstError === "string"
        ? firstError
        : "Complétez tous les champs requis avant de créer le projet."
    );
  }

  function handleSubmit(values: ManualProjectInput) {
    if (!isBudgetBalanced(budget, budgetShares, selectedServices)) {
      toast.error("La ventilation doit être égale au budget total du projet.");
      return;
    }

    const payload: ManualProjectInput = {
      ...values,
      clientId:
        defaultClientId ?? (isCreatingClient ? null : values.clientId ?? null),
      budget,
      selectedServices,
      serviceBudgets: toServiceBudgetAllocations(
        budgetShares,
        selectedServices
      ),
    };

    startTransition(async () => {
      const result = await createManualProject(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Projet créé — ouverture de la fiche 360…");
      onOpenChange(false);
      router.push(`/admin/projects/${result.projectId}`);
    });
  }

  const canSubmit =
    budget > 0 &&
    selectedServices.length > 0 &&
    isBudgetBalanced(budget, budgetShares, selectedServices) &&
    (defaultClientId
      ? true
      : isCreatingClient
        ? Boolean(
            form.watch("clientName")?.trim() &&
              form.watch("clientEmail")?.trim() &&
              form.watch("clientCompany")?.trim()
          )
        : Boolean(form.watch("clientId")));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Omni-Launch — Nouveau projet
          </SheetTitle>
          <SheetDescription>
            Création manuelle gré à gré — bouche-à-oreille, upsell, hors CRM.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)}
            className="mt-6 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-24"
          >
            <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <SectionTitle step="1" title="Le client" />

              <FormField
                control={form.control}
                name="clientId"
                render={() => (
                  <FormItem>
                    <FormLabel>Client / Entreprise</FormLabel>
                    <FormControl>
                      <ClientSelector
                        clients={clients}
                        selectedClientId={form.watch("clientId") ?? null}
                        onSelectClient={(clientId) => {
                          form.setValue("clientId", clientId, {
                            shouldValidate: true,
                          });
                          if (clientId) {
                            setIsCreatingClient(false);
                            form.setValue("clientName", "");
                            form.setValue("clientEmail", "");
                            form.setValue("clientCompany", "");
                          }
                        }}
                        newClient={{
                          name: form.watch("clientName") ?? "",
                          email: form.watch("clientEmail") ?? "",
                          company: form.watch("clientCompany") ?? "",
                        }}
                        onNewClientChange={(patch) => {
                          if (patch.name !== undefined) {
                            form.setValue("clientName", patch.name, {
                              shouldValidate: true,
                            });
                          }
                          if (patch.email !== undefined) {
                            form.setValue("clientEmail", patch.email, {
                              shouldValidate: true,
                            });
                          }
                          if (patch.company !== undefined) {
                            form.setValue("clientCompany", patch.company, {
                              shouldValidate: true,
                            });
                          }
                        }}
                        isCreating={isCreatingClient}
                        onIsCreatingChange={(creating) => {
                          setIsCreatingClient(creating);
                          if (creating) {
                            form.setValue("clientId", null, {
                              shouldValidate: true,
                            });
                          } else {
                            form.setValue("clientName", "");
                            form.setValue("clientEmail", "");
                            form.setValue("clientCompany", "");
                          }
                        }}
                        disabled={isPending}
                        lockedClient={
                          defaultClientId && lockedClient
                            ? lockedClient
                            : undefined
                        }
                      />
                    </FormControl>
                    <FormMessage />
                    {isCreatingClient ? (
                      <div className="space-y-1">
                        {form.formState.errors.clientName ? (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.clientName.message}
                          </p>
                        ) : null}
                        {form.formState.errors.clientEmail ? (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.clientEmail.message}
                          </p>
                        ) : null}
                        {form.formState.errors.clientCompany ? (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.clientCompany.message}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <SectionTitle step="2" title="Le projet" />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du projet</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Refonte Site Web Corporate"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline prévue (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(event.target.value || null)
                        }
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <SectionTitle step="3" title="Budget & services" />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget contractuel (€ HT)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        placeholder="15000"
                        value={field.value || ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? 0
                              : Number(event.target.value)
                          )
                        }
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {budget > 0 ? (
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <p className="font-medium">Budget total</p>
                  <p className="text-lg font-bold tabular-nums">
                    {formatCurrency(budget)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ventilez ce montant entre les pôles concernés.
                  </p>
                </div>
              ) : null}

              <ServiceBudgetFields
                totalBudget={budget}
                selectedServices={selectedServices}
                budgetShares={budgetShares}
                onSelectedServicesChange={setSelectedServices}
                onBudgetSharesChange={setBudgetShares}
                disabled={isPending || budget <= 0}
              />
            </section>

            <Separator />

            <div className="sticky bottom-0 -mx-6 border-t bg-background/95 px-6 py-4 backdrop-blur">
              <Button
                type="submit"
                className="w-full"
                disabled={isPending || !canSubmit}
              >
                {isPending ? "Création en cours…" : "Créer et ouvrir la fiche 360"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
