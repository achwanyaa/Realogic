# Handoff to Claude Code: LuxuryBoma platform, Realogic first

Written 11 Nov 2026. Read this whole file before changing anything. Then read `AGENTS.md` (Next.js 16 has breaking changes; its docs ship in `node_modules/next/dist/docs/`).

## 1. What this is

One Next.js app and one Supabase database that serve many clients. The first client is Realogic. The product's whole value is that property facts are checked and labelled by an independent party, so the independence rules in section 6 are requirements, not preferences.

**Who is who**

- **LuxuryBoma**: Tete's company. Owns the platform and the verification work (measurements, scans, checks, the verification record, anonymised data). Licenses the platform to clients for flat fees. Takes no shares in and no revenue share from a client's sales.
- **Realogic Properties Limited**: first client. Subsidiary of Sketch3D Ltd, a Kenyan architectural firm. Built most of the godowns (warehouses) it sells and leases. Owns its properties, listings, prices and leads.
- **Sketch3D Ltd**: designed the godowns and owns copyright in the drawings.
- **Tete**: founder of LuxuryBoma, also holds a personal stake in Realogic. This shared ownership must be disclosed on the site (wording in section 6).

**Not building:** payments or escrow, rent management, accounting.

## 2. Current state

Verified on 11 Nov 2026:

| Thing | State |
| --- | --- |
| GitHub | `https://github.com/achwanyaa/Realogic`, branch `main`, one commit (foundation). This handoff and `CLAUDE.md` were added after that commit and may still need committing. |
| Local folder | `C:\Users\sajim\Desktop\Realogic` (Windows, PowerShell). |
| Supabase project | ref `dlgqgtyiqclyduxkckgi`. API keys work (new `sb_publishable_` / `sb_secret_` format). **The 4 migrations are applied** (11 Nov 2026) and the API sees the 14 catalogue rows; anon is refused on clients, staff, buyers, events and audit. The real Realogic `clients` row is in (id `8342d565-ad5d-42e6-8795-d48e669ebcd6`). Types are generated in `src/lib/supabase/database.types.ts`. The repo folder is linked (`npx supabase link`). The current CLI targets a local stack by default: pass `--remote` to `db push` and `gen types`; it uses a temporary login role, so no database password is needed. Security advisor not yet run (dashboard only). No admin staff row yet. Phone sign-in is off, email sign-in is on. |
| Local env | Keys are in `.env` (git-ignored). `.env.example` is the blank template. |
| Tests | `npm test`: 61 pass. Lint, typecheck and build pass on the Windows machine (11 Nov 2026). `typecheck` runs `next typegen` first so `PageProps`/`LayoutProps` exist on a fresh clone. |
| Vercel | Project `realogic` under `achwanyaas-projects` (created 11 Nov 2026; the older `reallogic-demo` is the prototype, not this repo). Local folder is linked (`.vercel/`, git-ignored). The four env vars are set for Production and Preview; `SUPABASE_SECRET_KEY` is Sensitive. **GitHub repo not yet connected and nothing deployed yet**: connect it in the dashboard (Settings > Git), then push `main`. Deploy through Git, not `vercel deploy` from this folder: the CLI does not read `.gitignore` and can upload `.env` with the source. |

Milestone 1 (Foundation) is code-complete. What remains of it is operational (section 8).

## 3. Run and check

```
npm install
npm run dev          # then open http://realogic.localhost:3000
npm test             # data walls and independence rules, in-memory Postgres
npm run lint
npm run typecheck
npm run build
```

Local addresses (the `*.localhost` names resolve in Chrome and Edge without setup):

| Address | Shows |
| --- | --- |
| `http://realogic.localhost:3000` | Realogic portal |
| `http://console.localhost:3000` | LuxuryBoma console |
| `http://luxuryboma.localhost:3000` | luxuryboma.com |
| `http://localhost:3000` | whatever `DEFAULT_SITE` names (`realogic`, `console` or `luxuryboma`) |

Run all four checks before every commit. Never commit `.env`.

## 4. Stack and versions

