# LuxuryBoma platform (Realogic first)

One Next.js app and one Supabase database serving three kinds of site, chosen by domain:

| Site | Folder | Local address |
| --- | --- | --- |
| A client's portal (Realogic) | `src/app/sites/[site]` | http://realogic.localhost:3000 |
| LuxuryBoma console (our staff) | `src/app/console` | http://console.localhost:3000 |
| luxuryboma.com | `src/app/lb` | http://luxuryboma.localhost:3000 |

Plain http://localhost:3000 shows the site named in `DEFAULT_SITE`.

## Run it

```
npm install
copy .env.example .env.local    (then fill in the Supabase values)
npm run dev
```

The app runs without Supabase values; pages that need data will say so.

## Checks

```
npm test          data-wall and independence-rule tests (no Docker or Supabase needed)
npm run lint
npm run typecheck
npm run build
```

`npm test` builds a throwaway Postgres in memory, applies every file in
`supabase/migrations`, and proves that one client cannot read another client's
data. Run it before every release and after every migration.

## Database

- `supabase/migrations/` is the schema, in order. Never edit a migration that
  has been applied to a real project; add a new one.
- `supabase/seed.sql` is sample data for local development only.
- Every client table carries `client_id` and has row-level security on.
- Staff accounts (LuxuryBoma and client) only get staff access when signed in
  with two-factor.

Independence rules enforced by the database, not just the screens:

- Client staff cannot add, edit or remove a fact; they can file a correction request.
- Every change to a fact keeps the previous version in `spec_value_history`.
- Client staff change only price, availability and description on a listing.
- A "From drawings" fact must name its drawing and author.
- A property goes live only after a site visit, and only a reviewer or admin publishes.

## Where things are

- `src/proxy.ts`, `src/lib/sites.ts`: which domain shows which site.
- `src/lib/supabase/`: Supabase clients for the browser, the server and the proxy.
- `src/app/globals.css`: Realogic and LuxuryBoma design tokens from the prototype.
- `src/components/ProvenancePill.tsx`: the provenance label.

## Build order

1. Foundation (this commit): app, schema, data walls, tests.
2. LuxuryBoma console: staff sign-in with two-factor, enter properties, facts, media, documents.
3. Verification and methodology pages.
4. Realogic portal and dossier.
5. Fit check, sign-up, booking, messages; Realogic backend.
6. luxuryboma.com.
