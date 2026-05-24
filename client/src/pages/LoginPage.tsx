import { useState } from "react";

interface LoginPageProps {
  onLogin: (token: string, user: AuthUser) => void;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const API_BASE = "http://localhost:4000";

export function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, firstName, lastName };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        return;
      }

      onLogin(data.token, data.user);
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Google OAuth not available");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Is the server running?");
    }
  }

  return (
    <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        {mode === "login" ? "Welcome back" : "Create an account"}
      </h2>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "register" && (
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
            />
          </div>
        )}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
        />

        <input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-slate-500">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="h-11 w-full rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Continue with Google
      </button>

      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          className="font-medium text-blue-600"
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </section>
  );
}
