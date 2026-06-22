# Release Proof Checklist

Use this checklist before merging, staging promotion, and production promotion. Do not substitute fake usage, fake billing data, fake portal URLs, production secrets, or local-only workspace IDs for proof evidence.

## Required Before Merge

Run locally or confirm the static `Ecosystem Proof` CI job passed:

```bash
npm run test:proof-scanner
npm run proof:ecosystem:static
node -e "JSON.parse(require('fs').readFileSync('output/phase17-ecosystem-proof-report.json','utf8')); console.log('proof report ok')"
node -e "JSON.parse(require('fs').readFileSync('ecosystem-contracts/routes.json','utf8')); JSON.parse(require('fs').readFileSync('ecosystem-contracts/env-contract.json','utf8')); console.log('contracts ok')"
npm run public:brand-casing:audit
```

Review the generated reports:

- `output/phase17-ecosystem-proof-report.json`
- `output/phase17-ecosystem-proof-report.md`

The merge gate is blocked by any proof `fail`, any blocker, or any leakage finding.

## Required Before Staging Promotion

- GitHub static `Ecosystem Proof` job passed.
- Latest static proof artifact reviewed.
- JSON report has no blockers.
- Known unrelated warnings are documented and unchanged.
- No public localhost production links were introduced.
- No raw Stripe IDs, service tokens, or payment identifiers appear in frontend-safe/public proof output.

## Required Before Production Promotion

- One recent protected staging HTTP proof run completed.
- GitHub Actions workflow: `Ecosystem Proof`.
- Manual inputs:
  - `run_http_smoke=true`
  - `environment=staging`
- Uploaded JSON and Markdown artifacts reviewed.
- No blockers in the HTTP proof report.
- No secret or raw Stripe leakage in artifacts.
- No mutation endpoints were called.
- No production URLs were used for the staging proof.
- Verixet status contract, portal safety, usage ingest, and satellite writer checks remain green.

## Latest Protected Staging HTTP Proof

- [ ] Not completed yet.
- Run date: pending
- GitHub run ID / URL: pending
- Environment: `staging`
- Result: pending
- Artifact names:
  - `phase17-ecosystem-proof-report.json`
  - `phase17-ecosystem-proof-report.md`
- Notes: blocked until the GitHub `staging` environment has non-production proof URLs, `VERIXET_PROOF_WORKSPACE_ID`, and `VERIXET_ECOSYSTEM_STATUS_SERVICE_TOKEN` configured. Do not mark this complete from a local static run or from placeholder URLs.

## GitHub Manual HTTP Smoke

Reference:

- `docs/ecosystem-proof-env.example.md`
- `docs/ecosystem-proof-runbook.md`

Manual steps:

1. Open GitHub Actions.
2. Select `Ecosystem Proof`.
3. Click `Run workflow`.
4. Set `run_http_smoke=true`.
5. Set `environment=staging`.
6. Inspect uploaded artifacts:
   - `phase17-ecosystem-proof-report.json`
   - `phase17-ecosystem-proof-report.md`

## Report Interpretation

- `pass`: expected contract, source guard, route, or test evidence was found.
- `warning`: optional context is missing or a non-blocking condition was detected.
- `fail`: release blocker.
- `blocker`: normalized failure summary that must be resolved before promotion.
- skipped HTTP checks: expected in static mode or when optional HTTP proof envs are absent.
- static mode: source and contract proof only; no network calls.
- HTTP mode: protected non-mutating public/service checks with explicit staging configuration.

Inspect JSON when exact files/routes matter:

```bash
node -e "const r=JSON.parse(require('fs').readFileSync('output/phase17-ecosystem-proof-report.json','utf8')); console.log({pass:r.passCount,warnings:r.warningCount,failures:r.failCount,blockers:r.blockers})"
```

Inspect Markdown for a quick human summary:

```bash
cat output/phase17-ecosystem-proof-report.md
```

## Known Non-Blocking Noise

Only treat these as non-blocking if unchanged and unrelated to the release:

- Verixet vendor `no-empty-object-type` lint errors.
- Existing unused `RatAiFyWordmarkText` warnings.
- Existing XFlow Turnstile hook dependency warning.

## Hard Blockers

- Any proof harness blocker.
- Raw Stripe IDs in frontend-safe payloads.
- Service token leakage.
- Public localhost production link.
- Missing contract route.
- Missing all-six-app baseline.
- Broken Verixet status contract.
- Plan-change preview or execution regression.
- Satellite billing authority regression.
- Fake usage data.
- Browser-exposed service token.
- Fake HTTP proof result.
- Production mutation during proof.

## Release Note Recommendation

Attach or link the latest static proof report and the latest protected staging HTTP proof artifact in the release note. No badge is added because this workspace does not currently show a badge convention.
