import { BadgeDollarSign, Droplets, Flame, Home, LayoutDashboard, PiggyBank, Settings, TrendingUp, Wallet, Waypoints } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useFinancePlan } from "../../hooks/useFinancePlan";
import { useCopilot } from "../../hooks/useCopilot";
import { CopilotPopover } from "../copilot/CopilotPopover";
import { Pills } from "../ui/Elements";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/money-flow", label: "Money Flow", icon: Waypoints },
  { to: "/accounts", label: "Net Worth", icon: TrendingUp },
  { to: "/liquidity", label: "Liquidity", icon: Droplets },
  { to: "/scenarios", label: "Scenarios", icon: TrendingUp },
  { to: "/tax", label: "Tax Strategy", icon: BadgeDollarSign },
  { to: "/debt", label: "Debt", icon: Wallet },
  { to: "/fire", label: "FIRE", icon: Flame },
  { to: "/dual-income", label: "Household", icon: Home },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function AppShell() {
  const { state, dashboard, setProfile, setUiPreferences } = useFinancePlan();
  const navigate = useNavigate();
  const location = useLocation();
  const copilot = useCopilot(state, dashboard);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,81,195,0.12),_transparent_40%),linear-gradient(180deg,_#f7f9fc_0%,_#f4f7fb_100%)]">
      <div className="grid min-h-screen grid-cols-[240px_minmax(0,1fr)]">
        <aside className="flex flex-col border-r border-white/70 bg-white/70 px-5 py-7 backdrop-blur">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-slateblue shadow-sm">
              <PiggyBank className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-ink">Finance Pilot</p>
              <p className="text-sm text-slate-400">Personal planning cockpit</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? "bg-blue-50 text-slateblue shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[28px] border border-slate-200 bg-white p-5 shadow-panel">
            <p className="text-sm font-semibold text-ink">Household View</p>
            <p className="mt-1 text-sm text-slate-500">
              {state.profile.planningType === "dual" ? `${state.people[0].name} + ${state.people[1].name}` : state.people[0].name}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {state.profile.planningType === "dual" ? "Household plan" : "Just me"}
            </p>
            <button
              type="button"
              onClick={() => navigate("/dual-income")}
              className="mt-5 text-sm font-medium text-slateblue"
            >
              Manage household →
            </button>
          </div>
        </aside>

        <main className="px-8 py-6">
          <header className="mb-8 flex items-center justify-between rounded-[28px] border border-white/80 bg-white/70 px-7 py-5 shadow-panel backdrop-blur">
            <div className="flex items-center gap-6">
              <Pills
                value={state.profile.planningType}
                onChange={(value) => setProfile({ planningType: value as typeof state.profile.planningType })}
                options={[
                  { value: "single", label: "Just Me" },
                  { value: "dual", label: "Household" }
                ]}
              />
              {location.pathname !== "/setup" ? (
                <Pills
                  value={state.uiPreferences.selectedScenarioId}
                  onChange={(value) => setUiPreferences({ selectedScenarioId: value })}
                  options={state.scenarios.map((scenario) => ({ value: scenario.id, label: scenario.name }))}
                />
              ) : null}
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500"
                aria-label="Open settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
      <CopilotPopover copilot={copilot} />
    </div>
  );
}
