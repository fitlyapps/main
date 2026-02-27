import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { requireAppUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function saveCoachProfile(formData: FormData) {
  "use server";

  const appUser = await requireAppUser();
  if (appUser.role !== UserRole.COACH) {
    redirect("/dashboard");
  }

  const bio = String(formData.get("bio") || "").trim();
  const avatarUrl = String(formData.get("avatarUrl") || "").trim();
  const specialtiesRaw = String(formData.get("specialties") || "");
  const city = String(formData.get("city") || "").trim();
  const countryCode = String(formData.get("countryCode") || "").trim().toUpperCase();
  const yearsExperienceRaw = String(formData.get("yearsExperience") || "").trim();
  const monthlyPriceRaw = String(formData.get("monthlyPrice") || "").trim();
  const currency = String(formData.get("currency") || "EUR").trim().toUpperCase();

  const specialties = specialtiesRaw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const yearsExperience = yearsExperienceRaw ? Number(yearsExperienceRaw) : null;
  const monthlyPrice = monthlyPriceRaw ? Number(monthlyPriceRaw) : null;
  const monthlyPriceCents =
    typeof monthlyPrice === "number" && Number.isFinite(monthlyPrice)
      ? Math.round(monthlyPrice * 100)
      : null;

  await prisma.user.update({
    where: { id: appUser.id },
    data: {
      avatarUrl: avatarUrl || null
    }
  });

  await prisma.coachProfile.upsert({
    where: { userId: appUser.id },
    update: {
      bio: bio || null,
      specialties,
      city: city || null,
      countryCode: countryCode || null,
      yearsExperience: Number.isFinite(yearsExperience) ? yearsExperience : null,
      monthlyPriceCents,
      currency: currency || "EUR"
    },
    create: {
      userId: appUser.id,
      bio: bio || null,
      specialties,
      city: city || null,
      countryCode: countryCode || null,
      yearsExperience: Number.isFinite(yearsExperience) ? yearsExperience : null,
      monthlyPriceCents,
      currency: currency || "EUR"
    }
  });

  redirect("/dashboard");
}

export default async function CoachOnboardingPage() {
  const appUser = await requireAppUser();

  if (appUser.role !== UserRole.COACH) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
        <Card>
          <h1 className="text-2xl font-semibold tracking-tight">Onboarding coach</h1>
          <p className="mt-2 text-sm text-muted">Cette section est réservée aux comptes coach.</p>
        </Card>
      </main>
    );
  }

  const profile = appUser.coachProfile;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
      <Card>
        <h1 className="text-3xl font-semibold tracking-tight">Onboarding Coach</h1>
        <p className="mt-2 text-sm text-muted">Complète ton profil pour apparaître dans le catalogue public.</p>

        <form action={saveCoachProfile} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted">Photo de profil (URL)</label>
            <input
              name="avatarUrl"
              type="url"
              defaultValue={appUser.avatarUrl ?? ""}
              placeholder="https://..."
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none ring-accent/40 transition focus:ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Bio</label>
            <textarea
              name="bio"
              defaultValue={profile?.bio ?? ""}
              rows={4}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none ring-accent/40 transition focus:ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">Spécialités (séparées par virgule)</label>
            <input
              name="specialties"
              defaultValue={(profile?.specialties ?? []).join(", ")}
              placeholder="Hypertrophie, Perte de poids"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none ring-accent/40 transition focus:ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-muted">Ville</label>
              <input
                name="city"
                defaultValue={profile?.city ?? ""}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none ring-accent/40 transition focus:ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">Code pays (FR, US...)</label>
              <input
                name="countryCode"
                maxLength={2}
                defaultValue={profile?.countryCode ?? ""}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm uppercase outline-none ring-accent/40 transition focus:ring"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-muted">Expérience (années)</label>
              <input
                type="number"
                min={0}
                name="yearsExperience"
                defaultValue={profile?.yearsExperience ?? ""}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none ring-accent/40 transition focus:ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">Prix mensuel</label>
              <input
                type="number"
                min={0}
                step="0.01"
                name="monthlyPrice"
                defaultValue={profile?.monthlyPriceCents ? profile.monthlyPriceCents / 100 : ""}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none ring-accent/40 transition focus:ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">Devise</label>
              <input
                name="currency"
                maxLength={3}
                defaultValue={profile?.currency ?? "EUR"}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm uppercase outline-none ring-accent/40 transition focus:ring"
              />
            </div>
          </div>

          <Button type="submit">Enregistrer le profil</Button>
        </form>
      </Card>
    </main>
  );
}
