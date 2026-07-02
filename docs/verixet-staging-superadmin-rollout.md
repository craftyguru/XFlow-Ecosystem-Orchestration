# Verixet Staging Superadmin Rollout Checklist

Date: 2026-07-01

Purpose: safely roll out the read-only Superadmin admission-event source, persisted scoped permission assignments, and authenticated E2E fixtures in a non-production environment. This checklist does not enable any new Superadmin action. `activation.recheck` remains the only enabled action.

## Stop First

Stop immediately if any of these are true:

- The target database cannot be confirmed as local, staging, disposable, test, QA, or dev.
- The target is production or production-like.
- A command would print raw API keys, bearer tokens, cookies, secrets, authorization headers, provider credentials, webhook payload bodies, raw request bodies, raw response bodies, private customer content, stack traces, or full provider identifiers.
- Required authenticated E2E keys are missing.
- Migration checks fail.
- Activation recheck grants or implies entitlement/access.
- Any disabled Superadmin action becomes enabled unexpectedly.

## 1. Environment Classification

Required operator checks:

- Confirm target environment is non-production.
- Confirm database URL points to staging, local, disposable, test, QA, or dev.
- Confirm no production migration is being run.
- Confirm terminal capture and evidence files omit secret values.
- Confirm `NODE_ENV`, `VERCEL_ENV`, `RAILWAY_ENVIRONMENT_NAME`, and `VERIXET_ENVIRONMENT` are not production/live.

Presence-only preflight:

```powershell
npm --prefix apps/Verixet run preflight:superadmin-staging
```

This command prints presence/category only and omits raw values.

## 2. Required DB Migrations

Migrations:

- `apps/Verixet/drizzle/0077_admission_decision_events.sql`
- `apps/Verixet/drizzle/0078_superadmin_permission_assignments.sql`

Apply only after environment classification passes:

```powershell
$env:VERIXET_LOCAL_NAV_QA_DATABASE='1' # local/disposable only
$env:DIRECT_DATABASE_URL='<non-production-postgres-url>'
npm --prefix apps/Verixet run db:migrate
```

For migration `0077_admission_decision_events`, verify:

- `admission_decision_events` table exists.
- Expected columns exist.
- Expected indexes exist.
- Constraints exist where applicable.
- Write/read proof passes through admission resolver/event repository.
- No destructive migration behavior occurred.
- Restore plan exists before applying to staging.

For migration `0078_superadmin_permission_assignments`, verify:

- `superadmin_permission_assignments` table exists.
- Expected columns exist: `id`, `user_id`, `permission`, `scope_type`, `scope_id`, `granted_by`, `granted_at`, `revoked_at`, `reason_code`, `created_at`, `updated_at`.
- Expected indexes exist.
- Permission, scope, and reason constraints exist.
- Active assignment insert/read proof passes.
- Revoked assignment insert/read proof passes.
- No credential, session, token, auth-header, API-key, request-body, response-body, provider-credential, or stack-trace columns exist.
- Restore plan exists before applying to staging.

Known local proof commands:

```powershell
# Requires a confirmed disposable/local/staging DB URL in DATABASE_URL or VERIXET_DATABASE_URL.
npm --prefix apps/Verixet exec tsx scripts/proof-phase3e-admission-events.ts

# Requires a confirmed disposable/local/staging DB URL in DATABASE_URL, DIRECT_DATABASE_URL, or VERIXET_DATABASE_URL.
cd apps/Verixet
npm exec tsx scripts/proof-phase4e-permission-assignments.ts
```

## 3. Required Authenticated Fixture Variables

Check presence only, never values:

- `E2E_API_KEY`
- `E2E_ADMIN_API_KEY`
- `E2E_PLATFORM_SUPER_ADMIN_API_KEY`
- `E2E_BASE_URL`
- one of `DATABASE_URL`, `DIRECT_DATABASE_URL`, or `VERIXET_DATABASE_URL`

If fixtures must be generated for a disposable non-production database and the operator can safely capture generated secrets:

```powershell
$env:E2E_BOOTSTRAP='1'
$env:DATABASE_URL='<non-production-postgres-url>'
npm --prefix apps/Verixet run bootstrap:e2e-env
```

The bootstrap command prints generated keys. Run it only in an operator-controlled secret setup step, store values in the non-production secret manager, and do not paste raw values into audit docs, screenshots, chat, or evidence files.

For local-only disposable testing, prefer the non-printing wrapper:

```powershell
$env:E2E_BOOTSTRAP='1'
$env:VERIXET_LOCAL_NAV_QA_DATABASE='1'
$env:DATABASE_URL='<local-disposable-postgres-url>'
npm --prefix apps/Verixet run bootstrap:e2e-local-env
npm --prefix apps/Verixet run preflight:superadmin-staging
```

