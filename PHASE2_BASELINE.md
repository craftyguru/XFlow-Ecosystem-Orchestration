# Phase 2 Baseline

Date: 2026-06-17
Workspace: `K:\XFlow-Ecosystem Workspace`
Scope: audit only. No package installs, migrations, deploys, pushes, or source changes were made.

## Executive Summary

All six target app repositories started clean and ended clean after the baseline commands:

- `apps\XFlow`
- `apps\Verixet`
- `apps\CreVux`
- `apps\RatAiFy`
- `apps\AudAix`
- `apps\WordGeni`

CreVux live deploy proof is already cleared by the baseline route verifier: `https://crevux.com/api/healthz` reports commit `ead7a6b2e1ff7ff7d377c069fffc57aff97f6972`, and unauthenticated `https://crevux.com/api/healthz/ffmpeg` returns 401.

Verixet canonical host proof is already cleared by the baseline verifier: `https://www.verixet.com/`, `/sitemap.xml`, and `/robots.txt` redirect to apex with HTTP 301.

Highest-priority remaining production-risk chains:

1. CreVux `@tensorflow/tfjs-node -> tar` high advisories.
2. Drizzle ORM high advisory in XFlow, RatAiFy, and WordGeni.
3. WordGeni OpenTelemetry Prometheus exporter high advisories.
4. XFlow Sentry/Rollup/Vitest high/critical audit chains.

## Per-App Baseline

### XFlow

- Path: `apps\XFlow`
- Branch: `master`
- Phase 1/current commit: `01dea27ab9205175f1a79e563bdcd7dc39b8c74a` (`chore(xflow): sync app route manifest`)
- Initial status: clean
- Final status: clean
- Package manager observed: npm `10.9.3`, Node `v22.18.0`
- Lockfile: `package-lock.json`
- Relevant declared package versions: `drizzle-orm ^0.36.4`, `drizzle-kit ^0.28.1`, `@sentry/nextjs 8.55.0`, `@sentry/node 8.55.0`, `next ^15.5.14`, `vite` transitive, `vitest ^2.1.6`

Commands:

| Command | Result |
| --- | --- |
| `git status --short` | pass, clean |
| `git branch --show-current` / `git rev-parse HEAD` | `master`, `01dea27ab9205175f1a79e563bdcd7dc39b8c74a` |
| `npm --version` / `node --version` | `10.9.3`, `v22.18.0` |
| `npm audit --audit-level=high` | fail: 35 vulnerabilities, including 30 moderate, 4 high, 1 critical |
| `npm audit --omit=dev --audit-level=high` | fail: 27 vulnerabilities, including 24 moderate, 3 high |
| `npm run lint` | pass; warnings only (`ChronicleSourcesClient.tsx`, `next/image`) |
| `npm run typecheck` | pass |
| `npm test` | pass |
| `npm run build` | pass |
| `npm run verify:security` | pass |
| `npm run verify:routes` | pass; 412 expected App Router files present |
| `npm run verify:env` | pass; low-severity `.env.example` warnings |

Remaining advisories:

- Production: `drizzle-orm <0.45.2` high; `@sentry/nextjs -> @sentry/node/@sentry/opentelemetry/rollup/uuid` high/moderate; `next -> postcss` moderate with unsafe audit downgrade recommendation.
- Dev/tooling: `vitest/vite/vite-node/@vitest/mocker/esbuild` includes critical/high/moderate; `drizzle-kit -> @esbuild-kit -> esbuild` moderate.
- Fix paths requiring major/breaking/forced upgrade: `drizzle-orm 0.45.2`, `drizzle-kit 0.31.10`, `vitest 4.1.9`, `@sentry/nextjs 10.58.0`, `@sentry/node 10.58.0`. NPM suggests `next@9.3.3` for PostCSS, which is an unsafe downgrade and must not be used.

### Verixet

