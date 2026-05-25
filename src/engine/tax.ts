import type { FilingStatus, FinancePlanState, TaxPlanSummary } from "../types/finance";
import { roundCurrency } from "../utils/formatting";
import { getPeopleForPlanningType, totalIncome, totalPretaxContributions } from "./common";

const FEDERAL_BRACKETS: Record<FilingStatus, Array<{ upTo: number; rate: number }>> = {
  single: [
    { upTo: 11600, rate: 0.1 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243725, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 }
  ],
  married_filing_jointly: [
    { upTo: 23200, rate: 0.1 },
    { upTo: 94300, rate: 0.12 },
    { upTo: 201050, rate: 0.22 },
    { upTo: 383900, rate: 0.24 },
    { upTo: 487450, rate: 0.32 },
    { upTo: 731200, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 }
  ],
  married_filing_separately: [
    { upTo: 11600, rate: 0.1 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243725, rate: 0.32 },
    { upTo: 365600, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 }
  ],
  head_of_household: [
    { upTo: 16550, rate: 0.1 },
    { upTo: 63100, rate: 0.12 },
    { upTo: 100500, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243700, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 }
  ]
};

const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 14600,
  married_filing_jointly: 29200,
  married_filing_separately: 14600,
  head_of_household: 21900
};

const CA_BRACKETS: Array<{ upTo: number; rate: number }> = [
  { upTo: 10412, rate: 0.01 },
  { upTo: 24684, rate: 0.02 },
  { upTo: 38959, rate: 0.04 },
  { upTo: 54081, rate: 0.06 },
  { upTo: 68350, rate: 0.08 },
  { upTo: 349137, rate: 0.093 },
  { upTo: Infinity, rate: 0.103 }
];

export function calculateTaxPlan(state: FinancePlanState): TaxPlanSummary {
  const people = getPeopleForPlanningType(state);
  const grossAnnualIncome = totalIncome(people);
  const pretaxContributions = totalPretaxContributions(people);
  const taxableAnnualIncome = Math.max(0, grossAnnualIncome - pretaxContributions - STANDARD_DEDUCTION[state.taxProfile.filingStatus]);
  const federalIncomeTax = progressiveTax(taxableAnnualIncome, FEDERAL_BRACKETS[state.taxProfile.filingStatus]);
  const payrollTax = calculatePayrollTax(grossAnnualIncome);
  const { stateIncomeTax, stateOverrideRequired } = estimateStateTax(
    state.taxProfile.state,
    taxableAnnualIncome,
    state.taxProfile.stateTaxMode === "manual_override" ? state.taxProfile.stateTaxRateOverride : undefined
  );
  const totalTax = federalIncomeTax + payrollTax + stateIncomeTax;
  const effectiveTaxRate = state.taxProfile.effectiveTaxRateOverride ?? (grossAnnualIncome > 0 ? totalTax / grossAnnualIncome : 0);
  const marginalTaxRate = state.taxProfile.marginalTaxRateOverride ?? marginalRateForIncome(taxableAnnualIncome, FEDERAL_BRACKETS[state.taxProfile.filingStatus]);
  const takeHomeAnnualIncome = grossAnnualIncome - totalTax - people.reduce((sum, person) => sum + person.preTaxContributionAnnual + person.rothContributionAnnual + person.hsaContributionAnnual, 0);

  return {
    grossAnnualIncome: roundCurrency(grossAnnualIncome),
    taxableAnnualIncome: roundCurrency(taxableAnnualIncome),
    federalIncomeTax: roundCurrency(federalIncomeTax),
    payrollTax: roundCurrency(payrollTax),
    stateIncomeTax: roundCurrency(stateIncomeTax),
    totalTax: roundCurrency(totalTax),
    effectiveTaxRate,
    marginalTaxRate,
    takeHomeAnnualIncome: roundCurrency(takeHomeAnnualIncome),
    takeHomeMonthlyIncome: roundCurrency(takeHomeAnnualIncome / 12),
    stateOverrideRequired
  };
}

function progressiveTax(income: number, brackets: Array<{ upTo: number; rate: number }>): number {
  let remaining = income;
  let previousLimit = 0;
  let tax = 0;
  for (const bracket of brackets) {
    if (remaining <= 0) {
      break;
    }
    const taxableAtBracket = Math.min(bracket.upTo - previousLimit, remaining);
    tax += taxableAtBracket * bracket.rate;
    remaining -= taxableAtBracket;
    previousLimit = bracket.upTo;
  }
  return tax;
}

function marginalRateForIncome(income: number, brackets: Array<{ upTo: number; rate: number }>): number {
  return brackets.find((bracket) => income <= bracket.upTo)?.rate ?? brackets[brackets.length - 1].rate;
}

function calculatePayrollTax(income: number): number {
  const socialSecurityWageBase = 176100;
  const socialSecurity = Math.min(income, socialSecurityWageBase) * 0.062;
  const medicare = income * 0.0145;
  return socialSecurity + medicare;
}

function estimateStateTax(stateCode: string, taxableIncome: number, manualRate?: number): { stateIncomeTax: number; stateOverrideRequired: boolean } {
  if (typeof manualRate === "number") {
    return {
      stateIncomeTax: taxableIncome * manualRate,
      stateOverrideRequired: false
    };
  }

  if (stateCode === "WA" || stateCode === "FL") {
    return { stateIncomeTax: 0, stateOverrideRequired: false };
  }

  if (stateCode === "AZ") {
    return { stateIncomeTax: taxableIncome * 0.025, stateOverrideRequired: false };
  }

  if (stateCode === "CA") {
    return { stateIncomeTax: progressiveTax(taxableIncome, CA_BRACKETS), stateOverrideRequired: false };
  }

  return {
    stateIncomeTax: 0,
    stateOverrideRequired: true
  };
}
