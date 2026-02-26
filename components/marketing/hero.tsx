"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 pb-20 pt-16 text-center">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full bg-white px-4 py-2 text-xs font-medium text-muted ring-1 ring-black/5"
      >
        Marketplace + Coaching Workspace
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl"
      >
        Le SaaS premium pour relier coachs sportifs et clients, puis piloter toute la progression.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.6 }}
        className="max-w-2xl text-base text-muted sm:text-lg"
      >
        Catalogue coachs notés, espace privé, plan nutrition détaillé, programmes évolutifs et suivi photo.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <Link href="/coaches">
          <Button>Trouver un coach</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost">Ouvrir le dashboard</Button>
        </Link>
      </motion.div>
    </section>
  );
}
