"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function AuthControls() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="ml-auto flex items-center gap-2">
        <Link href="/auth/sign-in" className="rounded-full px-4 py-2 text-sm text-muted hover:bg-black/[0.04]">
          Connexion
        </Link>
        <Link href="/auth/sign-up" className="rounded-full bg-accent px-4 py-2 text-sm text-white">
          Inscription
        </Link>
      </div>
    );
  }

  return (
    <div className="ml-auto flex items-center gap-2">
      <span className="hidden text-xs text-muted sm:block">{user.email}</span>
      <button
        type="button"
        onClick={signOut}
        className="rounded-full px-4 py-2 text-sm text-muted hover:bg-black/[0.04]"
      >
        Se déconnecter
      </button>
    </div>
  );
}
