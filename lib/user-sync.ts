import { UserRole, type User as PrismaUser } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type SyncInput = {
  email: string;
  fullName?: string | null;
  role?: string | null;
};

function normalizeRole(role?: string | null): UserRole {
  const value = role?.toUpperCase();
  if (value === UserRole.COACH || value === UserRole.ADMIN) {
    return value;
  }

  return UserRole.CLIENT;
}

export async function syncAppUser(input: SyncInput): Promise<PrismaUser> {
  const role = normalizeRole(input.role);
  const fullName = input.fullName?.trim() || "New User";

  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      fullName,
      role
    },
    create: {
      email: input.email,
      fullName,
      role
    }
  });

  if (role === UserRole.COACH) {
    await prisma.coachProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        specialties: []
      }
    });
  }

  if (role === UserRole.CLIENT) {
    await prisma.clientProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        goals: []
      }
    });
  }

  return user;
}
