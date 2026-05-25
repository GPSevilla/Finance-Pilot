export type UserMode = "starter" | "advanced";
export type PlanningType = "single" | "dual";
export type FilingStatus =
  | "single"
  | "married_filing_jointly"
  | "married_filing_separately"
  | "head_of_household";

export type FinancialGoal =
  | "balanced_plan"
  | "build_emergency_fund"
  | "pay_off_debt"
  | "preserve_liquidity"
  | "minimize_taxes"
  | "maximize_retirement"
  | "reach_fire"
  | "prepare_home_purchase";

export type PersonOwner = "personA" | "personB" | "shared";

export type AccountType =
  | "checking"
  | "savings"
  | "hysa"
  | "money_market"
  | "taxable_brokerage"
  | "roth_ira"
  | "roth_401k"
  | "traditional_401k"
  | "traditional_ira"
  | "rollover_ira"
  | "403b"
  | "hsa"
  | "home_equity"
  | "vehicle"
  | "other_asset";

export type LiquidityTier =
  | "immediate"
  | "flexible"
  | "conditional"
  | "restricted"
  | "illiquid";

export interface FinancialAccount {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  owner?: PersonOwner;
  annualContribution?: number;
  monthlyContribution?: number;
  expectedReturnOverride?: number;
  liquidityTier?: LiquidityTier;
  rothContributionBasis?: number;
  notes?: string;
}

export type DebtType =
  | "student_loan"
  | "credit_card"
  | "auto_loan"
  | "mortgage"
  | "personal_loan"
  | "other_debt";

export interface DebtAccount {
  id: string;
  name: string;
  type: DebtType;
  balance: number;
  apr: number;
  minimumPayment: number;
  plannedPayment?: number;
  remainingTermMonths?: number;
  extraPayment?: number;
  owner?: PersonOwner;
  taxDeductibleInterest?: boolean;
  notes?: string;
}

export interface ProjectionAssumptions {
  expectedReturn: number;
  volatility: number;
  inflation: number;
  incomeGrowth: number;
  expenseGrowth: number;
  safeWithdrawalRate: number;
  projectionYears: number;
}

export interface IncomeEvent {
  id: string;
  year: number;
  type: "income";
  amount: number;
  label: string;
}

export interface ExpenseEvent {
  id: string;
  year: number;
  type: "expense";
  amount: number;
  label: string;
}

export interface HomePurchaseEvent {
  id: string;
  year: number;
  type: "home_purchase";
  amount: number;
  label: string;
  downPayment?: number;
  monthlyHousingCost?: number;
  purchaseCosts?: number;
}

export type OneTimeEvent = IncomeEvent | ExpenseEvent | HomePurchaseEvent;

export interface Scenario {
  id: string;
  name: string;
  assumptions: ProjectionAssumptions;
  monthlyDebtPaymentOverride?: number;
  monthlyInvestmentContributionOverride?: number;
  oneTimeEvents?: OneTimeEvent[];
}

export interface TaxProfile {
  taxYear: number;
  state: string;
  filingStatus: FilingStatus;
  federalTaxMode: "estimated" | "manual_override";
  stateTaxMode: "estimated" | "manual_override";
  effectiveTaxRateOverride?: number;
  marginalTaxRateOverride?: number;
  stateTaxRateOverride?: number;
}

export interface UserProfile {
  mode: UserMode;
  planningType: PlanningType;
  state: string;
  filingStatus: FilingStatus;
  primaryGoal: FinancialGoal;
}

export interface PersonPlan {
  id: "personA" | "personB";
  name: string;
  age: number;
  annualIncome: number;
  annualBonusMode: "amount" | "percent";
  annualBonus: number;
  annualBonusPercent: number;
  monthlyExpenses: number;
  preTaxContributionAnnual: number;
  rothContributionAnnual: number;
  hsaContributionAnnual: number;
  employerMatchEligible: boolean;
  employerMatchPercent: number;
  currentRetirementContributionRate: number;
}

export type SplitMethod = "equal" | "proportional_to_income" | "custom_percentage" | "fully_pooled";

export interface HouseholdPlan {
  sharedMonthlyExpenses: number;
  sharedSavingsGoals: number;
  splitMethod: SplitMethod;
  customSplitPersonAPercent: number;
  targetAnnualRetirementSpending: number;
  fireNumberOverride?: number;
  desiredRetirementAge?: number;
  targetPurchaseYear?: number;
  downPaymentTarget?: number;
  estimatedMonthlyHousingCost?: number;
}

export type DebtStrategy = "avalanche" | "snowball";
export type RedirectAllocationTarget = "investing" | "cash" | "split";

export interface CashFlowPlan {
  strategy: DebtStrategy;
  extraDebtAllocationMonthly: number;
  extraInvestingAllocationMonthly: number;
  extraCashAllocationMonthly: number;
  redirectAfterDebtPayoff: RedirectAllocationTarget;
  redirectInvestingPercent: number;
}

export interface UIPreferences {
  selectedScenarioId: string;
  nominalDollars: boolean;
  setupComplete: boolean;
}

