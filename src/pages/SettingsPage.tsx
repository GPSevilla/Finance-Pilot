import { useRef } from "react";
import { useFinancePlan } from "../hooks/useFinancePlan";
import { ActionButton, Panel, SectionTitle } from "../components/ui/Elements";
import { exportState } from "../utils/storage";

export function SettingsPage() {
  const { state, importJson, resetAll, setUiPreferences } = useFinancePlan();
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleExport() {
    const blob = new Blob([exportState(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finance-pilot-export.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    const raw = await file.text();
    importJson(raw);
    setUiPreferences({ setupComplete: true });
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Settings" detail="Control local persistence, import/export, and reset actions for this browser-only app." />
      <div className="grid grid-cols-2 gap-6">
        <Panel title="Local data">
          <div className="space-y-3">
            <ActionButton onClick={handleExport}>Export JSON</ActionButton>
            <ActionButton variant="secondary" onClick={() => inputRef.current?.click()}>Import JSON</ActionButton>
            <ActionButton variant="danger" onClick={() => {
              resetAll();
              setUiPreferences({ setupComplete: false });
            }}>
              Reset all local data
            </ActionButton>
            <input
              ref={inputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleImport(file);
                }
              }}
            />
          </div>
        </Panel>
        <Panel title="Planner notes">
          <div className="space-y-4 text-sm text-slate-500">
            <p>All calculations are deterministic and local-first.</p>
            <p>Copilot hooks are present in the data model but no API key flow is exposed in this MVP.</p>
            <p>Resetting data clears the full browser snapshot and returns the app to onboarding.</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
