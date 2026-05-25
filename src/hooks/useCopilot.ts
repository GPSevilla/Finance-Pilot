import { useEffect, useMemo, useState } from "react";
import { buildCopilotContextString } from "../engine/copilotContext";
import type { CopilotMessage, CopilotSettings, CopilotSource } from "../types/copilot";
import type { DashboardSnapshot, FinancePlanState } from "../types/finance";
import { clearCopilotMessages, defaultCopilotSettings, loadCopilotMessages, loadCopilotSettings, saveCopilotMessages, saveCopilotSettings } from "../utils/copilotStorage";

const SYSTEM_PROMPT = [
  "You are Finance Copilot inside Finance Pilot.",
  "Use the supplied planner context as the source of truth for user-specific facts.",
  "Do not invent balances, debts, ages, or assumptions that are not in context.",
  "Explain outputs in plain English, point out tradeoffs, and suggest next actions.",
  "Clearly state when something depends on assumptions or when the answer is based on general finance information rather than the user's data.",
  "Do not present formal financial, legal, or tax advice."
].join(" ");

export function useCopilot(state: FinancePlanState, dashboard: DashboardSnapshot) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CopilotSettings>(() => loadCopilotSettings());
  const [messages, setMessages] = useState<CopilotMessage[]>(() => loadCopilotMessages());
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const context = useMemo(() => buildCopilotContextString(state, dashboard), [state, dashboard]);

  useEffect(() => {
    saveCopilotSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveCopilotMessages(messages);
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending) {
      return;
    }

    if (!settings.apiKey.trim()) {
      setShowSettings(true);
      setError("Add your API key before sending a Finance Copilot message.");
      return;
    }

    setError(null);
    setIsSending(true);
    const nextUserMessage: CopilotMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString()
    };

    const previousMessages = [...messages, nextUserMessage];
    setMessages(previousMessages);
    setDraft("");

    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey.trim()}`
        },
        body: JSON.stringify({
          model: settings.model,
          store: false,
          instructions: `${SYSTEM_PROMPT}\n\nCurrent Finance Pilot context:\n${context}`,
          tools: settings.webSearchEnabled
            ? [{
              type: "web_search",
              external_web_access: true,
              user_location: {
                type: "approximate",
                country: "US",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }
            }]
            : undefined,
          tool_choice: "auto",
          include: settings.webSearchEnabled ? ["web_search_call.action.sources"] : undefined,
          input: previousMessages.slice(-10).map((message) => ({
            role: message.role,
            content: message.content
          })),
          max_output_tokens: 900
        })
      });

      if (!response.ok) {
        const details = await safeJson(response);
        throw new Error(details?.error?.message ?? "Finance Copilot could not complete the request.");
      }

      const payload = await response.json();
      const assistantText = extractResponseText(payload);
      const sources = extractSources(payload);

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantText || "I couldn't find a useful answer for that yet. Try rephrasing the question.",
          createdAt: new Date().toISOString(),
          sources
        }
      ]);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Finance Copilot hit an unexpected error.";
      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: message,
          createdAt: new Date().toISOString(),
          error: true
        }
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function updateSettings(patch: Partial<CopilotSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  function resetSettings() {
    setSettings(defaultCopilotSettings());
  }

  function clearConversation() {
    setMessages([]);
    clearCopilotMessages();
  }

  return {
    isOpen,
    setIsOpen,
    showSettings,
    setShowSettings,
    settings,
    updateSettings,
    resetSettings,
    messages,
    draft,
    setDraft,
    isSending,
    error,
    sendMessage,
    clearConversation,
    context
  };
}

export type CopilotController = ReturnType<typeof useCopilot>;

async function safeJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractResponseText(payload: any): string {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const texts: string[] = [];
  for (const item of payload?.output ?? []) {
    if (item?.type === "message") {
      for (const content of item.content ?? []) {
        if (typeof content?.text === "string") {
          texts.push(content.text);
        }
      }
    }
  }

  return texts.join("\n\n").trim();
}

function extractSources(payload: any): CopilotSource[] {
  const found = new Map<string, CopilotSource>();
  visit(payload, (value) => {
    if (hasUrlRecord(value)) {
      found.set(value.url, {
        url: value.url,
        title: typeof value.title === "string" ? value.title : undefined
      });
    }
  });
  return [...found.values()].slice(0, 8);
}

function visit(value: unknown, visitor: (value: unknown) => void): void {
  visitor(value);
  if (Array.isArray(value)) {
    value.forEach((item) => visit(item, visitor));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => visit(item, visitor));
  }
}

function hasUrlRecord(value: unknown): value is { url: string; title?: string } {
  if (!value || typeof value !== "object") {
    return false;
  }
  return "url" in value && typeof (value as { url?: unknown }).url === "string";
}
