import { ProjectionChart, LiquidityAreaChart, DebtTimelineChart, AccountMixChart, MoneyFlowTrajectoryChart, ScenarioComparisonChart } from "../components/charts/FinanceCharts";
import { KpiCard, Panel, Pills, SectionTitle, StatList } from "../components/ui/Elements";
import { useFinancePlan } from "../hooks/useFinancePlan";
import { formatCurrency, formatPercent } from "../utils/formatting";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const { dashboard, state, setUiPreferences } = useFinancePlan();
  const navigate = useNavigate();
  const activeScenario = state.scenarios.find((scenario) => scenario.id === state.uiPreferences.selectedScenarioId) ?? state.scenarios[0];

  return (
    <div className="space-y-6">
      <SectionTitle title="Financial command center" detail="A desktop-first planning dashboard that separates accessible cash, future wealth, debt drag, and your long-range trajectory." />

      <div className="grid grid-cols-6 gap-4">
        <KpiCard label="Total Net Worth" value={formatCurrency(dashboard.liquidity.totalNetWorth)} helper="Directionally updated from your planner state" accent="bg-blue-100 text-blue-700" />
        <KpiCard label="Liquid Net Worth" value={formatCurrency(dashboard.liquidity.liquidNetWorth)} helper={`${dashboard.liquidity.emergencyFundRunwayMonths.toFixed(1)} months cash runway`} accent="bg-cyan-100 text-cyan-700" />
        <KpiCard label="Retirement Net Worth" value={formatCurrency(dashboard.liquidity.retirementNetWorth)} helper="Includes Roth, pre-tax, and HSA assets" accent="bg-violet-100 text-violet-700" />
        <KpiCard label="Monthly Surplus" value={formatCurrency(dashboard.tax.takeHomeMonthlyIncome - (state.people.reduce((sum, person) => sum + person.monthlyExpenses, 0) + state.household.sharedMonthlyExpenses + state.household.sharedSavingsGoals))} helper={`Effective tax ${formatPercent(dashboard.tax.effectiveTaxRate)}`} accent="bg-emerald-100 text-emerald-700" />
          <KpiCard label="Debt-Free Date" value={dashboard.debtAvalanche.debtFreeDateLabel} helper={`Snowball saves ${formatCurrency(Math.max(0, dashboard.debtSnowball.interestSavedVsAlternate * -1))} less`} accent="bg-amber-100 text-amber-700" />
          <KpiCard label="FIRE Date" value={dashboard.fire.fireDateLabel} helper={dashboard.fire.fireAge ? `Target age ${dashboard.fire.fireAge}` : "Outside current horizon"} accent="bg-green-100 text-green-700" />
        </div>

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-6">
        <Panel
          title="Net Worth Projection"
          subtitle={`Scenario: ${activeScenario.name}. ${
            state.uiPreferences.nominalDollars
              ? "Nominal dollars show what balances would actually read at that future point in time, including inflation."
              : "Today's dollars convert future values back into current purchasing-power terms so you can compare them in real terms."
          }`}
          right={(
            <Pills
              value={state.uiPreferences.nominalDollars ? "nominal" : "real"}
              onChange={(value) => setUiPreferences({ nominalDollars: value === "nominal" })}
              options={[
                { value: "nominal", label: "Nominal Dollars" },
                { value: "real", label: "Today's Dollars" }
              ]}
            />
          )}
        >
          <ProjectionChart dashboard={dashboard} nominalDollars={state.uiPreferences.nominalDollars} inflation={activeScenario.assumptions.inflation} />
        </Panel>
        <Panel title="Liquidity Breakdown" subtitle="Liquid and restricted wealth over time">
          <LiquidityAreaChart dashboard={dashboard} nominalDollars={state.uiPreferences.nominalDollars} inflation={activeScenario.assumptions.inflation} />
        </Panel>
      </div>

      <div className="grid grid-cols-[1fr_0.9fr_0.8fr] gap-6">
        <Panel title="Debt Payoff Timeline" subtitle={`Avalanche saves ${formatCurrency(dashboard.debtAvalanche.interestSavedVsAlternate)} vs snowball`}>
          <DebtTimelineChart dashboard={dashboard} />
        </Panel>
        <Panel title="Account Mix" subtitle="Current allocation by account type">
          <AccountMixChart dashboard={dashboard} />
        </Panel>
        <Panel title="Tax Strategy" subtitle="Recommended allocation order">
          <ol className="space-y-3">
            {dashboard.strategy.priorityActions.map((action, index) => (
              <li key={action.title} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-ink">{index + 1}. {action.title}</p>
                <p className="mt-1 text-sm text-slate-500">{action.detail}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div>
        <Panel title="Money Flow Snapshot" subtitle="How today&apos;s leftover cash is being deployed between debt and savings">
          <div className="grid grid-cols-[1.05fr_0.95fr] gap-4">
            <MoneyFlowTrajectoryChart dashboard={dashboard} />
            <div className="space-y-4">
              <StatList items={[
                { label: "Allocation pool", value: dashboard.moneyFlow.availableAllocationPoolMonthly },
                { label: "Extra debt", value: dashboard.moneyFlow.actualExtraDebtMonthly },
                { label: "Extra investing", value: dashboard.moneyFlow.actualExtraInvestingMonthly },
                { label: "Extra cash", value: dashboard.moneyFlow.actualExtraCashMonthly },
                { label: "Take-home savings rate", value: dashboard.moneyFlow.takeHomeSavingsRate, format: "percent" },
                { label: "Debt-free date", value: dashboard.moneyFlow.debtFreeDateLabel, format: "plain" }
              ]} />
              <button
                type="button"
                onClick={() => navigate("/money-flow")}
                className="text-sm font-medium text-slateblue"
              >
                Open Money Flow {"->"}
              </button>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-6">
        <Panel title="Scenario Comparison" subtitle="Compare final outcomes across base, conservative, and optimistic paths">
          <ScenarioComparisonChart dashboard={dashboard} />
        </Panel>
        <Panel title="Single vs Dual Income Planning" subtitle="Household burden and fairness view">
          {dashboard.fairness ? (
            <div className="space-y-4">
              <StatList items={[
                { label: "Person A shared burden", value: dashboard.fairness.burdenByPerson.personA, format: "percent" },
                { label: "Person B shared burden", value: dashboard.fairness.burdenByPerson.personB, format: "percent" },
                { label: "Person A post-shared surplus", value: dashboard.fairness.surplusByPerson.personA },
                { label: "Person B post-shared surplus", value: dashboard.fairness.surplusByPerson.personB }
              ]} />
              {dashboard.fairness.warning ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {dashboard.fairness.warning}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500">
              Switch to dual-income planning to unlock shared expense fairness analysis.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
