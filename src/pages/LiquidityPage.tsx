import { Info } from "lucide-react";
import { ACCOUNT_TYPE_OPTIONS } from "../data/defaults";
import { resolveLiquidityTier } from "../engine/common";
import { useFinancePlan } from "../hooks/useFinancePlan";
import type { FinancialAccount, LiquidityTier } from "../types/finance";
import { formatCurrency, formatPercent } from "../utils/formatting";
import { Panel, SectionTitle } from "../components/ui/Elements";

const LIQUIDITY_TIER_DETAILS: Record<
  LiquidityTier,
  { title: string; definition: string; examples: string[] }
> = {
  immediate: {
    title: "Immediate",
    definition: "Money you can usually spend today without selling, transferring, or creating tax consequences.",
    examples: ["Checking", "Savings", "HYSA", "Money market"]
  },
  flexible: {
    title: "Flexible",
    definition: "Assets that are fairly accessible, but may require selling investments and can move around with markets.",
    examples: ["Taxable brokerage", "Other liquid investments"]
  },
  conditional: {
    title: "Conditional",
    definition: "Money that can be accessed in some cases, but only under specific rules or with extra recordkeeping.",
    examples: ["Roth IRA contribution basis", "HSA reimbursements"]
  },
  restricted: {
    title: "Restricted",
    definition: "Retirement-designated assets that are generally meant for later use and may face age or tax constraints.",
    examples: ["401k", "Traditional IRA", "Rollover IRA", "403b", "Roth earnings"]
  },
  illiquid: {
    title: "Illiquid",
    definition: "Wealth that exists on paper but is not easy to tap quickly without selling or borrowing against an asset.",
    examples: ["Home equity", "Vehicle value", "Private investments", "Other illiquid assets"]
  }
};

const TIER_ORDER: LiquidityTier[] = ["immediate", "flexible", "conditional", "restricted", "illiquid"];

export function LiquidityPage() {
  const { dashboard, state } = useFinancePlan();

  return (
    <div className="space-y-6">
      <SectionTitle title="Liquidity" detail="Wealth is separated into immediate, flexible, conditional, restricted, and illiquid buckets so accessible money stays visible." />
      <div className="grid grid-cols-2 gap-6">
        <Panel title="Runway view">
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-600">Cash runway</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{dashboard.liquidity.emergencyFundRunwayMonths.toFixed(1)} months</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Based on immediate liquidity only: checking, savings, HYSA, and money market balances.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-600">Extended runway</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{dashboard.liquidity.extendedRunwayMonths.toFixed(1)} months</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Includes broader accessible assets, such as flexible and conditional liquidity, in addition to cash-like accounts.
              </p>
            </div>
          </div>
        </Panel>
        <Panel title="Runway note">
          <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
            Cash runway is meant to answer “How many months could I cover core spending with true savings-like assets?”
            Extended runway is a broader planning view and may include assets like brokerage or conditional-access accounts.
          </div>
        </Panel>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Panel title="Liquidity tiers">
          <div className="space-y-3">
            {TIER_ORDER.map((tier) => (
              <LiquidityTierRow
                key={tier}
                tier={tier}
                value={dashboard.liquidity.tierTotals[tier]}
                currentAccounts={currentAccountsForTier(state.accounts, tier)}
              />
            ))}
          </div>
        </Panel>
        <Panel title="Tier percentages">
          <div className="space-y-3">
            {TIER_ORDER.map((tier) => (
              <LiquidityTierRow
                key={tier}
                tier={tier}
                value={dashboard.liquidity.tierPercentages[tier]}
                format="percent"
                currentAccounts={currentAccountsForTier(state.accounts, tier)}
              />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function LiquidityTierRow({
  tier,
  value,
  format = "currency",
  currentAccounts
}: {
  tier: LiquidityTier;
  value: number;
  format?: "currency" | "percent";
  currentAccounts: string[];
}) {
  const details = LIQUIDITY_TIER_DETAILS[tier];

  return (
    <div className="group relative flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">{details.title}</span>
        <div className="relative">
          <Info className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
          <div className="pointer-events-none absolute left-0 top-6 z-20 hidden w-80 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-panel group-hover:block">
            <p className="text-sm font-semibold text-ink">{details.title} liquidity</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{details.definition}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Typical accounts</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{details.examples.join(", ")}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">In this plan</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {currentAccounts.length ? currentAccounts.join(", ") : "No current accounts in this tier."}
            </p>
          </div>
        </div>
      </div>
      <span className="text-sm font-semibold text-ink">
        {format === "percent" ? formatPercent(value) : formatCurrency(value)}
      </span>
    </div>
  );
}

function currentAccountsForTier(
  accounts: FinancialAccount[],
  tier: LiquidityTier
): string[] {
  return accounts
    .filter((account) => resolveLiquidityTier(account) === tier)
    .map((account) => account.name);
}
