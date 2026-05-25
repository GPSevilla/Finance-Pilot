import { useMemo, useState } from "react";
import { ACCOUNT_TYPE_OPTIONS } from "../data/defaults";
import { useFinancePlan } from "../hooks/useFinancePlan";
import { ActionButton, CurrencyInput, LabeledInput, LabeledSelect, Panel, SectionTitle } from "../components/ui/Elements";

export function AccountsPage() {
  const { state, addAccount, updateAccount, removeAccount } = useFinancePlan();
  const [showZeroBalanceAccounts, setShowZeroBalanceAccounts] = useState(false);
  const [showDraftAccounts, setShowDraftAccounts] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const { activeAccounts, zeroBalanceAccounts, draftAccounts } = useMemo(() => {
    const drafts = state.accounts.filter((account) => account.id !== editingAccountId && account.balance === 0 && account.name === "New Account");
    const zeros = state.accounts.filter((account) => account.id !== editingAccountId && account.balance === 0 && account.name !== "New Account");
    const active = state.accounts.filter((account) => account.balance !== 0 || account.id === editingAccountId);

    return {
      activeAccounts: active,
      zeroBalanceAccounts: zeros,
      draftAccounts: drafts
    };
  }, [state.accounts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle
          title="Accounts"
          detail="Manual-entry-first account registry with editable liquidity tiers and contribution assumptions. Zero-balance placeholders are tucked away so the real net worth picture stays readable."
        />
        <ActionButton icon="plus" onClick={() => addAccount()}>Add account</ActionButton>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Panel title="Active Accounts" subtitle="Accounts currently contributing to net worth">
          <p className="text-3xl font-semibold text-ink">{activeAccounts.length}</p>
        </Panel>
        <Panel title="Zero-Balance Accounts" subtitle="Accounts with a current balance of $0">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-semibold text-ink">{zeroBalanceAccounts.length}</p>
            <button
              type="button"
              onClick={() => setShowZeroBalanceAccounts((current) => !current)}
              className="text-sm font-medium text-slateblue"
            >
              {showZeroBalanceAccounts ? "Hide" : "Show"}
            </button>
          </div>
        </Panel>
        <Panel title="Draft Accounts" subtitle="New placeholders that still need details">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-semibold text-ink">{draftAccounts.length}</p>
            <button
              type="button"
              onClick={() => setShowDraftAccounts((current) => !current)}
              className="text-sm font-medium text-slateblue"
            >
              {showDraftAccounts ? "Hide" : "Show"}
            </button>
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        {activeAccounts.map((account) => (
          <Panel key={account.id} className="bg-white/90">
            <div className="grid grid-cols-6 gap-4">
              <div className="max-w-[220px]">
                <LabeledInput label="Account name" value={account.name} onChange={(value) => updateAccount(account.id, { name: value })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} />
              </div>
              <LabeledSelect label="Type" value={account.type} onChange={(value) => updateAccount(account.id, { type: value as typeof account.type })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} options={ACCOUNT_TYPE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))} />
              <CurrencyInput label="Balance" value={account.balance} onChange={(value) => updateAccount(account.id, { balance: value })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} />
              <CurrencyInput label="Monthly contribution" value={account.monthlyContribution ?? 0} onChange={(value) => updateAccount(account.id, { monthlyContribution: value })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} />
              <CurrencyInput label="Roth basis" value={account.rothContributionBasis ?? 0} onChange={(value) => updateAccount(account.id, { rothContributionBasis: value })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} />
              <div className="flex items-end justify-end">
                <ActionButton variant="danger" icon="trash" onClick={() => removeAccount(account.id)}>Remove</ActionButton>
              </div>
            </div>
          </Panel>
        ))}

        {showZeroBalanceAccounts && zeroBalanceAccounts.length > 0 ? (
          <Panel title="Zero-Balance Accounts" subtitle="Visible because you expanded them">
            <div className="space-y-4">
              {zeroBalanceAccounts.map((account) => (
                <div key={account.id} className="grid grid-cols-6 gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="max-w-[220px]">
                    <LabeledInput label="Account name" value={account.name} onChange={(value) => updateAccount(account.id, { name: value })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} />
                  </div>
                  <LabeledSelect label="Type" value={account.type} onChange={(value) => updateAccount(account.id, { type: value as typeof account.type })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} options={ACCOUNT_TYPE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))} />
                  <CurrencyInput label="Balance" value={account.balance} onChange={(value) => updateAccount(account.id, { balance: value })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} />
                  <CurrencyInput label="Monthly contribution" value={account.monthlyContribution ?? 0} onChange={(value) => updateAccount(account.id, { monthlyContribution: value })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} />
                  <CurrencyInput label="Roth basis" value={account.rothContributionBasis ?? 0} onChange={(value) => updateAccount(account.id, { rothContributionBasis: value })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} />
                  <div className="flex items-end justify-end">
                    <ActionButton variant="danger" icon="trash" onClick={() => removeAccount(account.id)}>Remove</ActionButton>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {showDraftAccounts && draftAccounts.length > 0 ? (
          <Panel title="Draft Accounts" subtitle="Quick-add placeholders waiting for real values">
            <div className="space-y-4">
              {draftAccounts.map((account) => (
                <div key={account.id} className="grid grid-cols-6 gap-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="max-w-[220px]">
                    <LabeledInput label="Account name" value={account.name} onChange={(value) => updateAccount(account.id, { name: value })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} />
                  </div>
                  <LabeledSelect label="Type" value={account.type} onChange={(value) => updateAccount(account.id, { type: value as typeof account.type })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} options={ACCOUNT_TYPE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))} />
                  <CurrencyInput label="Balance" value={account.balance} onChange={(value) => updateAccount(account.id, { balance: value })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} />
                  <CurrencyInput label="Monthly contribution" value={account.monthlyContribution ?? 0} onChange={(value) => updateAccount(account.id, { monthlyContribution: value })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} />
                  <CurrencyInput label="Roth basis" value={account.rothContributionBasis ?? 0} onChange={(value) => updateAccount(account.id, { rothContributionBasis: value })} onFocus={() => setEditingAccountId(account.id)} onBlur={() => setEditingAccountId(null)} />
                  <div className="flex items-end justify-end">
                    <ActionButton variant="danger" icon="trash" onClick={() => removeAccount(account.id)}>Remove</ActionButton>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
