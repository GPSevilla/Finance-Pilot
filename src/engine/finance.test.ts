import { describe, expect, test } from "vitest";
import { createInitialState } from "../data/defaults";
import { calculateDebtPlan } from "./debt";
import { calculateFairnessSummary } from "./dualIncome";
import { calculateFirePlan } from "./fire";
import { calculateLiquidity } from "./liquidity";
import { calculateMoneyFlowSummary } from "./moneyFlow";
import { calculateScenarioProjection } from "./projections";
import { calculateStrategyRecommendation } from "./strategy";
import { calculateTaxPlan } from "./tax";

describe("finance engine", () => {
  test("liquidity treats roth basis as conditional liquidity", () => {
    const state = createInitialState();
    const liquidity = calculateLiquidity(state);

    expect(liquidity.tierTotals.conditional).toBeGreaterThanOrEqual(17000);
    expect(liquidity.retirementNetWorth).toBeGreaterThan(liquidity.tierTotals.restricted);
  });

  test("tax plan handles Washington with no state income tax", () => {
    const state = createInitialState();
    state.taxProfile.state = "WA";

    const tax = calculateTaxPlan(state);

    expect(tax.stateIncomeTax).toBe(0);
    expect(tax.stateOverrideRequired).toBe(false);
    expect(tax.takeHomeMonthlyIncome).toBeGreaterThan(0);
  });

  test("avalanche pays no more interest than snowball for default debts", () => {
    const state = createInitialState();

    const avalanche = calculateDebtPlan(state.debts, "avalanche");
    const snowball = calculateDebtPlan(state.debts, "snowball");

    expect(avalanche.totalInterestPaid).toBeLessThanOrEqual(snowball.totalInterestPaid);
    expect(avalanche.debtFreeMonth).not.toBeNull();
  });

  test("loan term enforces a realistic payment floor for amortizing debt", () => {
    const payoff = calculateDebtPlan([
      {
        id: "loan-1",
        name: "Student Loan",
        type: "student_loan",
        balance: 44000,
        apr: 0.08,
        minimumPayment: 50,
        plannedPayment: 50,
        remainingTermMonths: 60
      }
    ], "avalanche");

    expect(payoff.debtFreeMonth).not.toBeNull();
    expect(payoff.debtFreeMonth!).toBeLessThanOrEqual(61);
  });

  test("planned payments beat minimum-only debt payoff for the same strategy", () => {
    const payoff = calculateDebtPlan([
      {
        id: "card-1",
        name: "Credit Card",
        type: "credit_card",
        balance: 12000,
        apr: 0.24,
        minimumPayment: 250,
        plannedPayment: 650
      }
    ], "avalanche");

    expect(payoff.timeSavedVsMinimumMonths).toBeGreaterThan(0);
    expect(payoff.interestSavedVsMinimum).toBeGreaterThan(0);
    expect(payoff.minimumOnlyDebtFreeMonth).toBeGreaterThan(payoff.debtFreeMonth ?? 0);
  });

  test("scenario projection grows across the configured horizon", () => {
    const state = createInitialState();
    const points = calculateScenarioProjection(state, "base");

    expect(points).toHaveLength(state.assumptions.projectionYears + 1);
    expect(points[0].label).not.toBe(points[points.length - 1]?.label);
  });

  test("fire plan returns progress and a valid number", () => {
    const state = createInitialState();
    const fire = calculateFirePlan(state, "base");

    expect(fire.fireNumber).toBeGreaterThan(0);
    expect(fire.progress).toBeGreaterThan(0);
  });

  test("dual income fairness warning appears when split is uneven", () => {
    const state = createInitialState();
    state.profile.planningType = "dual";
    state.people[0].annualIncome = 180000;
    state.people[1].annualIncome = 30000;
    state.people[1].monthlyExpenses = 2500;
    state.household.splitMethod = "equal";
    state.household.sharedMonthlyExpenses = 6000;

    const fairness = calculateFairnessSummary(state);

    expect(fairness).toBeDefined();
    expect(fairness?.warning).toBeTruthy();
  });

  test("strategy recommendation prioritizes emergency runway when cash is weak", () => {
    const state = createInitialState();
    state.accounts = state.accounts.map((account) => {
      if (account.type === "hysa" || account.type === "taxable_brokerage" || account.type === "roth_ira") {
        return { ...account, balance: 500, rothContributionBasis: 0 };
      }
      return account;
    });

    const strategy = calculateStrategyRecommendation(state);

    expect(strategy.priorityActions[0]?.title).toMatch(/emergency/i);
  });

  test("money flow computes savings rates and a positive allocation pool", () => {
    const state = createInitialState();
    state.people[0].annualIncome = 168000;
    state.people[0].monthlyExpenses = 3000;
    state.household.sharedMonthlyExpenses = 0;
    state.household.sharedSavingsGoals = 0;
    state.cashFlow.extraDebtAllocationMonthly = 2000;
    state.cashFlow.extraInvestingAllocationMonthly = 2500;
    state.cashFlow.extraCashAllocationMonthly = 500;

    const moneyFlow = calculateMoneyFlowSummary(state, "base");

    expect(moneyFlow.takeHomeMonthlyIncome).toBeGreaterThan(0);
    expect(moneyFlow.availableAllocationPoolMonthly).toBeGreaterThan(0);
    expect(moneyFlow.grossSavingsRate).toBeGreaterThan(0);
    expect(moneyFlow.timeline.length).toBeGreaterThan(3);
  });

  test("money flow redirects freed debt cash into investing after payoff", () => {
    const state = createInitialState();
    state.cashFlow.strategy = "avalanche";
    state.cashFlow.extraDebtAllocationMonthly = 2500;
    state.cashFlow.extraInvestingAllocationMonthly = 500;
    state.cashFlow.extraCashAllocationMonthly = 0;
    state.cashFlow.redirectAfterDebtPayoff = "investing";

    const moneyFlow = calculateMoneyFlowSummary(state, "base");

    expect(moneyFlow.redirectedToInvestingMonthly).toBeGreaterThan(0);
    expect(moneyFlow.projectedInvestedBalanceAtHorizon).toBeGreaterThan(moneyFlow.projectedInvestedBalanceAtDebtFree);
  });
});
