# Decision Log

Every product/technical decision made on this project, with the options considered.
**Process rule: any new decision made in any session must be appended here.**

Format: `D<N>` — decision, options considered, choice, why.

---

## Process & docs

**D1 — Requirements source of truth.**
Options: PRD-FSD.md (generated spec) vs. the original take-home assignment text.
**Choice:** The assignment (saved as [ASSIGNMENT.md](ASSIGNMENT.md)) wins wherever they differ; PRD-FSD.md remains as elaboration.
Why: the assignment is the graded contract. Notable differences it settled: GraphQL (not REST) for profile mutation/query, Supabase/Postgres, Tailwind + shadcn/ui, pnpm, **no tests**, **no auth** (both explicitly negative points), `.env` committed.

**D2 — Decision tracking.**
**Choice:** maintain this decision-log.md and append every future decision; rule encoded in CLAUDE.md so future sessions comply. (User requirement, 2026-06-09.)

---

## Runtime & tooling

**D3 — Node version.**
Options: system Node 18.16 (below Next.js minimum) vs. nvm-installed 20.19 / 22.14 / 24.1.
**Choice:** Node 22.14 (nvm). Why: system node is too old for Next 14+; 22 is current LTS.

**D4 — Package manager.**
**Choice:** pnpm via corepack. No alternatives considered — assignment mandates `pnpm && pnpm dev`.

**D5 — Next.js / React version.**
Options: Next 15 + React 19 vs. Next 14 + React 18.
**Choice:** Next 14.2 + React 18. Why: under time pressure, maximum ecosystem compatibility (Apollo integrations, Ag-Grid, Radix) and a first-class Pages Router. React 19 buys nothing here.

**D6 — Tailwind version.**
Options: v4 (new engine) vs. v3.
**Choice:** Tailwind v3. Why: classic shadcn/ui conventions (tailwind.config + CSS variables + tailwindcss-animate) are built for v3; zero migration risk.

**D7 — shadcn/ui delivery.**
Options: `shadcn` CLI init vs. hand-written components in `components/ui/*` following shadcn conventions (Radix + cva + tailwind-merge).
**Choice:** hand-written primitives (button, input, label, card, checkbox, textarea, dialog, alert). Why: CLI is tuned for fresh scaffolds and interactive prompts; we need ~8 components and full control keeps output parsimonious — which the grader explicitly scores.

---

## Data layer

**D8 — Database access.**
Options: Prisma, Drizzle, raw `pg`, `@supabase/supabase-js`.
**Choice:** `@supabase/supabase-js` with the service-role key, used **only inside server code** (GraphQL resolvers). Schema shipped as [supabase/schema.sql](supabase/schema.sql) to run once in the Supabase SQL editor.
Why: assignment fixes Supabase; one table doesn't justify an ORM + migration pipeline; supabase-js is the canonical client and keeps setup at "paste SQL, paste keys".

**D9 — Table design.**
**Choice:** `patient_profiles` with snake_case columns, `id uuid default gen_random_uuid()`, `date_of_birth date`, `consent boolean not null check (consent)`, `created_at timestamptz default now()` (server-generated).
Why: DB-side `CHECK (consent)` + NOT NULLs make an incomplete/non-consented row impossible — atomicity enforced at the lowest layer, not just in JS.

**D10 — Email normalization.**
**Choice:** lowercase + trim server-side before insert (per PRD §2.30).

**D11 — DOB storage/transport.**
Options: store as text vs. Postgres `date`; transport as Date vs. string.
**Choice:** Postgres `date`, string (`YYYY-MM-DD`) everywhere in transit (GraphQL + form). Why: native `<input type="date">` emits exactly this; strings avoid timezone off-by-one bugs in SSR serialization.

---

## API layer

**D12 — GraphQL server wiring.**
Options: graphql-yoga, Apollo Server 4 standalone, Apollo Server 4 + `@as-integrations/next`.
**Choice:** Apollo Server 4 + `@as-integrations/next` at `pages/api/graphql.ts`. Why: assignment mandates Apollo Server + Apollo Client; the next integration is the canonical Pages Router adapter.

**D13 — SSR query path for /admin.**
Options: (a) fetch own `/api/graphql` over HTTP from `getServerSideProps` (self-call anti-pattern, needs absolute URL), (b) bypass GraphQL and call the DB directly in SSR, (c) Apollo Client with `SchemaLink` executing the real `getPatientProfiles` query against the schema in-process.
**Choice:** (c) SchemaLink. Why: the assignment says "Query `getPatientProfiles` on server side render" — SchemaLink runs the genuine GraphQL query (resolvers, typing, error path all exercised) with no HTTP round-trip.

**D14 — Mutation transport from the form.**
**Choice:** Apollo Client `useMutation(CREATE_PATIENT_PROFILE)` against `/api/graphql`. File upload + post-upload logic stay on REST (`/api/upload`) exactly as the assignment splits it.

