# Anonymous Corrections and Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the public report and track corrections without accounts, while authenticated moderators review them in a separate admin area.

**Architecture:** Supabase stores corrections, receipt hashes, and moderator-only audit events. Public Edge Functions accept reports and receipt-code actions; a private admin route uses Supabase Auth and moderator-only database policies. This plan depends on the place schema and public reads from `2026-10-27-muntara-public-directory-map.md`.

**Tech Stack:** React 19, TypeScript, Supabase Auth, Postgres, Supabase Edge Functions with Deno, `@supabase/supabase-js` 2.118.0, `@supabase/server` 1.9.2.

**Spec:** `docs/superpowers/specs/2026-10-27-muntinlupa-public-services-pilot-design.md`

## Global Constraints

- Public browsing and correction submission require no account.
- Supabase Auth is for administrators and moderators only; public sign-up stays disabled.
- Full moderation audit history is visible only to moderators. Each contributor can see their own correction status and user-facing decision notes. The public sees no audit history.
- Store only a hash of each receipt code. Never collect contributor accounts or email addresses.
- A community correction does not become an official-source or field-checked fact because a moderator accepts it.
- Explicitly grant only required database client operations; enable RLS and keep privileged keys out of browser code.
- Corrections never directly modify public place data from an anonymous request.

## Review Focus

- A random, invalid, or mistyped receipt code reveals no correction or whether another report exists.
- A valid receipt code exposes only its own report and submitter-facing notes.
- Anonymous requests cannot read or write correction tables directly or reach moderator operations.
- Replaying an action or submitting an invalid status transition does not corrupt status or duplicate audit events.
- Moderator-only notes, identities, and audit history never appear in public or receipt responses.

---

## File Map

- `supabase/migrations/`: correction, receipt, audit, and rate-limit tables with RLS and grants.
- `supabase/functions/`: public receipt endpoints and authenticated moderator actions.
- `supabase/functions/tests/`: Deno tests for receipt privacy and transition rules.
- `supabase/tests/corrections_rls.test.sql`: direct database access assertions.
- `src/lib/correctionApi.ts`: typed browser calls for public and admin workflows.
- `src/components/auth/RequireModerator.tsx`: client-side route guard backed by server-side role checks.
- `src/components/layout/AdminShell.tsx`: separate moderator layout.
- `src/pages/SubmitCorrectionPage.tsx`, `TrackCorrectionPage.tsx`, and `ModerationPage.tsx`: anonymous reporting, receipt lookup, and admin queue.
- `src/App.tsx`, `AppShell.tsx`, `TopBar.tsx`, and `BottomNav.tsx`: public routes plus unlinked, protected admin routes.

### Task 1: Add correction storage and database access rules

**Files:**
- Create: `supabase/migrations/<generated>_corrections_and_audit.sql`
- Create: `supabase/tests/corrections_rls.test.sql`
- Modify: `src/types/index.ts`

**Interfaces:**
- Keep the existing statuses and allowed transitions: `pending` → `in_review` → `accepted | rejected | needs_more_info`; `accepted | rejected` → `in_review`; `pending` → `withdrawn`; `needs_more_info` → `in_review` on reply.
- Add `ModerationEvent { id: string; correctionId: string; actorRole: 'moderator' | 'submitter' | 'system'; actorUserId: string | null; action: string; publicNote: string | null; internalNote: string | null; createdAt: string }`.
- Add `CorrectionReceiptMessage { body: string; author: 'you' | 'moderator'; createdAt: string }` and `CorrectionReceipt { placeName: string; field: CorrectionFieldTarget; proposedChange: string; status: CorrectionStatus; submittedAt: string; thread: CorrectionReceiptMessage[]; canReply: boolean; canWithdraw: boolean }`.
- Create tables `corrections`, `correction_receipts`, `correction_events`, and `correction_rate_limits`. Keep receipt hashes and rate-limit hashes inaccessible to browser roles.

- [ ] **Step 1: Create the correction migration with the CLI**

Run `supabase migration --help`, then create a migration with the CLI. Add the correction fields already represented by `Correction`, a unique SHA-256 receipt hash linked to each correction, append-only moderation events, and expiring request counters keyed by a server-side HMAC of the client IP.

- [ ] **Step 2: Lock down table grants and RLS**

Enable RLS on every table. Revoke anonymous and ordinary authenticated access to correction, receipt, and rate-limit tables. Give only moderator-role users read access to the queue and full events. Permit mutations through the specified server functions only. Store moderator authorization in trusted `app_metadata`; never use user-editable profile metadata.

- [ ] **Step 3: Implement transitions as a server-authoritative contract**

Retain the existing transition table values in `src/types/index.ts` and `availableDecisions` logic, but make the server reject any transition not allowed by the table above. Acceptance may update a place field only through moderator action and must preserve its source/field-check state unless the moderator records the matching evidence.

- [ ] **Step 4: Add database access assertions**

