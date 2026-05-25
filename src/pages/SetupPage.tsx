import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ACCOUNT_TYPE_OPTIONS, DEBT_TYPE_OPTIONS, FILING_STATUS_OPTIONS, FINANCIAL_GOALS, STATES } from "../data/defaults";
import { useFinancePlan } from "../hooks/useFinancePlan";
import { ActionButton, CurrencyInput, CurrencySliderInput, LabeledInput, LabeledSelect, Panel, PercentInput, Pills, SectionTitle } from "../components/ui/Elements";

const steps = ["Basics", "Accounts", "Debts", "Assumptions", "Review"];
const FINANCIAL_SETUP_ACCOUNT_TYPES = [
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
  "hsa"
];
const ASSET_SETUP_ACCOUNT_TYPES = ["home_equity", "vehicle", "other_asset"];

function getSetupAccountLabel(value: string) {
  if (value === "taxable_brokerage") {
    return "Brokerage";
  }
  return ACCOUNT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function SetupPage() {
  const {
    state,
    setProfile,
    setTaxProfile,
    setAssumptions,
    setHousehold,
    updatePerson,
    addAccount,
    updateAccount,
    removeAccount,
    addDebt,
    updateDebt,
    removeDebt,
    setUiPreferences
  } = useFinancePlan();
  const [stepIndex, setStepIndex] = useState(0);
  const financialAccounts = state.accounts.filter((account) => FINANCIAL_SETUP_ACCOUNT_TYPES.includes(account.type));
  const assetAccounts = state.accounts.filter((account) => ASSET_SETUP_ACCOUNT_TYPES.includes(account.type));
  const financialAccountOptions = ACCOUNT_TYPE_OPTIONS
    .filter((option) => FINANCIAL_SETUP_ACCOUNT_TYPES.includes(option.value))
    .map((option) => ({ value: option.value, label: getSetupAccountLabel(option.value) }));
  const assetAccountOptions = ACCOUNT_TYPE_OPTIONS
    .filter((option) => ASSET_SETUP_ACCOUNT_TYPES.includes(option.value))
    .map((option) => ({ value: option.value, label: option.label }));

  if (state.uiPreferences.setupComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,81,195,0.16),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-10 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between">
          <SectionTitle
            eyebrow="Finance Pilot"
            title="Build your planning cockpit"
            detail="This wizard sets the foundation for your dashboard. You can refine everything later without losing the local-first workflow."
          />
          <div className="rounded-2xl bg-white/80 px-5 py-3 text-sm text-slate-500 shadow-panel">
            Step {stepIndex + 1} of {steps.length}: <span className="font-semibold text-ink">{steps[stepIndex]}</span>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-5 gap-3">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => setStepIndex(index)}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                index === stepIndex
                  ? "bg-slateblue text-white shadow-panel"
                  : index < stepIndex
                    ? "bg-white text-slateblue"
                    : "bg-white/70 text-slate-400"
              }`}
            >
              {step}
            </button>
          ))}
        </div>

        <Panel className="min-h-[560px] bg-white/90 p-8">
          {stepIndex === 0 ? (
            <div className="space-y-8">
              <SectionTitle
                title="Tell us about your plan"
                detail="Enter the core household and current-finance details that power the rest of the app."
              />

              <div className="grid grid-cols-[0.9fr_1.1fr] gap-8">
                <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm font-semibold text-ink">Who is this plan for?</p>
                  <Pills
                    value={state.profile.planningType}
                    onChange={(value) => setProfile({ planningType: value as typeof state.profile.planningType })}
                    options={[
                      { value: "single", label: "Just Me" },
                      { value: "dual", label: "Household" }
                    ]}
                  />
                  <p className="text-sm leading-6 text-slate-500">
                    Start with just your finances or plan for a household with two people and shared expenses. You can switch later.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <LabeledSelect
                    label="State"
                    value={state.profile.state}
                    onChange={(value) => {
                      setProfile({ state: value });
                      setTaxProfile({ state: value });
                    }}
                    options={STATES.map((value) => ({ value, label: value }))}
                  />
                  <LabeledSelect
                    label="Filing status"
                    value={state.profile.filingStatus}
                    onChange={(value) => {
                      setProfile({ filingStatus: value as typeof state.profile.filingStatus });
                      setTaxProfile({ filingStatus: value as typeof state.profile.filingStatus });
                    }}
                    options={FILING_STATUS_OPTIONS}
                  />
                  <CurrencySliderInput
                    label={state.profile.planningType === "dual" ? "Person 1 annual income" : "Annual income"}
                    value={state.people[0].annualIncome}
                    onChange={(value) => updatePerson("personA", { annualIncome: value })}
                    min={0}
                    max={500000}
                    step={1000}
                  />
                  {state.profile.planningType === "dual" ? (
                    <CurrencySliderInput
                      label="Person 2 annual income"
                      value={state.people[1].annualIncome}
                      onChange={(value) => updatePerson("personB", { annualIncome: value })}
                      min={0}
                      max={500000}
                      step={1000}
                    />
                  ) : null}
                  <CurrencyInput
                    label="Household monthly expenses"
                    value={state.household.sharedMonthlyExpenses}
                    onChange={(value) => {
                      setHousehold({ sharedMonthlyExpenses: value });
                      updatePerson("personA", { monthlyExpenses: 0 });
                      if (state.profile.planningType === "dual") {
                        updatePerson("personB", { monthlyExpenses: 0 });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {stepIndex === 1 ? (
            <div className="space-y-5">
              <SectionTitle
                title="Add your accounts and assets"
                detail="Start with the common financial accounts most people recognize, then add larger assets like home equity separately."
              />

              <div className="inline-block max-w-full space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-ink">Accounts</p>
                    <p className="text-sm text-slate-500">Checking, savings, brokerage, and retirement balances.</p>
                  </div>
                  <ActionButton icon="plus" onClick={() => addAccount()}>
                    Add account
                  </ActionButton>
                </div>

                <div className="space-y-4">
                  {financialAccounts.map((account) => (
                    <div key={account.id} className="inline-grid grid-cols-[160px_190px_160px_auto] gap-4 rounded-3xl border border-slate-200 bg-white p-4">
                      <LabeledInput label="Name" value={account.name} onChange={(value) => updateAccount(account.id, { name: value })} />
                      <LabeledSelect
                        label="Type"
                        value={account.type}
                        onChange={(value) => updateAccount(account.id, { type: value as typeof account.type })}
                        options={financialAccountOptions}
                      />
                      <CurrencyInput label="Balance" value={account.balance} onChange={(value) => updateAccount(account.id, { balance: value })} />
                      <div className="flex items-end">
                        <ActionButton variant="danger" icon="trash" onClick={() => removeAccount(account.id)}>
                          Remove
                        </ActionButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="inline-block max-w-full space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-ink">Other assets</p>
                    <p className="text-sm text-slate-500">Home equity, vehicle value, and other non-account assets.</p>
                  </div>
                  <ActionButton
                    icon="plus"
                    onClick={() => addAccount({
                      name: "Home equity",
                      type: "home_equity",
                      liquidityTier: "illiquid",
                      owner: state.profile.planningType === "dual" ? "shared" : "personA"
                    })}
                  >
                    Add asset
                  </ActionButton>
                </div>

                <div className="space-y-4">
                  {assetAccounts.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-6 text-sm text-slate-500">
                      Skip this for now if you just want to enter bank, brokerage, and retirement balances first.
                    </div>
                  ) : null}
                  {assetAccounts.map((account) => (
                    <div key={account.id} className="inline-grid grid-cols-[160px_190px_160px_auto] gap-4 rounded-3xl border border-slate-200 bg-white p-4">
                      <LabeledInput label="Name" value={account.name} onChange={(value) => updateAccount(account.id, { name: value })} />
                      <LabeledSelect
                        label="Type"
                        value={account.type}
                        onChange={(value) => updateAccount(account.id, { type: value as typeof account.type })}
                        options={assetAccountOptions}
                      />
                      <CurrencyInput label="Value" value={account.balance} onChange={(value) => updateAccount(account.id, { balance: value })} />
                      <div className="flex items-end">
                        <ActionButton variant="danger" icon="trash" onClick={() => removeAccount(account.id)}>
                          Remove
                        </ActionButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {stepIndex === 2 ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <SectionTitle title="Add your debts" detail="Debt inputs power payoff comparisons, runway accuracy, and strategy recommendations." />
                <ActionButton icon="plus" onClick={() => addDebt()}>
                  Add debt
                </ActionButton>
              </div>
              <div className="space-y-4">
                {state.debts.map((debt) => (
                  <div key={debt.id} className="inline-grid grid-cols-[160px_180px_160px_140px_auto] gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <LabeledInput label="Name" value={debt.name} onChange={(value) => updateDebt(debt.id, { name: value })} />
                    <LabeledSelect label="Type" value={debt.type} onChange={(value) => updateDebt(debt.id, { type: value as typeof debt.type })} options={DEBT_TYPE_OPTIONS} />
                    <CurrencyInput label="Balance" value={debt.balance} onChange={(value) => updateDebt(debt.id, { balance: value })} />
                    <PercentInput label="Annual interest rate" value={debt.apr} onChange={(value) => updateDebt(debt.id, { apr: value })} step={0.01} />
                    <div className="flex items-end">
                      <ActionButton variant="danger" icon="trash" onClick={() => removeDebt(debt.id)}>
                        Remove
                      </ActionButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {stepIndex === 3 ? (
            <div className="space-y-5">
              <div className="rounded-3xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-slate-600">
                Default assumptions are based on long-run historical averages and common planning heuristics. They are useful starting points, not predictions.
              </div>
              <div className="grid grid-cols-3 gap-5">
                <CurrencyInput
                  label="Target annual retirement spending"
                  value={state.household.targetAnnualRetirementSpending}
                  onChange={(value) => setHousehold({ targetAnnualRetirementSpending: value })}
                />
                <PercentInput label="Expected return" value={state.assumptions.expectedReturn} onChange={(value) => setAssumptions({ expectedReturn: value })} />
                <PercentInput label="Volatility" value={state.assumptions.volatility} onChange={(value) => setAssumptions({ volatility: value })} />
                <PercentInput label="Inflation" value={state.assumptions.inflation} onChange={(value) => setAssumptions({ inflation: value })} />
                <PercentInput label="Income growth" value={state.assumptions.incomeGrowth} onChange={(value) => setAssumptions({ incomeGrowth: value })} />
                <PercentInput label="Expense growth" value={state.assumptions.expenseGrowth} onChange={(value) => setAssumptions({ expenseGrowth: value })} />
                <LabeledInput
                  label="Projection years"
                  value={state.assumptions.projectionYears}
                  onChange={(value) => setAssumptions({ projectionYears: Number(value) })}
                  type="number"
                  min={1}
                  max={100}
                  zeroAsEmpty
                />
              </div>
            </div>
          ) : null}

          {stepIndex === 4 ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-500">Plan snapshot</p>
                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <p>Plan scope: <span className="font-semibold text-ink">{state.profile.planningType === "dual" ? "Household" : "Just Me"}</span></p>
                  <p>State: <span className="font-semibold text-ink">{state.profile.state}</span></p>
                  <p>Goal: <span className="font-semibold text-ink">{FINANCIAL_GOALS.find((item) => item.value === state.profile.primaryGoal)?.label}</span></p>
                  <p>Accounts: <span className="font-semibold text-ink">{state.accounts.length}</span></p>
                  <p>Debts: <span className="font-semibold text-ink">{state.debts.length}</span></p>
                </div>
              </div>
              <div className="rounded-3xl bg-blue-50 p-6 text-slate-700">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slateblue">Ready to launch</p>
                <p className="mt-3 text-lg font-semibold text-ink">You can refine assumptions and data later from the dashboard, accounts, debt, and settings sections.</p>
              </div>
            </div>
          ) : null}

          <div className="mt-10 flex justify-between">
            <ActionButton variant="secondary" onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>
              Back
            </ActionButton>
            {stepIndex === steps.length - 1 ? (
              <ActionButton onClick={() => setUiPreferences({ setupComplete: true })}>
                Open dashboard
              </ActionButton>
            ) : (
              <ActionButton onClick={() => setStepIndex((current) => Math.min(steps.length - 1, current + 1))}>
                Continue
              </ActionButton>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
