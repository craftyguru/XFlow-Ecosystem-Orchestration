# App Boundary and Data Ownership

This document records the expected ownership boundaries for the six-app ecosystem. It is a control document for security review, release validation, incident response, and future cross-app integrations.

## Boundary Principles

- Each app owns its own runtime, route surface, storage model, and verifier gates.
- Tenant, workspace, and project identifiers must not be trusted across app boundaries without explicit authorization checks.
- App-local artifacts must not be read, listed, linked, or served by another app unless a reviewed integration explicitly allows it.
- Secrets and credentials must not cross repositories, logs, documentation, CI output, or generated artifacts.
- Public routes must never expose private data, generated reports, local DB files, logs, uploaded media, derived artifacts, billing state, entitlement state, API keys, prompts, scanner results, or exports without explicit authorization.

## XFlow

Boundary:

- Control plane, authentication, operator workflows, and ecosystem coordination.

Owned data types:

- User/session/auth context.
- Operator/admin state.
- Control-plane route and policy metadata.
- App route manifest and integrity verification context.

Sensitive routes and surfaces:

- Authentication routes.
- Operator/admin routes.
- Control-plane APIs.
- Integrity and environment verification surfaces.

Cross-app dependencies:

- May coordinate app-level route or policy state.
- Must not directly access app-owned private artifacts, media, reports, billing data, exports, or scanner output without a reviewed integration.

Artifact/storage ownership:

- Owns control-plane metadata only.
- Must not become a shared dumping ground for app-local generated output.

Isolation assumptions:

- Auth, operator, tenant, workspace, and app ownership checks must remain explicit.

Must not cross boundary:

- Verixet billing/API keys.
- CreVux uploaded or derived media.
- RatAiFy scanner reports/artifacts.
- AudAix audit results/dashboard data.
- WordGeni source/export content.

## Verixet

Boundary:

- Billing, entitlements, API keys, API documentation, and deploy gates.

Owned data types:

- Billing state.
- Subscription and entitlement state.
- API key metadata.
- Deploy-gate configuration.
- API documentation and canonical host configuration.

Sensitive routes and surfaces:

- Billing and entitlement routes.
- API key management routes.
- Deploy-gate routes.
- Canonical host behavior.
- API documentation routes where implementation details may be exposed.

Cross-app dependencies:

- May provide entitlement or API access decisions to other reviewed consumers.
- Must not accept cross-app billing or entitlement mutations without explicit authorization and auditability.

Artifact/storage ownership:

- Owns billing/entitlement/API key records and related audit evidence.

Isolation assumptions:

- Tenant/account boundaries must be enforced before reading or mutating billing, entitlement, API key, or deploy-gate state.

Must not cross boundary:

- API keys or billing state into logs, docs, public route output, or unrelated app storage.
- Deploy credentials into app repositories or CI workflow files.

## CreVux

Boundary:

- Media uploads, media validation, ffmpeg processing, and derived artifacts.

Owned data types:

- Uploaded media metadata.
- Uploaded media objects.
- Derived media artifacts.
- Processing status and health metadata.
- Upload safety test fixtures and media policy configuration.

Sensitive routes and surfaces:

- Upload APIs.
- Media download or preview routes.
- Derived artifact routes.
- `/api/healthz/ffmpeg`.
- Any ffmpeg or processing health details.

Cross-app dependencies:

- May expose reviewed media results to authorized app consumers.
- Must not allow public listing or cross-tenant access to uploads or derived artifacts.

Artifact/storage ownership:

- Owns uploaded media and derived artifacts.
- Uploaded or generated media must not be staged in source repositories unless explicitly approved as test fixtures.

Isolation assumptions:

- Media ownership must be scoped by tenant, workspace, project, user, or equivalent app-level principal.

Must not cross boundary:

- Raw uploads or derived artifacts into public docs, logs, unrelated app storage, or unauthenticated routes.
- Internal ffmpeg capability details to public unauthenticated health responses.

