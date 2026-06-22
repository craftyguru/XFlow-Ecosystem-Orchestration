# XFlow Ecosystem Repository Audit

Date: 2026-06-17  
Mode: audit-only. No app source files were edited, deleted, formatted, migrated, deployed, pushed, or secret-rotated.

## Repos Inspected

Primary production-readiness scope:

| App | Repo path | Branch | HEAD | Git status after audit commands |
|---|---|---:|---:|---|
| XFlow | `K:\XFlow-Ecosystem Workspace\apps\XFlow` | `master` | `91028cf` | clean |
| Verixet | `K:\XFlow-Ecosystem Workspace\apps\Verixet` | `main` | `997c6b0` | clean |
| CreVux | `K:\XFlow-Ecosystem Workspace\apps\CreVux` | `main` | `f036b16` | clean |
| RatAiFy | `K:\XFlow-Ecosystem Workspace\apps\RatAiFy` | `main` | `4898cbd` | clean |
| AudAix | `K:\XFlow-Ecosystem Workspace\apps\AudAix` | `main` | `6fec47a6` | clean |
| WordGeni | `K:\XFlow-Ecosystem Workspace\apps\WordGeni` | `main` | `e188774` | clean |

Additional git repos inventoried as ecosystem-adjacent, not primary app scope: `apps\PitStrike`, `packages\ecosystem-showcase`, `xflow-ecosystem-ops`.

## Files And Folders Inspected

Inspected folders:

- `K:\XFlow-Ecosystem Workspace\apps\XFlow`
- `K:\XFlow-Ecosystem Workspace\apps\Verixet`
- `K:\XFlow-Ecosystem Workspace\apps\CreVux`
- `K:\XFlow-Ecosystem Workspace\apps\RatAiFy`
- `K:\XFlow-Ecosystem Workspace\apps\AudAix`
- `K:\XFlow-Ecosystem Workspace\apps\WordGeni`
- `K:\XFlow-Ecosystem Workspace\.github`
- `K:\XFlow-Ecosystem Workspace\docs`
- `K:\XFlow-Ecosystem Workspace\supabase`
- top-level root artifacts, logs, temp folders, local env files, and adjacent app clones.

Inspected file categories:

- `package.json`, lockfiles, TypeScript configs, lint configs, build/deploy configs.
- `.env`, `.env.local`, `.env.example`, `.env.*.example`, `.env.*.template` files, with values redacted.
- `.github\workflows`, Railway, Docker, Nixpacks, Supabase migration/config folders.
- Security, architecture, operations, testing, API, runbook, and README docs.
- Targeted source files found by searches for auth, ownership, storage, upload, outbound URL, webhook, prompt, token, and artifact handling.

## Commands Run

Repository and inventory commands:

```powershell
Get-ChildItem -Force
Get-ChildItem -Recurse -Force -Directory -Filter .git
git -C <app> status --short
git -C <app> branch --show-current
git -C <app> rev-parse --short HEAD
Get-Command gitleaks,semgrep,trivy -ErrorAction SilentlyContinue
Get-ChildItem -LiteralPath <app> -Force
rg --files <app>
rg -n --glob '!**/node_modules/**' --glob '!**/.next/**' --glob '!**/dist/**' "console\.log|debugger|TODO|FIXME|HACK|XXX" <apps>
rg -n --glob '!**/node_modules/**' "prompt|completion|encrypted|pii|secret|token|apiKey|api_key" apps/WordGeni/apps/api/src
rg -n --glob '!**/node_modules/**' "localhost|127\.0\.0\.1|169\.254|private|SSRF|url|axios|fetch|CONNECTION_TIMEOUT|webhook" apps/RatAiFy/server apps/RatAiFy/shared
rg -n --glob '!**/node_modules/**' "upload|multer|file|mime|size|storage|artifact|public|signed|asset" apps/CreVux/artifacts/api-server/src
Get-ChildItem -Recurse -File -Name .env*; git -C <app> ls-files --error-unmatch -- <env-file>
```

