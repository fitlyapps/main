import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncAppUser } from "@/lib/user-sync";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUser = await syncAppUser({
    email: user.email,
    fullName: user.user_metadata?.full_name,
    role: user.user_metadata?.role
  });

  return NextResponse.json({
    data: {
      id: appUser.id,
      email: appUser.email,
      role: appUser.role,
      fullName: appUser.fullName
    }
  });
}
