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