Verification commands:

```powershell
npm run typecheck      # XFlow, Verixet, RatAiFy, AudAix
pnpm run typecheck     # CreVux, WordGeni
npm run lint           # XFlow, Verixet, RatAiFy, AudAix
pnpm run lint          # CreVux, WordGeni
npm test               # XFlow, Verixet, RatAiFy, AudAix
pnpm test              # CreVux, WordGeni
npm run build          # XFlow, Verixet, RatAiFy, AudAix
pnpm run build         # CreVux, WordGeni
npm audit --audit-level=high   # XFlow, Verixet, RatAiFy, AudAix
pnpm audit --audit-level high  # CreVux, WordGeni
npm run verify:security        # XFlow, Verixet, RatAiFy, AudAix
pnpm run verify:security       # CreVux, WordGeni
```

## Command Results

Static and verification gates:

| App | Typecheck | Lint | Test | Build | Security verify | Dependency audit |
|---|---|---|---|---|---|---|
| XFlow | pass | pass with 2 warnings | pass: 542 files, 2646 tests | pass | pass | fail: 40 vulns, 1 critical, 9 high |
| Verixet | pass | pass with 19 warnings | pass: 576 files, 2120 tests | pass | fail | fail: 24 vulns, 2 high |
| CreVux | pass | pass with 156 warnings | pass: 33 files, 124 tests | pass | pass | fail: 60 vulns, 2 critical, 27 high |
| RatAiFy | pass | pass with 391 warnings | pass: 373 tests | pass | pass | fail: 41 vulns, 3 critical, 15 high |
| AudAix | pass | pass with 98 warnings | pass: 109 files, 578 tests | pass | pass | fail: 24 vulns, 1 critical, 4 high |
| WordGeni | pass | pass with warnings in API/packages | pass: 15 tasks | pass | pass | fail: 73 vulns, 3 critical, 25 high |

Tool availability:

- `Get-Command gitleaks,semgrep,trivy` returned no available tools in PATH.

Search result counts:

| App | `console.log` / `debugger` / TODO-like marker count |
|---|---:|
| XFlow | 372 |
| Verixet | 193 |
| CreVux | 457 |
| RatAiFy | 147 |
| AudAix | 55 |
| WordGeni | 76 |

## Findings By Severity

### P0

| ID | Finding | Confidence | Evidence | Blast radius | Difficulty | Safe for Codex auto-fix |
|---|---|---|---|---|---|---|
| P0-1 | Real-looking secrets are present in local root/app env files; values were redacted during audit. | confirmed | Root files include `.env.shared.local`, `.env.security-local`, `.env.proof.local`, `.env.backup.local`; app files include `.env` / `.env.local` across all six apps and nested WordGeni apps. | ecosystem-wide | large | no, rotation and provider-side review require manual approval |
| P0-2 | Dependency audit thresholds fail across all six apps, including critical advisories in XFlow, CreVux, RatAiFy, AudAix, and WordGeni. | confirmed | `npm audit --audit-level=high` / `pnpm audit --audit-level high` exited nonzero for every app. | ecosystem-wide | large | partially, but major/framework upgrades require manual approval |
| P0-3 | Production-like local data/artifacts exist in app roots, including a large AudAix SQLite DB and many logs/test/build outputs. | confirmed | `apps\AudAix\audaix.db` is 281,792,512 bytes; app roots contain `.next`, `dist`, `output`, `test-results`, `uploads`, `playwright-report`, `tmp*.log`. | ecosystem-wide | medium | no for deletion; cleanup requires owner approval |

### P1

