import type { ServiceId } from "@/types/database";

export type ServiceBudgetAllocation = {
  serviceId: ServiceId;
  budgetShare: number;
};

export const BUDGET_TOLERANCE = 0.01;

export function formatCurrency(amount: number) {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function splitBudgetEvenly(
  totalBudget: number,
  serviceIds: ServiceId[]
): Partial<Record<ServiceId, number>> {
  if (serviceIds.length === 0) return {};

  const count = serviceIds.length;
  const base = Math.floor((totalBudget / count) * 100) / 100;
  const shares: Partial<Record<ServiceId, number>> = {};
  let allocated = 0;

  serviceIds.forEach((id, index) => {
    if (index === count - 1) {
      shares[id] = Math.round((totalBudget - allocated) * 100) / 100;
      return;
    }
    shares[id] = base;
    allocated += base;
  });

  return shares;
}

export function sumBudgetShares(
  shares: Partial<Record<ServiceId, number>>,
  selectedServices: ServiceId[]
): number {
  return selectedServices.reduce(
    (sum, serviceId) => sum + (shares[serviceId] ?? 0),
    0
  );
}

export function isBudgetBalanced(
  totalBudget: number,
  shares: Partial<Record<ServiceId, number>>,
  selectedServices: ServiceId[]
): boolean {
  const allocated = sumBudgetShares(shares, selectedServices);
  return Math.abs(allocated - totalBudget) <= BUDGET_TOLERANCE;
}

export function toServiceBudgetAllocations(
  shares: Partial<Record<ServiceId, number>>,
  selectedServices: ServiceId[]
): ServiceBudgetAllocation[] {
  return selectedServices.map((serviceId) => ({
    serviceId,
    budgetShare: shares[serviceId] ?? 0,
  }));
}
