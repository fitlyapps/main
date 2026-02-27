"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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
};

type Coordinates = {
  lat: number;
  lon: number;
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

const RADIUS_OPTIONS = [0, 10, 25, 50, 100, 250];

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

function haversineDistanceKm(a: Coordinates, b: Coordinates) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const root = sinLat * sinLat + sinLon * sinLon * Math.cos(lat1) * Math.cos(lat2);
  const arc = 2 * Math.atan2(Math.sqrt(root), Math.sqrt(1 - root));

  return earthRadiusKm * arc;
}

async function geocodeCity(city: string): Promise<Coordinates | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&city=${encodeURIComponent(city)}`,
    {
      headers: {
        Accept: "application/json"
      }
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Array<{ lat: string; lon: string }>;
  const first = data[0];
  if (!first) {
    return null;
  }

  return {
    lat: Number(first.lat),
    lon: Number(first.lon)
  };
}

export function CoachCatalog({ coaches, cityOptions }: CoachCatalogProps) {
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState("");
  const [query, setQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [radiusKm, setRadiusKm] = useState(25);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [distanceFilteredIds, setDistanceFilteredIds] = useState<Set<string> | null>(null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const geocodeCache = useRef<Map<string, Coordinates | null>>(new Map());

  const filteredCitySuggestions = useMemo(() => {
    const normalized = cityInput.trim().toLowerCase();
    if (!normalized) {
      return cityOptions.slice(0, 6);
    }

    return cityOptions.filter((city) => city.toLowerCase().includes(normalized)).slice(0, 6);
  }, [cityInput, cityOptions]);

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

  async function resolveCityCoordinates(city: string) {
    const key = city.trim().toLowerCase();
    if (!key) {
      return null;
    }

    if (geocodeCache.current.has(key)) {
      return geocodeCache.current.get(key) ?? null;
    }

    const result = await geocodeCity(city);
    geocodeCache.current.set(key, result);
    return result;
  }

  useEffect(() => {
    let cancelled = false;

    async function applyRadiusFilter() {
      const targetCity = cityInput.trim();
      if (!targetCity) {
        setDistanceFilteredIds(null);
        setDistanceLoading(false);
        setLocationError(null);
        return;
      }

      if (radiusKm === 0) {
        const exactMatches = new Set(
          coaches
            .filter((coach) => coach.city?.toLowerCase().includes(targetCity.toLowerCase()))
            .map((coach) => coach.id)
        );
        setDistanceFilteredIds(exactMatches);
        setDistanceLoading(false);
        return;
      }

      setDistanceLoading(true);
      setLocationError(null);

      const targetCoordinates = await resolveCityCoordinates(targetCity);
      if (!targetCoordinates) {
        if (!cancelled) {
          setDistanceFilteredIds(new Set());
          setDistanceLoading(false);
          setLocationError("Ville introuvable. Essaie une autre orthographe ou choisis une suggestion.");
        }
        return;
      }

      const ids = new Set<string>();
      await Promise.all(
        coaches.map(async (coach) => {
          if (!coach.city) {
            return;
          }

          const coachCoordinates = await resolveCityCoordinates(coach.city);
          if (!coachCoordinates) {
            return;
          }

          const distanceKm = haversineDistanceKm(targetCoordinates, coachCoordinates);
          if (distanceKm <= radiusKm) {
            ids.add(coach.id);
          }
        })
      );

      if (!cancelled) {
        setDistanceFilteredIds(ids);
        setDistanceLoading(false);
      }
    }

    const timeout = window.setTimeout(() => {
      void applyRadiusFilter();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [cityInput, radiusKm, coaches]);

  const visibleCoaches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return coaches.filter((coach) => {
      const matchesQuery =
        !normalizedQuery ||
        coach.name.toLowerCase().includes(normalizedQuery) ||
        coach.bio?.toLowerCase().includes(normalizedQuery) ||
        coach.city?.toLowerCase().includes(normalizedQuery) ||
        coach.specialties.some((specialty) => specialty.toLowerCase().includes(normalizedQuery));

      const matchesSpecialties =
        selectedSpecialties.length === 0 ||
        selectedSpecialties.some((specialty) => coach.specialties.includes(specialty));

      const matchesDistance = distanceFilteredIds ? distanceFilteredIds.has(coach.id) : true;

      return matchesQuery && matchesSpecialties && matchesDistance;
    });
  }, [coaches, distanceFilteredIds, query, selectedSpecialties]);

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
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
            {
              headers: {
                Accept: "application/json"
              }
            }
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
          setShowCitySuggestions(false);
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
            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Recherche</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Nom du coach, specialite, ville"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </label>

                <div>
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Ville</span>
                  <div className="relative">
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={cityInput}
                        onFocus={() => setShowCitySuggestions(true)}
                        onChange={(event) => {
                          setCityInput(event.target.value);
                          setShowCitySuggestions(true);
                        }}
                        placeholder="Paris, Lyon, Toulouse"
                        autoComplete="off"
                        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                    {showCitySuggestions && filteredCitySuggestions.length ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                        {filteredCitySuggestions.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setCityInput(city);
                              setShowCitySuggestions(false);
                            }}
                            className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 last:border-b-0"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
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
                </div>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Rayon</span>
                  <select
                    value={radiusKm}
                    onChange={(event) => setRadiusKm(Number(event.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none"
                  >
                    {RADIUS_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value === 0 ? "Ville exacte" : `${value} km`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white"
                >
                  {distanceLoading ? "Recherche locale..." : `Voir ${visibleCoaches.length} coachs`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCityInput("");
                    setSelectedSpecialties([]);
                    setRadiusKm(25);
                    setLocationError(null);
                    setShowCitySuggestions(false);
                  }}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  Reinitialiser
                </button>
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
              {cityInput ? (
                <p className="text-sm text-slate-500">
                  Rayon actif: {radiusKm === 0 ? "ville exacte" : `${radiusKm} km autour de ${cityInput}`}
                </p>
              ) : null}
              {locationError ? <p className="text-sm font-medium text-rose-600">{locationError}</p> : null}
            </div>
          </div>

          <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.38),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.22),transparent_30%)]" />
            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Discovery Engine
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{visibleCoaches.length} coachs trouves</p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/78">
                Recherche plus utile: ville + rayon, pour trouver aussi les coachs des villes voisines.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {visibleCoaches.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleCoaches.map((coach, index) => (
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
                    <div
                      className="relative shrink-0 overflow-hidden rounded-[24px] border-4 border-white bg-slate-950 shadow-lg"
                      style={{ width: 72, height: 72 }}
                    >
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
          <p className="mt-2 text-sm text-slate-600">Essaie une autre ville, un rayon plus large ou retire une specialite.</p>
        </Card>
      )}
    </>
  );
}