| ID | Finding | Confidence | Evidence | Blast radius | Difficulty | Safe for Codex auto-fix |
|---|---|---|---|---|---|---|
| P1-1 | Verixet security gate fails because dependency audit fails high threshold. | confirmed | `npm run verify:security` exited `1`; output includes `form-data` high CRLF injection and `ws` high memory DoS. | one app | medium | partially |
| P1-2 | Next.js and React web apps include vulnerable framework/transitive packages. | confirmed | XFlow audit: Next.js high advisories, Drizzle SQL injection, ws/esbuild/rollup/fast-uri. WordGeni audit: Next.js 15.5.15 high, Hono CORS high, Drizzle SQL injection. | multiple apps | large | partially |
| P1-3 | Scanner/media apps rely on vulnerable file/network processing chains. | confirmed | CreVux audit includes `tar` via `@tensorflow/tfjs-node`, `axios`, `protobufjs`, `vite`, `ws`; RatAiFy audit includes `fast-xml-parser`, `axios`, `multer`, Drizzle SQL injection. | multiple apps | large | partially |
| P1-4 | WordGeni stores AI prompts in DB schema fields; encryption appears optional/config-dependent. | likely | `apps\WordGeni\apps\api\src\db\schema.ts:646` has `prompt: text('prompt').notNull()` with comment `Encrypted in transit/resting`; `services\admin-security-health.ts` warns when `WORDGENI_DATA_ENCRYPTION_KEY` is not configured. | one app | medium | partially |
| P1-5 | Local env examples/templates may contain live-looking endpoints and token-shaped values requiring manual review. | likely | Tracked files include app `.env.example` files; root `.env.security-staging.example` appears to contain real-looking Supabase/DB/Auth shapes. | ecosystem-wide | medium | no for validation/rotation |
| P1-6 | CI/CD enforcement is fragmented: root workflow exists, but per-app deploy configs and example workflows are not a single enforced release gate. | confirmed | Root `.github\workflows\ecosystem-proof.yml`; app deploy configs include Railway/Docker/Nixpacks; Verixet has example GitHub action workflow samples. | ecosystem-wide | medium | yes for CI config, manual approval for deployment policy |
| P1-7 | Several apps expose public report/artifact/download/link surfaces that require manual review against auth and retention policies. | needs manual review | AudAix tests cover public reports and signed artifacts; CreVux routes cover asset exports/download links; RatAiFy schema has `publicReportUrl`, `downloadUrl`, webhook URLs. | multiple apps | large | no until product policy is confirmed |
| P1-8 | Optional security scanners were unavailable locally. | confirmed | `Get-Command gitleaks,semgrep,trivy` returned no tools. | ecosystem-wide | small | yes to add CI jobs, no to interpret external scan findings |

### P2

| ID | Finding | Confidence | Evidence | Blast radius | Difficulty | Safe for Codex auto-fix |
|---|---|---|---|---|---|---|
| P2-1 | Lint warnings are high in RatAiFy, CreVux, and AudAix. | confirmed | RatAiFy: 391 warnings; CreVux: 156 warnings; AudAix: 98 warnings. | multiple apps | medium | yes, after P0/P1 |
| P2-2 | Debug/TODO marker volume is high across the ecosystem. | confirmed | `rg` counts: XFlow 372, Verixet 193, CreVux 457, RatAiFy 147, AudAix 55, WordGeni 76. | ecosystem-wide | medium | partially |
| P2-3 | Build output shows large frontend bundles in media/editor-heavy apps. | confirmed | CreVux build emits `vendor-three` ~999 kB, `vendor-onnx` ~864 kB, `AnimateTab` ~420 kB; RatAiFy emits `vendor-recharts` ~484 kB and `index` ~460 kB; WordGeni project route ~170 kB page / 365 kB first load. | multiple apps | medium | yes |
| P2-4 | Stale/generated clones and adjacent app folders are present in the workspace. | confirmed | `apps\ASO-Audit-Agent`, `apps\PitStrike`, `apps\xflow-master-release`, `apps\XFlow-phase4b-pr`, `apps\XFlow-push-through`. | ecosystem-wide | small | no deletion without approval |
| P2-5 | Root and app artifacts include many untracked logs, build outputs, local caches, and temp outputs. | confirmed | `build.log`, `tmp-*.log`, `.next`, `dist`, `.turbo`, `output`, `test-results`, `playwright-report`, `tsconfig.tsbuildinfo`. | ecosystem-wide | small | no deletion without approval |
| P2-6 | Some app roots include mixed lockfiles/tooling, increasing install ambiguity. | confirmed | XFlow has `package-lock.json` and `pnpm-lock.yaml`; CreVux and WordGeni use pnpm; other apps use npm. | multiple apps | small | yes with approval |