- Next.js 16.4 (App Router, Turbopack, **Cache Components on**, Partial Prefetching on), React 19.3, TypeScript, Tailwind CSS 4.
- Supabase: `@supabase/ssr` 0.12, `@supabase/supabase-js` 2.119.
- Tests: Vitest 5 with PGlite (Postgres compiled to WebAssembly). No Docker needed.
- Hosting: Vercel. Database, auth and files: Supabase.

**Next.js 16 points that differ from older habits**

- Middleware is now `src/proxy.ts`, exporting `proxy`.
- With Cache Components, anything that reads `cookies()`, `headers()`, `searchParams`, or uncached data must sit inside `<Suspense>`, or the build fails with a blocking-route error. Cached reads use the `'use cache'` directive plus `cacheLife`/`cacheTag`. Read `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` and `09-revalidating.md` before writing any data-fetching page.
- Route props are typed with the generated helpers: `PageProps<"/sites/[site]">`, `LayoutProps<"/sites/[site]">`. `params` is a Promise.
- `next.config.ts` wires Tailwind through `@tailwindcss/turbopack`. Leave it.

## 5. Code map

```
src/proxy.ts                      Host -> folder rewrite, then Supabase session refresh
src/lib/sites.ts                  Site config (Realogic brand/contacts), host routing, disclosure text
src/lib/supabase/env.ts           Env names; supabaseConfigured flag
src/lib/supabase/client.ts        Browser client (publishable key)
src/lib/supabase/server.ts        Server client for Server Components, Actions, Route Handlers
src/lib/supabase/session.ts       Session refresh used by the proxy
src/app/layout.tsx                Root layout, four fonts via next/font
src/app/globals.css               Design tokens (@theme), .hatch and .blueprint textures
src/app/sites/[site]/layout.tsx   Client portal shell: contact strip, header, footer
src/app/sites/[site]/page.tsx     Portal home (static content only so far)
src/app/console/page.tsx          LuxuryBoma console placeholder
src/app/lb/page.tsx               luxuryboma.com placeholder
src/components/ProvenancePill.tsx Provenance label (LuxuryBoma identity)
supabase/migrations/              Schema, in order (4 files)
supabase/seed.sql                 SAMPLE data for local development only
tests/helpers/db.ts               In-memory Postgres + a small Supabase auth shim
tests/data-walls.test.ts          The wall and independence-rule tests
tests/seed.test.ts                Seed loads on top of migrations
```

**How routing works.** `src/proxy.ts` looks at the Host header and rewrites the path:

- a client's domain or `<slug>.localhost` -> `/sites/<slug>/...`
- `console.luxuryboma.com` or `console.localhost` -> `/console/...`
- `luxuryboma.com` or `luxuryboma.localhost` -> `/lb/...`
- anything else -> `DEFAULT_SITE`

Visitors never see `/sites/...`; asking for it directly returns 404 because the prefix is always added. Links inside a portal are written without the prefix (`/properties`, not `/sites/realogic/properties`).

**Site config is hardcoded for now.** `SITES` in `src/lib/sites.ts` holds Realogic's branding and contacts, and `domains: []` is empty because Realogic's domain is not decided. The database has a `clients` table and a `get_site_client(p_domain, p_slug)` function meant to replace this later. When Realogic's domain is known, add it to `domains` (and to the `clients` row).

## 6. Independence rules (enforce in the database, not just the screens)

1. Realogic cannot edit, hide or remove a verified fact. Only LuxuryBoma corrects facts, and every correction keeps the earlier version. Realogic can request a correction.
2. Realogic edits only price, availability and description on a listing.
3. Every "From drawings" fact names its drawing and author, for example "Drawing A-101 rev C, Sketch3D Ltd (developer's architect)".
4. A property goes live only after a LuxuryBoma site visit, and only a reviewer or admin publishes (an editor cannot publish their own work).
5. Disclosure appears wherever verification is claimed: "Designed by Sketch3D · developed and listed by Realogic · verified by LuxuryBoma. Realogic and LuxuryBoma share an owner." (constants in `src/lib/sites.ts`).
6. In v1, LuxuryBoma enters all listing data.
7. While Tete is the only staff member, editor and reviewer are the same person. Facts where `reviewed_by = checked_by` must be shown as "self-reviewed" so the verification page never overstates the checking.