`bootstrap:e2e-local-env` writes `apps/Verixet/.env.e2e.local`, which is ignored by Git. It prints presence/status only, not API key values. It seeds normal/admin/platform dashboard keys, a platform superadmin user, scoped activation recheck assignment fixtures, activation binding fixture data, and Phase 2E admission-case rows.

## 4. Required Seeded Cases for Phase 2E

Seed these non-production cases:

- Paid active entitlement admits access.
- Missing entitlement denies access.
- Free/baseline plan denies paid ecosystem access.
- Past-due billing denies access.
- Canceled billing denies access.
- Unpaid billing denies access.
- Workspace/app policy mismatch denies access.

For each case, capture safe seed row identifiers, authenticated API response, UI/browser evidence, audit event evidence where available, admission decision event evidence, safe denial reason, and redaction proof.

## 5. Required Seeded Cases for Phase 4F

Seed these non-production cases:

- Platform superadmin can run activation recheck.
- Non-superadmin with active `verixet.activation.recheck` assignment can run activation recheck.
- Non-superadmin with revoked assignment is denied.
- Non-superadmin with wrong permission is denied.
- Missing reason category is denied.
- Production disable switch blocks even when permission passes.
- Activation recheck does not grant entitlement/access.
- Activation recheck does not expose raw provider/request/response bodies.

For each case, capture safe seed row identifiers, authenticated API response, permission decision result, audit event evidence, dashboard/UI state or browser screenshot where available, safe denial reason, and redaction proof.

## 6. Evidence Capture

For every Phase 2E and Phase 4F case, capture:

- Safe seed row identifiers.
- Authenticated API response with raw credentials omitted.
- UI screenshot or rendered browser evidence.
- Audit event evidence.
- Admission decision event evidence.
- Scoped permission decision evidence where applicable.
- Safe denial reason.
- Redaction proof.

Evidence must not contain:

- raw API keys
- bearer tokens
- secrets
- cookies
- authorization headers
- webhook payload bodies
- provider credentials
- raw request bodies
- raw response bodies
- stack traces
- private customer content
- full provider identifiers

## 7. Commands to Run

Preflight:

```powershell
npm --prefix apps/Verixet run preflight:superadmin-staging
```

Migration apply/check:

```powershell
$env:DIRECT_DATABASE_URL='<non-production-postgres-url>'
npm --prefix apps/Verixet run db:migrate
```

Phase 2E proof:

```powershell
# Run only after non-production authenticated fixtures are loaded.
npm --prefix apps/Verixet run test:e2e:dashboard
npm --prefix apps/Verixet run proof:phase2e4f:local
```

Phase 4F proof:

```powershell
# Run only after non-production authenticated fixtures and scoped assignment rows are loaded.
npm --prefix apps/Verixet run test:e2e:dashboard
npm --prefix apps/Verixet run proof:phase2e4f:local
```

Local proof note:

- The combined local harness `proof:phase2e4f:local` writes sanitized evidence to `apps/Verixet/output/phase2e4f-local/`.
- It is intended for loopback/local non-production fixture proof only. For staging, use the same required cases and evidence shape, but confirm the DB and base URL are non-production before running.
- The proof JSON must pass the sensitive-field grep before evidence is shared. Dev-server logs may contain safe field names and route names that match broad grep terms; treat the sanitized proof JSON as the shareable evidence artifact.
- For local dashboard E2E reliability, `npm --prefix apps/Verixet run test:e2e:dashboard` runs the authenticated Desktop Chrome dashboard auth/audit specs serially and clears `auth_rate_buckets` only when the DB URL is confirmed local/disposable/non-production. Use `E2E_SKIP_WEBSERVER=1` with `next dev` on an alternate loopback port when port `3000` is occupied.

Standard validation:

```powershell
npm --prefix apps/Verixet run audit:dashboard
npm --prefix apps/Verixet run typecheck
npm --prefix apps/Verixet run lint
npm --prefix apps/Verixet run test:e2e:dashboard
npm run proof:billing-contracts
```

Grep generated evidence:

```powershell
rg -n -i "Authorization|Bearer|token|cookie|apiKey|secret|password|request_body|response_body|provider response|stack trace|force grant|bypass billing|access granted|production-ready" apps/Verixet/output
```

Any match in generated evidence must be reviewed. Raw secret, raw credential, raw body, stack trace, fake access, fake readiness, or bypass wording blocks rollout.

## 8. Rollout Exit Criteria

Rollout is ready only when:

- Migrations 0077 and 0078 are applied to the confirmed non-production database.
- Table, column, index, and constraint checks pass.
- Phase 2E seeded admission cases pass with authenticated API/UI evidence.
- Phase 4F activation recheck cases pass with authenticated API/UI evidence.
- Evidence grep passes with no leaked sensitive values and no fake access/readiness labels.
- `activation.recheck` remains the only enabled Superadmin action.
- All other Superadmin actions remain disabled.
- No permission grant/revoke UI exists.
- No billing, entitlement, API-key, webhook retry, tenant, provider credential, impersonation, deployment, or destructive mutation was added.
