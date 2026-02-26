# Fitly

SaaS marketplace + workspace privé pour coachs sportifs et clients.

## Stack MVP (free-tier first)

- Next.js 15 + TypeScript
- Supabase (Postgres/Auth/Storage)
- Prisma ORM
- Stripe + Stripe Connect
- Tailwind CSS + Framer Motion

## Démarrage

1. Installer les dépendances:

```bash
npm install
```

2. Copier les variables:

```bash
cp .env.example .env.local
```

3. Renseigner les clés Supabase + Stripe dans `.env.local`.

4. Générer Prisma client:

```bash
npm run db:generate
```

5. Lancer le serveur:

```bash
npm run dev
```

## Modèle de données inclus

- Utilisateurs (`COACH`, `CLIENT`, `ADMIN`)
- Profil coach + notation + spécialités + localisation
- Relation coach/client
- Plans nutrition hebdo + macros journalières
- Programmes d'entraînement + sessions + exercices
- Messages privés
- Photos de progression
- Abonnement coach

## Roadmap courte

- Brancher Supabase Auth (email + OAuth)
- Ajouter RLS policies côté Supabase
- Connecter Stripe Connect onboarding + webhooks
- Ajouter i18n (`en`, `fr`) et devises multi-pays
- Préparer une app Expo (mobile) sur la même couche API
# main
