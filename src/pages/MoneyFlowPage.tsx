import { MoneyFlowTrajectoryChart } from "../components/charts/FinanceCharts";
import { CurrencyInput, Panel, Pills, SectionTitle, StatList, WholePercentInput } from "../components/ui/Elements";
import { useFinancePlan } from "../hooks/useFinancePlan";
import { formatCurrency, formatPercent } from "../utils/formatting";

export function MoneyFlowPage() {
  const { dashboard, state, setCashFlow } = useFinancePlan();
  const moneyFlow = dashboard.moneyFlow;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Money flow"
        detail="Direct your leftover monthly cash between faster debt payoff, cash reserves, and market investing. When debt clears, the app automatically redirects that freed-up payment based on your selected rule."
      />

      <div className="grid grid-cols-[0.95fr_1.05fr] gap-6">
        <Panel
          title="Allocation controls"
          subtitle="These controls use your current take-home, expenses, debt payments, and contribution settings."
          right={(
            <Pills
              value={state.cashFlow.strategy}
              onChange={(value) => setCashFlow({ strategy: value as typeof state.cashFlow.strategy })}
              options={[
                { value: "avalanche", label: "Avalanche" },
                { value: "snowball", label: "Snowball" }
              ]}
            />
          )}
        >
          <div className="grid grid-cols-2 gap-4">
            <CurrencyInput
              label="Extra debt allocation"
              value={state.cashFlow.extraDebtAllocationMonthly}
              onChange={(value) => setCashFlow({ extraDebtAllocationMonthly: value })}
            />
            <CurrencyInput
              label="Extra investing allocation"
              value={state.cashFlow.extraInvestingAllocationMonthly}
              onChange={(value) => setCashFlow({ extraInvestingAllocationMonthly: value })}
            />
            <CurrencyInput
              label="Extra cash allocation"
              value={state.cashFlow.extraCashAllocationMonthly}
              onChange={(value) => setCashFlow({ extraCashAllocationMonthly: value })}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold text-ink">After debt payoff</p>
            <p className="mt-1 text-sm text-slate-500">
              Redirect the freed monthly debt budget of {formatCurrency(moneyFlow.redirectedMonthlyAfterDebt)} into investing, cash, or a split.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Pills
                value={state.cashFlow.redirectAfterDebtPayoff}
                onChange={(value) => setCashFlow({ redirectAfterDebtPayoff: value as typeof state.cashFlow.redirectAfterDebtPayoff })}
                options={[
                  { value: "investing", label: "Investing" },
                  { value: "cash", label: "Cash" },
                  { value: "split", label: "Split" }
                ]}
              />
              {state.cashFlow.redirectAfterDebtPayoff === "split" ? (
                <div className="w-44">
                  <WholePercentInput
                    label="Investing share"
                    value={state.cashFlow.redirectInvestingPercent * 100}
                    onChange={(value) => setCashFlow({ redirectInvestingPercent: value / 100 })}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Need the allocation pool to match your real paycheck more closely? Adjust annual income or use tax overrides in Tax Strategy.
          </p>
        </Panel>

        <Panel title="Monthly inflow vs outflow" subtitle="Take-home comes from your startup income and tax settings, then each outflow bucket claims a share of that inflow.">
          <InflowOutflowBar moneyFlow={moneyFlow} />
          <div className="mt-5">
            <MoneyFlowWaterfall moneyFlow={moneyFlow} />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Inflow</p>
              <p className="text-sm font-semibold text-ink">{formatCurrency(moneyFlow.takeHomeMonthlyIncome)}/mo</p>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Payroll retirement of {formatCurrency(moneyFlow.payrollRetirementMonthly)}/mo happens before this take-home number.
            </p>
          </div>

          <StatList items={[
            { label: "Available allocation pool", value: moneyFlow.availableAllocationPoolMonthly },
            { label: "Unallocated", value: moneyFlow.unallocatedMonthly },
            { label: "Overallocated", value: moneyFlow.overallocatedMonthly }
          ]} />

          {moneyFlow.overallocatedMonthly > 0 ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Your requested debt, investing, and cash split is {formatCurrency(moneyFlow.overallocatedMonthly)} above today&apos;s available pool. The model scales those three allocations down proportionally until the plan fits.
            </div>
          ) : null}
        </Panel>
      </div>

      <div className="grid grid-cols-[1.05fr_0.95fr] gap-6">
        <Panel title="Debt vs savings path" subtitle="Current-pace trajectory using your selected debt strategy and return assumption">
          <MoneyFlowTrajectoryChart dashboard={dashboard} />
        </Panel>
        <Panel title="Savings rates and outcomes">
          <StatList items={[
            { label: "Gross savings rate", value: moneyFlow.grossSavingsRate, format: "percent" },
            { label: "Take-home savings rate", value: moneyFlow.takeHomeSavingsRate, format: "percent" },
            { label: "Post-expense savings rate", value: moneyFlow.postExpenseSavingsRate, format: "percent" },
            { label: "Debt-free date", value: moneyFlow.debtFreeDateLabel, format: "plain" },
            { label: "Projected invested balance at debt-free", value: moneyFlow.projectedInvestedBalanceAtDebtFree },
            { label: "Projected invested balance at horizon", value: moneyFlow.projectedInvestedBalanceAtHorizon },
            { label: "Projected cash balance at horizon", value: moneyFlow.projectedCashBalanceAtHorizon },
            { label: "Redirected to investing after payoff", value: moneyFlow.redirectedToInvestingMonthly },
            { label: "Redirected to cash after payoff", value: moneyFlow.redirectedToCashMonthly }
          ]} />
        </Panel>
      </div>
    </div>
  );
}