Rules 1 to 4 are already enforced by constraints, triggers and policies, and covered by tests. Any new feature that touches facts, listings or publishing must keep those tests green and add its own.

## 7. Database

### Tables (all in `public`, all with row-level security on)

| Table | Holds | Walled by |
| --- | --- | --- |
| `clients` | name, slug, domain, logo, phone, WhatsApp, briefing recipients, licence status | itself |
| `staff_members` | user, client (null for LuxuryBoma staff), role, active | client |
| `properties` | reference, slug, name, type, address, area, map point, status, site visit date | `client_id` |
| `spaces` | halls, mezzanines, yards within a property | `client_id` |
| `spec_definitions` | catalogue of facts: key, name, group, unit, headline flag, required flag | shared |
| `spec_values` | one fact: value, display value, unit, label, method, source, document, checked on/by, reviewed by | `client_id` |
| `spec_value_history` | every earlier version of a fact (written by trigger only) | `client_id` |
| `documents` | drawings and reports: title, number, revision, author, file path, visibility | `client_id` |
| `media` | tours (link), photos, scans | `client_id` |
| `listings` | deal (lease/sale), price, price on request, availability, description, status | `client_id` |
| `industries`, `industry_requirements` | fit-check profiles: spec key, rule, threshold, fixable, fix note | shared |
| `buyer_profiles` | buyer name, company, role, phone, industry, consent date and version | per buyer |
| `leads` | links a buyer to a client; pipeline stage and sales notes | `client_id` |
| `saved_properties`, `fit_results` | buyer activity | per buyer; client sees its own |
| `bookings` | visit requests: day, time of day, purpose, questions, status, staff notes | `client_id` |
| `correction_requests` | a client asking LuxuryBoma to correct a fact | `client_id` |
| `events` | dossier views, tour opens, downloads, fit checks | `client_id` |
| `audit_log` | who changed which row and when (written by trigger only) | `client_id` |

`staff_members`, `leads` and `correction_requests` are additions to the original 15-table plan. `leads` exists because a buyer profile is global but a client's staff should only see buyers who signed up on that client's portal; `public.register_interest(client_id)` creates the link.

Child rows are tied to their property's client with a composite foreign key `(property_id, client_id) -> properties (id, client_id)`, so a row cannot point at another client's property. Keep this pattern for every new client table.

### Roles

Stored in `staff_members.role`: `lb_admin`, `lb_editor`, `lb_reviewer`, `client_staff`. Buyers are any signed-in user with a `buyer_profiles` row. The public is the `anon` role.

| Role | Can |
| --- | --- |
| LuxuryBoma admin | everything, all clients, catalogues, staff accounts |
| LuxuryBoma editor | create and edit properties, facts, media, documents; cannot publish |
| LuxuryBoma reviewer | the same, plus publish |
| Client staff | read everything of their own client; update listing price/availability/description, booking status/notes/confirmed time, lead stage/notes; file correction requests |
| Buyer | own profile, saved properties, fit results, bookings |
| Public | live properties with their facts, media, public documents, active listings, catalogues |

### Helper functions (schema `private`, not exposed by the API)

`private.staff_session_ok()`, `lb_role()`, `is_lb_staff()`, `is_lb_admin()`, `can_publish()`, `is_client_staff(client_id)`, `can_see_client(client_id)`, `property_is_live(property_id)`, `buyer_is_my_lead(buyer_id)`. Policies call these; the ones that read tables are `security definer` with `search_path = ''`.

**Two-factor is enforced in the database.** `private.staff_session_ok()` requires the JWT claim `aal = 'aal2'`. A staff account signed in without two-factor is treated as an ordinary visitor and sees only public data. Consequence: nothing in the console works until staff can enrol and verify a TOTP factor (Supabase MFA). Build that first in milestone 2.

### Server-only writes

