"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LocateFixed, Search, Sparkles, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CoachCard = {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  specialties: string[];
  city: string | null;
  countryCode: string | null;
  avgRating: number;
  ratingCount: number;
  isVerified: boolean;
  monthlyPriceCents: number | null;
  currency: string;
};

type CoachCatalogProps = {
  coaches: CoachCard[];
  initialFilters: {
    q: string;
    specialty: string;
    country: string;
    city: string;
  };
};

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

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function CoachCatalog({ coaches, initialFilters }: CoachCatalogProps) {
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const filteredCountLabel = useMemo(() => {
    return `${coaches.length} coach${coaches.length > 1 ? "s" : ""} trouves`;
  }, [coaches.length]);

  async function fillLocationFromBrowser() {
    setLocationError(null);

    if (!("geolocation" in navigator)) {
      setLocationError("La geolocalisation n est pas supportee par ce navigateur.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`
          );

          if (!response.ok) {
            throw new Error("Reverse geocoding failed");
          }

          const data = (await response.json()) as {
            address?: {
              city?: string;
              town?: string;
              village?: string;
              municipality?: string;
              country_code?: string;
            };
          };

          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.municipality ||
            "";
          const country = data.address?.country_code?.toUpperCase() || "";

          const cityInput = document.querySelector<HTMLInputElement>('input[name="city"]');
          const countryInput = document.querySelector<HTMLInputElement>('input[name="country"]');
          const form = document.querySelector<HTMLFormElement>('form[data-coach-filters="true"]');

          if (cityInput) {
            cityInput.value = city;
          }
          if (countryInput) {
            countryInput.value = country;
          }

          form?.requestSubmit();
        } catch {
          setLocationError("Impossible de recuperer la ville automatiquement.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        setLocationError("Autorise la geolocalisation pour remplir automatiquement la localite.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  return (
    <>
      <Card className="mt-8 overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-black/5 p-5 lg:border-b-0 lg:border-r">
            <form data-coach-filters="true" className="grid gap-3 md:grid-cols-4">
              <label className="md:col-span-2">
                <span className="mb-1 block text-sm text-muted">Recherche</span>
                <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 shadow-sm">
                  <Search className="h-4 w-4 text-muted" />
                  <input
                    type="text"
                    name="q"
                    defaultValue={initialFilters.q}
                    placeholder="Nom, ville, specialite"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>
              <label>
                <span className="mb-1 block text-sm text-muted">Specialite</span>
                <input
                  type="text"
                  name="specialty"
                  defaultValue={initialFilters.specialty}
                  placeholder="Hypertrophie"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none shadow-sm"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm text-muted">Pays</span>
                <input
                  type="text"
                  name="country"
                  defaultValue={initialFilters.country}
                  placeholder="FR"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm uppercase outline-none shadow-sm"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm text-muted">Ville</span>
                <input
                  type="text"
                  name="city"
                  defaultValue={initialFilters.city}
                  placeholder="Paris"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none shadow-sm"
                />
              </label>
              <div className="flex flex-wrap items-end gap-3 md:col-span-3">
                <button type="submit" className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white">
                  Filtrer
                </button>
                <a href="/coaches" className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-foreground ring-1 ring-black/10">
                  Reinitialiser
                </a>
                <button
                  type="button"
                  onClick={fillLocationFromBrowser}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white"
                  disabled={locationLoading}
                >
                  <LocateFixed className="h-4 w-4" />
                  {locationLoading ? "Localisation..." : "Me localiser"}
                </button>
              </div>
              {locationError ? <p className="md:col-span-4 text-sm text-red-600">{locationError}</p> : null}
            </form>
          </div>

          <div className="relative overflow-hidden bg-slate-950 p-5 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,130,246,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.18),transparent_30%)]" />
            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Discovery Engine
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight">{filteredCountLabel}</p>
              <p className="mt-3 max-w-sm text-sm text-white/70">
                Des profils filtres par qualite d&apos;onboarding, localisation et promesse de coaching.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {coaches.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach, index) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <Card className="group relative flex h-full flex-col overflow-hidden border border-white/60 bg-white/85 p-0 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
                <div className="h-28 bg-[linear-gradient(135deg,#0f172a_0%,#1f7aea_55%,#a7f3d0_130%)]" />
                <div className="relative px-6 pb-6">
                  <div className="-mt-10 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-[28px] ring-4 ring-white shadow-lg">
                        {coach.avatarUrl ? (
                          <Image src={coach.avatarUrl} alt={coach.name} fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-950 text-xl font-semibold text-white">
                            {initials(coach.name)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{coach.name}</p>
                        <p className="mt-1 text-sm text-muted">{formatLocation(coach.city, coach.countryCode)}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        coach.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {coach.isVerified ? "Verifie" : "Profil actif"}
                    </span>
                  </div>

                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted">{coach.bio}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {coach.specialties.map((item) => (
                      <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-foreground">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span>{coach.avgRating.toFixed(1)}</span>
                      <span className="text-muted">({coach.ratingCount})</span>
                    </div>
                    <span className="font-medium">{formatPrice(coach.monthlyPriceCents, coach.currency)}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="mt-6 border border-dashed border-black/10 bg-white/80">
          <p className="text-lg font-semibold">Aucun coach ne correspond aux filtres.</p>
          <p className="mt-2 text-sm text-muted">Essaie une recherche plus large ou retire un filtre.</p>
        </Card>
      )}
    </>
  );
}
