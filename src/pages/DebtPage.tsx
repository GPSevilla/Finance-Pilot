import { useEffect, useState } from "react";
import { DebtPaymentComparisonChart } from "../components/charts/FinanceCharts";
import { DEBT_TYPE_OPTIONS } from "../data/defaults";
import { requiredDebtPaymentForTerm } from "../engine/common";
import { useFinancePlan } from "../hooks/useFinancePlan";
import { ActionButton, CurrencyInput, LabeledInput, LabeledSelect, Panel, PercentInput, SectionTitle, StatList } from "../components/ui/Elements";
import { formatCurrency } from "../utils/formatting";
import type { DebtAccount } from "../types/finance";

export function DebtPage() {
  const { state, dashboard, addDebt, updateDebt, removeDebt } = useFinancePlan();
  const activePlan = dashboard.activeDebtPlan;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="Debt strategy" detail="Compare avalanche and snowball paths while editing balances, minimums, planned payments, and loan terms." />
        <ActionButton icon="plus" onClick={() => addDebt()}>Add debt</ActionButton>
      </div>

      <Panel title="How the strategies work" subtitle="A quick guide before you compare payoff timelines">
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="font-semibold text-ink">Avalanche</p>
            <p className="mt-2 leading-6">
              Pay extra toward the highest-interest debt first while making minimum payments on the rest.
              This usually minimizes total interest and is often the mathematically cheapest path.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="font-semibold text-ink">Snowball</p>
            <p className="mt-2 leading-6">
              Pay extra toward the smallest balance first while making minimum payments on the rest.
              This can create faster early wins and momentum, even if it sometimes costs more interest overall.
            </p>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="space-y-4">
          {state.debts.map((debt) => (
            <Panel key={debt.id}>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
                <div className="max-w-[220px]">
                  <LabeledInput label="Name" value={debt.name} onChange={(value) => updateDebt(debt.id, { name: value })} />
                </div>
                <LabeledSelect label="Type" value={debt.type} onChange={(value) => updateDebt(debt.id, { type: value as typeof debt.type })} options={DEBT_TYPE_OPTIONS} />
                <CurrencyInput label="Balance" value={debt.balance} onChange={(value) => updateDebt(debt.id, { balance: value })} />
                <div className="max-w-[190px]">
                  <PercentInput label="Annual interest rate" value={debt.apr} onChange={(value) => updateDebt(debt.id, { apr: value })} step={0.01} />
                </div>
                <CurrencyInput
                  label={debt.type === "credit_card" ? "Min payment" : "Min payment (computed)"}
                  value={debt.type === "credit_card" ? debt.minimumPayment : requiredDebtPaymentForTerm(debt)}
                  onChange={(value) => updateDebt(debt.id, { minimumPayment: value })}
                  readOnly={debt.type !== "credit_card"}
                />
                <PlannedPaymentField debt={debt} onCommit={(patch) => updateDebt(debt.id, patch)} />
                {debt.type !== "credit_card" ? (
                  <div className="space-y-2">
                    <LabeledInput
                      label="Remaining term (months)"
                      value={debt.remainingTermMonths ?? 0}
                      onChange={(value) => updateDebt(debt.id, { remainingTermMonths: Number(value) })}
                      type="number"
                      zeroAsEmpty
                    />
                    {debt.remainingTermMonths ? (
                      <p className="px-1 text-xs leading-5 text-slate-500">
                        To finish this loan in {debt.remainingTermMonths} months, the modeled payment floor is{" "}
                        <span className="font-semibold text-slate-700">{formatCurrency(requiredDebtPaymentForTerm(debt))}/mo</span>.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex items-center rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">
                    Revolving debt: no fixed loan term.
                  </div>
                )}
                <div className="flex items-end">
                  <ActionButton variant="danger" icon="trash" onClick={() => removeDebt(debt.id)}>Remove</ActionButton>
                </div>
              </div>
            </Panel>
          ))}
        </div>
        <Panel title="Payoff summary">
          <StatList items={[
            { label: "Avalanche debt-free", value: dashboard.debtAvalanche.debtFreeDateLabel, format: "plain" },
            { label: "Avalanche interest", value: dashboard.debtAvalanche.totalInterestPaid },
            { label: "Avalanche time saved", value: `${dashboard.debtAvalanche.timeSavedVsAlternateMonths} months`, format: "plain" },
            { label: "Snowball debt-free", value: dashboard.debtSnowball.debtFreeDateLabel, format: "plain" },
            { label: "Snowball interest", value: dashboard.debtSnowball.totalInterestPaid },
            { label: "Snowball time saved", value: `${dashboard.debtSnowball.timeSavedVsAlternateMonths} months`, format: "plain" }
          ]} />
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {dashboard.debtAvalanche.timeSavedVsAlternateMonths > 0
              ? `Avalanche saves ${dashboard.debtAvalanche.timeSavedVsAlternateMonths} months and ${formatCurrency(dashboard.debtAvalanche.interestSavedVsAlternate)} compared with snowball.`
              : dashboard.debtSnowball.timeSavedVsAlternateMonths > 0
                ? `Snowball saves ${dashboard.debtSnowball.timeSavedVsAlternateMonths} months, but avalanche still saves ${formatCurrency(dashboard.debtAvalanche.interestSavedVsAlternate)} in interest.`
                : `Both strategies finish on a similar timeline, with avalanche saving ${formatCurrency(dashboard.debtAvalanche.interestSavedVsAlternate)} in interest.`}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-6">
        <Panel
          title="Minimum vs planned payoff"
          subtitle={`${activePlan.strategy === "avalanche" ? "Avalanche" : "Snowball"} ordering, comparing minimum-only payments against your planned payment path`}
        >
          <DebtPaymentComparisonChart plan={activePlan} />
        </Panel>
        <Panel title="What the extra payment buys you">
          <StatList items={[
            { label: "Strategy shown", value: activePlan.strategy === "avalanche" ? "Avalanche" : "Snowball", format: "plain" },
            { label: "Planned-payment debt-free", value: activePlan.debtFreeDateLabel, format: "plain" },
            { label: "Minimum-only debt-free", value: activePlan.minimumOnlyDebtFreeDateLabel, format: "plain" },
            { label: "Time saved vs minimums", value: `${activePlan.timeSavedVsMinimumMonths} months`, format: "plain" },
            { label: "Interest avoided vs minimums", value: activePlan.interestSavedVsMinimum },
            { label: "Minimum-only interest", value: activePlan.minimumOnlyInterestPaid }
          ]} />
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {activePlan.timeSavedVsMinimumMonths > 0
              ? `Your planned payment level gets you out of debt ${activePlan.timeSavedVsMinimumMonths} months earlier and avoids ${formatCurrency(activePlan.interestSavedVsMinimum)} of interest compared with making minimum payments only.`
              : `Your current planned payment is already very close to the minimum-only path, so the biggest remaining choice is strategy rather than payment level.`}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function PlannedPaymentField({
  debt,
  onCommit
}: {
  debt: DebtAccount;
  onCommit: (patch: Partial<DebtAccount>) => void;
}) {
  const committedValue = Math.trunc(debt.plannedPayment ?? debt.minimumPayment);
  const computedFloor = Math.trunc(requiredDebtPaymentForTerm(debt));
  const [draft, setDraft] = useState(committedValue ? String(committedValue) : "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraft(committedValue ? String(committedValue) : "");
    }
  }, [committedValue, isEditing]);

  return (
    <LabeledInput
      label="Planned payment"
      value={draft}
      onChange={setDraft}
      onFocus={() => setIsEditing(true)}
      onBlur={() => {
        setIsEditing(false);
        const trimmed = draft.trim();
        const parsed = trimmed === "" ? computedFloor : Math.trunc(Number(trimmed));
        onCommit({
          plannedPayment: Number.isFinite(parsed) ? Math.max(parsed, computedFloor) : Math.max(committedValue, computedFloor)
        });
      }}
      type="number"
      prefix="$"
      placeholder="0"
    />
  );
}