function InflowOutflowBar({
  moneyFlow
}: {
  moneyFlow: ReturnType<typeof useFinancePlan>["dashboard"]["moneyFlow"];
}) {
  const inflow = Math.max(1, moneyFlow.takeHomeMonthlyIncome);
  const segments = [
    { label: "Living expenses", value: moneyFlow.livingExpensesMonthly, color: "bg-slate-400" },
    { label: "Required debt", value: moneyFlow.requiredDebtPaymentsMonthly, color: "bg-rose-400" },
    { label: "Take-home investing", value: moneyFlow.takeHomeInvestingMonthly, color: "bg-emerald-500" },
    { label: "Shared cash goals", value: moneyFlow.baselineCashGoalsMonthly, color: "bg-cyan-500" },
    { label: "Extra debt", value: moneyFlow.actualExtraDebtMonthly, color: "bg-rose-600" },
    { label: "Extra investing", value: moneyFlow.actualExtraInvestingMonthly, color: "bg-emerald-700" },
    { label: "Extra cash", value: moneyFlow.actualExtraCashMonthly, color: "bg-blue-600" },
    { label: "Unallocated", value: moneyFlow.unallocatedMonthly, color: "bg-slate-200" }
  ].filter((segment) => segment.value > 0);

  const totalOutflow = segments.reduce((sum, segment) => sum + segment.value, 0);
  const barDenominator = totalOutflow > inflow ? totalOutflow : inflow;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="flex h-8 w-full">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className={`${segment.color} h-full`}
              style={{ width: `${(segment.value / barDenominator) * 100}%` }}
              title={`${segment.label}: ${formatCurrency(segment.value)} (${formatPercent(segment.value / inflow)})`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`h-3.5 w-3.5 rounded-full ${segment.color}`} />
              <span className="text-sm text-slate-600">{segment.label}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{formatCurrency(segment.value)}</p>
              <p className="text-xs text-slate-400">{formatPercent(segment.value / inflow)}</p>
            </div>
          </div>
        ))}
      </div>

      {totalOutflow > inflow ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Core outflows are currently above monthly take-home, so the bar is scaled to total outflows instead of income until the plan is back within range.
        </div>
      ) : null}
    </div>
  );
}

function MoneyFlowWaterfall({
  moneyFlow
}: {
  moneyFlow: ReturnType<typeof useFinancePlan>["dashboard"]["moneyFlow"];
}) {
  const inflow = Math.max(1, moneyFlow.takeHomeMonthlyIncome);
  const steps = [
    { label: "Take-home income", delta: moneyFlow.takeHomeMonthlyIncome, tone: "inflow" as const },
    { label: "Living expenses", delta: -moneyFlow.livingExpensesMonthly, tone: "expense" as const },
    { label: "Required debt", delta: -moneyFlow.requiredDebtPaymentsMonthly, tone: "debt" as const },
    { label: "Take-home investing", delta: -moneyFlow.takeHomeInvestingMonthly, tone: "investing" as const },
    { label: "Shared cash goals", delta: -moneyFlow.baselineCashGoalsMonthly, tone: "cash" as const },
    { label: "Extra debt", delta: -moneyFlow.actualExtraDebtMonthly, tone: "debt" as const },
    { label: "Extra investing", delta: -moneyFlow.actualExtraInvestingMonthly, tone: "investing" as const },
    { label: "Extra cash", delta: -moneyFlow.actualExtraCashMonthly, tone: "cash" as const },
    { label: "Unallocated", delta: -moneyFlow.unallocatedMonthly, tone: "remaining" as const }
  ].filter((step) => Math.abs(step.delta) > 0);

  let running = 0;
  const rows = steps.map((step) => {
    running += step.delta;
    return {
      ...step,
      remaining: running
    };
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Monthly waterfall</p>
        <p className="text-xs text-slate-400">Running balance after each step</p>
      </div>
      <div className="space-y-3">
        {rows.map((row) => {
          const remainingShare = Math.max(0, Math.min(1, row.remaining / inflow));
          return (
            <div key={row.label} className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">{row.label}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {row.delta >= 0 ? "Adds to monthly inflow" : `${formatPercent(Math.abs(row.delta) / inflow)} of take-home`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${deltaToneClass(row.tone)}`}>
                    {row.delta >= 0 ? "+" : "-"}{formatCurrency(Math.abs(row.delta))}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Remaining {formatCurrency(Math.max(0, row.remaining))}</p>
                </div>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className={`h-full rounded-full ${barToneClass(row.tone)}`}
                  style={{ width: `${remainingShare * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function barToneClass(tone: "inflow" | "expense" | "debt" | "investing" | "cash" | "remaining"): string {
  return {
    inflow: "bg-slateblue",
    expense: "bg-slate-400",
    debt: "bg-rose-500",
    investing: "bg-emerald-600",
    cash: "bg-cyan-500",
    remaining: "bg-slate-300"
  }[tone];
}

function deltaToneClass(tone: "inflow" | "expense" | "debt" | "investing" | "cash" | "remaining"): string {
  return {
    inflow: "text-slateblue",
    expense: "text-slate-600",
    debt: "text-rose-600",
    investing: "text-emerald-700",
    cash: "text-cyan-700",
    remaining: "text-slate-500"
  }[tone];
}