- Path: `apps\Verixet`
- Branch: `main`
- Phase 1/current commit: `e5ee0e4eb3e9878cfbd4775291e425904aea0901` (`fix(verixet): let middleware enforce www canonical 301`)
- Initial status: clean
- Final status: clean
- Package manager observed: npm `10.9.3`, Node `v22.18.0`
- Lockfile: `package-lock.json`
- Relevant declared package versions: `drizzle-orm 0.45.2`, `drizzle-kit 0.31.10`, `@sentry/nextjs ^9.47.1`, `vite ^8.0.16`, `vitest ^4.1.8`; overrides include `esbuild 0.28.1`, `postcss 8.5.15`, `uuid 11.1.1`

Commands:

| Command | Result |
| --- | --- |
| `git status --short` | pass, clean |
| `git branch --show-current` / `git rev-parse HEAD` | `main`, `e5ee0e4eb3e9878cfbd4775291e425904aea0901` |
| `npm --version` / `node --version` | `10.9.3`, `v22.18.0` |
| `npm audit --audit-level=high` | pass exit 0; reports 20 moderate vulnerabilities |
| `npm audit --omit=dev --audit-level=high` | pass exit 0; reports 20 moderate vulnerabilities |
| `npm run lint` | pass; 19 warnings |
| `npm run typecheck` | pass |
| `npm test` | pass; 576 files passed, 3 skipped; 2120 tests passed, 26 skipped |
| `npm run build` | pass |
| `npm run verify:security` | pass exit 0, but dependency audit portion reports moderate advisories |
| `npm run verify:routes` | pass |
| `npm run verify:env` | pass |
| `npm run verify:canonical-host` | pass; all three www-to-apex checks return 301 |

Remaining advisories:

- Production: `@sentry/nextjs -> @sentry/node/@sentry/vercel-edge -> @opentelemetry/*` moderate; `swagger-ui-react -> js-yaml` moderate.
- Dev/tooling: none above high threshold observed.
- Fix paths requiring major/breaking/forced upgrade: `@sentry/nextjs 10.58.0`; `swagger-ui-react` audit suggests `3.23.3`, which is a major downgrade from current `^5.32.1` and requires manual review.

### CreVux

- Path: `apps\CreVux`
- Branch: `main`
- Phase 1/current commit: `ead7a6b2e1ff7ff7d377c069fffc57aff97f6972` (`security(crevux): harden media uploads and ffmpeg health access`)
- Initial status: clean
- Final status: clean
- Package manager observed: pnpm `10.30.3`, Node `v22.18.0`
- Declared package manager: `pnpm@10.30.3`
- Lockfile: `pnpm-lock.yaml`
- Relevant declared package versions: root `@tensorflow/tfjs-core 4.22.0`; audit path includes `artifacts__api-server > @tensorflow/tfjs-node > tar`

Commands:

| Command | Result |
| --- | --- |
| `git status --short` | pass, clean |
| `git branch --show-current` / `git rev-parse HEAD` | `main`, `ead7a6b2e1ff7ff7d377c069fffc57aff97f6972` |
| `pnpm --version` / `node --version` | `10.30.3`, `v22.18.0` |
| `pnpm audit --audit-level high` | fail: 28 total vulnerabilities; 6 high displayed |
| `pnpm audit --prod --audit-level high` | fail: 24 total vulnerabilities; 6 high displayed |
| `pnpm run lint` | pass; warnings only |
| `pnpm run typecheck` | pass |
| `pnpm test` | pass |
| `pnpm run build` | pass |
| `pnpm run verify:security` | pass |
| `pnpm run verify:routes` | pass; live deploy parity checks pass, `healthz` commit matches `ead7a6b2e1ff7ff7d377c069fffc57aff97f6972`, `ffmpeg` health route returns 401 unauthenticated |
| `pnpm run verify:env` | pass |

Remaining advisories:

- Production: `@tensorflow/tfjs-node -> tar` high; six tar advisories remain in production audit. Secondary production/moderate paths include `nodemailer`, `ip-address`, `qs`, and `@opentelemetry/core`.
- Dev/tooling: `lib__db -> drizzle-kit -> @esbuild-kit -> esbuild` moderate; `lib__api-spec -> orval/typedoc` markdown/yaml/brace-expansion moderate; mobile Expo/PostCSS/UUID/Babel advisories; `onnxruntime-web -> protobufjs` moderate.
- Fix paths requiring major/breaking/forced upgrade: TensorFlow/tfjs-node native chain requires a targeted compatibility decision; do not override `tar` blindly without native install/build/generation proof.

### RatAiFy

- Path: `apps\RatAiFy`
- Branch: `main`
- Phase 1/current commit: `daec015c6f02e748011c0ee799b9b11cf716bd12` (`security(rataify): harden scanner SSRF and artifact controls`)
- Initial status: clean
- Final status: clean
- Package manager observed: npm `10.9.3`, Node `v22.18.0`
- Lockfile: `package-lock.json`
- Relevant declared package versions: `drizzle-orm ^0.39.1`, `drizzle-kit ^0.31.10`, `vite ^6.3.4`, `vitest ^4.1.9`, `@sentry/node ^10.32.1`, `@sentry/react ^10.32.1`, `@google-cloud/storage ^7.18.0`, `bull ^4.16.5`

Commands:

| Command | Result |
| --- | --- |
| `git status --short` | pass, clean |
| `git branch --show-current` / `git rev-parse HEAD` | `main`, `daec015c6f02e748011c0ee799b9b11cf716bd12` |
| `npm --version` / `node --version` | `10.9.3`, `v22.18.0` |
| `npm audit --audit-level=high` | fail: 11 vulnerabilities, including 10 moderate, 1 high |
| `npm audit --omit=dev --audit-level=high` | fail: 7 vulnerabilities, including 6 moderate, 1 high |
| `npm run lint` | pass; 388 warnings |
| `npm run typecheck` | pass |
| `npm test` | pass; 381 tests passed |
| `npm run build` | pass |
| `npm run verify:security` | pass; 23 tests passed |
| `npm run verify:routes` | pass; 104 unique paths, no duplicates |
| `npm run verify:env` | fail; `RELEASE_VERIFY_BASE_URL` required |

Remaining advisories:

- Production: `drizzle-orm <0.45.2` high; `uuid` moderate through `bull`, `gaxios`, `teeny-request`, `@google-cloud/storage/retry-request`.
- Dev/tooling: `drizzle-kit -> @esbuild-kit -> esbuild` moderate.
- Fix paths requiring major/breaking/forced upgrade: `drizzle-orm 0.45.2`; audit suggests `drizzle-kit 0.18.1` and `bull 1.1.3`, both unsafe major downgrades and not acceptable without manual review.
- Environment blocker: release env verification requires `RELEASE_VERIFY_BASE_URL`.

### AudAix

- Path: `apps\AudAix`
- Branch: `main`
- Phase 1/current commit: `a278352f6791686b4c26605293837feefe739d9f` (`security(audaix): harden outbound scan validation`)
- Initial status: clean
- Final status: clean
- Package manager observed: npm `10.9.3`, Node `v22.18.0`
- Lockfile: `package-lock.json`
- Relevant declared package versions: `@sentry/node ^10.50.0`, `lighthouse ^12.8.2`, `vite` via dashboard, `vitest ^3.2.6`

Commands:

| Command | Result |
| --- | --- |
| `git status --short` | pass, clean |
| `git branch --show-current` / `git rev-parse HEAD` | `main`, `a278352f6791686b4c26605293837feefe739d9f` |
| `npm --version` / `node --version` | `10.9.3`, `v22.18.0` |
| `npm audit --audit-level=high` | pass exit 0; reports 18 vulnerabilities, including 1 low and 17 moderate |
| `npm audit --omit=dev --audit-level=high` | pass exit 0; reports 17 moderate vulnerabilities |
| `npm run lint` | pass; 97 warnings |
| `npm run typecheck` | pass |
| `npm test` | pass; 109 files passed, 2 skipped; 595 tests passed, 2 skipped |
| `npm run build` | skipped: script runs `npm ci --prefix dashboard`, which would install packages and violates audit-only/no-install scope |
| `npm run verify:security` | pass; aliases `test:ci`, same result as tests |
| `npm run verify:routes` | pass; aliases `test:ci`, same result as tests |
| `npm run verify:env` | pass; `production_env_valid` |