In `supabase/tests/corrections_rls.test.sql`, assert anonymous and ordinary authenticated roles cannot read, insert, update, or delete correction, receipt, or event rows; a moderator can read the queue and full audit; a non-moderator cannot.

- [ ] **Step 5: Run local database checks**

Run: `supabase start` then `supabase test db`  
Expected: all allow and deny assertions pass.

### Task 2: Implement anonymous receipt endpoints

**Files:**
- Create: `supabase/functions/deno.json`
- Create: `supabase/functions/submit-correction/index.ts`
- Create: `supabase/functions/correction-receipt/index.ts`
- Create: `supabase/functions/correction-action/index.ts`
- Create: `supabase/functions/_shared/receipt.ts`
- Create: `supabase/functions/_shared/validation.ts`
- Create: `supabase/functions/tests/receipt_test.ts`
- Modify: `supabase/config.toml`

**Interfaces:**
- `submit-correction` accepts `{ placeId, field, proposedChange, newValue, submitterNote }` and returns `{ receiptCode }` only.
- `correction-receipt` accepts `{ receiptCode }` and returns `CorrectionReceipt`; invalid and unknown codes receive the same generic error.
- `correction-action` accepts `{ receiptCode, action: 'reply' | 'withdraw', note?: string }` and applies only actions allowed for that correction’s current state.
- Generate 32 random bytes with Web Crypto, encode them as base64url, hash with SHA-256 before storage, and return the raw code only once. Never put it in a URL, database log, or application log.

- [ ] **Step 1: Write receipt and access tests**

Use Deno’s test runner. Cover code creation/hash mismatch, valid lookup, invalid-code response, response-field allowlist, `needs_more_info` reply, pending-only withdrawal, and invalid transitions.

- [ ] **Step 2: Run tests and confirm the expected failures**

Run: `deno test supabase/functions/tests/receipt_test.ts`  
Expected: FAIL because the receipt helpers and handlers do not exist.

- [ ] **Step 3: Pin the Edge Function helper and configure public endpoints**

Pin the import to `npm:@supabase/server@1.9.2` in `deno.json`. Configure only the three public receipt endpoints to accept publishable-key callers without a user JWT; keep moderator endpoints on user-JWT verification. Put the secret key in Supabase project secrets only.

- [ ] **Step 4: Implement request validation and submission**

Validate place ID, supported field, and non-empty bounded text before writing. Do not accept `status`, `submittedBy`, moderator fields, or place verification from the client. Add a hidden honeypot and rate limits of 5 submissions per IP per hour and 30 receipt lookups per IP per minute. HMAC the trusted gateway IP before storing counters; expire counters after 24 hours and never store raw IP addresses.

- [ ] **Step 5: Implement receipt lookup and submitter actions**

Hash the presented code and query only its linked correction. Return only the receipt interface above, never the full correction row or moderator event history. Validate `reply` and `withdraw` against the current status in the same database transaction as their event insert.

- [ ] **Step 6: Run Edge Function tests and local requests**

Run: `deno test supabase/functions/tests/receipt_test.ts`, then serve the functions locally and exercise valid and invalid receipt calls.  
Expected: all tests pass; valid code returns one report, invalid code reveals no report, and replayed or invalid actions leave state unchanged.

### Task 3: Add invite-only moderator sign-in and route protection

**Files:**
- Create: `src/components/auth/RequireModerator.tsx`
- Create: `src/components/layout/AdminShell.tsx`
- Create: `src/pages/AdminLoginPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/AppShell.tsx`
- Modify: `src/lib/supabaseClient.ts`

**Interfaces:**
- `RequireModerator({ children }: { children: ReactNode })` renders children only when a valid Supabase session has trusted moderator role metadata; otherwise it redirects to `/admin/login`.
- `AdminShell({ children }: { children: ReactNode })` renders the separate admin navigation and sign-out action.

- [ ] **Step 1: Configure invitation-only administrator accounts**

Disable public account creation in Supabase Auth. Use email magic-link sign-in for moderators invited by the project owner. Assign moderator role through a trusted admin operation; never expose role assignment in the app.

- [ ] **Step 2: Implement route and server guards**

Use `supabase.auth.getClaims()` to load the current session and render a loading state while checking. Protect `/admin/corrections` in the client, and enforce the same moderator claim in each server-side moderation operation. The hidden route itself is not an access control.

- [ ] **Step 3: Add the separate admin shell and routes**

Add `/admin/login` and protected `/admin/corrections` routes. Do not add sign-in, moderation, or account creation to the public navigation. Add sign-out and an access-denied state.

- [ ] **Step 4: Verify role boundaries**

Sign in with an invited moderator and an ordinary non-moderator. Confirm the moderator reaches the queue, the non-moderator is denied by both client and server, and a signed-out visitor can still browse and submit corrections.

### Task 4: Replace the mock submitter tracker with a private receipt flow

**Files:**
- Create: `src/lib/correctionApi.ts`
- Create: `src/pages/TrackCorrectionPage.tsx`
- Modify: `src/pages/SubmitCorrectionPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/types/index.ts`
- Modify: `src/components/corrections/CorrectionStatusBadge.tsx`

