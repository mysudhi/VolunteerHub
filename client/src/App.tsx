import { DesktopHeader } from "./components/layout/DesktopHeader";
import { MobileTabBar } from "./components/layout/MobileTabBar";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";

export function App() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <DesktopHeader />
      <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <LoginPage />
        <DashboardPage />
      </main>
      <MobileTabBar />
    </div>
  );
}
