import type { FinancePlanState, FirePlanSummary } from "../types/finance";
import { calculateScenarioProjection } from "./projections";
import { assumptionsForScenario, totalPlannedAnnualSavings } from "./common";

export function calculateFirePlan(state: FinancePlanState, scenarioId?: string): FirePlanSummary {
  const assumptions = assumptionsForScenario(state, scenarioId);
  const projection = calculateScenarioProjection(state, scenarioId);
  const fireNumber = state.household.fireNumberOverride
    ?? (state.household.targetAnnualRetirementSpending / assumptions.safeWithdrawalRate);
  const current = projection[0];
  const crossingIndex = projection.findIndex((point) => point.investableAssets >= point.fireTarget);
  const firePoint = crossingIndex >= 0 ? projection[crossingIndex] : undefined;
  const fireDateLabel = firePoint ? firePoint.label : "Not within horizon";
  const coastFireAge = calculateCoastFireAge(state, scenarioId);
  const desiredRetirementAge = state.household.desiredRetirementAge;
  const primaryAge = state.people[0]?.age ?? 30;
  const currentPlannedAnnualSavings = totalPlannedAnnualSavings(state);
  const requiredAnnualSavings = calculateRequiredAnnualSavings(
    current?.investableAssets ?? 0,
    fireNumber,
    assumptions.expectedReturn,
    desiredRetirementAge ? Math.max(0, desiredRetirementAge - primaryAge) : null
  );
  const requiredMonthlySavings = requiredAnnualSavings / 12;
  const annualSavingsGap = Math.max(0, requiredAnnualSavings - currentPlannedAnnualSavings);
  const onTrackToDesiredAge = desiredRetirementAge
    ? (firePoint?.age ?? Infinity) <= desiredRetirementAge
    : null;

  return {
    fireNumber,
    progress: current ? current.investableAssets / fireNumber : 0,
    fireDateLabel,
    fireAge: firePoint?.age ?? null,
    coastFireAge,
    desiredRetirementAge,
    requiredAnnualSavings,
    requiredMonthlySavings,
    currentPlannedAnnualSavings,
    annualSavingsGap,
    onTrackToDesiredAge
  };
}

function calculateCoastFireAge(state: FinancePlanState, scenarioId?: string): number | null {
  const assumptions = assumptionsForScenario(state, scenarioId);
  const currentInvestableAssets = calculateScenarioProjection(state, scenarioId)[0]?.investableAssets ?? 0;
  const target = state.household.targetAnnualRetirementSpending / assumptions.safeWithdrawalRate;
  const baseAge = state.people[0]?.age ?? 30;

  for (let years = 0; years <= assumptions.projectionYears; years += 1) {
    if (currentInvestableAssets * Math.pow(1 + assumptions.expectedReturn, years) >= target) {
      return baseAge + years;
    }
  }

  return null;
}

function calculateRequiredAnnualSavings(
  currentInvestableAssets: number,
  target: number,
  expectedReturn: number,
  yearsUntilTarget: number | null
): number {
  if (yearsUntilTarget === null) {
    return 0;
  }

  if (yearsUntilTarget <= 0) {
    return Math.max(0, target - currentInvestableAssets);
  }

  const futureValueOfCurrentAssets = currentInvestableAssets * Math.pow(1 + expectedReturn, yearsUntilTarget);
  const remainingGap = Math.max(0, target - futureValueOfCurrentAssets);

  if (remainingGap <= 0) {
    return 0;
  }

  if (expectedReturn === 0) {
    return remainingGap / yearsUntilTarget;
  }

  const annuityFactor = (Math.pow(1 + expectedReturn, yearsUntilTarget) - 1) / expectedReturn;
  return annuityFactor > 0 ? remainingGap / annuityFactor : remainingGap / yearsUntilTarget;
}
