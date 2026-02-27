import { Prisma } from "@prisma/client";
import { Search, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

type CoachesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function formatLocation(city: string | null, countryCode: string | null) {
  return [city, countryCode].filter(Boolean).join(", ") || "Remote";
}

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

export default async function CoachesPage({ searchParams }: CoachesPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const q = getSingleParam(params?.q);
  const specialty = getSingleParam(params?.specialty);
  const country = getSingleParam(params?.country).toUpperCase();
  const city = getSingleParam(params?.city);

  const filters: Prisma.CoachProfileWhereInput[] = [
    { bio: { not: null } },
    { city: { not: null } },
    { countryCode: { not: null } },
    { monthlyPriceCents: { not: null } },
    { specialties: { isEmpty: false } }
  ];

  if (specialty) {
    filters.push({ specialties: { has: specialty } });
  }

  if (country) {
    filters.push({ countryCode: { equals: country, mode: "insensitive" } });
  }

  if (city) {
    filters.push({ city: { contains: city, mode: "insensitive" } });
  }

  if (q) {
    filters.push({
      OR: [
        { user: { fullName: { contains: q, mode: "insensitive" } } },
        { bio: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { specialties: { has: q } }
      ]
    });
  }

  const coaches = await prisma.coachProfile.findMany({
    where: {
      AND: filters
    },
    include: {
      user: {
        select: {
          fullName: true,
          avatarUrl: true
        }
      }
    },
    orderBy: [{ isVerified: "desc" }, { avgRating: "desc" }, { createdAt: "desc" }],
    take: 36
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">Catalogue de coachs</h1>
        <p className="mt-3 text-muted">
          Recherche par spécialité, localisation et positionnement tarifaire. Les profils affichés ont
          terminé leur onboarding.
        </p>
      </div>

      <Card className="mt-8 p-4 sm:p-5">
        <form className="grid gap-3 md:grid-cols-4">
          <label className="md:col-span-2">
            <span className="mb-1 block text-sm text-muted">Recherche</span>
            <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5">
              <Search className="h-4 w-4 text-muted" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Nom, ville, spécialité"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </label>
          <label>
            <span className="mb-1 block text-sm text-muted">Spécialité</span>
            <input
              type="text"
              name="specialty"
              defaultValue={specialty}
              placeholder="Hypertrophie"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm text-muted">Pays</span>
            <input
              type="text"
              name="country"
              defaultValue={country}
              placeholder="FR"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm uppercase outline-none"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm text-muted">Ville</span>
            <input
              type="text"
              name="city"
              defaultValue={city}
              placeholder="Paris"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none"
            />
          </label>
          <div className="flex items-end gap-3 md:col-span-3">
            <button type="submit" className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white">
              Filtrer
            </button>
            <a href="/coaches" className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-foreground ring-1 ring-black/10">
              Réinitialiser
            </a>
          </div>
        </form>
      </Card>

      <div className="mt-8 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{coaches.length} coach{coaches.length > 1 ? "s" : ""} trouvés</p>
      </div>

      {coaches.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <Card key={coach.id} className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{coach.user.fullName}</p>
                  <p className="mt-1 text-sm text-muted">{formatLocation(coach.city, coach.countryCode)}</p>
                </div>
                {coach.isVerified ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Verifie
                  </span>
                ) : null}
              </div>

              <p className="mt-4 line-clamp-3 text-sm text-muted">{coach.bio}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {coach.specialties.map((item) => (
                  <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-foreground">
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span>{Number(coach.avgRating).toFixed(1)}</span>
                  <span className="text-muted">({coach.ratingCount})</span>
                </div>
                <span className="font-medium">{formatPrice(coach.monthlyPriceCents, coach.currency)}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-6">
          <p className="text-lg font-semibold">Aucun coach ne correspond aux filtres.</p>
          <p className="mt-2 text-sm text-muted">Essaie une recherche plus large ou retire un filtre.</p>
        </Card>
      )}
    </main>
  );
}
