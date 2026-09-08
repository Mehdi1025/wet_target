export const TVA_RATE = 0.2;
export const IS_RATE = 0.25;
export const URSSAF_RATE = 0.3;

export type FinancialBreakdown = {
  caHt: number;
  tvaCollectee: number;
  externalCosts: number;
  grossMargin: number;
  isProvision: number;
  urssafProvision: number;
  taxes: number;
  trueNetCash: number;
};

export type FinanceInputs = {
  caHt: number;
  externalCosts: number;
};

export function computeFinancialBreakdown(
  input: FinanceInputs
): FinancialBreakdown {
  const { caHt, externalCosts } = input;
  const tvaCollectee = roundCurrency(caHt * TVA_RATE);
  const grossMargin = roundCurrency(caHt - externalCosts);

  const taxableBase = Math.max(grossMargin, 0);
  const isProvision = roundCurrency(taxableBase * IS_RATE);
  const urssafProvision = roundCurrency(taxableBase * URSSAF_RATE);
  const taxes = roundCurrency(isProvision + urssafProvision);
  const trueNetCash = roundCurrency(grossMargin - taxes);

  return {
    caHt: roundCurrency(caHt),
    tvaCollectee,
    externalCosts: roundCurrency(externalCosts),
    grossMargin,
    isProvision,
    urssafProvision,
    taxes,
    trueNetCash,
  };
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
