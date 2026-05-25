import type { DebtAccount, DebtStrategy, FinancePlanState, MoneyFlowPoint, MoneyFlowSummary } from "../types/finance";
import { formatMonthLabel, roundCurrency } from "../utils/formatting";
import { assumptionsForScenario, getPeopleForPlanningType, plannedDebtPayment, sumAccountContributionAnnual, totalInvestableAssets, totalIncome } from "./common";
import { calculateDebtPlan } from "./debt";
import { calculateLiquidity } from "./liquidity";
import { calculateTaxPlan } from "./tax";

interface DebtSnapshot extends DebtAccount {
  remainingBalance: number;
}

export function calculateMoneyFlowSummary(state: FinancePlanState, scenarioId?: string): MoneyFlowSummary {
  const people = getPeopleForPlanningType(state);
  const assumptions = assumptionsForScenario(state, scenarioId);
  const tax = calculateTaxPlan(state);
  const liquidity = calculateLiquidity(state);
  const strategy = state.cashFlow.strategy;
  const monthlyReturn = Math.pow(1 + assumptions.expectedReturn, 1 / 12) - 1;
  const payrollRetirementMonthly = people.reduce(
    (sum, person) => sum + person.preTaxContributionAnnual + person.rothContributionAnnual + person.hsaContributionAnnual,
    0
  ) / 12;
  const takeHomeInvestingMonthly = state.accounts.reduce((sum, account) => sum + sumAccountContributionAnnual(account), 0) / 12;
  const baselineInvestingMonthly = payrollRetirementMonthly + takeHomeInvestingMonthly;
  const baselineCashGoalsMonthly = state.household.sharedSavingsGoals;
  const livingExpensesMonthly = people.reduce((sum, person) => sum + person.monthlyExpenses, 0) + state.household.sharedMonthlyExpenses;
  const requiredDebtPaymentsMonthly = state.debts.reduce((sum, debt) => sum + plannedDebtPayment(debt), 0);
  const availableAllocationPoolMonthly = tax.takeHomeMonthlyIncome - livingExpensesMonthly - requiredDebtPaymentsMonthly - takeHomeInvestingMonthly - baselineCashGoalsMonthly;
  const desiredExtraDebtMonthly = state.cashFlow.extraDebtAllocationMonthly;
  const desiredExtraInvestingMonthly = state.cashFlow.extraInvestingAllocationMonthly;
  const desiredExtraCashMonthly = state.cashFlow.extraCashAllocationMonthly;
  const actualAllocationPoolMonthly = Math.max(0, availableAllocationPoolMonthly);
  const desiredTotal = desiredExtraDebtMonthly + desiredExtraInvestingMonthly + desiredExtraCashMonthly;
  const scalingFactor = desiredTotal > actualAllocationPoolMonthly && desiredTotal > 0
    ? actualAllocationPoolMonthly / desiredTotal
    : 1;
  const actualExtraDebtMonthly = roundCurrency(desiredExtraDebtMonthly * scalingFactor);
  const actualExtraInvestingMonthly = roundCurrency(desiredExtraInvestingMonthly * scalingFactor);
  const actualExtraCashMonthly = roundCurrency(desiredExtraCashMonthly * scalingFactor);
  const actualTotal = actualExtraDebtMonthly + actualExtraInvestingMonthly + actualExtraCashMonthly;
  const redirectedMonthlyAfterDebt = roundCurrency(requiredDebtPaymentsMonthly + actualExtraDebtMonthly);
  const redirectedToInvestingMonthly = roundCurrency(redirectedMonthlyAfterDebt * redirectInvestingShare(state.cashFlow.redirectAfterDebtPayoff, state.cashFlow.redirectInvestingPercent));
  const redirectedToCashMonthly = roundCurrency(redirectedMonthlyAfterDebt - redirectedToInvestingMonthly);
  const annualTakeHomeSavings = (takeHomeInvestingMonthly + baselineCashGoalsMonthly + actualExtraInvestingMonthly + actualExtraCashMonthly) * 12;
  const grossAnnualSavings = annualTakeHomeSavings + payrollRetirementMonthly * 12;
  const essentialAfterDebtMonthly = Math.max(0, tax.takeHomeMonthlyIncome - livingExpensesMonthly - requiredDebtPaymentsMonthly);
  const debtPlan = calculateDebtPlan(state.debts, strategy, actualExtraDebtMonthly);
  const debtFreeMonth = debtPlan.debtFreeMonth;

  const timeline = buildMoneyFlowTimeline(
    state,
    strategy,
    monthlyReturn,
    baselineInvestingMonthly,
    baselineCashGoalsMonthly,
    actualExtraDebtMonthly,
    actualExtraInvestingMonthly,
    actualExtraCashMonthly,
    redirectedToInvestingMonthly,
    redirectedToCashMonthly
  );
  const projectedInvestedBalanceAtDebtFree = debtFreeMonth === null
    ? timeline[timeline.length - 1]?.investedBalance ?? totalInvestableAssets(state.accounts)
    : timeline.find((point) => point.monthIndex >= debtFreeMonth)?.investedBalance
      ?? timeline[timeline.length - 1]?.investedBalance
      ?? totalInvestableAssets(state.accounts);
  const horizonPoint = timeline[timeline.length - 1];

  return {
    strategy,
    takeHomeMonthlyIncome: roundCurrency(tax.takeHomeMonthlyIncome),
    livingExpensesMonthly: roundCurrency(livingExpensesMonthly),
    requiredDebtPaymentsMonthly: roundCurrency(requiredDebtPaymentsMonthly),
    payrollRetirementMonthly: roundCurrency(payrollRetirementMonthly),
    takeHomeInvestingMonthly: roundCurrency(takeHomeInvestingMonthly),
    baselineInvestingMonthly: roundCurrency(baselineInvestingMonthly),
    baselineCashGoalsMonthly: roundCurrency(baselineCashGoalsMonthly),
    availableAllocationPoolMonthly: roundCurrency(availableAllocationPoolMonthly),
    desiredExtraDebtMonthly: roundCurrency(desiredExtraDebtMonthly),
    desiredExtraInvestingMonthly: roundCurrency(desiredExtraInvestingMonthly),
    desiredExtraCashMonthly: roundCurrency(desiredExtraCashMonthly),
    actualExtraDebtMonthly,
    actualExtraInvestingMonthly,
    actualExtraCashMonthly,
    unallocatedMonthly: roundCurrency(Math.max(0, actualAllocationPoolMonthly - actualTotal)),
    overallocatedMonthly: roundCurrency(Math.max(0, desiredTotal - actualAllocationPoolMonthly)),
    grossSavingsRate: totalIncome(people) > 0 ? grossAnnualSavings / totalIncome(people) : 0,
    takeHomeSavingsRate: tax.takeHomeAnnualIncome > 0 ? annualTakeHomeSavings / tax.takeHomeAnnualIncome : 0,
    postExpenseSavingsRate: essentialAfterDebtMonthly > 0
      ? (takeHomeInvestingMonthly + baselineCashGoalsMonthly + actualExtraInvestingMonthly + actualExtraCashMonthly) / essentialAfterDebtMonthly
      : 0,
    debtFreeMonth,
    debtFreeDateLabel: debtPlan.debtFreeDateLabel,
    redirectedMonthlyAfterDebt,
    redirectedToInvestingMonthly,
    redirectedToCashMonthly,
    projectedInvestedBalanceAtDebtFree: roundCurrency(projectedInvestedBalanceAtDebtFree),
    projectedInvestedBalanceAtHorizon: roundCurrency(horizonPoint?.investedBalance ?? totalInvestableAssets(state.accounts)),
    projectedCashBalanceAtHorizon: roundCurrency(horizonPoint?.cashBalance ?? liquidity.tierTotals.immediate),
    timeline
  };
}