Remaining advisories:

- Production: `lighthouse -> @sentry/node -> @opentelemetry/*` moderate.
- Dev/tooling: dashboard `vite -> esbuild` low/moderate.
- Fix paths requiring major/breaking/forced upgrade: audit suggests `lighthouse 12.6.1`, a downgrade from declared `^12.8.2`; must not be accepted blindly. Need scanner compatibility proof.

### WordGeni

- Path: `apps\WordGeni`
- Branch: `main`
- Phase 1/current commit: `0e78e2a316778a160e30c45ada88c5ce4e4e7703` (`security(wordgeni): harden export downloads and dependency posture`)
- Initial status: clean
- Final status: clean
- Package manager observed: pnpm `9.15.0`, Node `v22.18.0`
- Declared package manager: `pnpm@9.15.0`
- Lockfile: `pnpm-lock.yaml`
- Relevant declared package versions: root `@sentry/opentelemetry 9.47.1`, `lighthouse ^13.4.0`; workspace paths include `drizzle-orm 0.38.4`, `drizzle-kit 0.30.6`, `next 15.5.18`, `@sentry/nextjs 9.47.1`, `@opentelemetry/sdk-node 0.57.2`

Commands:

| Command | Result |
| --- | --- |
| `git status --short` | pass, clean |
| `git branch --show-current` / `git rev-parse HEAD` | `main`, `0e78e2a316778a160e30c45ada88c5ce4e4e7703` |
| `pnpm --version` / `node --version` | `9.15.0`, `v22.18.0` |
| `pnpm audit --audit-level high` | fail: 20 total vulnerabilities; high Drizzle and OpenTelemetry exporter advisories displayed |
| `pnpm audit --prod --audit-level high` | fail: 16 total vulnerabilities; high Drizzle and OpenTelemetry exporter advisories displayed |
| `pnpm run lint` | pass; warnings only |
| `pnpm run typecheck` | pass; 21 tasks successful |
| `pnpm test` | pass; 15 turbo tasks successful |
| `pnpm run build` | pass; 8 tasks successful |
| `pnpm run verify:security` | pass |
| `pnpm run verify:routes` | pass; 24 web route tests passed |
| `pnpm run verify:env` | pass; required env names present, optional env vars missing only |

Remaining advisories:

- Production: `drizzle-orm <0.45.2` high; `@opentelemetry/sdk-node/@opentelemetry/exporter-prometheus <0.217.0` high; `next -> postcss` moderate; `uuid` moderate via Temporal; `qs` moderate via Stripe; `ip-address` moderate via Puppeteer proxy stack; `ai/jsondiffpatch` low/moderate; `@sentry/opentelemetry/lighthouse -> @opentelemetry/core` moderate.
- Dev/tooling: `drizzle-kit -> esbuild` moderate; `tsx/vitest/vite -> esbuild` low; ESLint/Capacitor `brace-expansion`/`js-yaml` moderate.
- Fix paths requiring major/breaking/forced upgrade: Drizzle to `0.45.2`; OpenTelemetry to `0.217.0`; Next/PostCSS needs safe Next patch or override proof, not downgrade.

## Dependency Chain Table

