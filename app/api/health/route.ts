import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, service: "fitly-web", timestamp: new Date().toISOString() });
}
