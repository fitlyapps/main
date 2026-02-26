import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const coaches = await prisma.coachProfile.findMany({
    orderBy: [{ avgRating: "desc" }],
    take: 30,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true
        }
      }
    }
  });

  return NextResponse.json({ data: coaches });
}