**D15 — Upload mechanics.**
Options: (a) multipart POST through an API route to Blob, (b) `@vercel/blob/client` client-upload flow — `/api/upload` mints a signed client token via `handleUpload`, browser PUTs directly to Blob.
**Choice:** (b). Why: Vercel serverless request bodies cap at ~4.5 MB; the spec allows 10 MB images, so proxying through the function is broken by design. Client upload is the canonical "PUT upload URL" pattern the assignment names.

**D16 — Upload-side validation.**
**Choice:** `/api/upload` allows only `image/png, image/jpeg, image/webp` and ≤ 10 MB via `onBeforeGenerateToken` (server-enforced, not just client Zod). Pathnames are namespaced `insurance-card/*` / `photo-id/*` with `addRandomSuffix` to prevent collisions/overwrites.

**D17 — Atomicity model.**
**Choice:** profile insert happens only after **both** blob URLs exist, in one single-row insert (atomic by definition in Postgres), re-validated server-side with the shared Zod schema + DB constraints. A failed upload therefore can never produce a partial profile. Orphaned blobs from abandoned submissions are accepted for this assignment (noted in TRD as a production cleanup item).

---

## Form UX (graded "free parameters")

**D18 — Phone input.**
Options: `react-phone-number-input` (intl, flags, libphonenumber ~150KB), `react-imask`, plain text + regex, custom as-you-type US formatter.
**Choice:** custom as-you-type formatter to `(555) 123-4567` + Zod rule of exactly 10 digits, `type="tel"`, `autoComplete="tel"`. Why: US-only intake; canonical UX without a heavyweight dependency; shows the edge-case was handled deliberately.

**D19 — Address input.**
Options: Google Places autocomplete (needs a billable API key committed to .env), Mapbox/Radar autocomplete (same key problem), structured 4-field address, single labeled field.
**Choice:** single address field with `autoComplete="street-address"` (browser autofill does real work here); Places autocomplete deferred to the TRD as the first production upgrade.
Why: cannot commit a third-party billing key to a shared repo; browser autofill gives 80% of the conversion win for free.

**D20 — Date of birth input.**
Options: shadcn Calendar popover vs. native `<input type="date">` with `max=today`.
**Choice:** native date input. Why: calendar popovers are poor for birth dates (decades of back-navigation); native control is keyboard/mobile/a11y-correct and zero code. Styled to match shadcn inputs.

**D21 — Step navigation model.**
**Choice:** single `useForm` (one Zod schema) for all three steps; step advance runs `trigger()` on that step's fields only; Back never validates; state survives navigation automatically. Quiz-style card with a stepper header, matching the assignment's suggested pattern.

**D22 — File picker UX.**
**Choice:** custom drop-zone-styled `<input type="file">` (via shadcn-styled component) showing image thumbnail preview (`URL.createObjectURL`), file name + size after selection, inline Zod errors for type/size. `accept="image/png,image/jpeg,image/webp"`.

**D23 — Duplicate submission guard.**
**Choice:** submit button disabled while `isSubmitting`; per-stage progress copy ("Uploading insurance card…", "Uploading photo ID…", "Saving your profile…"); success screen replaces the form (no resubmit path) with a "Submit another response" reset.

---

## Admin page

**D24 — Ag-Grid version/theming.**
Options: v32 (legacy CSS imports) vs. v33 (Theming API, `AllCommunityModule`).
**Choice:** v33 community, `themeQuartz`, `ModuleRegistry.registerModules([AllCommunityModule])`. Why: current major, no CSS-file juggling, default theme is clean next to shadcn.

**D25 — Document preview interaction.**
Options: open blob URL in new tab vs. in-app modal preview.
**Choice:** shadcn Dialog modal rendering the image from the blob URL (assignment: "show photo previews when clicked"). Cell renderer buttons → dialog with the image; new-tab open available from inside the dialog.

**D26 — Grid features.**
**Choice:** `defaultColDef: { sortable, filter, resizable }`, `pagination: true`, `paginationPageSize: 10`, newest-first default sort on `createdAt`, empty state when no rows.

---

## Styling discipline (assignment requirement)

**D27 — Class strategy.**
**Choice:** semantic classes (e.g. `.page-shell`, `.page-title`, `.page-subtitle`, `.form-grid`) defined in `styles/globals.css` via `@apply` for typography/color/size; inline Tailwind on the two pages limited to padding/margin/flex/grid per the assignment. All reusable styling lives in `components/ui/*`.

---

## Submission logistics

**D28 — .env handling.**
**Choice:** `.env` is committed (assignment requires it) containing `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BLOB_READ_WRITE_TOKEN`. Values must be pasted in by the repo owner before pushing — Claude cannot provision Supabase/Vercel accounts. `.gitignore` adjusted to allow `.env`.

