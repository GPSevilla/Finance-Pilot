import type { DebtAccount, DebtPlanSummary, DebtStrategy } from "../types/finance";
import { formatMonthLabel, roundCurrency } from "../utils/formatting";
import { plannedDebtPayment } from "./common";

interface DebtSnapshot extends DebtAccount {
  remainingBalance: number;
}

interface DebtSimulationSummary {
  debtFreeMonth: number;
  debtFreeDateLabel: string;
  totalInterestPaid: number;
  totalPaid: number;
  payoffTimeline: DebtPlanSummary["payoffTimeline"];
}

export function calculateDebtPlan(
  debts: DebtAccount[],
  strategy: DebtStrategy,
  monthlyExtraBudget = 0
): DebtPlanSummary {
  const debtList = debts.filter((debt) => debt.balance > 0);

  if (!debtList.length) {
    return {
      strategy,
      debtFreeMonth: 0,
      debtFreeDateLabel: "Debt free now",
      totalInterestPaid: 0,
      totalPaid: 0,
      interestSavedVsAlternate: 0,
      timeSavedVsAlternateMonths: 0,
      minimumOnlyDebtFreeMonth: 0,
      minimumOnlyDebtFreeDateLabel: "Debt free now",
      minimumOnlyInterestPaid: 0,
      interestSavedVsMinimum: 0,
      timeSavedVsMinimumMonths: 0,
      payoffTimeline: [{ monthIndex: 0, label: "Now", remainingBalance: 0 }],
      minimumOnlyTimeline: [{ monthIndex: 0, label: "Now", remainingBalance: 0 }]
    };
  }

  const planned = simulateDebtPlan(debtList, strategy, monthlyExtraBudget, true);
  const minimumOnly = simulateDebtPlan(debtList, strategy, monthlyExtraBudget, false);
  const alternate = simulateAlternate(debts, strategy === "avalanche" ? "snowball" : "avalanche", monthlyExtraBudget);

  return {
    strategy,
    debtFreeMonth: planned.debtFreeMonth,
    debtFreeDateLabel: planned.debtFreeDateLabel,
    totalInterestPaid: planned.totalInterestPaid,
    totalPaid: planned.totalPaid,
    interestSavedVsAlternate: roundCurrency(alternate.totalInterestPaid - planned.totalInterestPaid),
    timeSavedVsAlternateMonths: Math.max(0, alternate.debtFreeMonth - planned.debtFreeMonth),
    minimumOnlyDebtFreeMonth: minimumOnly.debtFreeMonth,
    minimumOnlyDebtFreeDateLabel: minimumOnly.debtFreeDateLabel,
    minimumOnlyInterestPaid: minimumOnly.totalInterestPaid,
    interestSavedVsMinimum: roundCurrency(minimumOnly.totalInterestPaid - planned.totalInterestPaid),
    timeSavedVsMinimumMonths: Math.max(0, minimumOnly.debtFreeMonth - planned.debtFreeMonth),
    payoffTimeline: planned.payoffTimeline,
    minimumOnlyTimeline: minimumOnly.payoffTimeline
  };
}

function simulateAlternate(debts: DebtAccount[], strategy: DebtStrategy, monthlyExtraBudget: number): { totalInterestPaid: number; debtFreeMonth: number } {
  return calculateDebtPlanLite(debts, strategy, monthlyExtraBudget);
}

function simulateDebtPlan(
  debts: DebtAccount[],
  strategy: DebtStrategy,
  monthlyExtraBudget: number,
  usePlannedPayments: boolean
): DebtSimulationSummary {
  const ordered = sortDebts(
    debts.map((debt) => ({ ...debt, remainingBalance: debt.balance })),
    strategy
  );
  const baseMonthlyBudget = ordered.reduce(
    (sum, debt) => sum + (usePlannedPayments ? plannedDebtPayment(debt) : debt.minimumPayment),
    0
  );
  const monthlyBudget = baseMonthlyBudget + monthlyExtraBudget;
  const payoffTimeline = [{ monthIndex: 0, label: "Now", remainingBalance: roundCurrency(totalRemaining(ordered)) }];
  let totalInterestPaid = 0;
  let totalPaid = 0;
  let monthIndex = 0;

  while (totalRemaining(ordered) > 0.01 && monthIndex < 1200) {
    monthIndex += 1;
    let available = monthlyBudget;

    for (const debt of ordered) {
      if (debt.remainingBalance <= 0) {
        continue;
      }
      const interest = debt.remainingBalance * (debt.apr / 12);
      totalInterestPaid += interest;
      debt.remainingBalance += interest;
    }

    for (const debt of ordered) {
      if (debt.remainingBalance <= 0) {
        continue;
      }
      const baselinePayment = usePlannedPayments ? plannedDebtPayment(debt) : debt.minimumPayment;
      const payment = Math.min(debt.remainingBalance, baselinePayment);
      debt.remainingBalance -= payment;
      available -= payment;
      totalPaid += payment;
    }

    while (available > 0.01 && totalRemaining(ordered) > 0.01) {
      const target = ordered.find((debt) => debt.remainingBalance > 0.01);
      if (!target) {
        break;
      }
      const payment = Math.min(target.remainingBalance, available);
      target.remainingBalance -= payment;
      available -= payment;
      totalPaid += payment;
    }

    if (monthIndex === 1 || monthIndex % 3 === 0 || totalRemaining(ordered) <= 0.01) {
      payoffTimeline.push({
        monthIndex,
        label: formatMonthLabel(monthIndex),
        remainingBalance: roundCurrency(totalRemaining(ordered))
      });
    }
  }

  return {
    debtFreeMonth: monthIndex,
    debtFreeDateLabel: monthIndex ? `In ${formatMonthLabel(monthIndex)}` : "Debt free now",
    totalInterestPaid: roundCurrency(totalInterestPaid),
    totalPaid: roundCurrency(totalPaid),
    payoffTimeline
  };
}

function calculateDebtPlanLite(
  debts: DebtAccount[],
  strategy: DebtStrategy,
  monthlyExtraBudget: number
): { totalInterestPaid: number; debtFreeMonth: number } {
  const debtList = sortDebts(
    debts.map((debt) => ({ ...debt, remainingBalance: debt.balance })),
    strategy
  );
  const monthlyBudget = debtList.reduce((sum, debt) => sum + plannedDebtPayment(debt), 0) + monthlyExtraBudget;
  let totalInterestPaid = 0;
  let monthIndex = 0;

  while (totalRemaining(debtList) > 0.01 && monthIndex < 1200) {
    monthIndex += 1;
    let available = monthlyBudget;

    for (const debt of debtList) {
      if (debt.remainingBalance <= 0) {
        continue;
      }
      const interest = debt.remainingBalance * (debt.apr / 12);
      totalInterestPaid += interest;
      debt.remainingBalance += interest;
    }

    for (const debt of debtList) {
      if (debt.remainingBalance <= 0) {
        continue;
      }
      const payment = Math.min(debt.remainingBalance, debt.minimumPayment);
      debt.remainingBalance -= payment;
      available -= payment;
    }

    while (available > 0.01 && totalRemaining(debtList) > 0.01) {
      const target = debtList.find((debt) => debt.remainingBalance > 0.01);
      if (!target) {
        break;
      }
      const payment = Math.min(target.remainingBalance, available);
      target.remainingBalance -= payment;
      available -= payment;
    }
  }

  return { totalInterestPaid, debtFreeMonth: monthIndex };
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
