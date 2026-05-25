# Finance Pilot Chatbot Copilot Spec

## Summary

Finance Pilot should offer an optional chatbot copilot as a small popover in the bottom-right corner of the app.

The copilot should:

- use the user’s current Finance Pilot data as structured context
- let the user provide their own API key
- store that key locally in browser storage only
- provide tailored planning explanations and next-step guidance
- clearly distinguish between calculator outputs and chatbot-generated explanation

This feature is optional and should not block core app functionality.

## Product goals

The copilot should help a user:

- understand their dashboard in plain English
- ask follow-up questions about their own finances
- compare tradeoffs between debt payoff, savings, and investing
- explain financial concepts in the context of their actual plan
- identify useful next questions for a CPA or financial advisor

## Non-goals for first pass

- no required backend
- no account creation
- no shared cloud conversation sync
- no autonomous financial advice engine
- no replacing deterministic calculators
- no automatic decision overrides
- no requirement that we pay for model usage

## UX

### Entry point

- persistent button in the bottom-right corner
- label: `Ask Finance Copilot`
- available throughout the authenticated app shell experience, not only on one page
- closed by default

### Popover behavior

- opens into a compact chat panel
- supports:
  - message list
  - text input
  - send button
  - close button
  - API key management shortcut
  - a small context badge like `Using current Finance Pilot data`

### Empty state

Before an API key is configured:

- explain that the copilot uses the user’s own LLM API key
- provide a button to add an API key
- clarify that the key is stored locally in this browser only

Suggested copy:

`Add your own API key to unlock tailored explanations using your Finance Pilot data.`

### Suggested prompts

When chat is empty, offer starter prompts such as:

- `What should I focus on next?`
- `Explain my debt vs investing tradeoff`
- `How does my liquidity look?`
- `Am I on track for my retirement goal?`
- `What assumptions matter most in my plan?`

## Context model

The copilot should not scrape the visible DOM or rely on loosely assembled page text.

It should receive structured context built from app state and deterministic outputs.

### Required structured context

- user goal
- profile mode and planning type
- state and filing status
- people income and expense summary
- accounts summary
- debts summary
- liquidity summary
- tax summary
- FIRE summary
- money flow summary
- active scenario
- active assumptions
- strategy recommendation
- fairness summary if in dual-income mode

### Prompting principle

The prompt should present:

1. deterministic calculator outputs
2. relevant app assumptions
3. user question
4. guidance boundaries

The copilot should explain results, not invent calculator outputs.

## Model and API key handling

### User-provided key

- user pastes their own API key
- key is stored locally in browser storage only
- key is never sent to our backend because there is no backend in MVP

### Provider approach

First pass should be provider-aware but implementation-practical.

Recommended initial approach:

- first support one provider path cleanly
- design data structures so future providers can be added later

Example settings shape:

- provider
- apiKey
- model
- internetAware toggle

### Warning copy

Show a clear note:

`Your API key is stored locally in this browser and used only for your own Finance Copilot requests.`

## Copilot modes

There are two useful modes.

### Mode 1: App-data explainer

Uses structured Finance Pilot data to answer:

- what do these numbers mean
- what tradeoffs am I making
- what should I do next
- what changes if I pay debt faster

This should be the first implemented mode.

### Mode 2: Internet-aware finance Q&A

Uses external web/model knowledge for questions like:

- current contribution limits
- Roth rules
- broad tax-rule changes
- general planning concepts

This should be optional and clearly labeled if added.

Important note:

If internet-aware mode is added later, the UI should distinguish between:

- answers based on your Finance Pilot data
- answers based on general external finance information

## Response boundaries

The copilot should:

- explain
- summarize
- compare
- highlight risks and assumptions
- suggest next questions

The copilot should not:

- claim to be a CPA or fiduciary
- present unsupported tax/legal claims as certain
- silently override calculator results
- invent balances, debts, ages, or assumptions

## Suggested response structure

Recommended default answer format:

1. short answer
2. what in your plan drives this
3. tradeoffs
4. suggested next step

## Privacy and trust

The UI should always remind the user:

- this uses your current Finance Pilot data
- this is planning guidance only
- results are not financial, legal, or tax advice

## User stories

### Story 1

As a beginner, I want to ask plain-English questions about my finances so that I can understand what the app is telling me.

### Story 2

As a planner, I want the copilot to use my actual Finance Pilot data so that the answer is specific to my situation.

### Story 3

As a privacy-conscious user, I want to use my own API key so that I control access and usage cost.

### Story 4

As a cautious user, I want the app to clearly separate deterministic calculations from chatbot explanation so that I know what is model output versus narrative guidance.

## Acceptance criteria

### Core

1. A bottom-right `Ask Finance Copilot` launcher exists throughout the app shell.
2. Clicking it opens a chat popover.
3. If no API key is configured, the popover shows an API key setup flow instead of a broken chat.
4. The user can store an API key locally in the browser.
5. The user can remove or replace the API key.
6. The copilot receives structured Finance Pilot context from the current planner state.
7. The copilot can answer a user question using that current context.
8. The app clearly labels the copilot as explanatory guidance, not formal financial advice.

### UX

9. The popover can be opened and closed without losing the rest of the app state.
10. Suggested prompts are shown for an empty conversation.
11. The popover indicates that it is using current Finance Pilot data.

### Safety / clarity

12. The app does not claim the chatbot is the source of calculator results.
13. The chatbot does not run if no API key is present.
14. The user can see or infer which model/provider is currently configured.

## Recommended implementation plan

### Phase 1: UI shell

- add bottom-right launcher
- add popover panel
- add API key settings UI
- add local storage for copilot settings

### Phase 2: Context builder

- create a structured context builder from dashboard/state outputs
- keep context deterministic and compact
- expose only the fields needed for good answers

### Phase 3: Chat request layer

- implement provider request module
- first support one provider cleanly
- handle request states:
  - idle
  - sending
  - success
  - error

### Phase 4: Conversation UX

- message history within the current local session
- suggested prompts
- system disclaimer

### Phase 5: Optional internet-aware mode

- add explicit toggle
- keep it clearly labeled as external/general information
- preserve separation from deterministic app outputs

## Technical notes

Recommended new files:

- `src/components/copilot/CopilotLauncher.tsx`
- `src/components/copilot/CopilotPopover.tsx`
- `src/components/copilot/CopilotSettings.tsx`
- `src/hooks/useCopilot.ts`
- `src/engine/copilotContext.ts`
- `src/utils/copilotStorage.ts`
- `src/types/copilot.ts`

## Recommended first implementation boundaries

The first shippable version should:

- support local API key entry
- support current-plan context
- answer chat questions about the current financial picture
- stay provider-minimal and app-data-first

It should not yet try to become a full internet finance research assistant unless we intentionally take that on as a later feature.

