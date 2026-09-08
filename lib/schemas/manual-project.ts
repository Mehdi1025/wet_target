import { z } from "zod";

import { BUDGET_TOLERANCE } from "@/lib/admin/budget-allocation";

const serviceIdEnum = z.enum([
  "branding",
  "sites-web",
  "reseaux-sociaux",
  "publicite",
  "automatisation",
]);

const serviceBudgetAllocationSchema = z.object({
  serviceId: serviceIdEnum,
  budgetShare: z
    .number({ message: "Le montant doit être un nombre." })
    .min(0, "Le montant ne peut pas être négatif."),
});

export const manualProjectSchema = z
  .object({
    clientId: z.string().uuid().nullable().optional(),
    clientName: z.string().trim().optional(),
    clientEmail: z.string().trim().optional(),
    clientCompany: z.string().trim().optional(),
    title: z.string().trim().min(1, "Le nom du projet est requis."),
    description: z.string().trim().optional(),
    deadline: z.string().trim().nullable().optional(),
    budget: z
      .number({ message: "Le budget doit être un nombre." })
      .min(1, "Indiquez le budget contractuel du projet."),
    allocatedDays: z
      .number({ message: "Les jours alloués doivent être un nombre." })
      .int("Les jours alloués doivent être un entier.")
      .min(0, "Les jours alloués ne peuvent pas être négatifs"),
    selectedServices: z
      .array(serviceIdEnum)
      .min(1, "Sélectionnez au moins un pôle d'activité."),
    serviceBudgets: z
      .array(serviceBudgetAllocationSchema)
      .min(1, "Ventilez le budget entre les pôles sélectionnés."),
  })
  .superRefine((data, ctx) => {
    if (data.clientId) {
      return;
    }

    if (!data.clientName || data.clientName.length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Le nom du client est requis.",
        path: ["clientName"],
      });
    }

    if (!data.clientEmail || !z.string().email().safeParse(data.clientEmail).success) {
      ctx.addIssue({
        code: "custom",
        message: "Adresse email invalide.",
        path: ["clientEmail"],
      });
    }

    if (!data.clientCompany || data.clientCompany.length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "L'entreprise est requise.",
        path: ["clientCompany"],
      });
    }
  })
  .superRefine((data, ctx) => {
    const selectedSet = new Set(data.selectedServices);
    const allocations = data.serviceBudgets.filter((entry) =>
      selectedSet.has(entry.serviceId)
    );

    if (allocations.length !== data.selectedServices.length) {
      ctx.addIssue({
        code: "custom",
        message: "Chaque pôle sélectionné doit avoir une part de budget.",
        path: ["serviceBudgets"],
      });
      return;
    }

    const allocatedTotal = allocations.reduce(
      (sum, entry) => sum + entry.budgetShare,
      0
    );

    if (allocatedTotal <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Ventilez le budget entre les pôles sélectionnés.",
        path: ["serviceBudgets"],
      });
      return;
    }

    if (Math.abs(allocatedTotal - data.budget) > BUDGET_TOLERANCE) {
      ctx.addIssue({
        code: "custom",
        message: "La ventilation doit être égale au budget total du projet.",
        path: ["serviceBudgets"],
      });
    }
  });

export type ManualProjectInput = z.infer<typeof manualProjectSchema>;

export { serviceBudgetAllocationSchema, serviceIdEnum };
