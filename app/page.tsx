import Link from "next/link";
import { Hero } from "@/components/marketing/hero";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Fitly
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link href="/coaches">Coachs</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>
      <Hero />
    </main>
  );
}