function buildMoneyFlowTimeline(
  state: FinancePlanState,
  strategy: DebtStrategy,
  monthlyReturn: number,
  baselineInvestingMonthly: number,
  baselineCashGoalsMonthly: number,
  actualExtraDebtMonthly: number,
  actualExtraInvestingMonthly: number,
  actualExtraCashMonthly: number,
  redirectedToInvestingMonthly: number,
  redirectedToCashMonthly: number
): MoneyFlowPoint[] {
  const horizonMonths = Math.min(Math.max(24, state.assumptions.projectionYears * 12), 360);
  const primaryAge = state.people[0]?.age ?? 30;
  let investedBalance = totalInvestableAssets(state.accounts);
  let cashBalance = calculateLiquidity(state).tierTotals.immediate;
  const debts = sortDebts(
    state.debts
      .filter((debt) => debt.balance > 0)
      .map((debt) => ({ ...debt, remainingBalance: debt.balance })),
    strategy
  );
  const requiredDebtPaymentsMonthly = state.debts.reduce((sum, debt) => sum + plannedDebtPayment(debt), 0);
  const points: MoneyFlowPoint[] = [{
    monthIndex: 0,
    label: "Now",
    age: primaryAge,
    debtBalance: roundCurrency(totalRemaining(debts)),
    investedBalance: roundCurrency(investedBalance),
    cashBalance: roundCurrency(cashBalance)
  }];

  for (let monthIndex = 1; monthIndex <= horizonMonths; monthIndex += 1) {
    const debtStillActiveAtStart = totalRemaining(debts) > 0.01;
    investedBalance *= 1 + monthlyReturn;

    if (debtStillActiveAtStart) {
      let available = requiredDebtPaymentsMonthly + actualExtraDebtMonthly;

      for (const debt of debts) {
        if (debt.remainingBalance <= 0) {
          continue;
        }
        debt.remainingBalance += debt.remainingBalance * (debt.apr / 12);
      }

      for (const debt of debts) {
        if (debt.remainingBalance <= 0) {
          continue;
        }
        const payment = Math.min(debt.remainingBalance, debt.minimumPayment);
        debt.remainingBalance -= payment;
        available -= payment;
      }

      while (available > 0.01 && totalRemaining(debts) > 0.01) {
        const target = debts.find((debt) => debt.remainingBalance > 0.01);
        if (!target) {
          break;
        }
        const payment = Math.min(target.remainingBalance, available);
        target.remainingBalance -= payment;
        available -= payment;
      }
    }

    const redirectingThisMonth = totalRemaining(debts) <= 0.01;
    investedBalance += baselineInvestingMonthly + actualExtraInvestingMonthly + (redirectingThisMonth ? redirectedToInvestingMonthly : 0);
    cashBalance += baselineCashGoalsMonthly + actualExtraCashMonthly + (redirectingThisMonth ? redirectedToCashMonthly : 0);

    if (monthIndex === 1 || monthIndex % 6 === 0 || monthIndex === horizonMonths) {
      points.push({
        monthIndex,
        label: formatMonthLabel(monthIndex),
        age: Math.round((primaryAge + monthIndex / 12) * 10) / 10,
        debtBalance: roundCurrency(totalRemaining(debts)),
        investedBalance: roundCurrency(investedBalance),
        cashBalance: roundCurrency(cashBalance)
      });
    }
  }

  return points;
}

function redirectInvestingShare(target: FinancePlanState["cashFlow"]["redirectAfterDebtPayoff"], splitPercent: number): number {
  if (target === "investing") {
    return 1;
  }
  if (target === "cash") {
    return 0;
  }
  return Math.min(1, Math.max(0, splitPercent));
}

function totalRemaining(debts: DebtSnapshot[]): number {
  return debts.reduce((sum, debt) => sum + Math.max(0, debt.remainingBalance), 0);
}

function sortDebts(debts: DebtSnapshot[], strategy: DebtStrategy): DebtSnapshot[] {
  return [...debts].sort((left, right) => {
    if (strategy === "avalanche") {
      return right.apr - left.apr || left.balance - right.balance;
    }
    return left.balance - right.balance || right.apr - left.apr;
  });
}
