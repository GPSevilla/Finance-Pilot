import { ACCOUNT_TYPE_OPTIONS } from "../data/defaults";
import type {
  DebtAccount,
  FinancePlanState,
  FinancialAccount,
  LiquidityTier,
  PersonPlan,
  ProjectionAssumptions,
  Scenario
} from "../types/finance";
import { roundCurrency } from "../utils/formatting";

export function findScenario(state: FinancePlanState, scenarioId?: string): Scenario {
  const selectedId = scenarioId ?? state.uiPreferences.selectedScenarioId;
  return state.scenarios.find((scenario) => scenario.id === selectedId) ?? state.scenarios[0];
}

export function assumptionsForScenario(state: FinancePlanState, scenarioId?: string): ProjectionAssumptions {
  return findScenario(state, scenarioId)?.assumptions ?? state.assumptions;
}

export function resolveLiquidityTier(account: FinancialAccount): LiquidityTier {
  if (account.liquidityTier) {
    return account.liquidityTier;
  }
  return ACCOUNT_TYPE_OPTIONS.find((option) => option.value === account.type)?.liquidityTier ?? "illiquid";
}

export function sumAccountContributionAnnual(account: FinancialAccount): number {
  return Number(account.annualContribution ?? 0) + Number(account.monthlyContribution ?? 0) * 12;
}

export function getPeopleForPlanningType(state: FinancePlanState): PersonPlan[] {
  return state.profile.planningType === "single" ? state.people.filter((person) => person.id === "personA") : state.people;
}

export function totalIncome(people: PersonPlan[]): number {
  return people.reduce((sum, person) => sum + person.annualIncome + annualBonusValue(person), 0);
}

export function annualBonusValue(person: PersonPlan): number {
  if (person.annualBonusMode === "percent") {
    return person.annualIncome * person.annualBonusPercent;
  }
  return person.annualBonus;
}

export function totalPretaxContributions(people: PersonPlan[]): number {
  return people.reduce((sum, person) => sum + person.preTaxContributionAnnual + person.hsaContributionAnnual, 0);
}

export function totalRothContributions(people: PersonPlan[]): number {
  return people.reduce((sum, person) => sum + person.rothContributionAnnual, 0);
}

export function totalPersonalMonthlyExpenses(people: PersonPlan[]): number {
  return people.reduce((sum, person) => sum + person.monthlyExpenses, 0);
}

export function totalDebtMinimums(debts: DebtAccount[]): number {
  return debts.reduce((sum, debt) => sum + plannedDebtPayment(debt), 0);
}

export function totalAccountBalances(accounts: FinancialAccount[]): number {
  return accounts.reduce((sum, account) => sum + account.balance, 0);
}

export function totalDebtBalances(debts: DebtAccount[]): number {
  return debts.reduce((sum, debt) => sum + debt.balance, 0);
}

export function totalInvestableAssets(accounts: FinancialAccount[]): number {
  return accounts.reduce((sum, account) => {
    const tier = resolveLiquidityTier(account);
    if (tier === "immediate" || tier === "flexible" || tier === "conditional" || tier === "restricted") {
      return sum + account.balance;
    }
    return sum;
  }, 0);
}

export function totalPlannedAnnualSavings(state: FinancePlanState): number {
  const personContributions = state.people.reduce(
    (sum, person) => sum + person.preTaxContributionAnnual + person.rothContributionAnnual + person.hsaContributionAnnual,
    0
  );
  const accountContributions = state.accounts.reduce((sum, account) => sum + sumAccountContributionAnnual(account), 0);
  return personContributions + accountContributions;
}

export function personMonthlyContribution(person: PersonPlan): number {
  return (person.preTaxContributionAnnual + person.rothContributionAnnual + person.hsaContributionAnnual) / 12;
}

export function ownerWeight(state: FinancePlanState, owner: FinancialAccount["owner"] | DebtAccount["owner"], personId: "personA" | "personB"): number {
  if (state.profile.planningType === "single") {
    return personId === "personA" ? 1 : 0;
  }

  if (owner === "shared" || !owner) {
    return 0.5;
  }

  return owner === personId ? 1 : 0;
}

export function plannedDebtPayment(debt: DebtAccount): number {
  const requiredForTerm = requiredDebtPaymentForTerm(debt);
  return Math.max(
    debt.minimumPayment,
    Number(debt.plannedPayment ?? (debt.minimumPayment + Number(debt.extraPayment ?? 0))),
    requiredForTerm
  );
}

export function requiredDebtPaymentForTerm(debt: DebtAccount): number {
  if (debt.type === "credit_card" || !debt.remainingTermMonths || debt.remainingTermMonths <= 0) {
    return 0;
  }

  const principal = Math.max(0, debt.balance);
  const months = debt.remainingTermMonths;
  const monthlyRate = debt.apr / 12;

  if (principal <= 0) {
    return 0;
  }

  if (monthlyRate === 0) {
    return principal / months;
  }

  const denominator = 1 - Math.pow(1 + monthlyRate, -months);
  if (denominator <= 0) {
    return roundCurrency(principal / months);
  }

  return roundCurrency((principal * monthlyRate) / denominator);
}
