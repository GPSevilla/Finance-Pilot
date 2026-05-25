# Finance Pilot

Finance Pilot is a local-first personal finance planning app built for manual entry, scenario modeling, and financial decision support.

This version is designed for personal use, family use, and academic demo/review. It focuses on deterministic calculations for planning, with an optional chatbot layer that can use user-provided LLM API keys.

## What it does

- Manual entry for accounts, debts, income, and expenses
- Net worth and liquidity breakdowns
- Debt payoff modeling
- FIRE planning and retirement target modeling
- Money flow allocation planning
- Scenario comparison
- Local-first browser storage
- Optional chatbot/copilot integration using user-provided API keys

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Zod

## Getting started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Run tests

```bash
npm test
```

## Project notes

- This is an MVP / in-progress class project.
- The app is local-first and does not require a backend.
- Financial outputs are planning estimates, not professional financial, tax, or legal advice.
- The optional copilot is intended for small trusted use with user-provided API keys, not broad public deployment.

## Repository contents

- `src/` application code
- `HANDOFF.md`, `PROJECT_CONTEXT.md`, `NEXT_STEPS.md`, `SESSION_LOG.md` project context and planning notes
- `CHATBOT_COPILOT_SPEC.md` copilot feature spec