### P3

| ID | Finding | Confidence | Evidence | Blast radius | Difficulty | Safe for Codex auto-fix |
|---|---|---|---|---|---|---|
| P3-1 | Documentation depth is uneven by app. | confirmed | XFlow has security/architecture/testing/ops docs; RatAiFy, Verixet, CreVux, AudAix, and WordGeni lack many exact per-app docs by name. | ecosystem-wide | medium | yes |
| P3-2 | `next lint` is deprecated in Next.js apps. | confirmed | XFlow and WordGeni lint output mention deprecation; Verixet also uses Next lint flow. | multiple apps | small | yes |
| P3-3 | Some test output is noisy and includes structured logs that obscure signal. | confirmed | AudAix tests print many Fastify request logs; WordGeni Temporal test prints simulated failure warning while passing. | multiple apps | small | yes |
| P3-4 | App naming/casing is inconsistent in folder names and docs. | likely | User scope names include RatAiFy/AudAix/CreVux; package/docs contain `rataify`, `AudAiX`, `Crevux`. | multiple apps | small | yes |
| P3-5 | Some app-level env examples are very large and may be hard to audit. | confirmed | Verixet `.env.example` 18,420 bytes; CreVux API `.env.example` 20,012 bytes; RatAiFy `.env.example` 15,119 bytes. | multiple apps | small | yes |

## Stale / Temp / Debug / Artifact Inventory

Confirmed root/app artifact categories:

- XFlow: `.next`, `artifacts`, `output`, `test-results`, `tmp`, `build.log`, many `tmp-*.log`, `xflow-dev*.log`, `tsconfig.tsbuildinfo`.
- Verixet: `.next`, `artifacts`, `output`, `test-results`, many `tmp-*.log`, `tsconfig.tsbuildinfo`, zero-byte file named `{`.
- CreVux: `artifacts`, `attached_assets`, `.local`, `.canvas`, `.agents`, `output`, `tmp`.
- RatAiFy: `dist`, `output`, `playwright-report`, `test-results`, `uploads`, `backup.dump`, `site_snapshot.txt`, `tmp-rataify-vite.*`.
- AudAix: `dist`, `artifacts`, `output`, `test-results`, `audaix.db`, `.audaix-dev-*.log`, many `tmp-*.log`.
- WordGeni: `.next`, `.turbo`, `dist`, `output`, `test-results`, `.codex-logs`, Android artifacts.

## Redacted Secret / Env Inventory

No full secret values are printed. Classification is based on key names, value shapes, file names, and git tracking checks.

Root local env files, outside a git repo or untracked at workspace root:

| File | Variable names observed | Appears real or placeholder | Tracked by git | Client-exposed | Recommended action |
|---|---|---|---|---|---|
| `.env.stripe.catalog.local` | `STRIPE_CATALOG_SECRET_KEY` | real-looking | no root git repo | no | manually verify owner; rotate if shared or committed elsewhere |
| `.env.shared.local` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` | real-looking | no root git repo | anon key may be client-safe; service role/database are server-only | move to secret manager; verify no source references load root local files in production |
| `.env.security-local` | `AUTH_SECRET`, `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, public Supabase URL/key | real-looking | no root git repo | public URL/anon key may be client-exposed | rotate if copied; remove from shared workspace backups |
| `.env.security-staging.example` | Supabase URL/DB/service role/auth secret shapes | real-looking despite `.example` | no root git repo | mixed | manual review; replace with placeholders if it is an example |
| `.env.proof.local` | DB URLs, Stripe secrets, app bearer tokens/secrets | real-looking | no root git repo | mostly server-only | rotate if ever used outside local proof run |
| `.env.backup.local` | DB URLs | real-looking | no root git repo | no | remove or archive securely after approval |