export interface FinancePlanMeta {
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinancePlanState {
  profile: UserProfile;
  people: PersonPlan[];
  household: HouseholdPlan;
  accounts: FinancialAccount[];
  debts: DebtAccount[];
  taxProfile: TaxProfile;
  assumptions: ProjectionAssumptions;
  scenarios: Scenario[];
  cashFlow: CashFlowPlan;
  uiPreferences: UIPreferences;
  meta: FinancePlanMeta;
}

export interface MetricSummary {
  label: string;
  value: number;
  helper?: string;
}

export interface LiquidityBreakdown {
  totalNetWorth: number;
  liquidNetWorth: number;
  accessibleToday: number;
  retirementNetWorth: number;
  restrictedFutureWealth: number;
  debtAdjustedNetWorth: number;
  emergencyFundRunwayMonths: number;
  extendedRunwayMonths: number;
  tierTotals: Record<LiquidityTier, number>;
  tierPercentages: Record<LiquidityTier, number>;
  accountTypePercentages: Record<string, number>;
}

export interface TaxPlanSummary {
  grossAnnualIncome: number;
  taxableAnnualIncome: number;
  federalIncomeTax: number;
  payrollTax: number;
  stateIncomeTax: number;
  totalTax: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  takeHomeAnnualIncome: number;
  takeHomeMonthlyIncome: number;
  stateOverrideRequired: boolean;
}

export interface DebtTimelinePoint {
  monthIndex: number;
  label: string;
  remainingBalance: number;
}

export interface DebtPlanSummary {
  strategy: DebtStrategy;
  debtFreeMonth: number | null;
  debtFreeDateLabel: string;
  totalInterestPaid: number;
  totalPaid: number;
  interestSavedVsAlternate: number;
  timeSavedVsAlternateMonths: number;
  minimumOnlyDebtFreeMonth: number | null;
  minimumOnlyDebtFreeDateLabel: string;
  minimumOnlyInterestPaid: number;
  interestSavedVsMinimum: number;
  timeSavedVsMinimumMonths: number;
  payoffTimeline: DebtTimelinePoint[];
  minimumOnlyTimeline: DebtTimelinePoint[];
}

export interface ProjectionPoint {
  yearOffset: number;
  label: string;
  age: number;
  netWorth: number;
  liquidNetWorth: number;
  restrictedWealth: number;
  monthlySurplus: number;
  investableAssets: number;
  fireTarget: number;
  fireProgress: number;
}

export interface FirePlanSummary {
  fireNumber: number;
  progress: number;
  fireDateLabel: string;
  fireAge: number | null;
  coastFireAge: number | null;
  desiredRetirementAge?: number;
  requiredAnnualSavings: number;
  requiredMonthlySavings: number;
  currentPlannedAnnualSavings: number;
  annualSavingsGap: number;
  onTrackToDesiredAge: boolean | null;
}

export interface StrategyAction {
  title: string;
  detail: string;
  emphasis: "critical" | "high" | "medium";
}

export interface StrategyRecommendation {
  goal: FinancialGoal;
  priorityActions: StrategyAction[];
  explanation: string;
  warnings: string[];
  supportingMetrics: Record<string, number>;
}

export interface MoneyFlowPoint {
  monthIndex: number;
  label: string;
  age: number;
  debtBalance: number;
  investedBalance: number;
  cashBalance: number;
}

export interface MoneyFlowSummary {
  strategy: DebtStrategy;
  takeHomeMonthlyIncome: number;
  livingExpensesMonthly: number;
  requiredDebtPaymentsMonthly: number;
  payrollRetirementMonthly: number;
  takeHomeInvestingMonthly: number;
  baselineInvestingMonthly: number;
  baselineCashGoalsMonthly: number;
  availableAllocationPoolMonthly: number;
  desiredExtraDebtMonthly: number;
  desiredExtraInvestingMonthly: number;
  desiredExtraCashMonthly: number;
  actualExtraDebtMonthly: number;
  actualExtraInvestingMonthly: number;
  actualExtraCashMonthly: number;
  unallocatedMonthly: number;
  overallocatedMonthly: number;
  grossSavingsRate: number;
  takeHomeSavingsRate: number;
  postExpenseSavingsRate: number;
  debtFreeMonth: number | null;
  debtFreeDateLabel: string;
  redirectedMonthlyAfterDebt: number;
  redirectedToInvestingMonthly: number;
  redirectedToCashMonthly: number;
  projectedInvestedBalanceAtDebtFree: number;
  projectedInvestedBalanceAtHorizon: number;
  projectedCashBalanceAtHorizon: number;
  timeline: MoneyFlowPoint[];
}

export interface FairnessSummary {
  burdenByPerson: Record<"personA" | "personB", number>;
  surplusByPerson: Record<"personA" | "personB", number>;
  warning?: string;
}

export interface DashboardSnapshot {
  liquidity: LiquidityBreakdown;
  tax: TaxPlanSummary;
  debtAvalanche: DebtPlanSummary;
  debtSnowball: DebtPlanSummary;
  activeDebtPlan: DebtPlanSummary;
  moneyFlow: MoneyFlowSummary;
  fire: FirePlanSummary;
  activeProjection: ProjectionPoint[];
  scenarioComparison: Array<{
    id: string;
    name: string;
    finalNetWorth: number;
    fireDateLabel: string;
    debtFreeDateLabel: string;
    liquidNetWorth: number;
    monthlySurplus: number;
  }>;
  strategy: StrategyRecommendation;
  fairness?: FairnessSummary;
}

export interface CopilotContext {
  summary: DashboardSnapshot;
  goal: FinancialGoal;
  selectedScenario: string;
  assumptions: ProjectionAssumptions;
}
