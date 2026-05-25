import { createInitialState, STORAGE_KEY, STORAGE_VERSION } from "../data/defaults";
import { financePlanSchema } from "./validation";
import type { FinancePlanState } from "../types/finance";

export function loadState(): FinancePlanState {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialState();
  }

  try {
    const parsed = JSON.parse(raw);
    const validated = financePlanSchema.parse(parsed);
    if (validated.meta.version !== STORAGE_VERSION) {
      return createInitialState();
    }
    return validated as FinancePlanState;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: FinancePlanState): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportState(state: FinancePlanState): string {
  return JSON.stringify(state, null, 2);
}

export function importState(raw: string): FinancePlanState {
  const parsed = JSON.parse(raw);
  const validated = financePlanSchema.parse(parsed);
  if (validated.meta.version !== STORAGE_VERSION) {
    throw new Error("This export uses an unsupported Finance Pilot version.");
  }
  return validated as FinancePlanState;
}

export function resetState(): FinancePlanState {
  const next = createInitialState();
  saveState(next);
  return next;
}
