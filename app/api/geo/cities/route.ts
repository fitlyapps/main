import { NextResponse } from "next/server";

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
  result_type?: string;
};

export async function GET(request: Request) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEOAPIFY_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.trim();
  const limit = Number(searchParams.get("limit") || "6");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const mapResult = (item: GeoapifyResult) => ({
    city: item.city!,
    state: item.state ?? null,
    country: item.country ?? null,
    countryCode: item.country_code?.toUpperCase() ?? null,
    lat: item.lat!,
    lon: item.lon!,
    label: item.formatted ?? [item.city, item.state, item.country].filter(Boolean).join(", ")
  });

  if (lat && lon) {
    const reverseParams = new URLSearchParams({
      lat,
      lon,
      type: "city",
      format: "json",
      lang: "fr",
      apiKey
    });

    const reverseResponse = await fetch(`${GEOAPIFY_REVERSE_URL}?${reverseParams.toString()}`, {
      headers: {
        Accept: "application/json"
      },
      next: { revalidate: 3600 }
    });

    if (!reverseResponse.ok) {
      return NextResponse.json({ error: "Geoapify reverse request failed" }, { status: reverseResponse.status });
    }

    const reverseData = (await reverseResponse.json()) as { results?: GeoapifyResult[] };
    const results = (reverseData.results ?? [])
      .filter((item) => item.city && typeof item.lat === "number" && typeof item.lon === "number")
      .map(mapResult);

    return NextResponse.json({ results });
  }

  if (!text) {
    return NextResponse.json({ results: [] });
  }

  const geoapifyParams = new URLSearchParams({
    text,
    type: "city",
    format: "json",
    lang: "fr",
    limit: String(Math.min(Math.max(limit, 1), 10)),
    apiKey
  });

  const response = await fetch(`${GEOAPIFY_AUTOCOMPLETE_URL}?${geoapifyParams.toString()}`, {
    headers: {
      Accept: "application/json"
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Geoapify request failed" }, { status: response.status });
  }

  const data = (await response.json()) as { results?: GeoapifyResult[] };

  const results = (data.results ?? [])
    .filter((item) => item.city && typeof item.lat === "number" && typeof item.lon === "number")
    .map(mapResult);

  return NextResponse.json({ results });
}
