export default function DashboardLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <div className="animate-pulse">
        <div className="h-10 w-72 rounded-2xl bg-slate-200" />
        <div className="mt-3 h-5 w-96 rounded-xl bg-slate-100" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-3xl bg-white p-6 shadow-soft">
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="h-56 rounded-3xl bg-white shadow-soft" />
          <div className="h-56 rounded-3xl bg-white shadow-soft" />
        </div>
      </div>
    </main>
  );
}