| Chain | Affected apps | Production risk | Dev/tooling risk | Current blocker/fix shape |
| --- | --- | --- | --- | --- |
| Drizzle ORM / drizzle-kit | XFlow, RatAiFy, WordGeni; CreVux has dev `drizzle-kit -> esbuild`; Verixet already on patched Drizzle | XFlow, RatAiFy, WordGeni have `drizzle-orm <0.45.2` high | XFlow, RatAiFy, WordGeni, CreVux have `drizzle-kit/@esbuild-kit/esbuild` tooling advisories | Upgrade `drizzle-orm` to `>=0.45.2`; upgrade `drizzle-kit` only with schema/type/migration proof |
| TensorFlow / tfjs-node / tar | CreVux | Yes: `artifacts__api-server > @tensorflow/tfjs-node > tar` high advisories in prod audit | No primary dev-only finding | Native package chain; must prove install/build/runtime generation before accepting |
| Vite / esbuild / Vitest | XFlow, RatAiFy, AudAix, WordGeni, CreVux; Verixet currently mitigated by overrides | XFlow audit reports `vitest` critical and `vite` high through installed graph; others mostly tooling | Broad dev-server/test-runner exposure | Upgrade per app; avoid test harness rewrites except compatibility |
| Sentry / OpenTelemetry / Rollup / UUID | XFlow, Verixet, AudAix, WordGeni; RatAiFy has UUID via storage/bull, not Sentry; CreVux has OpenTelemetry moderate | XFlow high via Sentry/Rollup; WordGeni high via OpenTelemetry Prometheus exporter; Verixet/AudAix moderate | Source-map/build/runtime instrumentation risk | Coordinated Sentry/OpenTelemetry/UUID/Rollup upgrades with startup checks |
| Lighthouse scanner | AudAix, WordGeni root dev dependency; CreVux API spec/tooling has secondary scanners | AudAix moderate production chain through Lighthouse/Sentry/OpenTelemetry | WordGeni and other scanner/dev paths may be advisory only | Do not downgrade Lighthouse; verify scanner output and report schema |
| Next / PostCSS | XFlow, WordGeni; possibly Verixet mitigated by PostCSS override | XFlow and WordGeni Next apps report nested PostCSS moderate | Build/router/middleware compatibility risk | Safe same-major Next patch or lockfile override only; reject unsafe Next downgrade |
| Swagger / js-yaml | Verixet | Moderate if `swagger-ui-react` is served in production | None primary | Audit proposes unsafe downgrade; needs direct dependency review |
| Storage / UUID / retry chain | RatAiFy | Moderate through `@google-cloud/storage`, `bull`, `uuid` | None primary | Upgrade storage/bull paths carefully; audit suggestions are unsafe downgrades |
| Misc low/moderate transitive chains | CreVux, WordGeni | Some production paths: `nodemailer`, `qs`, `ip-address`, `ai/jsondiffpatch`, `protobufjs` | ESLint/Capacitor/Typedoc/markdown/yaml paths | Track in exception register after core chains |

## Production Risk vs Dev Tooling Risk

Production-risk advisories:

- XFlow: Drizzle ORM high; Sentry/Rollup high; Next/PostCSS moderate; Sentry/OpenTelemetry/UUID moderate.
- Verixet: Sentry/OpenTelemetry moderate; `swagger-ui-react -> js-yaml` moderate.
- CreVux: `@tensorflow/tfjs-node -> tar` high; additional moderate production paths (`nodemailer`, `ip-address`, `qs`, OpenTelemetry).
- RatAiFy: Drizzle ORM high; UUID/storage/bull chain moderate.
- AudAix: Lighthouse/Sentry/OpenTelemetry moderate.
- WordGeni: Drizzle ORM high; OpenTelemetry Prometheus exporter high; Next/PostCSS moderate; Temporal/UUID, Stripe/QS, Puppeteer/IP address moderate.

Dev/tooling-risk advisories:

- XFlow: Vite/esbuild/Vitest critical/high/moderate; Drizzle kit/esbuild.
- CreVux: Drizzle kit/esbuild, API spec tooling, mobile Expo/PostCSS/UUID/Babel, ONNX/protobufjs.
- RatAiFy: Drizzle kit/esbuild.
- AudAix: dashboard Vite/esbuild.
- WordGeni: Drizzle kit/esbuild, tsx/vitest/vite/esbuild, ESLint/Capacitor support packages.
- Verixet: no high dev/tooling advisory observed in this baseline.

## Recommended Upgrade Order

