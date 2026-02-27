"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthControls } from "@/components/auth/auth-controls";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/coaches", label: "Coachs" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/onboarding", label: "Onboarding" },
  { href: "/dashboard/clients", label: "Clients" }
];

export function GlobalNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const canGoBack = pathname !== "/";

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={!canGoBack}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-black/10 transition",
            canGoBack ? "bg-white hover:bg-black/[0.03]" : "cursor-not-allowed bg-slate-100 text-slate-400"
          )}
          aria-label="Retour"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <Link href="/" className="mr-2 text-lg font-semibold tracking-tight">
          Fitly
        </Link>

        <nav className="flex items-center gap-2 overflow-x-auto">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm transition",
                  isActive ? "bg-accent text-white" : "text-muted hover:bg-black/[0.04] hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <AuthControls />
      </div>
    </header>
  );
}
