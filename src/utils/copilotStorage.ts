import type { CopilotMessage, CopilotSettings } from "../types/copilot";

const COPILOT_SETTINGS_KEY = "finance-pilot-copilot-settings";
const COPILOT_MESSAGES_KEY = "finance-pilot-copilot-messages";

export function defaultCopilotSettings(): CopilotSettings {
  return {
    provider: "openai",
    apiKey: "",
    model: "gpt-4.1-mini",
    webSearchEnabled: true
  };
}

export function loadCopilotSettings(): CopilotSettings {
  if (typeof window === "undefined") {
    return defaultCopilotSettings();
  }

  try {
    const raw = window.localStorage.getItem(COPILOT_SETTINGS_KEY);
    if (!raw) {
      return defaultCopilotSettings();
    }
    return {
      ...defaultCopilotSettings(),
      ...JSON.parse(raw)
    };
  } catch {
    return defaultCopilotSettings();
  }
}

export function saveCopilotSettings(settings: CopilotSettings): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(COPILOT_SETTINGS_KEY, JSON.stringify(settings));
}

export function loadCopilotMessages(): CopilotMessage[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(COPILOT_MESSAGES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCopilotMessages(messages: CopilotMessage[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(COPILOT_MESSAGES_KEY, JSON.stringify(messages.slice(-16)));
}

export function clearCopilotMessages(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(COPILOT_MESSAGES_KEY);
}
