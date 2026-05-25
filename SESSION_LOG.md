# Finance Pilot Session Log

This file is meant to be appended over time with major product, UX, and engine decisions.

## 2026-05-20

### Project framing

- Confirmed this should be a separate app from the old personal finance dashboard
- Desktop-only MVP for now
- Local-first architecture with no backend
- Deterministic calculator logic separated from UI

### Core app implementation

- Built `finance-pilot` as a React + TypeScript + Vite app
- Added setup flow, dashboard, accounts, liquidity, debt, FIRE, scenarios, tax, dual-income, settings
- Added local browser persistence and JSON import/export

### UX decisions

- Numeric inputs should allow clearing without forcing the user to delete a default `0`
- Currency fields should show a dollar prefix
- Percent fields should display as percentages, not raw decimals
- Remove sliders from most editing contexts; keep them only where they help in startup
- Keep visual fields readable without truncation
- Base scenario should appear in the middle of scenario comparisons

### Debt decisions

- Added planned payment alongside minimum payment
- Added remaining loan term for fixed-term loans
- Credit cards remain revolving debt
- Fixed-term loans compute an amortizing minimum payment floor
- Planned payment should remain editable and not fight the user while typing
- Currency displays should truncate cents in debt input fields
- Added avalanche vs snowball explanation on Debt page

### Liquidity decisions

- Added tier explanations for immediate, flexible, conditional, restricted, and illiquid
- Liquidity page should explain what each bucket means and which account types belong there
- Liquidity tooltips also show which current accounts fall into each tier
- Retirement assets should transition out of restricted treatment after retirement-access age in projection logic

### FIRE decisions

- Added desired retirement age
- Back-calculate required annual and monthly savings
- Support FIRE number override and editable retirement spending
- Explain nominal vs today’s dollars more clearly

### Money Flow decisions

- Added Money Flow as a top-level planning area
- Moved Money Flow to second in the sidebar, under Dashboard
- Added allocation controls for:
  - extra debt payoff
  - extra investing
  - extra cash savings
- Added redirect rules after debt payoff:
  - investing
  - cash
  - split
- Added savings-rate outputs
- Added debt vs invested-balance trajectory
- Added 100% inflow / outflow bar
- Added monthly waterfall showing the running remaining balance after each outflow

### Chatbot copilot direction

- Agreed that the chatbot should appear as a small popover in the bottom-right corner
- It should use structured Finance Pilot user data as context
- It should support a user-provided API key so there is no model cost to us
- It should store that key locally in browser storage only
- The first version should focus on app-data explanations before broader internet-aware finance research

### Chatbot copilot implementation

- Built first-pass bottom-right Finance Copilot popover
- Added local browser storage for copilot API key, model choice, and recent messages
- Added structured planner-context builder from Finance Pilot state and dashboard outputs
- Added OpenAI Responses API request path
- Added optional live web-search toggle using the Responses API web search tool
- Added in-app warning that browser-stored API keys are convenient but less secure than a backend proxy
- Verified production build and test suite after integration

### Important open modeling issue

- Monthly inflow currently behaves too much like a smoothed annual-income model
- Bonus should probably not be automatically folded into recurring monthly inflow
- Preferred future direction:
  - recurring monthly inflow from base salary only
  - bonus handled separately as lump sum / optional smoothing / separate deployment decision

### Handoff files created

- `HANDOFF.md`
- `PROJECT_CONTEXT.md`
- `NEXT_STEPS.md`
- `SESSION_LOG.md`
