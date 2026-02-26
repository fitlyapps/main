import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-6xl items-center px-6 py-10">
      <Card className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Inscription</h1>
        <p className="mt-2 text-sm text-muted">Crée ton compte coach ou client.</p>

        <div className="mt-6">
          <SignUpForm />
        </div>

        <p className="mt-5 text-sm text-muted">
          Déjà inscrit ?{" "}
          <Link href="/auth/sign-in" className="text-accent">
            Connexion
          </Link>
        </p>
      </Card>
    </main>
  );
}
