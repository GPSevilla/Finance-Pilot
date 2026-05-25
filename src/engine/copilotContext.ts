import type { DashboardSnapshot, FinancePlanState } from "../types/finance";
import { annualBonusValue, getPeopleForPlanningType } from "./common";

export function buildCopilotContextString(state: FinancePlanState, dashboard: DashboardSnapshot): string {
  const activeScenario = state.scenarios.find((scenario) => scenario.id === state.uiPreferences.selectedScenarioId) ?? state.scenarios[0];
  const people = getPeopleForPlanningType(state);

  const personLines = people.map((person) => (
    `- ${person.name}: age ${person.age}, base income ${currency(person.annualIncome)}, bonus ${currency(annualBonusValue(person))}, monthly expenses ${currency(person.monthlyExpenses)}`
  )).join("\n");

  const accountLines = state.accounts.map((account) => (
    `- ${account.name}: ${account.type}, balance ${currency(account.balance)}`
  )).join("\n");

  const debtLines = state.debts.map((debt) => (
    `- ${debt.name}: ${debt.type}, balance ${currency(debt.balance)}, APR ${percent(debt.apr)}, minimum ${currency(debt.minimumPayment)}, planned ${currency(debt.plannedPayment ?? debt.minimumPayment)}`
  )).join("\n");

  const strategyLines = dashboard.strategy.priorityActions.map((action, index) => (
    `${index + 1}. ${action.title}: ${action.detail}`
  )).join("\n");

  return [
    "Finance Pilot current planner context",
    "",
    `Mode: ${state.profile.mode}`,
    `Planning type: ${state.profile.planningType}`,
    `Goal: ${state.profile.primaryGoal}`,
    `State: ${state.profile.state}`,
    `Filing status: ${state.profile.filingStatus}`,
    `Selected scenario: ${activeScenario.name}`,
    "",
    "People",
    personLines || "- None",
    "",
    "Accounts",
    accountLines || "- None",
    "",
    "Debts",
    debtLines || "- None",
    "",
    "Liquidity summary",
    `- Total net worth: ${currency(dashboard.liquidity.totalNetWorth)}`,
    `- Liquid net worth: ${currency(dashboard.liquidity.liquidNetWorth)}`,
    `- Accessible today: ${currency(dashboard.liquidity.accessibleToday)}`,
    `- Retirement net worth: ${currency(dashboard.liquidity.retirementNetWorth)}`,
    `- Emergency fund runway: ${dashboard.liquidity.emergencyFundRunwayMonths.toFixed(1)} months`,
    "",
    "Tax summary",
    `- Gross annual income: ${currency(dashboard.tax.grossAnnualIncome)}`,
    `- Monthly take-home income: ${currency(dashboard.tax.takeHomeMonthlyIncome)}`,
    `- Effective tax rate: ${percent(dashboard.tax.effectiveTaxRate)}`,
    `- Marginal tax rate: ${percent(dashboard.tax.marginalTaxRate)}`,
    "",
    "Debt summary",
    `- Avalanche debt-free: ${dashboard.debtAvalanche.debtFreeDateLabel}`,
    `- Avalanche interest: ${currency(dashboard.debtAvalanche.totalInterestPaid)}`,
    `- Snowball debt-free: ${dashboard.debtSnowball.debtFreeDateLabel}`,
    `- Snowball interest: ${currency(dashboard.debtSnowball.totalInterestPaid)}`,
    "",
    "FIRE summary",
    `- FIRE number: ${currency(dashboard.fire.fireNumber)}`,
    `- FIRE progress: ${percent(dashboard.fire.progress)}`,
    `- FIRE date: ${dashboard.fire.fireDateLabel}`,
    `- Desired retirement age: ${state.household.desiredRetirementAge ?? "Not set"}`,
    `- Required annual savings: ${currency(dashboard.fire.requiredAnnualSavings)}`,
    "",
    "Money flow summary",
    `- Monthly take-home inflow: ${currency(dashboard.moneyFlow.takeHomeMonthlyIncome)}`,
    `- Living expenses: ${currency(dashboard.moneyFlow.livingExpensesMonthly)}`,
    `- Required debt payments: ${currency(dashboard.moneyFlow.requiredDebtPaymentsMonthly)}`,
    `- Available allocation pool: ${currency(dashboard.moneyFlow.availableAllocationPoolMonthly)}`,
    `- Extra debt allocation: ${currency(dashboard.moneyFlow.actualExtraDebtMonthly)}`,
    `- Extra investing allocation: ${currency(dashboard.moneyFlow.actualExtraInvestingMonthly)}`,
    `- Extra cash allocation: ${currency(dashboard.moneyFlow.actualExtraCashMonthly)}`,
    `- Gross savings rate: ${percent(dashboard.moneyFlow.grossSavingsRate)}`,
    `- Take-home savings rate: ${percent(dashboard.moneyFlow.takeHomeSavingsRate)}`,
    "",
    "Scenario assumptions",
    `- Expected return: ${percent(activeScenario.assumptions.expectedReturn)}`,
    `- Inflation: ${percent(activeScenario.assumptions.inflation)}`,
    `- Income growth: ${percent(activeScenario.assumptions.incomeGrowth)}`,
    `- Expense growth: ${percent(activeScenario.assumptions.expenseGrowth)}`,
    `- Safe withdrawal rate: ${percent(activeScenario.assumptions.safeWithdrawalRate)}`,
    "",
    "Current strategy recommendation",
    strategyLines || "- None"
  ].join("\n");
}

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function percent(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value * 100)}%`;
}
