import { FILING_STATUS_OPTIONS, STATES } from "../data/defaults";
import { useFinancePlan } from "../hooks/useFinancePlan";
import { LabeledSelect, Panel, PercentInput, SectionTitle, StatList } from "../components/ui/Elements";

export function TaxPage() {
  const { state, dashboard, setTaxProfile } = useFinancePlan();

  return (
    <div className="space-y-6">
      <SectionTitle title="Tax strategy" detail="Directional federal, payroll, and state estimates with visible manual override support." />
      <div className="grid grid-cols-[1fr_0.9fr] gap-6">
        <Panel title="Tax inputs">
          <div className="grid grid-cols-2 gap-4">
            <LabeledSelect label="State" value={state.taxProfile.state} onChange={(value) => setTaxProfile({ state: value })} options={STATES.map((item) => ({ value: item, label: item }))} />
            <LabeledSelect label="Filing status" value={state.taxProfile.filingStatus} onChange={(value) => setTaxProfile({ filingStatus: value as typeof state.taxProfile.filingStatus })} options={FILING_STATUS_OPTIONS} />
            <PercentInput label="Effective tax override" value={state.taxProfile.effectiveTaxRateOverride ?? 0} onChange={(value) => setTaxProfile({ effectiveTaxRateOverride: value, federalTaxMode: "manual_override" })} step={0.1} />
            <PercentInput label="State tax override" value={state.taxProfile.stateTaxRateOverride ?? 0} onChange={(value) => setTaxProfile({ stateTaxRateOverride: value, stateTaxMode: "manual_override" })} step={0.1} />
          </div>
        </Panel>
        <Panel title="Tax outputs">
          <StatList items={[
            { label: "Gross annual income", value: dashboard.tax.grossAnnualIncome },
            { label: "Taxable annual income", value: dashboard.tax.taxableAnnualIncome },
            { label: "Federal income tax", value: dashboard.tax.federalIncomeTax },
            { label: "Payroll tax", value: dashboard.tax.payrollTax },
            { label: "State income tax", value: dashboard.tax.stateIncomeTax },
            { label: "Take-home monthly income", value: dashboard.tax.takeHomeMonthlyIncome }
          ]} />
          <p className="mt-4 text-sm text-slate-500">
            Tax estimates are for planning purposes only and may not reflect your actual tax liability.
          </p>
          {dashboard.tax.stateOverrideRequired ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              This state uses a placeholder estimate. Add a state override for more reliable planning.
            </div>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}
