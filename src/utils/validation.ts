import { z } from "zod";

const liquidityTierSchema = z.enum(["immediate", "flexible", "conditional", "restricted", "illiquid"]);
const accountTypeSchema = z.enum([
  "checking",
  "savings",
  "hysa",
  "money_market",
  "taxable_brokerage",
  "roth_ira",
  "roth_401k",
  "traditional_401k",
  "traditional_ira",
  "rollover_ira",
  "403b",
  "hsa",
  "home_equity",
  "vehicle",
  "other_asset"
]);
const debtTypeSchema = z.enum([
  "student_loan",
  "credit_card",
  "auto_loan",
  "mortgage",
  "personal_loan",
  "other_debt"
]);
const personOwnerSchema = z.enum(["personA", "personB", "shared"]);

const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: accountTypeSchema,
  balance: z.number(),
  owner: personOwnerSchema.optional(),
  annualContribution: z.number().optional(),
  monthlyContribution: z.number().optional(),
  expectedReturnOverride: z.number().optional(),
  liquidityTier: liquidityTierSchema.optional(),
  rothContributionBasis: z.number().optional(),
  notes: z.string().optional()
});

const debtSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: debtTypeSchema,
  balance: z.number(),
  apr: z.number(),
  minimumPayment: z.number(),
  plannedPayment: z.number().optional(),
  remainingTermMonths: z.number().optional(),
  extraPayment: z.number().optional(),
  owner: personOwnerSchema.optional(),
  taxDeductibleInterest: z.boolean().optional(),
  notes: z.string().optional()
});

const assumptionsSchema = z.object({
  expectedReturn: z.number(),
  volatility: z.number(),
  inflation: z.number(),
  incomeGrowth: z.number(),
  expenseGrowth: z.number(),
  safeWithdrawalRate: z.number(),
  projectionYears: z.number()
});

const eventBase = {
  id: z.string(),
  year: z.number(),
  amount: z.number(),
  label: z.string()
};

const eventSchema = z.discriminatedUnion("type", [
  z.object({ ...eventBase, type: z.literal("income") }),
  z.object({ ...eventBase, type: z.literal("expense") }),
  z.object({
    ...eventBase,
    type: z.literal("home_purchase"),
    downPayment: z.number().optional(),
    monthlyHousingCost: z.number().optional(),
    purchaseCosts: z.number().optional()
  })
]);

const scenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  assumptions: assumptionsSchema,
  monthlyDebtPaymentOverride: z.number().optional(),
  monthlyInvestmentContributionOverride: z.number().optional(),
  oneTimeEvents: z.array(eventSchema).optional()
});

const cashFlowSchema = z.object({
  strategy: z.enum(["avalanche", "snowball"]),
  extraDebtAllocationMonthly: z.number(),
  extraInvestingAllocationMonthly: z.number(),
  extraCashAllocationMonthly: z.number(),
  redirectAfterDebtPayoff: z.enum(["investing", "cash", "split"]),
  redirectInvestingPercent: z.number()
});

export const financePlanSchema = z.object({
  profile: z.object({
    mode: z.enum(["starter", "advanced"]),
    planningType: z.enum(["single", "dual"]),
    state: z.string(),
    filingStatus: z.enum(["single", "married_filing_jointly", "married_filing_separately", "head_of_household"]),
    primaryGoal: z.enum([
      "balanced_plan",
      "build_emergency_fund",
      "pay_off_debt",
      "preserve_liquidity",
      "minimize_taxes",
      "maximize_retirement",
      "reach_fire",
      "prepare_home_purchase"
    ])
  }),
  people: z.array(
    z.object({
      id: z.enum(["personA", "personB"]),
      name: z.string(),
      age: z.number(),
      annualIncome: z.number(),
      annualBonusMode: z.enum(["amount", "percent"]),
      annualBonus: z.number(),
      annualBonusPercent: z.number(),
      monthlyExpenses: z.number(),
      preTaxContributionAnnual: z.number(),
      rothContributionAnnual: z.number(),
      hsaContributionAnnual: z.number(),
      employerMatchEligible: z.boolean(),
      employerMatchPercent: z.number(),
      currentRetirementContributionRate: z.number()
    })
  ),
  household: z.object({
    sharedMonthlyExpenses: z.number(),
    sharedSavingsGoals: z.number(),
    splitMethod: z.enum(["equal", "proportional_to_income", "custom_percentage", "fully_pooled"]),
    customSplitPersonAPercent: z.number(),
    targetAnnualRetirementSpending: z.number(),
    fireNumberOverride: z.number().optional(),
    desiredRetirementAge: z.number().optional(),
    targetPurchaseYear: z.number().optional(),
    downPaymentTarget: z.number().optional(),
    estimatedMonthlyHousingCost: z.number().optional()
  }),
  accounts: z.array(accountSchema),
  debts: z.array(debtSchema),
  taxProfile: z.object({
    taxYear: z.number(),
    state: z.string(),
    filingStatus: z.enum(["single", "married_filing_jointly", "married_filing_separately", "head_of_household"]),
    federalTaxMode: z.enum(["estimated", "manual_override"]),
    stateTaxMode: z.enum(["estimated", "manual_override"]),
    effectiveTaxRateOverride: z.number().optional(),
    marginalTaxRateOverride: z.number().optional(),
    stateTaxRateOverride: z.number().optional()
  }),
  assumptions: assumptionsSchema,
  scenarios: z.array(scenarioSchema),
  cashFlow: cashFlowSchema.optional(),
  uiPreferences: z.object({
    selectedScenarioId: z.string(),
    nominalDollars: z.boolean(),
    setupComplete: z.boolean()
  }),
  meta: z.object({
    version: z.number(),
    createdAt: z.string(),
    updatedAt: z.string()
  })
});
