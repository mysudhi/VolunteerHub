import { useState, useEffect } from "react";
import { API_BASE } from "../App";

interface LoginPageProps {
  onLogin: (token: string, user: AuthUser) => void;
  initialError?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export function LoginPage({ onLogin, initialError }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState(initialError || "");
  const [loading, setLoading] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/google/status`)
      .then((res) => res.json())
      .then((data) => setGoogleAvailable(data.configured))
      .catch(() => setGoogleAvailable(false));
  }, []);

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
    setGoogleLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/google`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Google OAuth not available");
        setGoogleLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Is the server running?");
      setGoogleLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        {mode === "login" ? "Welcome back" : "Create an account"}
      </h2>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {googleAvailable !== false && (
        <>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || googleAvailable === null}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-500">or continue with email</span>
            </div>
          </div>
        </>
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
          className="h-11 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

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
