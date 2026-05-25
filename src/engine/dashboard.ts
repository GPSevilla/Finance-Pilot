import type { CopilotContext, DashboardSnapshot, FinancePlanState } from "../types/finance";
import { calculateDebtPlan } from "./debt";
import { calculateFairnessSummary } from "./dualIncome";
import { calculateFirePlan } from "./fire";
import { calculateLiquidity } from "./liquidity";
import { calculateMoneyFlowSummary } from "./moneyFlow";
import { calculateScenarioProjection } from "./projections";
import { calculateStrategyRecommendation } from "./strategy";
import { calculateTaxPlan } from "./tax";

export function calculateDashboardSnapshot(state: FinancePlanState, scenarioId?: string): DashboardSnapshot {
  const activeScenarioId = scenarioId ?? state.uiPreferences.selectedScenarioId;
  const liquidity = calculateLiquidity(state);
  const tax = calculateTaxPlan(state);
  const debtAvalanche = calculateDebtPlan(state.debts, "avalanche");
  const debtSnowball = calculateDebtPlan(state.debts, "snowball");
  const moneyFlow = calculateMoneyFlowSummary(state, activeScenarioId);
  const fire = calculateFirePlan(state, activeScenarioId);
  const strategy = calculateStrategyRecommendation(state);
  const fairness = calculateFairnessSummary(state);
  const activeProjection = calculateScenarioProjection(state, activeScenarioId);

  return {
    liquidity,
    tax,
    debtAvalanche,
    debtSnowball,
    activeDebtPlan: state.cashFlow.strategy === "snowball" ? debtSnowball : debtAvalanche,
    moneyFlow,
    fire,
    activeProjection,
    scenarioComparison: state.scenarios.map((scenario) => {
      const projection = calculateScenarioProjection(state, scenario.id);
      const final = projection[projection.length - 1];
      return {
        id: scenario.id,
        name: scenario.name,
        finalNetWorth: final?.netWorth ?? 0,
        fireDateLabel: calculateFirePlan(state, scenario.id).fireDateLabel,
        debtFreeDateLabel: debtAvalanche.debtFreeDateLabel,
        liquidNetWorth: final?.liquidNetWorth ?? 0,
        monthlySurplus: final?.monthlySurplus ?? 0
      };
    }),
    strategy,
    fairness
  };
}

export function buildCopilotContext(state: FinancePlanState): CopilotContext {
  return {
    summary: calculateDashboardSnapshot(state),
    goal: state.profile.primaryGoal,
    selectedScenario: state.uiPreferences.selectedScenarioId,
    assumptions: state.assumptions
  };
}
