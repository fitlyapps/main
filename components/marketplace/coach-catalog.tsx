"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, LocateFixed, MapPin, Search, Sparkles, Star } from "lucide-react";
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
  cityOptions: string[];
  initialFilters: {
    q: string;
    specialties: string[];
    city: string;
  };
};

const SPECIALTY_OPTIONS = [
  "Perte de gras",
  "Prise de muscle",
  "Recomposition corporelle",
  "Hypertrophie",
  "Force",
  "Prepa Hyrox",
  "Prepa marathon",
  "Nutrition sportive",
  "Coaching feminin",
  "Retour de blessure"
];

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

export function CoachCatalog({ coaches, cityOptions, initialFilters }: CoachCatalogProps) {
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState(initialFilters.city);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(initialFilters.specialties);

  const filteredCountLabel = useMemo(() => {
    return `${coaches.length} coach${coaches.length > 1 ? "s" : ""} trouves`;
  }, [coaches.length]);

  const specialtyLabel =
    selectedSpecialties.length === 0
      ? "Toutes les specialites"
      : selectedSpecialties.length === 1
        ? selectedSpecialties[0]
        : `${selectedSpecialties.length} specialites`;

  function toggleSpecialty(option: string) {
    setSelectedSpecialties((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
    );
  }

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
            };
          };

          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.municipality ||
            "";

          setCityInput(city);
          const form = document.querySelector<HTMLFormElement>('form[data-coach-filters="true"]');
          requestAnimationFrame(() => form?.requestSubmit());
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
      <Card className="mt-8 overflow-hidden border border-white/70 bg-white/80 p-0 backdrop-blur-xl">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="border-b border-slate-200/80 p-5 lg:border-b-0 lg:border-r lg:border-r-slate-200/80">
            <form data-coach-filters="true" className="grid gap-5" method="GET">
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Recherche</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="q"
                      defaultValue={initialFilters.q}
                      placeholder="Nom du coach, specialite, ville"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Ville</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="city"
                      value={cityInput}
                      onChange={(event) => setCityInput(event.target.value)}
                      placeholder="Paris, Lyon, Toulouse"
                      autoComplete="off"
                      list="coach-city-suggestions"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <datalist id="coach-city-suggestions">
                      {cityOptions.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </div>
                </label>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Specialites</span>
                <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm text-slate-900">
                    <span>{specialtyLabel}</span>
                    <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-slate-100 px-4 py-4">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {SPECIALTY_OPTIONS.map((option) => {
                        const selected = selectedSpecialties.includes(option);

                        return (
                          <label
                            key={option}
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                              selected ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleSpecialty(option)}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                    {selectedSpecialties.length ? (
                      <button
                        type="button"
                        onClick={() => setSelectedSpecialties([])}
                        className="mt-3 text-xs font-medium text-slate-500 transition hover:text-slate-900"
                      >
                        Effacer la selection
                      </button>
                    ) : null}
                  </div>
                </details>
                {selectedSpecialties.map((specialty) => (
                  <input key={specialty} type="hidden" name="specialty" value={specialty} />
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Filtrer les coachs
                </button>
                <a
                  href="/coaches"
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  Reinitialiser
                </a>
                <button
                  type="button"
                  onClick={fillLocationFromBrowser}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  disabled={locationLoading}
                >
                  <LocateFixed className="h-4 w-4" />
                  {locationLoading ? "Localisation..." : "Me localiser"}
                </button>
              </div>
              {locationError ? <p className="text-sm font-medium text-rose-600">{locationError}</p> : null}
            </form>
          </div>

          <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.38),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.22),transparent_30%)]" />
            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Discovery Engine
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{filteredCountLabel}</p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/78">
                Des profils plus lisibles, filtres par promesse de resultat, localisation et niveau de
                finition du profil.
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
              <Card className="group relative flex h-full flex-col overflow-hidden border border-slate-200/80 bg-white p-0 shadow-[0_18px_50px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
                <div className="h-24 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_52%,#7dd3fc_100%)]" />
                <div className="px-6 pb-6">
                  <div className="-mt-9 flex items-start justify-between gap-4">
                    <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-[24px] border-4 border-white bg-slate-950 shadow-lg" style={{ width: 72, height: 72 }}>
                      {coach.avatarUrl ? (
                        <Image src={coach.avatarUrl} alt={coach.name} fill className="object-cover" sizes="72px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-950 text-lg font-semibold text-white">
                          {initials(coach.name)}
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-3 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                        coach.isVerified ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {coach.isVerified ? "Verifie" : "Profil actif"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xl font-semibold tracking-tight text-slate-950">{coach.name}</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {formatLocation(coach.city, coach.countryCode)}
                    </p>
                  </div>

                  <p className="mt-5 min-h-[78px] text-sm leading-7 text-slate-600">{coach.bio}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {coach.specialties.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-900">{coach.avgRating.toFixed(1)}</span>
                      <span className="text-slate-500">({coach.ratingCount})</span>
                    </div>
                    <span className="text-base font-semibold text-slate-950">
                      {formatPrice(coach.monthlyPriceCents, coach.currency)}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="mt-6 border border-dashed border-slate-300 bg-white/90">
          <p className="text-lg font-semibold text-slate-950">Aucun coach ne correspond aux filtres.</p>
          <p className="mt-2 text-sm text-slate-600">Essaie une recherche plus large ou retire un filtre.</p>
        </Card>
      )}
    </>
  );
}
