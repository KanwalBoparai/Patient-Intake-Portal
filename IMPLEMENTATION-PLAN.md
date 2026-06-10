# Implementation Plan — Reimagine Health Patient Intake

Source of truth: [ASSIGNMENT.md](ASSIGNMENT.md). Decisions + rationale: [decision-log.md](decision-log.md).

**Stack (mandated):** Next.js Pages Router · TypeScript · Tailwind + shadcn/ui · Supabase/Postgres · GraphQL (Apollo Server + Client) · Vercel Blob (PUT upload URLs) · React-Hook-Form + Zod · pnpm.
**Explicit non-goals (negative points):** tests, auth, devops.

## Commit-by-commit plan (~3h budget)

| # | Commit | Contents |
|---|--------|----------|
| 1 | docs | ASSIGNMENT.md, decision-log.md, CLAUDE.md, this plan |
| 2 | scaffold | package.json (pnpm), Next 14 + TS + Tailwind v3, globals.css with semantic classes, `_app.tsx` |
| 3 | schemas | `lib/validations.ts` (demographics / files / consent / full profile / upload request), `types/patient.ts` |
| 4 | ui kit | `components/ui/*` shadcn-convention primitives: button, input, label, textarea, checkbox, card, dialog, alert |
| 5 | api | `supabase/schema.sql`, `lib/supabase.ts`, `lib/graphql/{typeDefs,resolvers}.ts`, `pages/api/graphql.ts`, `lib/apollo.ts` |
| 6 | upload | `pages/api/upload.ts` (`handleUpload`, image-only, ≤10MB, namespaced paths) |
| 7 | intake | `pages/index.tsx` + `components/intake/*` (Stepper, DemographicsStep, DocumentsStep, ConfirmationStep, FileField) + submit orchestration (upload → upload → mutation) |
| 8 | admin | `pages/admin.tsx` (SSR via SchemaLink) + `components/admin/*` (grid, preview dialog cell) |
| 9 | env/readme | `.env` (committed per assignment), README with one-click run steps |
| 10 | TRD | TRD.md — pharmacy-delivery production hardening (written after code, per instructions) |

## Architecture in one paragraph

The intake page owns a single RHF `useForm` validated by one Zod schema; steps gate with `trigger()`. Submit uploads both images directly from the browser to Vercel Blob (tokens minted by `/api/upload`; bypasses the 4.5MB serverless body cap), then calls the `createPatientProfile` Apollo mutation with form data + blob URLs. The resolver re-validates with the same Zod schema and performs one atomic insert into Supabase `patient_profiles` (NOT NULL + `CHECK (consent)` make partial rows impossible). `/admin` runs the `getPatientProfiles` query in-process during SSR via SchemaLink and renders Ag-Grid (sort/filter/resize/paginate, 10/page) with click-to-preview dialogs for both documents.

## Manual steps for the repo owner

1. Create a Supabase project → run `supabase/schema.sql` in the SQL editor → paste URL + service-role key into `.env`.
2. Create a Vercel Blob store → paste `BLOB_READ_WRITE_TOKEN` into `.env`.
3. Push to a private GitHub repo, share with github.com/jackluo.
4. Vercel: import repo, paste the same three env vars, deploy.
5. Record screenshots/video of `/` happy path + `/admin`, send links.
