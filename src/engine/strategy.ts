import type { FinancePlanState, StrategyAction, StrategyRecommendation } from "../types/finance";
import { calculateDebtPlan } from "./debt";
import { calculateFirePlan } from "./fire";
import { calculateLiquidity } from "./liquidity";
import { calculateTaxPlan } from "./tax";

export function calculateStrategyRecommendation(state: FinancePlanState): StrategyRecommendation {
  const liquidity = calculateLiquidity(state);
  const tax = calculateTaxPlan(state);
  const debtPlan = calculateDebtPlan(state.debts, "avalanche");
  const fire = calculateFirePlan(state);
  const actions: StrategyAction[] = [];
  const warnings: string[] = [];

  if (liquidity.emergencyFundRunwayMonths < 3) {
    actions.push({
      title: "Rebuild your emergency runway",
      detail: "Keep the next surplus dollars in cash until you reach at least three months of core expenses.",
      emphasis: "critical"
    });
  }

  const missingMatch = state.people.some((person) => person.employerMatchEligible && person.currentRetirementContributionRate < person.employerMatchPercent);
  if (missingMatch) {
    actions.push({
      title: "Capture the full employer match",
      detail: "Your current retirement deferral is below one or more match thresholds, so this is the highest-return contribution available.",
      emphasis: "critical"
    });
  }

  const highInterestDebt = state.debts.find((debt) => debt.apr > Math.max(0.07, tax.marginalTaxRate + 0.02));
  if (highInterestDebt) {
    actions.push({
      title: "Accelerate high-interest debt payoff",
      detail: `${highInterestDebt.name} is likely costing more than your expected after-tax investing return.`,
      emphasis: "high"
    });
  }

  switch (state.profile.primaryGoal) {
    case "preserve_liquidity":
      actions.push({
        title: "Favor liquid reserves and taxable flexibility",
        detail: "Route new dollars to cash and taxable brokerage before locking more money behind retirement restrictions.",
        emphasis: "high"
      });
      break;
    case "minimize_taxes":
      actions.push({
        title: "Increase pre-tax contributions",
        detail: "Boost 401k or HSA contributions to lower taxable income while you are in a higher marginal bracket.",
        emphasis: "high"
      });
      break;
    case "reach_fire":
      actions.push({
        title: "Lift your investable savings rate",
        detail: "Your FIRE date moves fastest when monthly investing rises after cash runway and match are secured.",
        emphasis: "high"
      });
      break;
    case "prepare_home_purchase":
      actions.push({
        title: "Protect the down-payment pool",
        detail: "Keep near-term home funds in immediate or flexible liquidity rather than adding market volatility.",
        emphasis: "high"
      });
      break;
    case "pay_off_debt":
      actions.push({
        title: "Use the avalanche plan as default",
        detail: `The current payoff path clears debt ${debtPlan.debtFreeDateLabel.toLowerCase()} and minimizes interest drag.`,
        emphasis: "high"
      });
      break;
    default:
      actions.push({
        title: "Balance tax sheltering with flexibility",
        detail: "Split the next dollars between retirement accounts and liquid investing once cash runway is healthy.",
        emphasis: "medium"
      });
      break;
  }

  if (tax.stateOverrideRequired) {
    warnings.push("Your state tax estimate is using a placeholder and should be overridden for more reliable planning.");
  }

  if (liquidity.retirementNetWorth > 0 && liquidity.accessibleToday < state.household.sharedMonthlyExpenses * 3) {
    warnings.push("A large share of your wealth is restricted, so short-term flexibility is weaker than total net worth suggests.");
  }

  return {
    goal: state.profile.primaryGoal,
    priorityActions: actions.slice(0, 7),
    explanation: `The recommendation balances liquidity runway, tax efficiency, debt cost, and your selected goal. At the current pace, FIRE is ${fire.fireDateLabel.toLowerCase()}.`,
    warnings,
    supportingMetrics: {
      runwayMonths: liquidity.emergencyFundRunwayMonths,
      effectiveTaxRate: tax.effectiveTaxRate,
      highAprDebtBalance: highInterestDebt?.balance ?? 0,
      fireProgress: fire.progress
    }
  };
}