`events`, `spec_value_history` and `audit_log` have no insert/update/delete rights for browser roles. History and audit are written by triggers. Events must be written from the server with the secret key (`SUPABASE_SECRET_KEY`); there is no secret-key client yet, so create `src/lib/supabase/admin.ts` when needed, import it only in server code, and never give that env var a `NEXT_PUBLIC_` name.

### Migration rules

- Never edit a migration that has been applied to a real project. Add a new file named `YYYYMMDDHHMMSS_description.sql`.
- Every new table: `enable row level security`, explicit `grant`s, policies, and a case in `tests/data-walls.test.ts` (add it to `CLIENT_TABLES` if it carries `client_id`). One test already fails if any `public` table lacks row-level security.
- `supabase/seed.sql` is sample data. Never run it against the real project. Godown A1's figures and the industry thresholds in it come from the prototype and are not verified.

### How the tests work

`tests/helpers/db.ts` starts PGlite, creates the roles `anon`, `authenticated`, `service_role`, an `auth.users` table, and `auth.uid()` / `auth.jwt()` that read `request.jwt.claims`, then applies every migration. `as(db, caller, fn)` runs `fn` as that caller (`anon`, or `user(id, { twoFactor })`) inside a transaction that is always rolled back. This proves the policies but is not a live Supabase project: Supabase Storage, Auth flows and realtime are not covered.

## 8. Do first: finish milestone 1