**D29 — Explicit non-goals.**
**Choice:** no unit/e2e tests, no auth on /admin, no devops beyond `vercel deploy` — all three are explicit negative points in the assignment, overriding the PRD's "recommended" auth section.

**D30 — Commit narrative.**
**Choice:** ~10 incremental commits in dependency order (docs → scaffold → schemas → UI kit → GraphQL/DB → upload → intake → admin → env/README → TRD), TRD strictly last per assignment instructions.

---

## Decisions made during implementation

**D31 — Executable schema package.**
Options: rely on Apollo Server's internal schema (not exported) vs. adding `@graphql-tools/schema`.
**Choice:** added `@graphql-tools/schema` (already an Apollo dependency family) so one `makeExecutableSchema` output is shared by the `/api/graphql` handler and the SSR SchemaLink client — both paths run identical resolvers.

**D32 — Ag-Grid rendered client-side only.**
Options: render the grid during SSR vs. `next/dynamic` with `ssr: false`.
**Choice:** dynamic client-only grid. Ag-Grid touches browser APIs at render; the data still arrives via SSR (`getServerSideProps`), which is what the assignment requires — only the table widget hydrates client-side.

**D33 — Apollo Client split (browser vs. SSR).**
**Choice:** `lib/apollo.ts` (HttpLink, used by `ApolloProvider`/`useMutation`) kept separate from `lib/apollo-ssr.ts` (SchemaLink, imports server code). Next.js strips `getServerSideProps`-only imports from the client bundle, so Supabase/service-role code never ships to the browser.

**D34 — PatientProfile consent typing.**
**Choice:** input type keeps Zod's literal `true`; the stored/output `PatientProfile` type widens consent to `boolean` (DB column is boolean; literal-true is an input-validation concern, not a storage shape).

**D35 — Cross-page navigation.**
**Choice:** discreet "Staff? Open the admin dashboard" footer link on the intake page; admin header shows live record count. Keeps the two pages visually consistent (same `page-header` pattern) per the grading rubric.

**D36 — Phone formatting wiring.**
Options: RHF `Controller` for the phone field vs. overriding `register`'s onChange with `setValue(formatPhone(...))`.
**Choice:** the `setValue` override — one line, keeps the field registered like its siblings; validation still runs on blur/trigger (`mode: "onTouched"`).

**D37 — .env placeholders.**
**Choice:** `.env` committed with clearly-marked placeholders; the repo owner pastes real Supabase/Blob values before pushing (Claude cannot provision third-party accounts). README documents the two one-time setup steps.

---

## Decisions from the UI polish pass (2026-06-10)

**D38 — Reward-early validation.**
Problem found by driving the real UI: pre-submit, RHF `onTouched` mode only clears errors on blur, so a fixed field kept its error until the user clicked away — and the blur-triggered layout shift could move the Next button mid-click (reproduced: an automated click missed entirely).
Options: switch to `mode: "onChange"` (errors appear while typing fresh fields — hostile), `mode: "all"` (same problem), or a watch subscription that re-validates only fields that currently show an error.
**Choice:** the watch subscription (4 lines in `pages/index.tsx`): errors appear on blur/Next as before, but disappear the moment the value becomes valid. Standard "reward early, punish late" pattern.

**D39 — Motion polish.**
**Choice:** tailwindcss-animate only (no new dependency): step content fades/slides on step change (`key={step}`), success card zooms in, submission error fades in, stepper connectors get color transitions. Subtle radial teal washes on the body background and a soft primary-tinted card shadow for depth. Durations 300–500ms.

**D40 — Invalid-file thumbnail guard.**
**Choice:** thumbnails render only for accepted MIME types; a rejected file (PDF/HEIC) shows a `FileWarning` icon + filename + size beside its validation error instead of a broken `<img>`.

**D41 — Brand mark icon.**
**Choice:** `HeartPulse` lucide icon added to the "Reimagine Health" mark on both pages for cross-page identity.

---

## Decisions from live integration (2026-06-10)

**D42 — @vercel/blob 0.27 → 2.4.**
Found during the first live upload: SDK 0.27 speaks a Blob API version that newly-created stores no longer serve (browser PUTs 404'd). Upgraded to 2.4.0 — `handleUpload`/`upload` call sites unchanged. Also dropped the no-op `onUploadCompleted` (2.x warns when no callback URL is derivable on localhost, and our insert path never depended on the webhook).

**D43 — Public Blob store required.**
First store was created with Private access; the API rejects `access: "public"` uploads against it, and private blobs would break the assignment's "previews rendered from the stored blob URLs" requirement. Store recreated as Public. Signed, short-lived read URLs for PHI remain the documented production upgrade in the TRD.
