import { NextResponse } from "next/server";
import { autocompleteCities, reverseCity } from "@/lib/geoapify";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text")?.trim();
    const limit = Number(searchParams.get("limit") || "6");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (lat && lon) {
      const results = await reverseCity(lat, lon);
      return NextResponse.json({ results });
    }

    if (!text) {
      return NextResponse.json({ results: [] });
    }

    const results = await autocompleteCities(text, limit);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Geo cities route failed:", error);
    return NextResponse.json({ error: "Geo lookup failed" }, { status: 500 });
  }
}
