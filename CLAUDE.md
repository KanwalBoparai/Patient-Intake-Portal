# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Process rules (read first)

1. **Log every decision.** Any product or technical decision made in any session — library choice, UX pattern, schema change, naming, trade-off — must be appended to [decision-log.md](decision-log.md) with the options considered and the reason. This is a standing user requirement.
2. **The assignment is the contract.** [ASSIGNMENT.md](ASSIGNMENT.md) (the original take-home text) overrides [PRD-FSD.md](PRD-FSD.md) wherever they differ. Key overrides already identified: GraphQL not REST for profile read/write, Supabase/Postgres, Tailwind + shadcn/ui, pnpm.
3. **Negative-point features — never build these:** unit/e2e tests, any authentication flow, devops beyond a plain Vercel deploy. The grader explicitly deducts for them.
4. **Parsimony is graded.** Keep components small and composable; no sprawling generated code. Inline Tailwind on `/` and `/admin` pages is limited to padding/margin/flex/grid — typography/colors/sizes/animations belong in semantic classes (globals.css) or `components/ui/*`.

## Commands

System node is too old — use Node 22 via nvm. pnpm is the required package manager:

```bash
export PATH="$HOME/.nvm/versions/node/v22.14.0/bin:$PATH"
pnpm install        # install deps
pnpm dev            # dev server on :3000
pnpm build          # production build (use to verify before committing)
pnpm lint           # next lint
```

Database: no migration tool — run [supabase/schema.sql](supabase/schema.sql) once in the Supabase SQL editor. Env vars live in `.env` (committed intentionally per assignment): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BLOB_READ_WRITE_TOKEN`.

## Architecture

Stack: Next.js 14 Pages Router · TypeScript · Tailwind v3 + hand-rolled shadcn-convention components · Apollo Server 4 (`pages/api/graphql.ts` via `@as-integrations/next`) + Apollo Client · Supabase (`@supabase/supabase-js`, service-role key, server-only) · Vercel Blob client uploads · Ag-Grid v33 community.

Two flows:

- **Intake (`pages/index.tsx`)** — one `useForm` + one Zod schema across a 3-step card flow (Demographics → Documents → Confirmation/consent); step advance uses `trigger()` on that step's fields. On submit: upload insurance card then photo ID via `@vercel/blob/client` `upload()` (token minted by `pages/api/upload.ts` `handleUpload`), then — only after both URLs exist — Apollo `createPatientProfile` mutation. The split is contractual: files on REST, everything else on GraphQL.
- **Admin (`pages/admin.tsx`)** — `getServerSideProps` runs the real `getPatientProfiles` GraphQL query in-process via Apollo `SchemaLink` (no HTTP self-call), rows into Ag-Grid (sortable/filterable/resizable, pagination 10), document columns open a Dialog rendering the blob image.

Shared layers: `lib/validations.ts` (Zod schemas used by both the form resolver and the GraphQL mutation resolver — single source of truth), `lib/graphql/` (typeDefs + resolvers), `lib/supabase.ts` (server-only client). DB mapping: snake_case columns ↔ camelCase GraphQL fields, mapped in resolvers; DOB is a `YYYY-MM-DD` string end-to-end; email lowercased server-side.

**The core invariant:** a patient profile row can only exist with both blob URLs, all demographics, and `consent = true`. Enforced three times: client orchestration order, Zod re-validation in the resolver, and DB `NOT NULL` + `CHECK (consent)` constraints.