1. Drizzle ORM / drizzle-kit: XFlow, RatAiFy, WordGeni first; inspect CreVux `lib__db` dev-only kit path after production Drizzle is cleared.
2. TensorFlow / tfjs-node / tar: CreVux only, because it is the clearest production high blocker.
3. Vite / esbuild / Vitest: AudAix, RatAiFy, WordGeni, XFlow, CreVux, then re-check Verixet.
4. Sentry / OpenTelemetry / Rollup / UUID: WordGeni and XFlow first because high advisories exist; then Verixet/AudAix; then RatAiFy UUID/storage chain.
5. Lighthouse: AudAix first; WordGeni only if scanner/tooling use is confirmed relevant.
6. Next / PostCSS: XFlow and WordGeni; Verixet only if its override stops applying.
7. Secondary moderate/low chains: Swagger/js-yaml, storage/retry/UUID, nodemailer, qs, ip-address, markdown/yaml/protobufjs, AI SDK/jsondiffpatch.

## Verification Commands After Each Chain Upgrade

Run the app-specific command set after every dependency-chain change. Add the audit command for the package manager and repeat production-only audit where supported.

### XFlow

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\XFlow"
npm audit --audit-level=high
npm audit --omit=dev --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:security
npm run verify:routes
npm run verify:env
```

### Verixet

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\Verixet"
npm audit --audit-level=high
npm audit --omit=dev --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:security
npm run verify:routes
npm run verify:env
npm run verify:canonical-host
```

### CreVux

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\CreVux"
pnpm audit --audit-level high
pnpm audit --prod --audit-level high
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
pnpm run verify:security
pnpm run verify:routes
pnpm run verify:env
```

### RatAiFy

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\RatAiFy"
npm audit --audit-level=high
npm audit --omit=dev --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:security
npm run verify:routes
$env:RELEASE_VERIFY_BASE_URL="https://www.rataify.com"; npm run verify:env
```

### AudAix

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\AudAix"
npm audit --audit-level=high
npm audit --omit=dev --audit-level=high
npm run lint
npm run typecheck
npm test
npm run verify:security
npm run verify:routes
npm run verify:env
```

`npm run build` currently runs `npm ci --prefix dashboard`; do not run it in no-install audit mode. For remediation work, run it only when package installation is explicitly allowed:

```powershell
npm run build
```

### WordGeni

```powershell
cd "K:\XFlow-Ecosystem Workspace\apps\WordGeni"
pnpm audit --audit-level high
pnpm audit --prod --audit-level high
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
pnpm run verify:security
pnpm run verify:routes
pnpm run verify:env
```

## Do Not Touch Without Manual Approval

- Production database schemas and migrations in any app.
- Drizzle migration generation outputs if an upgrade produces them; document only until approved.
- CreVux TensorFlow/tfjs-node native runtime behavior, generation policies, credits, entitlements, media storage policy, or existing media artifacts.
- Hosting/CDN/Cloudflare redirect rules outside the explicit Verixet canonical-host task.
- Secrets, `.env` contents, Railway variables, Stripe keys, Supabase service role keys, or token rotation.
- Deployment triggers, app pushes, or production migrations.
- NPM/pnpm force fixes or audit-suggested downgrades such as `next@9.3.3`, `bull@1.1.3`, `swagger-ui-react@3.23.3`, or `lighthouse@12.6.1`.
- Snapshot rewrites or test assertion changes unless a dependency major upgrade requires harmless harness compatibility and the behavior is explicitly unchanged.
- Generated build artifacts should remain unstaged; baseline ended with all six app worktrees clean.

## Baseline Exceptions To Carry Forward

- AudAix build was skipped in audit-only mode because the declared build command installs packages.
- RatAiFy `verify:env` failed because `RELEASE_VERIFY_BASE_URL` was absent.
- XFlow and WordGeni include deprecated `next lint` usage in their lint chain; this is not a Phase 2 blocker but should be tracked for CI hygiene.
- Several verifiers intentionally log expected denial/failure cases during tests. They exited 0 and are not treated as failures.

