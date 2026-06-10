# TRD — taking this intake form to a real pharmacy delivery flow

Context: existing 3-step form feeds a pharmacy delivery pipeline. Goals: maximize fill rate, minimize edge cases hitting admin staff. Auth/devops assumed handled. Not polishing the admin page.

## Biggest real-world gaps in the current form (fix first)

- **HEIC/HEIF**: iPhones shoot HEIC by default — current accept list (png/jpeg/webp) silently rejects the most common patient device. Accept HEIC and transcode server-side/edge, or convert client-side (heic2any). This alone is probably the #1 drop-off bug in the wild.
- **Photo size**: modern phone photos are 4–12 MB. Don't make users fight a 10 MB cap — compress client-side before upload (canvas/createImageBitmap downscale to ~2000px, quality 0.8). Faster uploads on cellular = fewer abandons mid-upload.
- **No resume**: any refresh loses everything. Persist draft to localStorage on every field change + restore banner ("Pick up where you left off"). For cross-device: draft row in DB keyed by emailed/SMS'd magic link — people start on desktop, finish on the phone that has the camera.
- **Upload retry**: one failed PUT kills the whole submit and re-uploads both files. Keep successful blob URLs in state, retry only the failed file, exponential backoff, per-file progress bars.

## Fill-rate optimizations (patient side)

- Mobile-first pass: file inputs get `capture="environment"` ("Take a photo of your card"), single-column layout, sticky Next button, inputmode attributes on phone/dob.
- Address: Google Places autocomplete writing into structured fields (street/unit/city/state/zip) + explicit apartment/unit field (delivery!). Validate deliverability (USPS/Lob) at submit, not at admin triage. Block PO boxes if the pharmacy can't ship there.
- Phone: keep as-you-type mask, add SMS verification (OTP) — a wrong phone number is fatal for a delivery flow; verified phone also powers delivery notifications.
- Step-level autosave + funnel analytics (step_viewed / step_completed / field_error events) so we know *where* people drop, not just that they do.
- Trust copy at the documents step: why we need ID, lock icon, "encrypted, only seen by pharmacy staff". ID uploads are where privacy anxiety kills conversion.
- Field-count discipline: every optional field earns its place or goes. DOB via 3 segmented inputs (MM/DD/YYYY) — native date pickers are miserable for birth years on mobile.
- Inline "looks wrong" hints instead of hard blocks where possible (e.g. email typo suggestion: gmial→gmail via mailcheck-style lib).
- Accessibility + Spanish localization — pharmacy demographics make this a conversion feature, not compliance checkbox.
- Confirmation: send email/SMS receipt with a reference number; people resubmit when they get no acknowledgment → duplicate records for staff.

## Reduce admin edge cases (data quality at the door)

- Insurance card OCR (Textract/GPT-4V-class) on upload: extract payer, member ID, group, BIN/PCN; show extracted fields to the patient to confirm. Staff stop hand-transcribing blurry cards — biggest admin time sink.
- Image quality gate at selection: blur/glare/too-dark detection client-side, prompt instant retake while the card is still in hand. Bad photos are the #1 back-and-forth generator.
- Server-side normalization: phone → E.164, email lowercase (done), names trimmed/cased, address → structured + geocoded.
- Dedupe: unique-ish constraint on (email, dob) with soft-match review queue (same person, typo'd email) instead of silent duplicate rows.
- Insurance eligibility pre-check (e.g. pVerify/Change Healthcare) async after submit; flag failures into a "needs attention" status instead of staff discovering at fill time.
- Status field on profiles (new / verified / needs-info / processed) + immutable audit trail — staff workflow needs state, not a flat table.
- "Needs info" loop: templated SMS/email asking patient to re-upload a specific document via tokenized link, instead of phone tag.

## Architecture/security to make it real

- Blobs are PHI: switch to private blob access, short-lived signed read URLs minted per admin view; audit log of who viewed what.
- Orphan cleanup: cron deleting blobs not referenced by a profile after 24h (abandoned submissions currently leak files forever).
- Use `onUploadCompleted` webhook (works on deployed env) to reconcile uploads vs. profiles; alert on uploads that never became a profile (signals drop-off after upload step or a bug).
- Abuse: rate-limit /api/upload + mutation per IP, turnstile/captcha only if abuse observed (captcha costs conversion), max uploads per session.
- Virus/malware scan on uploaded files before staff open them.
- Observability: Sentry on both pages + resolvers, alert on mutation error rate spike (a Zod/regression bug here = silent revenue loss).
- Idempotency key on createPatientProfile (client-generated UUID) so retries can't double-insert.
