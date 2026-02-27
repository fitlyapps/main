import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { syncAppUser } from "@/lib/user-sync";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/auth/sign-in?next=/dashboard");
  }

  try {
    await syncAppUser({
      email: user.email,
      fullName: user.user_metadata?.full_name,
      role: user.user_metadata?.role
    });
  } catch (error) {
    console.error("syncAppUser failed in requireUser:", error);
  }

  return user;
}

export async function requireAppUser() {
  const user = await requireUser();

  let appUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      coachProfile: true,
      clientProfile: true
    }
  });

  if (!appUser) {
    try {
      await syncAppUser({
        email: user.email!,
        fullName: user.user_metadata?.full_name,
        role: user.user_metadata?.role
      });
      appUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
          coachProfile: true,
          clientProfile: true
        }
      });
    } catch (error) {
      console.error("syncAppUser fallback failed in requireAppUser:", error);
    }
  }

  if (!appUser) {
    redirect("/auth/sign-in");
  }

  return appUser;
}
