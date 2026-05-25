import { CurrencyInput, LabeledInput, Panel, PercentInput, Pills, SectionTitle, StatList } from "../components/ui/Elements";
import { useFinancePlan } from "../hooks/useFinancePlan";

export function FirePage() {
  const { dashboard, state, setHousehold, setAssumptions, setUiPreferences, updatePerson } = useFinancePlan();
  const primaryPerson = state.people[0];

  return (
    <div className="space-y-6">
      <SectionTitle title="FIRE planning" detail="Track your FIRE number, progress, estimated date, and coast FIRE age from the active scenario." />
      <div className="grid grid-cols-[0.95fr_1.05fr] gap-6">
        <Panel title="FIRE controls" right={(
          <Pills
            value={state.uiPreferences.nominalDollars ? "nominal" : "real"}
            onChange={(value) => setUiPreferences({ nominalDollars: value === "nominal" })}
            options={[
              { value: "nominal", label: "Nominal" },
              { value: "real", label: "Today's Dollars" }
            ]}
          />
        )}>
          <div className="grid grid-cols-2 gap-4">
            <CurrencyInput
              label="FIRE number override"
              value={state.household.fireNumberOverride ?? 0}
              onChange={(value) => setHousehold({ fireNumberOverride: value || undefined })}
            />
            <CurrencyInput
              label="Annual retirement spending"
              value={state.household.targetAnnualRetirementSpending}
              onChange={(value) => setHousehold({ targetAnnualRetirementSpending: value })}
            />
            <PercentInput
              label="Safe withdrawal rate"
              value={state.assumptions.safeWithdrawalRate}
              onChange={(value) => setAssumptions({ safeWithdrawalRate: value })}
              step={0.1}
            />
            <LabeledInput
              label="Desired retirement age"
              value={state.household.desiredRetirementAge ?? 0}
              onChange={(value: string) => setHousehold({ desiredRetirementAge: Number(value) })}
              type="number"
              zeroAsEmpty
            />
            <CurrencyInput
              label="Primary annual income"
              value={primaryPerson.annualIncome}
              onChange={(value) => updatePerson("personA", { annualIncome: value })}
            />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {state.uiPreferences.nominalDollars
              ? "Nominal mode shows what account balances and FIRE targets would literally read at that future date, including inflation."
              : "Today's-dollars mode translates future balances and FIRE targets into current purchasing-power terms."}
          </p>
        </Panel>
        <Panel title="FIRE summary">
        <StatList items={[
          { label: "FIRE number", value: dashboard.fire.fireNumber },
          { label: "Progress", value: dashboard.fire.progress, format: "percent" },
          { label: "FIRE date", value: dashboard.fire.fireDateLabel, format: "plain" },
          { label: "FIRE age", value: dashboard.fire.fireAge ?? "Not within horizon", format: "number", digits: 0 },
          { label: "Coast FIRE age", value: dashboard.fire.coastFireAge ?? "Not yet", format: "number", digits: 0 },
          { label: "Desired retirement age", value: dashboard.fire.desiredRetirementAge ?? "Not set", format: "number", digits: 0 },
          { label: "Required annual savings", value: dashboard.fire.requiredAnnualSavings },
          { label: "Required monthly savings", value: dashboard.fire.requiredMonthlySavings },
          { label: "Current planned annual savings", value: dashboard.fire.currentPlannedAnnualSavings },
          { label: "Annual savings gap", value: dashboard.fire.annualSavingsGap },
          { label: "On track to desired age", value: dashboard.fire.onTrackToDesiredAge === null ? "No target age set" : dashboard.fire.onTrackToDesiredAge ? "Yes" : "Not yet", format: "plain" }
        ]} />
        </Panel>
      </div>
    </div>
  );
}
