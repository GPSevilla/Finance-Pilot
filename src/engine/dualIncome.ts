import type { FairnessSummary, FinancePlanState } from "../types/finance";
import { calculateTaxPlan } from "./tax";
import { annualBonusValue, getPeopleForPlanningType, totalIncome } from "./common";

export function calculateFairnessSummary(state: FinancePlanState): FairnessSummary | undefined {
  if (state.profile.planningType !== "dual") {
    return undefined;
  }

  const people = getPeopleForPlanningType(state);
  const totalHouseholdIncome = totalIncome(people);
  const tax = calculateTaxPlan(state);
  const afterTaxIncomeByPerson = {
    personA: estimateNetMonthlyIncome(state.people[0]?.annualIncome ?? 0, totalHouseholdIncome, tax.takeHomeAnnualIncome),
    personB: estimateNetMonthlyIncome(state.people[1]?.annualIncome ?? 0, totalHouseholdIncome, tax.takeHomeAnnualIncome)
  };
  const split = sharedExpenseSplit(state);
  const surplusByPerson = {
    personA: afterTaxIncomeByPerson.personA - (state.people[0]?.monthlyExpenses ?? 0) - split.personA,
    personB: afterTaxIncomeByPerson.personB - (state.people[1]?.monthlyExpenses ?? 0) - split.personB
  };
  const burdenByPerson = {
    personA: afterTaxIncomeByPerson.personA > 0 ? split.personA / afterTaxIncomeByPerson.personA : 0,
    personB: afterTaxIncomeByPerson.personB > 0 ? split.personB / afterTaxIncomeByPerson.personB : 0
  };

  let warning: string | undefined;
  const surplusShareA = afterTaxIncomeByPerson.personA > 0 ? surplusByPerson.personA / afterTaxIncomeByPerson.personA : 0;
  const surplusShareB = afterTaxIncomeByPerson.personB > 0 ? surplusByPerson.personB / afterTaxIncomeByPerson.personB : 0;
  if ((surplusShareA < 0.1 && surplusShareB > 0.25) || (surplusShareB < 0.1 && surplusShareA > 0.25)) {
    const lowerPerson = surplusShareA < surplusShareB ? "Person A" : "Person B";
    warning = `This plan may be affordable at the household level but uneven individually. ${lowerPerson} retains significantly less monthly surplus after shared expenses.`;
  }

  return {
    burdenByPerson,
    surplusByPerson,
    warning
  };
}

function estimateNetMonthlyIncome(personIncome: number, totalIncomeAnnual: number, totalTakeHomeAnnual: number): number {
  if (totalIncomeAnnual <= 0) {
    return 0;
  }
  return (totalTakeHomeAnnual * (personIncome / totalIncomeAnnual)) / 12;
}

function sharedExpenseSplit(state: FinancePlanState): Record<"personA" | "personB", number> {
  const sharedTotal = state.household.sharedMonthlyExpenses + state.household.sharedSavingsGoals;

  if (state.household.splitMethod === "fully_pooled") {
    return { personA: sharedTotal / 2, personB: sharedTotal / 2 };
  }
  if (state.household.splitMethod === "equal") {
    return { personA: sharedTotal / 2, personB: sharedTotal / 2 };
  }
  if (state.household.splitMethod === "custom_percentage") {
    const ratio = state.household.customSplitPersonAPercent / 100;
    return { personA: sharedTotal * ratio, personB: sharedTotal * (1 - ratio) };
  }

  const incomeA = (state.people[0]?.annualIncome ?? 0) + (state.people[0] ? annualBonusValue(state.people[0]) : 0);
  const incomeB = (state.people[1]?.annualIncome ?? 0) + (state.people[1] ? annualBonusValue(state.people[1]) : 0);
  const total = incomeA + incomeB;
  const ratio = total > 0 ? incomeA / total : 0.5;
  return { personA: sharedTotal * ratio, personB: sharedTotal * (1 - ratio) };
}
