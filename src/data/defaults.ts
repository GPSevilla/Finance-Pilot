import type {
  AccountType,
  CashFlowPlan,
  DebtType,
  FilingStatus,
  FinancePlanState,
  FinancialGoal,
  LiquidityTier,
  PersonPlan,
  Scenario
} from "../types/finance";

export const STORAGE_KEY = "finance-pilot-state";
export const STORAGE_VERSION = 1;

export const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
];

export const FILING_STATUS_OPTIONS: Array<{ value: FilingStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married_filing_jointly", label: "Married filing jointly" },
  { value: "married_filing_separately", label: "Married filing separately" },
  { value: "head_of_household", label: "Head of household" }
];

export const FINANCIAL_GOALS: Array<{ value: FinancialGoal; label: string }> = [
  { value: "balanced_plan", label: "Balanced plan" },
  { value: "build_emergency_fund", label: "Build emergency fund" },
  { value: "pay_off_debt", label: "Pay off debt" },
  { value: "preserve_liquidity", label: "Preserve liquidity" },
  { value: "minimize_taxes", label: "Minimize taxes" },
  { value: "maximize_retirement", label: "Maximize retirement" },
  { value: "reach_fire", label: "Reach FIRE" },
  { value: "prepare_home_purchase", label: "Prepare for home purchase" }
];

export const ACCOUNT_TYPE_OPTIONS: Array<{ value: AccountType; label: string; liquidityTier: LiquidityTier }> = [
  { value: "checking", label: "Checking", liquidityTier: "immediate" },
  { value: "savings", label: "Savings", liquidityTier: "immediate" },
  { value: "hysa", label: "HYSA", liquidityTier: "immediate" },
  { value: "money_market", label: "Money market", liquidityTier: "immediate" },
  { value: "taxable_brokerage", label: "Taxable brokerage", liquidityTier: "flexible" },
  { value: "roth_ira", label: "Roth IRA", liquidityTier: "conditional" },
  { value: "roth_401k", label: "Roth 401k", liquidityTier: "restricted" },
  { value: "traditional_401k", label: "Traditional 401k", liquidityTier: "restricted" },
  { value: "traditional_ira", label: "Traditional IRA", liquidityTier: "restricted" },
  { value: "rollover_ira", label: "Rollover IRA", liquidityTier: "restricted" },
  { value: "403b", label: "403b", liquidityTier: "restricted" },
  { value: "hsa", label: "HSA", liquidityTier: "conditional" },
  { value: "home_equity", label: "Home equity", liquidityTier: "illiquid" },
  { value: "vehicle", label: "Vehicle value", liquidityTier: "illiquid" },
  { value: "other_asset", label: "Other asset", liquidityTier: "illiquid" }
];

export const DEBT_TYPE_OPTIONS: Array<{ value: DebtType; label: string }> = [
  { value: "student_loan", label: "Student loan" },
  { value: "credit_card", label: "Credit card" },
  { value: "auto_loan", label: "Auto loan" },
  { value: "mortgage", label: "Mortgage" },
  { value: "personal_loan", label: "Personal loan" },
  { value: "other_debt", label: "Other debt" }
];

export const DEFAULT_ASSUMPTIONS = {
  expectedReturn: 0.08,
  volatility: 0.2,
  inflation: 0.03,
  incomeGrowth: 0.03,
  expenseGrowth: 0.03,
  safeWithdrawalRate: 0.04,
  projectionYears: 30
};

export function createDefaultCashFlow(): CashFlowPlan {
  return {
    strategy: "avalanche",
    extraDebtAllocationMonthly: 1500,
    extraInvestingAllocationMonthly: 2000,
    extraCashAllocationMonthly: 500,
    redirectAfterDebtPayoff: "investing",
    redirectInvestingPercent: 0.75
  };
}

export function createDefaultScenarios(): Scenario[] {
  return [
    {
      id: "base",
      name: "Base",
      assumptions: { ...DEFAULT_ASSUMPTIONS },
      oneTimeEvents: []
    },
    {
      id: "conservative",
      name: "Conservative",
      assumptions: {
        ...DEFAULT_ASSUMPTIONS,
        expectedReturn: 0.06,
        inflation: 0.035,
        incomeGrowth: 0.02
      },
      oneTimeEvents: []
    },
    {
      id: "optimistic",
      name: "Optimistic",
      assumptions: {
        ...DEFAULT_ASSUMPTIONS,
        expectedReturn: 0.1,
        incomeGrowth: 0.04,
        expenseGrowth: 0.025
      },
      oneTimeEvents: []
    }
  ];
}

