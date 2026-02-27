import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CoachCatalog } from "@/components/marketplace/coach-catalog";

type CoachesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
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
          Recherche par specialite, localisation et positionnement tarifaire. Les profils affiches ont
          termine leur onboarding.
        </p>
      </div>

      <CoachCatalog
        initialFilters={{ q, specialty, country, city }}
        coaches={coaches.map((coach) => ({
          id: coach.id,
          name: coach.user.fullName,
          avatarUrl: coach.user.avatarUrl,
          bio: coach.bio,
          specialties: coach.specialties,
          city: coach.city,
          countryCode: coach.countryCode,
          avgRating: Number(coach.avgRating),
          ratingCount: coach.ratingCount,
          isVerified: coach.isVerified,
          monthlyPriceCents: coach.monthlyPriceCents,
          currency: coach.currency
        }))}
      />
    </main>
  );
}
