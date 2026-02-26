import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const nextValue = params?.next;
  const nextPath = typeof nextValue === "string" ? nextValue : "/dashboard";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-6xl items-center px-6 py-10">
      <Card className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
        <p className="mt-2 text-sm text-muted">Accède à ton espace coach/client.</p>

        <div className="mt-6">
          <SignInForm nextPath={nextPath} />
        </div>

        <p className="mt-5 text-sm text-muted">
          Pas encore de compte ?{" "}
          <Link href="/auth/sign-up" className="text-accent">
            Inscription
          </Link>
        </p>
      </Card>
    </main>
  );
}