App env files:

| App | Env files | Tracking evidence | Client-exposed risk | Recommended action |
|---|---|---|---|---|
| XFlow | `.env`, `.env.local`, `.env.example`, `docs\examples\.env.production-proof.example` | local env files not tracked; examples tracked | `NEXT_PUBLIC_*` variables may be client-exposed | verify `.env.example` only has placeholders/live-safe public endpoints |
| Verixet | `.env`, `.env.local`, `.env.example`, `.env.local.example`, `.env.production.template` | local env files not tracked; examples/templates tracked | `NEXT_PUBLIC_*` variables may be client-exposed | review large tracked examples/templates for live endpoints |
| CreVux | `.env`, `.env.local`, `.env.example`, nested example files | local env files not tracked; examples tracked | Vite public envs may be client-exposed | keep root `.env` local only; split server/client example docs |
| RatAiFy | `.env`, `.env.local`, `.env.example` | local env files not tracked; example tracked | public app URLs and browser envs may be client-exposed | verify server secrets never use `VITE_*` or public prefixes |
| AudAix | `.env`, `.env.local`, `.env.example`, `.env.example.production-verification` | local env files not tracked; examples tracked | public API/base URL variables may be client-exposed | verify local DB/secrets not embedded in public build |
| WordGeni | `.env`, `.env.local`, `apps\api\.env`, `apps\api\.env.local`, `apps\web\.env.local`, `apps\worker\.env.local`, `.env.example` | local env files not tracked; example tracked | web `.env.local` may expose `NEXT_PUBLIC_*` | manually verify nested app env boundaries |

## Auth / Security Gaps

- Confirmed controls exist: XFlow security gate passed same-origin route guard verification for 72 protected session mutation routes.
- Confirmed controls exist: CreVux security gate passed billing webhook and Stripe idempotency checks.
- Confirmed controls exist: RatAiFy security tests include MFA, tenant access denial, webhook URL safety tests, and runtime payload redaction.
- Confirmed controls exist: AudAix tests include session/private report access, signed artifact URL behavior, workspace scoping, and connection secret endpoints.
- Confirmed gap: dependency vulnerabilities remain above high/critical thresholds.
- Needs manual review: public report, signed artifact, download-link, and webhook surfaces across AudAix, CreVux, RatAiFy, and WordGeni.
- Needs manual review: WordGeni AI prompt/encryption-at-rest behavior in production config.

## Storage / Temp Cleanup Gaps

- Confirmed: app roots contain generated build folders and local artifacts.
- Confirmed: AudAix has a 281 MB local SQLite database in the app root.
- Confirmed: RatAiFy has `uploads`, `playwright-report`, `test-results`, and a zero-byte `backup.dump`.
- Confirmed: CreVux has asset export retention code, but local artifact directories remain in the repo workspace.
- Unknown: whether generated artifacts are excluded from production images by Docker/Railway ignore rules in every app.

## API / Entitlement Gaps

- Confirmed passing tests cover several entitlement/security paths in XFlow, RatAiFy, AudAix, CreVux, and WordGeni.
- Needs manual review: cross-app entitlement source of truth and billing boundaries between XFlow, Verixet, CreVux, RatAiFy, AudAix, and WordGeni.
- Needs manual review: public API contract docs are uneven; XFlow has a public OpenAPI doc, while other apps have partial or app-specific specs.

## Performance Gaps

- Confirmed large bundle candidates:
  - CreVux: `vendor-three` ~999 kB, `vendor-onnx` ~864 kB, `AnimateTab` ~420 kB.
  - RatAiFy: `vendor-recharts` ~484 kB, app `index` ~460 kB.
  - WordGeni: `/dashboard/project/[id]` page ~170 kB, ~365 kB first-load.
