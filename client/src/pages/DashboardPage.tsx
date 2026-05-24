import type { AuthUser } from "./LoginPage";

interface DashboardPageProps {
  user: AuthUser;
}

const mockShifts = [
  { id: "1", title: "Food Drive", time: "08:00 - 12:00" },
  { id: "2", title: "Shelter Check-In", time: "13:00 - 17:00" },
  { id: "3", title: "Community Clinic", time: "18:00 - 21:00" }
];

export function DashboardPage({ user }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">
          Welcome, {user.firstName}!
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Signed in as {user.email} · Role: {user.role}
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Upcoming Shifts</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mockShifts.map((shift) => (
            <article key={shift.id} className="rounded-xl bg-white p-4 shadow-sm">
              <h3 className="text-base font-medium">{shift.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{shift.time}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
