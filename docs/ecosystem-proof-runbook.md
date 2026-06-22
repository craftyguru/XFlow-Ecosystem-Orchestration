# Ecosystem Proof Runbook

The ecosystem proof harness is a non-mutating gate for the XFlow, Verixet, and satellite account, billing, entitlement, usage, portal, and identity contracts.

For release and promotion gates, use `docs/release-proof-checklist.md`.

## Local Static Proof

Run:

```bash
npm run test:proof-scanner
npm run proof:ecosystem:static
```

Reports are written to:

- `output/phase17-ecosystem-proof-report.json`
- `output/phase17-ecosystem-proof-report.md`

Static proof checks source and contract files only. It does not call Stripe, create subscriptions, call webhook routes, create usage, or require HTTP base URLs.

## Result Meaning

- `pass`: the proof found the expected contract, source guard, or test coverage.
- `warn`: optional proof context is absent, usually HTTP smoke configuration.
- `fail`: a blocker that should stop promotion until fixed.

Static CI should fail on `fail` only. Optional HTTP smoke is protected and intentionally separate from normal pull request checks.

## Protected HTTP Smoke

HTTP smoke is manual-only in `.github/workflows/ecosystem-proof.yml`.

Required workflow inputs:

- `run_http_smoke=true`
- `environment=staging` or `environment=review`

Required GitHub environment variables:

- `XFLOW_PROOF_BASE_URL`
- `VERIXET_PROOF_BASE_URL`
- `RATAIFY_PROOF_BASE_URL`
- `AUDAIX_PROOF_BASE_URL`
- `WORDGENI_PROOF_BASE_URL`
- `CREVUX_PROOF_BASE_URL`
- `VERIXET_PROOF_WORKSPACE_ID`

Required GitHub secret:

- `VERIXET_ECOSYSTEM_STATUS_SERVICE_TOKEN`

See `docs/ecosystem-proof-env.example.md` for the full variable table and local command shapes.

HTTP smoke is refused for `environment=production`. In CI, localhost URLs are refused. Production domains are refused unless `ECOSYSTEM_PROOF_ALLOW_PRODUCTION_HTTP=true` is explicitly set, and the proof harness still does not call mutation endpoints.

Before adding values to the GitHub `staging` environment, confirm each proof URL points to a staging or review deployment and not production customer data. Do not use placeholders, local tunnels, localhost, or production domains for the first protected proof run.

To validate HTTP proof configuration without making network calls:

```bash
node scripts/phase17-ecosystem-proof.mjs --mode=http --validate-env-only
```

## Manual Workflow Dispatch

1. Open GitHub Actions.
2. Select `Ecosystem Proof`.
3. Click `Run workflow`.
4. Choose `run_http_smoke=true`.
5. Choose `environment=staging`.
6. Wait for the `Protected HTTP smoke` job.
7. Download and inspect:
   - `phase17-ecosystem-proof-report.json`
   - `phase17-ecosystem-proof-report.md`

Expected configuration failures include missing URL variables, localhost URLs in CI, production URLs without explicit approval, missing service token, missing workspace fixture, service endpoint `401`/`403`, contract version mismatch, or raw Stripe/secret leakage in a report.

After the first successful staging run, record the run URL or run ID in `docs/release-proof-checklist.md` under `Latest Protected Staging HTTP Proof`.

## Mutation Guardrails

The proof harness only performs static checks by default. HTTP mode is restricted to public GET checks and non-mutating service status checks. It does not call Stripe mutation APIs, checkout execution, subscription updates, webhook routes, or customer-changing endpoints.

Secrets are not printed. Generated reports are passed through the leakage scanner before being written.

## Known Unrelated Noise

Current unrelated issues may still appear in broader app verification:

- Verixet vendor `no-empty-object-type` lint errors.
- Existing unused `RatAiFyWordmarkText` warnings.
- Existing XFlow Turnstile hook dependency warning.
- Stale `.next/types` or Windows EPERM/esbuild file locking on local machines.

## When Proof Fails

Open the Markdown report first for the section summary, then inspect the JSON report for exact files and routes checked. Fix real blockers rather than suppressing them. Do not add fake usage, fake billing data, fake portal URLs, or local numeric workspace IDs to satisfy the proof.
