import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CoachCatalog } from "@/components/marketplace/coach-catalog";

export const dynamic = "force-dynamic";

const BASE_COMPLETENESS_FILTERS: Prisma.CoachProfileWhereInput[] = [
  { bio: { not: null } },
  { city: { not: null } },
  { countryCode: { not: null } },
  { monthlyPriceCents: { not: null } },
  { specialties: { isEmpty: false } }
];

export default async function CoachesPage() {
  const coaches = await prisma.coachProfile.findMany({
    where: {
      AND: BASE_COMPLETENESS_FILTERS
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
    take: 60
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
          currency: coach.currency,
          latitude: coach.latitude,
          longitude: coach.longitude
        }))}
      />
    </main>
  );
}
