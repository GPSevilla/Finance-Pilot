import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { TooltipProps } from "recharts";
import type { DashboardSnapshot, DebtPlanSummary, DebtTimelinePoint } from "../../types/finance";
import { formatCurrency, formatPercent } from "../../utils/formatting";

const palette = ["#2563eb", "#34c759", "#8b5cf6", "#f59e0b", "#ef4444", "#94a3b8"];

export function ProjectionChart({
  dashboard,
  nominalDollars,
  inflation
}: {
  dashboard: DashboardSnapshot;
  nominalDollars: boolean;
  inflation: number;
}) {
  const data = dashboard.activeProjection.map((point) => ({
    ...point,
    netWorth: adjustValue(point.netWorth, point.yearOffset, nominalDollars, inflation),
    investableAssets: adjustValue(point.investableAssets, point.yearOffset, nominalDollars, inflation),
    fireTarget: adjustValue(point.fireTarget, point.yearOffset, nominalDollars, inflation)
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis tickFormatter={(value) => formatCompact(value)} />
        <Tooltip content={<ProjectionTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="netWorth" stroke="#2563eb" strokeWidth={3} dot={false} name="Net worth" />
        <Line type="monotone" dataKey="investableAssets" stroke="#34c759" strokeWidth={2.5} dot={false} name="Investable assets" />
        <Line type="monotone" dataKey="fireTarget" stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="6 5" name="FIRE target" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function LiquidityAreaChart({
  dashboard,
  nominalDollars,
  inflation
}: {
  dashboard: DashboardSnapshot;
  nominalDollars: boolean;
  inflation: number;
}) {
  const data = dashboard.activeProjection.map((point) => ({
    ...point,
    liquidNetWorth: adjustValue(point.liquidNetWorth, point.yearOffset, nominalDollars, inflation),
    restrictedWealth: adjustValue(point.restrictedWealth, point.yearOffset, nominalDollars, inflation)
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis tickFormatter={(value) => formatCompact(value)} />
        <Tooltip content={<ProjectionTooltip />} />
        <Legend />
        <Area type="monotone" dataKey="liquidNetWorth" stackId="1" stroke="#60a5fa" fill="#93c5fd" name="Liquid" />
        <Area type="monotone" dataKey="restrictedWealth" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" name="Restricted" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DebtTimelineChart({ dashboard }: { dashboard: DashboardSnapshot }) {
  const data = mergeDebtTimelines([
    { key: "avalanche", timeline: dashboard.debtAvalanche.payoffTimeline },
    { key: "snowball", timeline: dashboard.debtSnowball.payoffTimeline }
  ]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis tickFormatter={(value) => formatCompact(value)} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Line dataKey="avalanche" stroke="#2563eb" strokeWidth={3} dot={false} name="Avalanche" />
        <Line dataKey="snowball" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Snowball" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DebtPaymentComparisonChart({ plan }: { plan: DebtPlanSummary }) {
  const data = mergeDebtTimelines([
    { key: "planned", timeline: plan.payoffTimeline },
    { key: "minimumOnly", timeline: plan.minimumOnlyTimeline }
  ]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis tickFormatter={(value) => formatCompact(value)} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Line dataKey="planned" stroke="#2563eb" strokeWidth={3} dot={false} name="Planned payment" />
        <Line dataKey="minimumOnly" stroke="#f59e0b" strokeWidth={2.5} dot={false} strokeDasharray="6 4" name="Minimum only" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AccountMixChart({ dashboard }: { dashboard: DashboardSnapshot }) {
  const data = Object.entries(dashboard.liquidity.accountTypePercentages).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-5">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatPercent(value)} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-1 gap-3">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
              <span className="text-sm capitalize text-slate-600">{entry.name.replace(/_/g, " ")}</span>
            </div>
            <span className="text-sm font-semibold text-ink">{formatPercent(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScenarioComparisonChart({ dashboard }: { dashboard: DashboardSnapshot }) {
  const order = ["conservative", "base", "optimistic"];
  const data = [...dashboard.scenarioComparison].sort(
    (left, right) => order.indexOf(left.id) - order.indexOf(right.id)
  );

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatCompact(value)} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Line type="monotone" dataKey="finalNetWorth" stroke="#2563eb" strokeWidth={3} dot name="Final Net Worth" />
        <Line type="monotone" dataKey="liquidNetWorth" stroke="#34c759" strokeWidth={2.5} dot name="Liquid Net Worth" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MoneyFlowTrajectoryChart({ dashboard }: { dashboard: DashboardSnapshot }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={dashboard.moneyFlow.timeline}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis tickFormatter={(value) => formatCompact(value)} />
        <Tooltip content={<ProjectionTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="debtBalance" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Debt Balance" />
        <Line type="monotone" dataKey="investedBalance" stroke="#34c759" strokeWidth={3} dot={false} name="Invested Balance" />
        <Line type="monotone" dataKey="cashBalance" stroke="#2563eb" strokeWidth={2.25} dot={false} name="Cash Reserve" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function adjustValue(value: number, yearOffset: number, nominalDollars: boolean, inflation: number): number {
  if (nominalDollars || yearOffset === 0) {
    return value;
  }
  return value / Math.pow(1 + inflation, yearOffset);
}

function ProjectionTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  const age = payload[0]?.payload?.age;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-panel">
      <p className="text-sm font-semibold text-ink">{label}</p>
      {typeof age === "number" ? <p className="mt-1 text-xs text-slate-500">Age {age}</p> : null}
      <div className="mt-3 space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-500">{entry.name}</span>
            <span className="font-semibold text-ink">{formatCurrency(Number(entry.value ?? 0))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function mergeDebtTimelines(series: Array<{ key: string; timeline: DebtTimelinePoint[] }>) {
  const monthMap = new Map<number, { monthIndex: number; label: string } & Record<string, number | string>>();

  for (const { key, timeline } of series) {
    for (const point of timeline) {
      const existing = monthMap.get(point.monthIndex) ?? {
        monthIndex: point.monthIndex,
        label: point.label
      };
      existing[key] = point.remainingBalance;
      monthMap.set(point.monthIndex, existing);
    }
  }

  const ordered = [...monthMap.values()].sort((left, right) => Number(left.monthIndex) - Number(right.monthIndex));
  let previousValues: Record<string, number> = {};

  return ordered.map((point) => {
    const nextPoint: Record<string, number | string> = { ...point };
    for (const { key } of series) {
      const currentValue = typeof nextPoint[key] === "number" ? Number(nextPoint[key]) : previousValues[key] ?? 0;
      nextPoint[key] = currentValue;
      previousValues = { ...previousValues, [key]: currentValue };
    }
    return nextPoint;
  });
}
