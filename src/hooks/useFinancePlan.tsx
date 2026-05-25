import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { createDefaultCashFlow, createInitialState, createStarterAccounts } from "../data/defaults";
import { calculateDashboardSnapshot } from "../engine/dashboard";
import { requiredDebtPaymentForTerm } from "../engine/common";
import type {
  CashFlowPlan,
  DebtAccount,
  FinancePlanState,
  FinancialAccount,
  HouseholdPlan,
  PersonPlan,
  ProjectionAssumptions,
  Scenario,
  TaxProfile,
  UIPreferences,
  UserProfile
} from "../types/finance";
import { importState, loadState, saveState } from "../utils/storage";

interface FinancePlanContextValue {
  state: FinancePlanState;
  dashboard: ReturnType<typeof calculateDashboardSnapshot>;
  setProfile: (profile: Partial<UserProfile>) => void;
  setTaxProfile: (profile: Partial<TaxProfile>) => void;
  setHousehold: (household: Partial<HouseholdPlan>) => void;
  setAssumptions: (assumptions: Partial<ProjectionAssumptions>) => void;
  setCashFlow: (cashFlow: Partial<CashFlowPlan>) => void;
  setUiPreferences: (preferences: Partial<UIPreferences>) => void;
  updatePerson: (id: PersonPlan["id"], patch: Partial<PersonPlan>) => void;
  addAccount: (account?: Partial<FinancialAccount>) => void;
  updateAccount: (id: string, patch: Partial<FinancialAccount>) => void;
  removeAccount: (id: string) => void;
  addDebt: (debt?: Partial<DebtAccount>) => void;
  updateDebt: (id: string, patch: Partial<DebtAccount>) => void;
  removeDebt: (id: string) => void;
  updateScenario: (id: string, patch: Partial<Scenario>) => void;
  resetAll: () => void;
  importJson: (raw: string) => void;
}

const FinancePlanContext = createContext<FinancePlanContextValue | null>(null);

export function FinancePlanProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<FinancePlanState>(() => normalizeLoadedState(loadState()));

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo<FinancePlanContextValue>(() => ({
    state,
    dashboard: calculateDashboardSnapshot(state),
    setProfile(profile) {
      setState((current) => updateState(current, { profile: { ...current.profile, ...profile } }));
    },
    setTaxProfile(profile) {
      setState((current) => updateState(current, {
        taxProfile: { ...current.taxProfile, ...profile },
        profile: {
          ...current.profile,
          state: profile.state ?? current.profile.state,
          filingStatus: profile.filingStatus ?? current.profile.filingStatus
        }
      }));
    },
    setHousehold(household) {
      setState((current) => updateState(current, { household: { ...current.household, ...household } }));
    },
    setAssumptions(assumptions) {
      setState((current) => updateState(current, {
        assumptions: { ...current.assumptions, ...assumptions },
        scenarios: current.scenarios.map((scenario) => scenario.id === "base"
          ? { ...scenario, assumptions: { ...scenario.assumptions, ...assumptions } }
          : scenario)
      }));
    },
    setCashFlow(cashFlow) {
      setState((current) => updateState(current, {
        cashFlow: { ...current.cashFlow, ...cashFlow }
      }));
    },
    setUiPreferences(preferences) {
      setState((current) => updateState(current, { uiPreferences: { ...current.uiPreferences, ...preferences } }));
    },
    updatePerson(id, patch) {
      setState((current) => updateState(current, {
        people: current.people.map((person) => person.id === id ? { ...person, ...patch } : person)
      }));
    },
    addAccount(account) {
      setState((current) => updateState(current, {
        accounts: [
          ...current.accounts,
          {
            id: crypto.randomUUID(),
            name: "New Account",
            type: "checking",
            balance: 0,
            owner: current.profile.planningType === "single" ? "personA" : "shared",
            ...account
          }
        ]
      }));
    },
    updateAccount(id, patch) {
      setState((current) => updateState(current, {
        accounts: current.accounts.map((account) => account.id === id ? { ...account, ...patch } : account)
      }));
    },
    removeAccount(id) {
      setState((current) => updateState(current, {
        accounts: current.accounts.filter((account) => account.id !== id)
      }));
    },
    addDebt(debt) {
      setState((current) => updateState(current, {
        debts: [
          ...current.debts,
          normalizeDebt({
            id: crypto.randomUUID(),
            name: "New Debt",
            type: "credit_card",
            balance: 0,
            apr: 0.18,
            minimumPayment: 50,
            plannedPayment: 50,
            remainingTermMonths: 60,
            owner: current.profile.planningType === "single" ? "personA" : "shared",
            ...debt
          })
        ]
      }));
    },
    updateDebt(id, patch) {
      setState((current) => updateState(current, {
        debts: current.debts.map((debt) => debt.id === id ? normalizeDebt({ ...debt, ...patch }, debt, patch) : debt)
      }));
    },
    removeDebt(id) {
      setState((current) => updateState(current, {
        debts: current.debts.filter((debt) => debt.id !== id)
      }));
    },
    updateScenario(id, patch) {
      setState((current) => updateState(current, {
        scenarios: current.scenarios.map((scenario) => scenario.id === id ? { ...scenario, ...patch } : scenario)
      }));
    },
    resetAll() {
      setState(createInitialState());
    },
    importJson(raw) {
      setState(normalizeLoadedState(importState(raw)));
    }
  }), [state]);

  return <FinancePlanContext.Provider value={value}>{children}</FinancePlanContext.Provider>;
}

