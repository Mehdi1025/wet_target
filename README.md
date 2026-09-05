# Target Agency — Next.js

Site [Target Agency](https://wearetarget.framer.website) migré depuis l'export Framer (NoCodeXport) vers Next.js.

## Structure

- `content/` — pages HTML exportées Framer (52 pages)
- `public/assets/` — images, fonts, vidéos, scripts Framer
- `app/[[...slug]]/route.ts` — sert les pages HTML à l'identique

## Développement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm start
```

## Pages

- `/` — Accueil
- `/about-us`, `/contacts`, `/career`, `/blog`, `/cases`
- `/legal`, `/policy`, `/terms`
- `/fr/*` — version française
- Articles de blog et études de cas

## Supabase

### 1. Créer le projet

1. Va sur [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Copie `.env.example` vers `.env.local` et remplis les clés API

### 2. Appliquer le schéma

Dans le **SQL Editor** Supabase, exécute le fichier :

`supabase/migrations/20260905120000_initial_schema.sql`

### 3. Variables Vercel

Ajoute les mêmes variables dans Vercel → **Settings → Environment Variables** :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server only)

### 4. Clients disponibles

| Fichier | Usage |
|---|---|
| `lib/supabase/client.ts` | Composants client (navigateur) |
| `lib/supabase/server.ts` | Server Components / Route Handlers |
| `lib/supabase/admin.ts` | Opérations admin (service role) |

### 5. CLI (optionnel)

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npm run supabase:types
```
