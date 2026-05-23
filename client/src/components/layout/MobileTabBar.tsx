const TABS = ["Schedule", "Shifts", "Profile"] as const;

export function MobileTabBar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white px-2 py-2 md:hidden"
    >
      <ul className="grid grid-cols-3 gap-2">
        {TABS.map((tab) => (
          <li key={tab}>
            <button
              type="button"
              className="h-11 w-full rounded-md bg-slate-100 text-sm font-medium text-slate-700"
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
