import type { AuthUser } from "../../pages/LoginPage";

interface DesktopHeaderProps {
  user: AuthUser | null;
  onLogout: () => void;
}

export function DesktopHeader({ user, onLogout }: DesktopHeaderProps) {
  return (
    <header className="hidden items-center justify-between border-b border-slate-200 px-6 py-4 md:flex">
      <h1 className="text-xl font-semibold text-slate-900">VolunteerHub</h1>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {user.firstName} {user.lastName}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
            >
              Sign out
            </button>
          </>
        )}
        {!user && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            Org Dashboard
          </span>
        )}
      </div>
    </header>
  );
}
