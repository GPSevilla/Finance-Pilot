# Finance Pilot Next Steps

## Highest priority

### 1. Fix income and bonus handling in Money Flow

Current issue:

- recurring monthly inflow is too close to a smoothed annual-income model
- bonus should not automatically behave like ordinary monthly inflow

Recommended change:

- use base annual salary to derive recurring monthly inflow
- treat bonus separately
- add bonus handling modes:
  - annual lump sum
  - smooth across year
  - ignore in recurring cash flow

### 1b. Add Chatbot Copilot

New feature area:

- bottom-right chat popover
- user-provided API key
- local-only key storage
- structured Finance Pilot context
- explanatory guidance using the user’s actual planner data

Reference spec:

- `CHATBOT_COPILOT_SPEC.md`

### 2. Improve Money Flow allocation UX

Current Money Flow is useful, but could become much clearer with:

- a more explicit next-dollar allocation planner
- side-by-side comparison presets like:
  - debt first
  - split debt and invest
  - invest first
- maybe a true waterfall chart component later instead of the current stacked UI representation

### 3. Make startup and Money Flow feel more connected

Right now startup captures the base data, but Money Flow is where planning gets interesting.

Useful improvements:

- clearer link from setup income/expenses into money-flow inflow
- helper text explaining exactly how monthly inflow is derived
- clearer explanation of payroll retirement vs take-home investing

## Medium priority

### 4. Code-splitting / bundle size

The build works, but bundle size is large.

Future cleanup:

- split large chart/dashboard code paths
- lazy-load lower-priority sections

### 5. Better scenario editing

Potential improvements:

- richer event editing
- clone scenario
- rename scenario
- scenario-specific money-flow assumptions later if useful

### 6. More polished chart storytelling

Potential additions:

- milestone markers in more places
- stronger labels around debt payoff and redirected cash
- more explicit post-retirement liquidity transitions

## Nice-to-have

### 7. Bonus deployment workflow

Once bonus is treated separately, add a control for:

- use bonus for debt
- use bonus for investing
- use bonus for cash reserve
- split bonus allocation

### 8. Better liquidity education

The tooltip layer is in place now, but later this could include:

- why a bucket matters
- tradeoffs
- when assets become more accessible

### 9. More guided dashboard narrative

The dashboard is already strong, but later it could include:

- “what changed” callouts
- “why this recommendation exists”
- clearer monthly money story for non-technical users

## How to resume quickly on another machine

1. Open the `finance-pilot` folder from OneDrive
2. Read:
   - `HANDOFF.md`
   - `PROJECT_CONTEXT.md`
   - `NEXT_STEPS.md`
3. Then inspect:
   - `src/pages/MoneyFlowPage.tsx`
   - `src/engine/moneyFlow.ts`
   - `src/hooks/useFinancePlan.tsx`
   - `src/types/finance.ts`

## Suggested first prompt for a future session

“Read `HANDOFF.md`, `PROJECT_CONTEXT.md`, and `NEXT_STEPS.md` in the finance-pilot folder, then help me continue from there.”
