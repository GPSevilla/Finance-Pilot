# Finance Pilot Project Context

## What this app is

Finance Pilot is a local-first personal finance planning app. It is meant to help a user manually enter their financial picture, understand net worth and liquidity, compare debt and investing tradeoffs, and model future outcomes without requiring bank sync, login, or a backend.

## Current product direction

The current implementation is intentionally:

- Desktop-first
- Manual-input-first
- Privacy-friendly
- Deterministic for calculations
- Visual and planning-oriented, not transaction-oriented

Mobile is intentionally out of scope for this MVP pass.

## Major implemented areas

- Setup wizard
- Dashboard
- Net worth / accounts
- Liquidity breakdown
- Debt strategy and payoff
- FIRE planning
- Scenario comparisons
- Tax estimation
- Dual-income planning
- Money Flow planning
- Local JSON import/export

## Important product decisions already made

### 1. This is a separate app

The app lives in:

`C:\Users\stlp\OneDrive - UW\VibeCoding\finance-pilot`

It should be treated as separate from the older personal finance dashboard project.

### 2. Desktop only for MVP

We explicitly chose not to optimize for mobile yet.

### 3. Starter and Advanced share one engine

Starter mode is a presentation simplification, not a separate logic path.

### 4. Local-first only

- No backend
- No login
- Browser storage only
- JSON import/export supported

### 5. Deterministic calculator logic

The LLM is not part of calculations. Math should stay in the engine layer.

## Key UX preferences established during iteration

- Numeric inputs should not force users to delete a `0` before typing
- Currency fields should feel like finance fields
- Percent fields should display as percents, not raw decimals
- Avoid ugly floating-point output like `3.5000000000000004`
- Visual fields should not truncate important content
- Money Flow is a top-level planning surface and should be high in the sidebar
- Scenario Comparison should order scenarios as `Conservative -> Base -> Optimistic`
- Liquidity tiers should be explained with tooltips and account examples

## Key finance behavior currently implemented

### Debt

- Supports avalanche and snowball
- Fixed-term loans compute a term-based minimum payment floor
- Credit cards are treated as revolving debt
- Planned payment is editable and can be higher than computed minimum
- Debt payoff chart and savings-vs-alternative summary exist

### Liquidity

- Tiers: immediate, flexible, conditional, restricted, illiquid
- Liquidity page now includes hover definitions and example accounts
- Current accounts mapped into each tier are shown in the tooltip
- Retirement assets shift out of restricted treatment once retirement-access age is reached in projection logic

### FIRE

- FIRE number
- FIRE progress
- FIRE date / age
- Coast FIRE estimate
- Desired retirement age support
- Required annual/monthly savings back-calculated from desired retirement age

### Money Flow

This is a newer feature area.

It currently supports:

- Allocation of leftover monthly cash between:
  - extra debt payoff
  - extra investing
  - extra cash savings
- Debt strategy selection inside money flow
- Redirect rule after debt payoff:
  - investing
  - cash
  - split
- Inflow / outflow 100% bar
- Monthly waterfall
- Savings rate outputs
- Debt vs invested-balance trajectory

## Important current limitation

Monthly inflow currently treats income more simply than ideal.

Right now the app effectively rolls base salary and bonus together in the broader tax/income model, which means the recurring monthly inflow is too close to a smoothed annual-income view.

The preferred future behavior is:

- monthly recurring inflow based on base salary only
- bonus handled separately
- ideally with options like:
  - ignore in monthly flow
  - treat as annual lump sum
  - smooth across year

This is one of the most important next improvements.

## Core files worth reading first

### State and types

- `src/types/finance.ts`
- `src/hooks/useFinancePlan.tsx`
- `src/data/defaults.ts`
- `src/utils/validation.ts`
- `src/utils/storage.ts`

### Engines

- `src/engine/dashboard.ts`
- `src/engine/liquidity.ts`
- `src/engine/debt.ts`
- `src/engine/fire.ts`
- `src/engine/projections.ts`
- `src/engine/moneyFlow.ts`
- `src/engine/tax.ts`
- `src/engine/common.ts`

### Pages

- `src/pages/DashboardPage.tsx`
- `src/pages/MoneyFlowPage.tsx`
- `src/pages/DebtPage.tsx`
- `src/pages/LiquidityPage.tsx`
- `src/pages/FirePage.tsx`
- `src/pages/ScenariosPage.tsx`

### Layout and charts

- `src/components/layout/AppShell.tsx`
- `src/components/charts/FinanceCharts.tsx`
- `src/components/ui/Elements.tsx`

## Build / test state

At the time of this handoff:

- tests passed
- production build passed

## Notes for the next person or future session

- Preserve the current UX direction; the app has already gone through a lot of iteration
- Keep finance logic deterministic and separate from UI
- Prefer improving the existing experience over adding a lot of brand-new sections
- The next highest-value work is likely around income realism, bonus handling, and more intuitive money-flow planning

