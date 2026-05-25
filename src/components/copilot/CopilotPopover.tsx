import { Bot, Globe, KeyRound, MessageSquare, Send, Settings2, Trash2, X } from "lucide-react";
import type { ChangeEvent } from "react";
import type { CopilotController } from "../../hooks/useCopilot";
import type { CopilotMessage } from "../../types/copilot";

const SUGGESTED_PROMPTS = [
  "What should I focus on next?",
  "Explain my debt vs investing tradeoff.",
  "How does my liquidity look right now?",
  "Am I on track for my retirement goal?",
  "Which assumptions matter most in my plan?"
];

export function CopilotPopover({
  copilot
}: {
  copilot: CopilotController;
}) {
  const hasApiKey = Boolean(copilot.settings.apiKey.trim());

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {copilot.isOpen ? (
        <div className="w-[420px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-slateblue">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Finance Copilot</p>
                  <p className="text-xs text-slate-400">Uses your current Finance Pilot data</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-slate-100 px-2.5 py-1">Model {copilot.settings.model}</span>
                {copilot.settings.webSearchEnabled ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                    <Globe className="h-3 w-3" />
                    Live web search on
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">App-data mode</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copilot.setShowSettings((current) => !current)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500"
                aria-label="Copilot settings"
              >
                <Settings2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => copilot.setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500"
                aria-label="Close copilot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {copilot.showSettings ? (
            <CopilotSettingsPanel copilot={copilot} />
          ) : null}

          {!hasApiKey ? (
            <div className="space-y-4 px-5 py-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-semibold text-ink">Add your API key</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Requests go directly from this browser using your own OpenAI API key and your current Finance Pilot data.
                </p>
                <p className="mt-3 text-xs leading-5 text-amber-700">
                  Browser-stored API keys are convenient for personal use, but less secure than a backend proxy. Use a personal key you control.
                </p>
                <button
                  type="button"
                  onClick={() => copilot.setShowSettings(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slateblue px-4 py-2.5 text-sm font-medium text-white"
                >
                  <KeyRound className="h-4 w-4" />
                  Add API key
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="max-h-[380px] space-y-4 overflow-y-auto px-5 py-5">
                {copilot.messages.length ? (
                  copilot.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                      Ask about your current plan, debt payoff, liquidity, retirement path, or model assumptions.
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {SUGGESTED_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => {
                            copilot.setDraft(prompt);
                            void copilot.sendMessage(prompt);
                          }}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600 transition hover:border-slateblue hover:text-ink"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {copilot.error ? (
                <div className="border-t border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-700">
                  {copilot.error}
                </div>
              ) : null}

              <div className="border-t border-slate-100 px-5 py-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <textarea
                    value={copilot.draft}
                    onChange={(event) => copilot.setDraft(event.target.value)}
                    placeholder="Ask about your debt, investing, taxes, liquidity, or retirement path..."
                    rows={3}
                    className="w-full resize-none bg-transparent text-sm text-ink outline-none"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Planning guidance only, not financial or tax advice
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copilot.clearConversation()}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500"
                        aria-label="Clear conversation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void copilot.sendMessage(copilot.draft)}
                        disabled={copilot.isSending || !copilot.draft.trim()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slateblue px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        {copilot.isSending ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => copilot.setIsOpen((current) => !current)}
        className="inline-flex items-center gap-3 rounded-full bg-slateblue px-5 py-3 text-sm font-medium text-white shadow-xl"
      >
        <Bot className="h-4 w-4" />
        Ask Finance Copilot
      </button>
    </div>
  );
}

function CopilotSettingsPanel({
  copilot
}: {
  copilot: CopilotController;
}) {
  return (
    <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
      <div className="grid grid-cols-1 gap-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">OpenAI API key</span>
          <input
            type="password"
            value={copilot.settings.apiKey}
            onChange={(event) => copilot.updateSettings({ apiKey: event.target.value })}
            placeholder="sk-..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none"
          />
        </label>
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Model</span>
            <select
              value={copilot.settings.model}
              onChange={(event) => copilot.updateSettings({ model: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none"
            >
              <option value="gpt-4.1-mini">gpt-4.1-mini</option>
              <option value="gpt-4.1">gpt-4.1</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
            </select>
          </label>
          <label className="flex items-end gap-2 pb-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={copilot.settings.webSearchEnabled}
              onChange={(event: ChangeEvent<HTMLInputElement>) => copilot.updateSettings({ webSearchEnabled: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            Use live web search
          </label>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Your API key is stored locally in this browser only. Requests go straight from this device to OpenAI.
      </p>
    </div>
  );
}

function MessageBubble({ message }: { message: CopilotMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] rounded-[24px] px-4 py-3 ${isUser ? "bg-slateblue text-white" : message.error ? "bg-rose-50 text-rose-800" : "bg-slate-50 text-ink"}`}>
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        {!isUser && message.sources?.length ? (
          <div className="mt-3 border-t border-slate-200/70 pt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sources</p>
            <div className="mt-2 space-y-1.5">
              {message.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-xs text-slateblue hover:underline"
                >
                  {source.title ?? source.url}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
