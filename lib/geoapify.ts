const GEOAPIFY_AUTOCOMPLETE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";
const GEOAPIFY_REVERSE_URL = "https://api.geoapify.com/v1/geocode/reverse";

type GeoapifyResult = {
  city?: string;
  state?: string;
  country?: string;
  country_code?: string;
  lat?: number;
  lon?: number;
  formatted?: string;
};

export type GeoCityResult = {
  city: string;
  state: string | null;
  country: string | null;
  countryCode: string | null;
  lat: number;
  lon: number;
  label: string;
};

function getApiKey() {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEOAPIFY_API_KEY");
  }
  return apiKey;
}

function mapResult(item: GeoapifyResult): GeoCityResult {
  return {
    city: item.city!,
    state: item.state ?? null,
    country: item.country ?? null,
    countryCode: item.country_code?.toUpperCase() ?? null,
    lat: item.lat!,
    lon: item.lon!,
    label: item.formatted ?? [item.city, item.state, item.country].filter(Boolean).join(", ")
  };
}

export async function autocompleteCities(text: string, limit = 6) {
  const geoapifyParams = new URLSearchParams({
    text,
    type: "city",
    format: "json",
    lang: "fr",
    limit: String(Math.min(Math.max(limit, 1), 10)),
    apiKey: getApiKey()
  });

  const response = await fetch(`${GEOAPIFY_AUTOCOMPLETE_URL}?${geoapifyParams.toString()}`, {
    headers: {
      Accept: "application/json"
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    throw new Error("Geoapify request failed");
  }

  const data = (await response.json()) as { results?: GeoapifyResult[] };

  return (data.results ?? [])
    .filter((item) => item.city && typeof item.lat === "number" && typeof item.lon === "number")
    .map(mapResult);
}

export async function reverseCity(lat: string, lon: string) {
  const reverseParams = new URLSearchParams({
    lat,
    lon,
    type: "city",
    format: "json",
    lang: "fr",
    apiKey: getApiKey()
  });

  const response = await fetch(`${GEOAPIFY_REVERSE_URL}?${reverseParams.toString()}`, {
    headers: {
      Accept: "application/json"
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    throw new Error("Geoapify reverse request failed");
  }

  const data = (await response.json()) as { results?: GeoapifyResult[] };
  return (data.results ?? [])
    .filter((item) => item.city && typeof item.lat === "number" && typeof item.lon === "number")
    .map(mapResult);
}

export async function geocodeCoachCity(city: string, countryCode?: string | null) {
  const query = countryCode ? `${city}, ${countryCode}` : city;
  const results = await autocompleteCities(query, 5);

  const normalizedCity = city.trim().toLowerCase();
  const normalizedCountry = countryCode?.trim().toUpperCase();

  return (
    results.find(
      (item) =>
        item.city.toLowerCase() === normalizedCity &&
        (!normalizedCountry || item.countryCode === normalizedCountry)
    ) ?? results.find((item) => item.city.toLowerCase() === normalizedCity) ?? results[0] ?? null
  );
}