function updateState(current: FinancePlanState, patch: Partial<FinancePlanState>): FinancePlanState {
  return {
    ...current,
    ...patch,
    meta: {
      ...current.meta,
      updatedAt: new Date().toISOString()
    }
  };
}

function normalizeLoadedState(state: FinancePlanState): FinancePlanState {
  const shouldResetSetupAccounts =
    !state.uiPreferences.setupComplete
    && (
      state.accounts.length === 0
      || hasLegacySetupAccounts(state.accounts)
    );

  return {
    ...state,
    accounts: shouldResetSetupAccounts ? createStarterAccounts("personA") : state.accounts,
    cashFlow: {
      ...createDefaultCashFlow(),
      ...state.cashFlow
    },
    debts: state.debts.map((debt) => normalizeDebt(debt, debt))
  };
}

function normalizeDebt(
  debt: DebtAccount,
  previousDebt?: DebtAccount,
  patch?: Partial<DebtAccount>
): DebtAccount {
  const requiredFloor = requiredDebtPaymentForTerm(debt);
  if (requiredFloor <= 0) {
    return {
      ...debt,
      minimumPayment: Number(debt.minimumPayment ?? 0),
      plannedPayment: Number(debt.plannedPayment ?? debt.minimumPayment ?? 0)
    };
  }

  const computedMinimumPayment = requiredFloor;
  const previousRequiredFloor = previousDebt ? requiredDebtPaymentForTerm(previousDebt) : 0;
  const previousMinimum = Number(previousDebt?.minimumPayment ?? previousRequiredFloor ?? debt.minimumPayment ?? 0);
  const previousPlanned = Number(previousDebt?.plannedPayment ?? previousMinimum);
  const nextPlanned = Number(debt.plannedPayment ?? previousPlanned);
  const currentUpdateChangedPlanned = patch ? Object.prototype.hasOwnProperty.call(patch, "plannedPayment") : false;
  const oneMonthSpike = debt.type === "credit_card"
    ? 0
    : requiredDebtPaymentForTerm({ ...debt, remainingTermMonths: 1 });
  const previousPlannedWasAuto =
    !previousDebt
    || previousDebt.type !== debt.type
    || previousDebt.plannedPayment === undefined
    || nearlyEqual(previousPlanned, previousMinimum)
    || nearlyEqual(previousPlanned, previousRequiredFloor)
    || (debt.remainingTermMonths ?? 0) > 1 && nearlyEqual(previousPlanned, oneMonthSpike)
    || previousPlanned < previousRequiredFloor + 0.01;
  const shouldAutoSyncPlanned =
    currentUpdateChangedPlanned
      ? false
      : previousPlannedWasAuto || nextPlanned < computedMinimumPayment;

  return {
    ...debt,
    minimumPayment: computedMinimumPayment,
    plannedPayment: shouldAutoSyncPlanned
      ? computedMinimumPayment
      : Math.max(nextPlanned, computedMinimumPayment)
  };
}

function nearlyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < 0.01;
}

function hasLegacySetupAccounts(accounts: FinancePlanState["accounts"]): boolean {
  if (accounts.length !== 4) {
    return false;
  }

  const legacyNames = ["Emergency HYSA", "Brokerage", "401k", "Roth IRA"];
  return legacyNames.every((name) => accounts.some((account) => account.name === name));
}

export function useFinancePlan(): FinancePlanContextValue {
  const context = useContext(FinancePlanContext);
  if (!context) {
    throw new Error("useFinancePlan must be used inside FinancePlanProvider.");
  }
  return context;
}
