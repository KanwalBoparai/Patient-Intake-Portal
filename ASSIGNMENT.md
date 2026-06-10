# Reimagine Health - Take home Assignment

Build a patient intake application in Next.js (using Pages Router) with a multi-step intake form and an operational admin dashboard.

Page **/index**

- A 3-step flow (do UI in whichever way feels most intuitive, it could be a 3 step quiz, a card that arrows to a second card to a third card, etc.) collecting patient information:

**Step 1 - Demographics**
- First name, last name, email, phone, date of birth, address

**Step 2 - Documents**
- File picker for insurance card upload (images only)
- File picker for photo ID upload (images only)

**Step 3 - Confirmation**
- Confirmation data resuming step 1
- User consent

Data validation with React-Hook-Form + Zod: required fields, valid e-mail, max 10 MB images.

**On form submission:**

1. Ping `/api/upload` on for each file to obtain Vercel Blob signed URLs. Send each file to its URL, obtain the final blob URLs on success. Trigger the onCompleted to insert to your database atomically

3. Call `createPatientProfile` mutation with the form data to upload the rest of the profile (so everything else done via GraphQL, except for the file upload and post-upload logic which is done on REST)

Page **/admin**

- Query `getPatientProfiles` on server side render.
- Display results in an Ag-Grid table; default columns should be sortable, filterable, resizable, and support pagination.
- Insurance and photo IDs should show photo previews when clicked, rendered from the stored blob URLs.

## Required tech stack

| Layer        |                                          |
| ------------ | ---------------------------------------- |
| Framework    | **Next.js (Pages Router)**               |
| Style + UI   | **Tailwind CSS + shadcn/ui** components  |
| Data         | **Supabase / Postgres**                  |
| API          | **GraphQL** (Apollo Server + Apollo Client) |
| File storage | **Vercel Blob** (PUT upload URLs)        |
| Misc         | TypeScript, React-Hook-Form + Zod for validation |

## Submission instructions

- Commit the code in a private repo with the .env committed (must run end to end with `pnpm && pnpm dev`).
- Share to https://github.com/jackluo, deploy on free Vercel Hobby, share link + screenshots/videos.
- Max 3 hours. Incremental commits showing chain of thought. First commit t=0, last commit t=3h.
- If time is tight: intake page + logic first, admin view next.
- UI clean and consistent across both pages; minimum inline Tailwind classes on /index and /admin (only padding/margin/flex/grid) — make classes for fonts/colors/sizes/animations. Composable and maintainable.

## Grading

- Systems thinking and edge-case discipline (validation, error states, maintainable API structure, clear resolvers, typing, atomicity on upload).
- UI/UX coherence and design velocity under pressure (shadcn + Tailwind, consistency, parsimonious output — no 1k-line AI garbage).
- Good taste (free parameters: e.g. address autocomplete, phone number input; canonical third-party libraries welcome).

## Explicitly do NOT build (negative points)

- Unit testing or end to end testing
- Any kind of authentication flow
- DevOps work beyond plain Vercel deploy

Extra time → make the patient flow as production-ready as possible (conversion-focused UI/UX).

## For product candidates

After code is submitted (sequentially, max 1 hour): write a TRD outlining what's needed to use this form in a real pharmacy delivery flow — optimize form fill rate, minimize admin edge cases. Bullet points fine; graded on product intuition. Do not focus on the admin page. Assume auth/devops handled. Commit to git.
