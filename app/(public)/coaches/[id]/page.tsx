import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, BadgeCheck, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type CoachPageProps = {
  params: Promise<{ id: string }>;
};

function formatPrice(monthlyPriceCents: number | null, currency: string) {
  if (!monthlyPriceCents) {
    return "Tarif sur demande";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(monthlyPriceCents / 100);
}

function formatLocation(city: string | null, countryCode: string | null) {
  return [city, countryCode].filter(Boolean).join(", ") || "Remote";
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function CoachPublicPage({ params }: CoachPageProps) {
  const { id } = await params;

  const coach = await prisma.coachProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          fullName: true,
          avatarUrl: true
        }
      }
    }
  });

  if (
    !coach ||
    !coach.bio ||
    !coach.city ||
    !coach.countryCode ||
    !coach.monthlyPriceCents ||
    coach.specialties.length === 0
  ) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden p-0">
          <div className="h-40 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_52%,#7dd3fc_100%)]" />
          <div className="px-8 pb-8">
            <div className="-mt-12 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="relative h-24 w-24 overflow-hidden rounded-[30px] border-4 border-white bg-slate-950 shadow-lg">
                  {coach.user.avatarUrl ? (
                    <Image src={coach.user.avatarUrl} alt={coach.user.fullName} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-950 text-2xl font-semibold text-white">
                      {initials(coach.user.fullName)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{coach.user.fullName}</h1>
                    {coach.isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verifie
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                    <MapPin className="h-4 w-4" />
                    <span>{formatLocation(coach.city, coach.countryCode)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-right">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Tarif</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {formatPrice(coach.monthlyPriceCents, coach.currency)}
                </p>
                <p className="mt-1 text-sm text-slate-500">accompagnement mensuel</p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
              <div>
                <p className="text-base leading-8 text-slate-600">{coach.bio}</p>

                <div className="mt-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Specialites</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {coach.specialties.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Card className="bg-slate-950 text-white shadow-none">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Confiance</p>
                <div className="mt-4 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-3xl font-semibold">{Number(coach.avgRating).toFixed(1)}</span>
                  <span className="text-white/60">({coach.ratingCount} avis)</span>
                </div>
                <div className="mt-6 space-y-3 text-sm text-white/75">
                  <p>{coach.yearsExperience ? `${coach.yearsExperience}+ ans d experience` : "Experience renseignee a l onboarding"}</p>
                  <p>Coaching potentiellement a distance ou hybride selon l offre.</p>
                  <p>Profil public pret pour une mise en relation client.</p>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="bg-slate-950 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">Prochaine etape</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Demander un coaching</h2>
            <p className="mt-3 text-sm leading-7 text-white/75">
              Prochaine iteration: formulaire de demande, validation du coach, puis ouverture de l espace prive.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950">
              Demander un coaching
              <ArrowRight className="h-4 w-4" />
            </button>
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Resume</p>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span>Ville</span>
                <span className="font-medium text-slate-950">{coach.city}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Pays</span>
                <span className="font-medium text-slate-950">{coach.countryCode}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Devise</span>
                <span className="font-medium text-slate-950">{coach.currency}</span>
              </div>
            </div>
          </Card>

          <Link href="/coaches" className="inline-block text-sm font-medium text-accent">
            Retour au catalogue
          </Link>
        </div>
      </div>
    </main>
  );
}
