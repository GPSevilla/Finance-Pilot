import { useFinancePlan } from "../hooks/useFinancePlan";
import { LabeledInput, Panel, PercentInput, SectionTitle } from "../components/ui/Elements";

export function ScenariosPage() {
  const { state, updateScenario } = useFinancePlan();

  return (
    <div className="space-y-6">
      <SectionTitle title="Scenarios" detail="Base, conservative, and optimistic assumptions drive separate long-range projections and comparison charts." />
      <div className="rounded-3xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-slate-600">
        The default assumptions start from historical averages and common planning rules of thumb. Adjust them when you want a more conservative or more personalized forecast.
      </div>
      <div className="space-y-4">
        {state.scenarios.map((scenario) => (
          <Panel key={scenario.id} title={scenario.name} subtitle="Edit assumptions for this scenario">
            <div className="grid grid-cols-4 gap-4">
              <PercentInput label="Expected return" value={scenario.assumptions.expectedReturn} onChange={(value) => updateScenario(scenario.id, { assumptions: { ...scenario.assumptions, expectedReturn: value } })} />
              <PercentInput label="Inflation" value={scenario.assumptions.inflation} onChange={(value) => updateScenario(scenario.id, { assumptions: { ...scenario.assumptions, inflation: value } })} />
              <PercentInput label="Income growth" value={scenario.assumptions.incomeGrowth} onChange={(value) => updateScenario(scenario.id, { assumptions: { ...scenario.assumptions, incomeGrowth: value } })} />
              <PercentInput label="Expense growth" value={scenario.assumptions.expenseGrowth} onChange={(value) => updateScenario(scenario.id, { assumptions: { ...scenario.assumptions, expenseGrowth: value } })} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
