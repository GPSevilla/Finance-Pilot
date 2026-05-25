import type { FinancePlanState, ProjectionPoint } from "../types/finance";
import { roundCurrency } from "../utils/formatting";
import { calculateDebtPlan } from "./debt";
import { assumptionsForScenario, findScenario, getPeopleForPlanningType, resolveLiquidityTier, totalIncome, totalInvestableAssets } from "./common";
import { calculateLiquidity } from "./liquidity";
import { calculateTaxPlan } from "./tax";

export function calculateScenarioProjection(state: FinancePlanState, scenarioId?: string): ProjectionPoint[] {
  const scenario = findScenario(state, scenarioId);
  const assumptions = assumptionsForScenario(state, scenario.id);
  const people = getPeopleForPlanningType(state);
  const tax = calculateTaxPlan(state);
  const debtPlan = calculateDebtPlan(state.debts, "avalanche");
  const currentYear = new Date().getFullYear();
  const points: ProjectionPoint[] = [];
  const liquiditySnapshot = calculateLiquidity(state);
  let annualIncome = totalIncome(people);
  let annualExpenses = (people.reduce((sum, person) => sum + person.monthlyExpenses, 0) + state.household.sharedMonthlyExpenses + state.household.sharedSavingsGoals) * 12;
  let currentImmediateLiquidity = liquiditySnapshot.tierTotals.immediate;
  let currentFlexibleAssets = liquiditySnapshot.tierTotals.flexible;
  let currentConditionalAssets = liquiditySnapshot.tierTotals.conditional;
  let currentRestrictedRetirement = liquiditySnapshot.tierTotals.restricted;
  let currentIlliquidAssets = liquiditySnapshot.tierTotals.illiquid;
  const baseNetWorth = liquiditySnapshot.totalNetWorth;
  const primaryAge = people[0]?.age ?? 30;
  const annualContributionBase = state.accounts.reduce((sum, account) => sum + Number(account.monthlyContribution ?? 0) * 12 + Number(account.annualContribution ?? 0), 0)
    + people.reduce((sum, person) => sum + person.preTaxContributionAnnual + person.rothContributionAnnual + person.hsaContributionAnnual, 0);
  const retirementAccessAge = 59.5;

  for (let yearOffset = 0; yearOffset <= assumptions.projectionYears; yearOffset += 1) {
    const age = primaryAge + yearOffset;
    const eventDelta = (scenario.oneTimeEvents ?? [])
      .filter((event) => event.year === currentYear + yearOffset)
      .reduce((sum, event) => {
        if (event.type === "income") {
          return sum + event.amount;
        }
        if (event.type === "home_purchase") {
          return sum - (event.downPayment ?? event.amount) - (event.purchaseCosts ?? 0);
        }
        return sum - event.amount;
      }, 0);

    const annualContributions = scenario.monthlyInvestmentContributionOverride
      ? scenario.monthlyInvestmentContributionOverride * 12
      : annualContributionBase;
    const debtDragRelease = debtPlan.debtFreeMonth !== null && yearOffset * 12 > debtPlan.debtFreeMonth
      ? state.debts.reduce((sum, debt) => sum + Math.max(debt.minimumPayment, Number(debt.plannedPayment ?? debt.minimumPayment + Number(debt.extraPayment ?? 0))), 0) * 12
      : 0;
    const annualSurplus = Math.max(0, annualIncome - annualIncome * tax.effectiveTaxRate - annualExpenses - annualContributions + debtDragRelease + eventDelta);
    if (yearOffset > 0) {
      currentImmediateLiquidity = Math.max(0, currentImmediateLiquidity + annualSurplus * 0.35 + eventDelta);
      currentFlexibleAssets = Math.max(0, currentFlexibleAssets * (1 + assumptions.expectedReturn) + annualSurplus * 0.25 + annualContributions * 0.3);
      currentConditionalAssets = Math.max(0, currentConditionalAssets * (1 + assumptions.expectedReturn * 0.4) + annualSurplus * 0.05);
      currentRestrictedRetirement = Math.max(0, currentRestrictedRetirement * (1 + assumptions.expectedReturn) + annualContributions * 0.7 + annualSurplus * 0.35);
      currentIlliquidAssets = currentIlliquidAssets * (1 + assumptions.expectedReturn * 0.2);
    }
    const baseFireNumber = state.household.fireNumberOverride
      ?? (state.household.targetAnnualRetirementSpending / assumptions.safeWithdrawalRate);
    const fireTarget = baseFireNumber * Math.pow(1 + assumptions.inflation, yearOffset);
    const unlockedRetirementAssets = age >= retirementAccessAge ? currentRestrictedRetirement : 0;
    const displayedLiquidAssets = currentImmediateLiquidity + currentFlexibleAssets + currentConditionalAssets + unlockedRetirementAssets;
    const displayedRestrictedAssets = (age >= retirementAccessAge ? 0 : currentRestrictedRetirement) + currentIlliquidAssets;
    const investableAssets = currentFlexibleAssets + currentConditionalAssets + currentRestrictedRetirement;
    const projectedNetWorth = yearOffset === 0
      ? baseNetWorth
      : displayedLiquidAssets + displayedRestrictedAssets - projectedDebtRemainder(state, yearOffset);

    points.push({
      yearOffset,
      label: `${currentYear + yearOffset}`,
      age,
      netWorth: roundCurrency(projectedNetWorth),
      liquidNetWorth: roundCurrency(displayedLiquidAssets),
      restrictedWealth: roundCurrency(displayedRestrictedAssets),
      monthlySurplus: roundCurrency(annualSurplus / 12),
      investableAssets: roundCurrency(investableAssets),
      fireTarget: roundCurrency(fireTarget),
      fireProgress: fireTarget > 0 ? investableAssets / fireTarget : 0
    });

    annualIncome *= 1 + assumptions.incomeGrowth;
    annualExpenses *= 1 + assumptions.expenseGrowth;
  }

  return points;
}
function projectedDebtRemainder(state: FinancePlanState, yearOffset: number): number {
  const debtPlan = calculateDebtPlan(state.debts, "avalanche");
  if (debtPlan.debtFreeMonth !== null && yearOffset * 12 >= debtPlan.debtFreeMonth) {
    return 0;
  }
  const decayFactor = Math.max(0, 1 - yearOffset / Math.max(1, state.assumptions.projectionYears));
  return state.debts.reduce((sum, debt) => sum + debt.balance, 0) * decayFactor;
}