1. **Apply the migrations to the Supabase project.** From the repo folder: `npx supabase login`, `npx supabase link --project-ref dlgqgtyiqclyduxkckgi`, `npx supabase db push`. It asks for the database password; ask Tete. If `link` complains about a missing config, run `npx supabase init` first and commit the `supabase/config.toml` it creates. Do not run the seed.
2. **Check the result.** In the Supabase dashboard run the security advisor and fix anything it reports. Confirm the API sees the tables (`/rest/v1/spec_definitions?select=key` returns the 14 catalogue rows).
3. **Insert the real Realogic client row** (not the seed's): slug `realogic`, name `Realogic Properties`, legal name `Realogic Properties Limited`, phone `+254 725 073 496`, WhatsApp `254725073496`, email `realogicacc@gmail.com`, postal address `P.O. Box 249-00100, Nairobi, Kenya`, `licence_status` `active`, domain left null until decided.
4. **Create the first admin.** Create Tete's auth user, then insert a `staff_members` row with `role = 'lb_admin'` and `client_id = null`. Use the SQL editor; no screen exists for this.
5. **Vercel env vars.** Confirm `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` and `DEFAULT_SITE=realogic` are set for Production and Preview. Vercel reads its own settings, not the local `.env`.
6. **Generate database types.** `npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts`, then pass `Database` to the three `createClient` helpers.
7. **Run `npm test` on Windows** once to confirm PGlite works there.

## 9. Milestone 2: LuxuryBoma console

Goal: Tete can enter one godown completely, with facts and their provenance. Done when Godown A1 is fully entered with real specs from the architect's drawings.

Build in this order, under `src/app/console/`:

1. **Staff sign-in with two-factor.** Email and password, then TOTP enrol (first time) or verify. Use Supabase MFA (`supabase.auth.mfa.enroll`, `challenge`, `verify`). After verify the session is `aal2`. Guard every console route on the server: no session or not `aal2` or no LuxuryBoma `staff_members` row -> redirect to sign-in. Check the current Supabase MFA docs rather than relying on memory.
2. **Properties list and create/edit.** Fields from `properties`. Status moves draft -> in review -> live -> paused / sold or leased. The "publish" action must show why it is blocked (no site visit date, or the user is an editor).
3. **Facts editor.** One row per `spec_definitions` entry for the property type. For each: value (number, yes/no or text by `value_type`), display value, unit, provenance label, method, source, linked document, checked on. Enforce in the form what the database enforces: "From drawings" needs a source; "Measured" needs a date; "Not yet checked" has no value. Show the change history from `spec_value_history`. Show "self-reviewed" when reviewer and checker are the same person.
4. **Documents.** Upload to a **private** Supabase Storage bucket; store the path in `documents.file_path`. Needs a new migration for the bucket and its storage policies (LuxuryBoma staff write; reads only through short-lived signed URLs created on the server after checking the `documents` row's visibility). Storage is not covered by the PGlite tests, so test it against the real project.
5. **Media.** Photos to storage (a public bucket is acceptable for photos of live properties), Realsee tours by link only.
6. **Listing.** Deal, price or price on request, availability, description, status.
7. **Catalogue screens (admin only).** Spec definitions and industry requirements. Lower priority; SQL is fine at first.

Use Server Actions for writes with the server client, so row-level security applies as the signed-in staff member. Do not use the secret key for console writes; that would bypass the publish and role rules.

## 10. Later milestones

3. **Verification and methodology pages.** A public LuxuryBoma page per property listing every fact with its label, source, date and correction history, plus a methodology page that explains the labels and discloses the shared ownership. Done when the badge on a listing opens this page.
4. **Realogic portal and dossier.** Listings, the godown dossier (gallery, 3D tour that loads only when tapped, key numbers grid, all specifications grouped and expandable with source detail, documents behind sign-in, location, booking/WhatsApp/save/spec sheet PDF sidebar, "Verified by LuxuryBoma" card with the measured / from drawings / other bar). Add the Properties and Fit check links back to the portal header. Done when live on Realogic's domain.
5. **Fit check, sign-up, booking, messages, Realogic backend.** Details below. Done when a test booking reaches Realogic with its briefing.
6. **luxuryboma.com.** Home, what we do, Realogic as first case study.

### Fit check logic (from the prototype)

For the chosen industry, each requirement is judged against the property's fact:

- fact missing, value null, or label `not_yet_checked` -> **Not enough data**
- `must_have`: true -> **Meets**; false -> **Fixable** if the requirement is fixable, else **Doesn't meet**
- `minimum`: value >= threshold -> **Meets**; otherwise **Fixable** or **Doesn't meet** as above

Overall verdict, in this order: any "Doesn't meet" -> **Does not fit**; else any "Not enough data" -> **Not enough data**; else any "Fixable" -> **Fits with changes**; else **Fits**. An unchecked fact therefore always blocks "Fits". A fact that meets only on a `declared` label carries the note "Meets on Realogic's word only. Ask to see proof at your visit." Fixable gaps offer "Ask Realogic for a fit-out quote", which needs a `fitout_requests` table (not created yet).

### Sign-up and booking (from the prototype)

- Sign-up: phone number -> 6-digit SMS code -> details (name, company, role, industry) with a consent checkbox: "I agree that Realogic receives my details to arrange visits, and that LuxuryBoma stores them for Realogic. I can delete my account at any time." Store `consent_at` and `consent_version`, then call `register_interest(client_id)`. "Use email instead" is offered.
- Booking, saving a property and viewing documents all require sign-in; after sign-in return the buyer to what they were doing.
- Booking form: day, morning/afternoon, purpose (first look, technical inspection, with my engineer or contractor, fit-out quote), optional questions. Confirmation says Realogic confirms by WhatsApp or SMS, usually within one working day.
- Account page: my visits, saved properties, my industry, delete my account and data (must really delete: Data Protection Act 2019).
- Phone sign-in needs an SMS provider that delivers in Kenya and phone auth switched on in Supabase. No provider is chosen. WhatsApp in v1 is click-to-chat links only (`https://wa.me/254725073496`).

### Realogic backend (staff)

Overview, leads pipeline (New -> Visit booked -> Visited -> Offer -> Won/Lost) with a briefing per lead, visits to confirm, listings (price, availability, description only), fit-out requests, demand insights. Client staff need two-factor too. Still to add in the database: `fitout_requests`, and a safe way for a buyer to cancel their own booking.

## 11. Design system

Tokens are in `src/app/globals.css` as Tailwind theme variables; use the utility names, not raw hex.

**Realogic**

| Use | Value | Tailwind name |
| --- | --- | --- |
| Navy (headings, contact strip, footer) | `#0C1B33` | `navy` |
| Blue (actions, links) | `#0A4FA3`, hover `#083E80` | `blue`, `blue-hover` |
| Page background | `#F5F8FC` | `page` |
| Borders | `#D3DCE8`, controls `#C9D4E6`, row dividers `#EEF1F6` | `line`, `line-strong`, `line-soft` |
| Text | `#1C2333`, body `#22324F`, muted `#3B4A63` | `ink`, `body`, `muted` |
| Available chip | `#EAF5DC` / `#2F5F10` | `available-bg`, `available` |
| Notice banner | `#FFF4DB` / `#5E4100` | `notice-bg`, `notice` |
| Fit status | green `#2E7A3C`, amber `#A35F00`, red `#B3261E`, grey `#4F5868` | `fit-green`, `fit-amber`, `fit-red`, `fit-grey` |

- Type: Archivo for headings (font-stretch 88%, weight 700 to 800), IBM Plex Sans for body and numbers (tabular figures), Montserrat 800 only for the REALOGIC wordmark.
- Shape and texture: radii 3 to 6px (`rounded-chip`, `rounded-control`, `rounded-card`), ruled datasheet grids for key numbers (1px gaps over a border-coloured background), CAD hatch (`.hatch`) for photo placeholders, faint blueprint grid (`.blueprint`) on the hero and map, navy contact strip on top. Content width 1180px. Touch targets at least 44px high.

**LuxuryBoma elements keep their own identity inside a client's portal:** purple `#4B3A78` (`lb`), deep `#3A2C60` (`lb-deep`), tint `#EFEBF8` (`lb-tint`), Plus Jakarta Sans (`font-lb`). This applies to the provenance pill, the "Verified by LuxuryBoma" card and footer credit.

**Provenance labels** (`ProvenancePill`, values match the `provenance_label` database type): `measured`, `from_drawings`, `declared` ("Declared by seller"), `indicative`, `not_found`, `not_yet_checked`.

**Copy:** plain, short, written from Realogic's side ("We can't edit or hide a verified fact"). "Godown" is the local word for warehouse; keep it.

**Performance target:** a dossier's text and specs readable within about 3 seconds on a mid-range Android phone on mobile data. Most buyers arrive from a WhatsApp link, so each listing needs its own title, description and share image.

## 12. Design sources

The prototype is the design source of truth, but it lives in claude.ai artifacts that Claude Code may not be able to open. Everything needed to start is summarised in this file and in `supabase/seed.sql` (the prototype's sample data). If a screen's exact layout is needed, ask Tete to export it.

- Realogic Portal Prototype: https://claude.ai/artifact/5hwqWSMbHaK7AwR3ufyiWR (Main = buyer portal, Backend = staff backend, Pill = provenance label)
- LuxuryBoma Vision 2026–2031, including the Build plan: https://claude.ai/artifact/2b9VpBv51S5QmWZBA47a13
- LuxuryBoma Platform Design Spec v1: https://claude.ai/artifact/VAG9C6bD6BfY8ZVWhA8RCX
- The Realogic logo is an uploaded image in the prototype and on Realogic's invoice; the portal header currently shows the wordmark only.

## 13. Open items (do not guess; ask Tete)

- Realogic's domain.
- Realogic's answers on lease vs sale, off-plan, listing other owners' properties, and who is on their team.
- SMS provider for sign-in codes.
- Whether "required to publish" stays as the architect's five facts (clear height, slab load, yard turning, mezzanine capacity, incoming power). The catalogue marks those five now; nothing enforces it yet.
- Real data for Godown A1: architect's drawings, site measurements, photos, Realsee link.
- From the advocate: ownership disclosure wording, privacy notice and terms, licence agreement, Sketch3D's permission to show drawings, whether LuxuryBoma must register with the Office of the Data Protection Commissioner.
- The Supabase database password, and which account owns the Vercel project.

## 14. Working rules for this repo

- Windows machine, PowerShell. Use `copy`, not `cp`, in instructions to Tete.
- Never print, log or commit secret values. `.env` stays local.
- Do not weaken a policy, constraint or trigger to make a feature easier. If a rule blocks legitimate work, raise it with Tete.
- Keep sample data clearly labelled as sample. Nothing unverified may appear on the live site as a checked fact.
- One milestone at a time; new ideas go on a "later" list.
- Commit in small steps with the four checks passing. The repo is public.
