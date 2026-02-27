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

function isPreparedStatementConflict(error: unknown) {
  return error instanceof Error && /42P05|prepared statement .* already exists/i.test(error.message);
}

async function withPreparedStatementRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isPreparedStatementConflict(error)) {
      throw error;
    }

    await prisma.$disconnect();
    return operation();
  }
}

export async function syncAppUser(input: SyncInput): Promise<PrismaUser> {
  const role = normalizeRole(input.role);
  const fullName = input.fullName?.trim() || "New User";

  return withPreparedStatementRetry(async () => {
    const existing = await prisma.user.findUnique({
      where: { email: input.email }
    });

    const user = existing
      ? await prisma.user.update({
          where: { email: input.email },
          data: {
            fullName: existing.fullName !== fullName ? fullName : undefined,
            role: existing.role !== role ? role : undefined
          }
        })
      : await prisma.user.create({
          data: {
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
  });
}
