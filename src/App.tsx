import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { SetupPage } from "./pages/SetupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AccountsPage } from "./pages/AccountsPage";
import { LiquidityPage } from "./pages/LiquidityPage";
import { DebtPage } from "./pages/DebtPage";
import { FirePage } from "./pages/FirePage";
import { MoneyFlowPage } from "./pages/MoneyFlowPage";
import { ScenariosPage } from "./pages/ScenariosPage";
import { TaxPage } from "./pages/TaxPage";
import { DualIncomePage } from "./pages/DualIncomePage";
import { SettingsPage } from "./pages/SettingsPage";
import { useFinancePlan } from "./hooks/useFinancePlan";

export default function App() {
  const { state } = useFinancePlan();

  return (
    <Routes>
      <Route path="/setup" element={<SetupPage />} />
      <Route
        path="/*"
        element={state.uiPreferences.setupComplete ? (
          <AppShell />
        ) : (
          <Navigate to="/setup" replace />
        )}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="liquidity" element={<LiquidityPage />} />
        <Route path="debt" element={<DebtPage />} />
        <Route path="money-flow" element={<MoneyFlowPage />} />
        <Route path="fire" element={<FirePage />} />
        <Route path="scenarios" element={<ScenariosPage />} />
        <Route path="tax" element={<TaxPage />} />
        <Route path="dual-income" element={<DualIncomePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