**Interfaces:**
- `submitCorrection(input: SubmitCorrectionInput): Promise<{ receiptCode: string }>`
- `fetchCorrectionReceipt(receiptCode: string): Promise<CorrectionReceipt>`
- `replyToCorrection(receiptCode: string, note: string): Promise<void>`
- `withdrawCorrection(receiptCode: string): Promise<void>`

- [ ] **Step 1: Add typed browser API calls**

Invoke the Edge Functions through `supabase.functions.invoke`; send receipt codes only in HTTPS request bodies. Convert server failures to safe user-facing messages without displaying raw token, SQL, or function errors.

- [ ] **Step 2: Remove mock session and abuse signals from submission UI**

Remove `submittedBy`, `sessionSubmissionCount`, mock trust scoring, and the prototype warning. Add a concise note asking users not to include private or medical details. Keep server-side validation authoritative.

- [ ] **Step 3: Show and preserve the receipt code once**

After successful submission, show the receipt code with a copy button and a clear save-it warning. Do not save the code to a URL, analytics, local storage, or logs. Link to `/corrections/track` for later manual entry.

- [ ] **Step 4: Build private status lookup and reply**

Replace the seeded public tracker with a code-entry form. Render only the returned `CorrectionReceipt`, its user-facing message thread, and actions allowed by `canReply`/`canWithdraw`. Use the generic error for invalid or unknown codes.

- [ ] **Step 5: Verify receipt privacy and no-sign-up flow**

Submit a report in a clean browser session without signing in, copy the code, reload, and retrieve only that report. Check that a wrong code shows the generic error and that no contributor email, account, other report, or internal moderator note appears.

### Task 5: Connect the moderator queue to durable review and audit

**Files:**
- Create: `supabase/functions/moderate-correction/index.ts`
- Create: `supabase/functions/tests/moderation_test.ts`
- Modify: `src/lib/correctionApi.ts`
- Modify: `src/pages/ModerationPage.tsx`
- Modify: `src/components/corrections/CorrectionActions.tsx`
- Modify: `src/components/corrections/TrustSignalMeter.tsx` or remove it if no real signal replaces it
- Modify: `supabase/migrations/<generated>_correction_moderation.sql`

**Interfaces:**
- `fetchModerationQueue(filter: CorrectionStatus | 'all'): Promise<Correction[]>`
- `moderateCorrection(id: string, decision: ModerationDecision, input: ModerationInput): Promise<Correction>`
- `fetchCorrectionEvents(id: string): Promise<ModerationEvent[]>`
- `moderate-correction` accepts a user JWT and validates a moderator claim before changing state.

- [ ] **Step 1: Write moderation transition and audit tests**

Cover all allowed transitions, reject without reason, request-info without a note, accepted community reports that remain unverified, and moderator-only full event visibility.

- [ ] **Step 2: Implement moderator endpoint and event history**

Use the current `FLOW_RULES` transitions as the single policy. Perform status change, place update, evidence-state change, and audit insert atomically. Record actor, action, timestamp, private note, and submitter-facing note separately. Use a `SECURITY INVOKER` database routine or caller-scoped client; do not bypass RLS with a `SECURITY DEFINER` workaround.

- [ ] **Step 3: Connect the queue and actions**

Replace `fetchCorrections` and `moderateCorrection` mock calls in the admin page. Keep UI actions derived from allowed transitions, show durable loading and error states, and display full audit events only inside the protected admin area.

- [ ] **Step 4: Run moderation tests and local workflow checks**

Run: `deno test supabase/functions/tests/moderation_test.ts` and `supabase test db`.  
Expected: valid moderator transitions and audit visibility pass; invalid transitions and non-moderator access fail.

### Task 6: Verify the complete pilot flows

**Files:**
- Modify: `README.md`
- Review: public and admin routes, Supabase policies, and function logs

- [ ] **Step 1: Run project checks**

Run: `npm run build` and `npm run lint`.  
Expected: both pass.

- [ ] **Step 2: Walk the public correction flow**

Browse without an account, submit a correction, save its receipt, reload, retrieve it, reply to a request for information, and withdraw a still-pending item.

- [ ] **Step 3: Walk the moderator flow**

Sign in as an invited moderator, review the item, request information, receive the submitter reply, accept or reject with required input, and confirm the public state changes only under the design’s provenance rules.

- [ ] **Step 4: Check privacy boundaries**

Confirm anonymous clients cannot query correction tables, one receipt cannot access another report, full audit is moderator-only, the public app exposes no account creation, and no secret or receipt code appears in browser or function logs.

## References

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Securing Edge Functions](https://supabase.com/docs/guides/functions/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Deno function tests](https://supabase.com/docs/guides/functions/unit-test)
- [Public directory and map plan](2026-10-27-muntara-public-directory-map.md)
- [Design document](../specs/2026-10-27-muntinlupa-public-services-pilot-design.md)
