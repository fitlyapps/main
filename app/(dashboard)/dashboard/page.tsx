import Link from "next/link";
import { UserRole } from "@prisma/client";
import { requireAppUser } from "@/lib/auth";
import { Kpis } from "@/components/dashboard/kpis";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await requireAppUser();
  const isCoach = user.role === UserRole.COACH;
  const coachProfile = user.coachProfile;
  const isCoachProfileComplete = Boolean(
    coachProfile?.bio &&
      coachProfile?.specialties.length &&
      coachProfile?.city &&
      coachProfile?.countryCode &&
      coachProfile?.monthlyPriceCents
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">
            {isCoach ? "Dashboard Coach" : "Dashboard Client"}
          </h1>
          <p className="mt-2 text-muted">Pilotage clients, nutrition, entraînement, paiements.</p>
        </div>
        {isCoach ? (
          <Link
            href="/dashboard/clients"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
          >
            Voir les clients
          </Link>
        ) : null}
      </header>

      {isCoach && !isCoachProfileComplete ? (
        <section className="mt-6">
          <Card className="border border-amber-200 bg-amber-50/70">
            <p className="text-sm font-medium text-amber-900">
              Ton profil coach est incomplet. Complète-le pour être visible dans le catalogue.
            </p>
            <Link href="/dashboard/onboarding" className="mt-3 inline-block text-sm font-medium text-accent">
              Compléter mon onboarding
            </Link>
          </Card>
        </section>
      ) : null}

      <section className="mt-8">
        <Kpis />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Nutrition de la semaine</h2>
          <p className="mt-2 text-sm text-muted">Graphique macros/calories à connecter via données Prisma.</p>
          <div className="mt-4 h-36 rounded-2xl bg-slate-100" />
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Programme en direct</h2>
          <p className="mt-2 text-sm text-muted">Timer repos, charges précédentes et objectifs séance.</p>
          <div className="mt-4 h-36 rounded-2xl bg-slate-100" />
        </Card>
      </section>
    </main>
  );
}