export function createStarterAccounts(owner: "personA" | "personB" | "shared" = "personA") {
  return [
    {
      id: crypto.randomUUID(),
      name: "Checking",
      type: "checking" as const,
      balance: 0,
      owner,
      liquidityTier: "immediate" as const
    },
    {
      id: crypto.randomUUID(),
      name: "Savings",
      type: "savings" as const,
      balance: 0,
      owner,
      liquidityTier: "immediate" as const
    },
    {
      id: crypto.randomUUID(),
      name: "HYSA",
      type: "hysa" as const,
      balance: 0,
      owner,
      liquidityTier: "immediate" as const
    },
    {
      id: crypto.randomUUID(),
      name: "Brokerage",
      type: "taxable_brokerage" as const,
      balance: 0,
      owner,
      liquidityTier: "flexible" as const
    },
    {
      id: crypto.randomUUID(),
      name: "401k",
      type: "traditional_401k" as const,
      balance: 0,
      owner,
      annualContribution: 0,
      liquidityTier: "restricted" as const
    },
    {
      id: crypto.randomUUID(),
      name: "Roth IRA",
      type: "roth_ira" as const,
      balance: 0,
      owner,
      annualContribution: 0,
      rothContributionBasis: 0,
      liquidityTier: "conditional" as const
    }
  ];
}

function createDefaultPerson(id: PersonPlan["id"], name: string): PersonPlan {
  return {
    id,
    name,
    age: id === "personA" ? 32 : 31,
    annualIncome: id === "personA" ? 120000 : 90000,
    annualBonusMode: "amount",
    annualBonus: id === "personA" ? 10000 : 5000,
    annualBonusPercent: 0.1,
    monthlyExpenses: id === "personA" ? 1600 : 1400,
    preTaxContributionAnnual: id === "personA" ? 12000 : 8000,
    rothContributionAnnual: id === "personA" ? 3000 : 3000,
    hsaContributionAnnual: id === "personA" ? 2000 : 0,
    employerMatchEligible: true,
    employerMatchPercent: 0.04,
    currentRetirementContributionRate: 0.1
  };
}

export function createInitialState(): FinancePlanState {
  const now = new Date().toISOString();
  return {
    profile: {
      mode: "advanced",
      planningType: "single",
      state: "WA",
      filingStatus: "single",
      primaryGoal: "balanced_plan"
    },
    people: [createDefaultPerson("personA", "You"), createDefaultPerson("personB", "Partner")],
    household: {
      sharedMonthlyExpenses: 2200,
      sharedSavingsGoals: 500,
      splitMethod: "proportional_to_income",
      customSplitPersonAPercent: 50,
      targetAnnualRetirementSpending: 80000,
      fireNumberOverride: undefined,
      desiredRetirementAge: 60,
      downPaymentTarget: 100000,
      targetPurchaseYear: new Date().getFullYear() + 4,
      estimatedMonthlyHousingCost: 3200
    },
    accounts: createStarterAccounts("personA"),
    debts: [
      {
        id: crypto.randomUUID(),
        name: "Travel Card",
        type: "credit_card",
        balance: 6400,
        apr: 0.2199,
        minimumPayment: 180,
        plannedPayment: 400,
        extraPayment: 220,
        owner: "personA"
      },
      {
        id: crypto.randomUUID(),
        name: "Student Loan",
        type: "student_loan",
        balance: 18000,
        apr: 0.0575,
        minimumPayment: 240,
        plannedPayment: 240,
        remainingTermMonths: 96,
        extraPayment: 0,
        owner: "personA"
      }
    ],
    taxProfile: {
      taxYear: new Date().getFullYear(),
      state: "WA",
      filingStatus: "single",
      federalTaxMode: "estimated",
      stateTaxMode: "estimated"
    },
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    scenarios: createDefaultScenarios(),
    cashFlow: createDefaultCashFlow(),
    uiPreferences: {
      selectedScenarioId: "base",
      nominalDollars: true,
      setupComplete: false
    },
    meta: {
      version: STORAGE_VERSION,
      createdAt: now,
      updatedAt: now
    }
  };
}
