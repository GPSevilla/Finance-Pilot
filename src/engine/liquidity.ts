import type { FinancePlanState, LiquidityBreakdown } from "../types/finance";
import { roundCurrency } from "../utils/formatting";
import { resolveLiquidityTier } from "./common";

export function calculateLiquidity(state: FinancePlanState): LiquidityBreakdown {
  const tierTotals = {
    immediate: 0,
    flexible: 0,
    conditional: 0,
    restricted: 0,
    illiquid: 0
  } as LiquidityBreakdown["tierTotals"];

  const accountTypeTotals: Record<string, number> = {};

  for (const account of state.accounts) {
    const resolvedTier = resolveLiquidityTier(account);
    const value = account.balance;
    tierTotals[resolvedTier] += value;
    accountTypeTotals[account.type] = (accountTypeTotals[account.type] ?? 0) + value;

    if (account.type === "roth_ira" && typeof account.rothContributionBasis === "number") {
      tierTotals.conditional += account.rothContributionBasis;
      tierTotals.restricted += Math.max(0, value - account.rothContributionBasis);
      tierTotals[resolvedTier] -= value;
    }
  }

  const totalAssets = Object.values(tierTotals).reduce((sum, value) => sum + value, 0);
  const totalDebt = state.debts.reduce((sum, debt) => sum + debt.balance, 0);
  const liquidNetWorth = tierTotals.immediate + tierTotals.flexible;
  const accessibleToday = liquidNetWorth + tierTotals.conditional;
  const retirementNetWorth = tierTotals.conditional + tierTotals.restricted;
  const restrictedFutureWealth = tierTotals.restricted + tierTotals.illiquid;
  const totalNetWorth = totalAssets - totalDebt;
  const accountTypePercentages = Object.fromEntries(
    Object.entries(accountTypeTotals).map(([type, value]) => [type, totalAssets ? value / totalAssets : 0])
  );
  const tierPercentages = Object.fromEntries(
    Object.entries(tierTotals).map(([tier, value]) => [tier, totalAssets ? value / totalAssets : 0])
  ) as LiquidityBreakdown["tierPercentages"];

  const monthlyCoreExpenses =
    state.people.reduce((sum, person) => sum + person.monthlyExpenses, 0) +
    state.household.sharedMonthlyExpenses;
  const emergencyFundRunwayMonths = monthlyCoreExpenses > 0 ? tierTotals.immediate / monthlyCoreExpenses : 0;
  const extendedRunwayMonths = monthlyCoreExpenses > 0 ? accessibleToday / monthlyCoreExpenses : 0;

  return {
    totalNetWorth: roundCurrency(totalNetWorth),
    liquidNetWorth: roundCurrency(liquidNetWorth - totalDebt),
    accessibleToday: roundCurrency(accessibleToday),
    retirementNetWorth: roundCurrency(retirementNetWorth),
    restrictedFutureWealth: roundCurrency(restrictedFutureWealth),
    debtAdjustedNetWorth: roundCurrency(totalAssets - totalDebt),
    emergencyFundRunwayMonths,
    extendedRunwayMonths,
    tierTotals: Object.fromEntries(
      Object.entries(tierTotals).map(([tier, value]) => [tier, roundCurrency(value)])
    ) as LiquidityBreakdown["tierTotals"],
    tierPercentages,
    accountTypePercentages
  };
}

export function calculateNetWorth(state: FinancePlanState): Pick<LiquidityBreakdown, "totalNetWorth" | "liquidNetWorth" | "retirementNetWorth" | "accessibleToday" | "restrictedFutureWealth" | "debtAdjustedNetWorth"> {
  const liquidity = calculateLiquidity(state);
  return {
    totalNetWorth: liquidity.totalNetWorth,
    liquidNetWorth: liquidity.liquidNetWorth,
    retirementNetWorth: liquidity.retirementNetWorth,
    accessibleToday: liquidity.accessibleToday,
    restrictedFutureWealth: liquidity.restrictedFutureWealth,
    debtAdjustedNetWorth: liquidity.debtAdjustedNetWorth
  };
}