- Confirmed build/test gates pass, but no Lighthouse/Core Web Vitals run was executed in this audit.

## Modularization Gaps

- Confirmed: CreVux and WordGeni are pnpm/turbo-style workspaces; XFlow, Verixet, RatAiFy, AudAix are separate npm apps.
- Confirmed: shared ecosystem behavior appears duplicated across apps through local integrations, env shapes, and route/security scripts.
- Needs manual review: which shared packages should become canonical versus copied app-local modules.

## Documentation Gaps

- XFlow has the strongest doc coverage: security model, architecture, threat model, secrets/key management, test strategy, tenant isolation plan, incident response, release signoff, public OpenAPI.
- RatAiFy has README and architecture docs but fewer exact security/ops docs.
- Verixet has README, docs README, runbook README, OpenAPI-related tests/docs, but fewer exact threat/ops docs.
- CreVux has README, local setup, OpenAPI YAML, migration READMEs, but fewer exact security/ops docs.
- AudAix has README and `SECURITY.md`, but fewer exact architecture/ops docs by requested names.
- WordGeni has README, ADR/branding docs, but fewer exact security/ops docs by requested names.

## CI/CD Gaps

- Confirmed root workflow: `.github\workflows\ecosystem-proof.yml`.
- Confirmed app deploy configs: XFlow Dockerfile/Railway, Verixet Railway/Nixpacks/examples, CreVux Railway/pnpm workspace, RatAiFy Dockerfile/Railway, AudAix Dockerfile/Railway, WordGeni Railway/Nixpacks/deploy configs.
- Gap: dependency audits currently fail; CI should block production release until resolved or formally waived.
- Gap: optional secret/security scanners were not installed locally; CI should install and run them.

## Unknowns Requiring Manual Review

- Whether any redacted env values are production credentials versus local/staging/proof credentials.
- Whether root `.env.*.local` files are included in backups, sync tools, or external sharing.
- Whether tracked `.env.example` and `.env.*.template` files contain live endpoints that must be replaced with placeholders.
- Whether public report/artifact/download URLs meet desired data-retention and access policies.
- Whether CI/CD deploy paths are currently authoritative or examples only.
- Whether any generated artifacts in `dist`, `.next`, `output`, and `uploads` are intentionally kept as release artifacts.
- Whether all dependency remediations can be made without product-affecting major upgrades.
- Whether OpenAPI/API docs reflect current runtime behavior across all apps.

## Totals

- P0 findings: 3
- P1 findings: 8
- P2 findings: 6
- P3 findings: 5
- Total findings: 22

## Top 10 Fixes To Do First

1. Manually classify and rotate any real root/app secrets that are production or shared beyond local use.
2. Remove or secure local databases, logs, and generated artifacts after explicit approval.
3. Upgrade vulnerable dependencies blocking high/critical audit thresholds.
4. Make Verixet `verify:security` pass.
5. Review WordGeni AI log encryption-at-rest production behavior.
6. Review public report/artifact/download-link surfaces across AudAix, CreVux, RatAiFy, and WordGeni.
7. Add CI secret scanning and dependency audit enforcement.
8. Reduce RatAiFy and CreVux lint warning volume.
9. Split/document server-only versus client-exposed env variables.
10. Standardize app production runbooks and release signoff docs.

## App To Fix First

RatAiFy should be fixed first after secret triage because it combines the highest operational risk profile: scanner/network/file-processing behavior, 3 critical dependency advisories, 15 high advisories, 391 lint warnings, local `uploads`, and public/report/download/webhook surfaces.

## Automated Fix Readiness

The repo is safe for Codex to start automated fixes after manual approval for secret handling and deletion/cleanup scope. Codex can safely work on dependency PRs, CI config, docs, lint cleanup, and targeted tests. Manual approval is required for secret rotation, deleting local artifacts/databases/uploads, migrations, deployment changes, auth policy changes, billing/entitlement policy changes, and any public URL/report retention policy changes.
