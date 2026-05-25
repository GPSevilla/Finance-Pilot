import { useFinancePlan } from "../hooks/useFinancePlan";
import { CurrencyInput, LabeledInput, LabeledSelect, Panel, PercentInput, Pills, SectionTitle, StatList, WholePercentInput } from "../components/ui/Elements";

export function DualIncomePage() {
  const { state, dashboard, updatePerson, setHousehold, setProfile } = useFinancePlan();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="Household planning" detail="Separate person-level income and expenses, then test shared expense splits and fairness." />
        <button
          type="button"
          onClick={() => setProfile({ planningType: state.profile.planningType === "dual" ? "single" : "dual" })}
          className="rounded-2xl bg-slateblue px-4 py-2.5 text-sm font-medium text-white"
        >
          {state.profile.planningType === "dual" ? "Switch to just me" : "Switch to household"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {state.people.map((person) => (
          <Panel key={person.id} title={person.id === "personA" ? "Person A" : "Person B"}>
            <div className="grid grid-cols-2 gap-4">
              <LabeledInput label="Name" value={person.name} onChange={(value) => updatePerson(person.id, { name: value })} />
              <LabeledInput
                label="Age"
                value={person.age}
                onChange={(value) => updatePerson(person.id, { age: Number(value) })}
                type="number"
                zeroAsEmpty
              />
              <CurrencyInput label="Annual income" value={person.annualIncome} onChange={(value) => updatePerson(person.id, { annualIncome: value })} />
              <div className="space-y-3">
                <div className="space-y-2">
                  <span className="block text-sm font-medium text-slate-600">Bonus input mode</span>
                  <Pills
                    value={person.annualBonusMode}
                    onChange={(value) => updatePerson(person.id, { annualBonusMode: value as "amount" | "percent" })}
                    options={[
                      { value: "amount", label: "Dollar Amount" },
                      { value: "percent", label: "% Of Salary" }
                    ]}
                  />
                </div>
                {person.annualBonusMode === "percent" ? (
                  <PercentInput
                    label="Annual bonus"
                    value={person.annualBonusPercent}
                    onChange={(value) => updatePerson(person.id, { annualBonusPercent: value })}
                    step={0.1}
                  />
                ) : (
                  <CurrencyInput
                    label="Annual bonus"
                    value={person.annualBonus}
                    onChange={(value) => updatePerson(person.id, { annualBonus: value })}
                  />
                )}
              </div>
              <CurrencyInput label="Monthly personal expenses" value={person.monthlyExpenses} onChange={(value) => updatePerson(person.id, { monthlyExpenses: value })} />
              <CurrencyInput label="Pre-tax contribution" value={person.preTaxContributionAnnual} onChange={(value) => updatePerson(person.id, { preTaxContributionAnnual: value })} />
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_0.9fr] gap-6">
        <Panel title="Shared household inputs">
          <div className="grid grid-cols-2 gap-4">
            <CurrencyInput label="Shared monthly expenses" value={state.household.sharedMonthlyExpenses} onChange={(value) => setHousehold({ sharedMonthlyExpenses: value })} />
            <CurrencyInput label="Shared savings goals" value={state.household.sharedSavingsGoals} onChange={(value) => setHousehold({ sharedSavingsGoals: value })} />
            <LabeledSelect label="Split method" value={state.household.splitMethod} onChange={(value) => setHousehold({ splitMethod: value as typeof state.household.splitMethod })} options={[
              { value: "equal", label: "50 / 50" },
              { value: "proportional_to_income", label: "Proportional to income" },
              { value: "custom_percentage", label: "Custom percentage" },
              { value: "fully_pooled", label: "Fully pooled" }
            ]} />
            <WholePercentInput label="Person A custom %" value={state.household.customSplitPersonAPercent} onChange={(value) => setHousehold({ customSplitPersonAPercent: value })} />
          </div>
        </Panel>
        <Panel title="Fairness summary">
          {dashboard.fairness ? (
            <>
              <StatList items={[
                { label: "Person A burden", value: dashboard.fairness.burdenByPerson.personA, format: "percent" },
                { label: "Person B burden", value: dashboard.fairness.burdenByPerson.personB, format: "percent" },
                { label: "Person A surplus", value: dashboard.fairness.surplusByPerson.personA },
                { label: "Person B surplus", value: dashboard.fairness.surplusByPerson.personB }
              ]} />
              {dashboard.fairness.warning ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {dashboard.fairness.warning}
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-slate-500">Enable dual-income mode to see the fairness model.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
