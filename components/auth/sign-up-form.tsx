"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignUpForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"coach" | "client">("coach");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role
        },
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      await fetch("/api/auth/sync", { method: "POST" });
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setInfo("Compte créé. Vérifie tes emails pour confirmer ton inscription.");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-muted">Nom complet</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none ring-accent/40 transition focus:ring"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none ring-accent/40 transition focus:ring"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">Mot de passe</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none ring-accent/40 transition focus:ring"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">Je suis</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "coach" | "client")}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none ring-accent/40 transition focus:ring"
        >
          <option value="coach">Coach</option>
          <option value="client">Client</option>
        </select>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {info ? <p className="text-sm text-green-700">{info}</p> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Création..." : "Créer mon compte"}
      </Button>
    </form>
  );
}
