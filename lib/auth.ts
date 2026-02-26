import { redirect } from "next/navigation";
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

  await syncAppUser({
    email: user.email,
    fullName: user.user_metadata?.full_name,
    role: user.user_metadata?.role
  });

  return user;
}