## RatAiFy

Boundary:

- Website scanning, scanner safety controls, reporting, and scanner-generated artifacts.

Owned data types:

- Scan targets and normalized URLs.
- Scan jobs and status.
- Scanner findings.
- Reports and report artifacts.
- Shared Supabase schema verification context.

Sensitive routes and surfaces:

- Scan submission routes.
- Report routes.
- Artifact routes.
- Shared Supabase schema routes.
- Any network-fetching scanner functionality.

Cross-app dependencies:

- May share summarized or authorized report outputs through reviewed integrations.
- Must not fetch internal, private, loopback, metadata, or disallowed network targets.

Artifact/storage ownership:

- Owns scanner reports and artifacts.
- Scanner output must not be publicly listable or staged in app repos.

Isolation assumptions:

- Reports and artifacts must be scoped by tenant, workspace, project, scan owner, or equivalent app-level principal.

Must not cross boundary:

- Scanner access to private networks or metadata endpoints.
- Report artifacts across tenants, workspaces, projects, or unrelated apps.

## AudAix

Boundary:

- Audit/scanner workflows, audit results, and dashboard presentation.

Owned data types:

- Audit targets.
- Scanner inputs and outputs.
- Audit results and generated reports.
- Dashboard auth/test context.
- Local audit DB or runtime state where present.

Sensitive routes and surfaces:

- Scanner submission routes.
- Audit result routes.
- Dashboard auth routes.
- Dashboard report views.
- Local DB-backed development or runtime state.

Cross-app dependencies:

- May consume reviewed auth or control-plane decisions.
- Must not expose audit outputs or dashboard data to unrelated apps without authorization.

Artifact/storage ownership:

- Owns audit/scanner output and dashboard-specific artifacts.
- Local DB files, generated reports, logs, and screenshots must not be staged or exposed.

Isolation assumptions:

- Audit data must remain scoped by tenant, workspace, project, user, or equivalent principal.

Must not cross boundary:

- Local DB files into source control or public storage.
- Audit/scanner findings across tenants or unrelated apps.
- Dashboard auth context into public logs or docs.

## WordGeni

Boundary:

- Writing workflows, source material, generation context, and export/download output.

Owned data types:

- Writing prompts and context.
- Source documents or source excerpts.
- Drafts and generated text.
- Export files and export metadata.
- Route and environment verification context.

Sensitive routes and surfaces:

- Source ingestion routes.
- Writing/generation routes.
- Export download routes.
- Any prompt/context inspection route.

Cross-app dependencies:

- May use reviewed auth/control-plane decisions.
- Must not share source material, prompts, generated drafts, or exports with unrelated apps without explicit authorization.

Artifact/storage ownership:

- Owns generated writing output and exports.
- Generated exports and source documents must not be staged or publicly exposed.

Isolation assumptions:

- Writing context, source material, and exports must be scoped by tenant, workspace, project, user, or equivalent principal.

Must not cross boundary:

- Prompt/source/export content into logs, docs, public routes, or unrelated app storage.
- Cross-tenant export downloads.

## Shared Prohibitions

The following must not cross app boundaries without explicit approval and reviewed implementation:

- Secret values or deploy credentials.
- Production database URLs or service-role credentials.
- Billing or entitlement records.
- API keys.
- Uploaded media or derived media artifacts.
- Scanner targets, reports, or artifacts.
- Audit findings or generated audit reports.
- Writing source material, prompts, drafts, or exports.
- Local DB files, logs, screenshots, caches, generated reports, build output, or media artifacts.

## Manual Review Required

Manual approval is required before:

- Introducing shared storage across apps.
- Sharing auth, tenant, workspace, or project identifiers across apps.
- Adding cross-app report, artifact, media, billing, entitlement, or export access.
- Changing public artifact retention or exposure policy.
- Running migrations or destructive cleanup.
- Rotating secrets or changing credential providers.
