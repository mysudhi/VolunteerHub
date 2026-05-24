import { useState, useEffect } from "react";
import { DesktopHeader } from "./components/layout/DesktopHeader";
import { MobileTabBar } from "./components/layout/MobileTabBar";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage, type AuthUser } from "./pages/LoginPage";

const API_BASE = "http://localhost:4000";

export function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) setUser(data.user);
          else localStorage.removeItem("token");
        })
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function handleLogin(token: string, authUser: AuthUser) {
    localStorage.setItem("token", token);
    setUser(authUser);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <DesktopHeader user={user} onLogout={handleLogout} />
      <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        {user ? <DashboardPage user={user} /> : <LoginPage onLogin={handleLogin} />}
      </main>
      {user && <MobileTabBar />}
    </div>
  );
}
