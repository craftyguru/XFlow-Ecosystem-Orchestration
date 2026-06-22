# Marketing Claims Ledger

This ledger keeps public lander copy grounded in current source evidence. Use `verified` for claims backed by local code or docs, `partial` for claims that are directionally true but need careful wording, and `remove/soften` for claims that should not appear as hard promises.

## XFlow

| Claim | Status | Evidence | Safe public wording |
|---|---|---|---|
| XFlow is a multi-app control plane for connected apps and workspaces. | verified | `apps/XFlow/src/components/showcase/CommercialHomepage.tsx`, `apps/XFlow/TRUST_CENTER_OVERVIEW.md` | XFlow coordinates connected apps, workspaces, events, readiness checks, and ecosystem visibility from one command center. |
| XFlow uses workspace RBAC and tenant-scoped records. | verified | `apps/XFlow/SECURITY_MODEL.md` | XFlow protects workspace data with membership-validated workspace access and explicit permission checks. |
| XFlow encrypts connection bearer tokens at rest. | verified | `apps/XFlow/SECURITY_MODEL.md` | XFlow stores connection bearer tokens encrypted at rest and supports token rotation overlap. |
| XFlow applies rate limits and event dedupe on control-plane ingest. | verified | `apps/XFlow/SECURITY_MODEL.md` | XFlow rate-limits control-plane ingest and uses dedupe keys to avoid duplicate event processing. |
| XFlow fully secures every connected app automatically. | remove/soften | `apps/XFlow/SECURITY_MODEL.md` known gaps and shared responsibility | XFlow coordinates connection, visibility, readiness, and control while each connected app keeps its own security boundary. |
| XFlow has complete CSRF token coverage for every browser mutation. | remove/soften | `apps/XFlow/SECURITY_MODEL.md` known gaps | XFlow uses same-origin protections for JSON mutations and documents where deeper CSRF-token coverage is still being expanded. |

## Verixet

| Claim | Status | Evidence | Safe public wording |
|---|---|---|---|
| Verixet is the billing, entitlement, governance, and trust authority. | verified | `apps/Verixet/SECURITY_AUDIT.md`, `apps/Verixet/src/components/marketing/home/HomePage.tsx` | Verixet governs plans, billing, entitlements, usage, API access, and audit-ready operator workflows. |
| Verixet enforces a nonce-based CSP with strict script and style posture. | verified | `apps/Verixet/SECURITY_AUDIT.md`, `apps/Verixet/src/lib/security/content-security-policy.ts` | Verixet uses enforced nonce-based CSP and keeps marketing UI compatible with strict script and style policies. |
| Verixet supports MFA, step-up, session inventory, and revocation. | verified | `apps/Verixet/SECURITY_AUDIT.md` | Verixet gives operators MFA, step-up flows, active session visibility, and session revocation controls. |
| Verixet protects Stripe/webhook flows with freshness and replay controls. | verified | `apps/Verixet/SECURITY_AUDIT.md` | Verixet hardens Stripe and webhook workflows with freshness checks, replay binding, and audit events. |
| Verixet can guarantee every third-party app enforces every entitlement correctly. | remove/soften | Connected apps maintain their own boundaries | Verixet is designed to be the authoritative billing and entitlement source, while connected apps must enforce decisions server-side. |

## AudAiX

| Claim | Status | Evidence | Safe public wording |
|---|---|---|---|
| AudAiX audits websites and apps for launch readiness. | verified | `apps/AudAix/dashboard/src/pages/LandingPage.tsx`, `apps/AudAix/SECURITY_AUDIT.md` | AudAiX checks real pages for route, UX, accessibility, performance, SEO, security, and readiness issues before launch. |
| AudAiX records visual evidence and audit artifacts. | verified | `apps/AudAix/dashboard/src/pages/LandingPage.tsx` | AudAiX keeps screenshots, findings, routes, scores, and artifacts together so recommendations have evidence. |
| AudAiX protects outbound scan fetches with SSRF guards. | verified | `apps/AudAix/SECURITY_AUDIT.md` | AudAiX uses guarded outbound requests to reduce private-network and metadata-service fetch risk. |
| AudAiX uses encrypted workspace secrets and signed replay-protected connector flows. | verified | `apps/AudAix/SECURITY_AUDIT.md` | AudAiX protects workspace secrets at rest and hardens connector ingress with timestamps, dedupe keys, and trust binding. |
| AudAiX proves a site is legally compliant. | remove/soften | Product is an audit/readiness tool, not legal certification | AudAiX surfaces risk signals and evidence so teams can prioritize fixes and review compliance concerns. |

## RatAiFy

| Claim | Status | Evidence | Safe public wording |
|---|---|---|---|
| RatAiFy is a trust, reputation, privacy, and risk engine for websites. | verified | `apps/RatAiFy/client/src/components/marketing/trust/TrustHomeSections.tsx`, `apps/RatAiFy/docs/pricing-cost-exposure-audit.md` | RatAiFy scans trust, privacy, policy, copy, inbox, SMS, and reputation signals so teams can improve customer confidence. |
| RatAiFy includes Website trust scans, privacy scans, policy generation, CopyGuard, inbox/SMS analysis, RiskRadar, reports, and connected-app verification. | verified | `apps/RatAiFy/docs/pricing-cost-exposure-audit.md`, `apps/RatAiFy/src/lib/billing/plans.ts` | RatAiFy brings trust scans, privacy checks, policy generation, CopyGuard, inbox/SMS analysis, RiskRadar, reports, and connected-app verification into one workspace. |
| RatAiFy has passkeys/MFA and tenant authorization hardening. | verified | `apps/RatAiFy/SECURITY_AUDIT.md` | RatAiFy uses passkeys, MFA, session normalization, and tenant-aware authorization to protect account and workspace data. |
| RatAiFy pricing and cross-app enforcement are fully proven across all ecosystem apps. | remove/soften | `apps/RatAiFy/docs/pricing-cost-exposure-audit.md` launch blockers | RatAiFy is designed to connect with ecosystem billing and verification; final cross-app claims should stay aligned with each app's own enforcement. |
| RatAiFy assistant usage is fully metered and launch-safe. | remove/soften | `apps/RatAiFy/docs/pricing-cost-exposure-audit.md` launch blockers | RatAiFy should describe assistant capabilities carefully until usage limits, meters, and rate limits are confirmed. |

## WordGeni

| Claim | Status | Evidence | Safe public wording |
|---|---|---|---|
| WordGeni is a source-grounded AI writing workspace. | verified | `apps/WordGeni/apps/web/src/app/page.tsx`, `apps/WordGeni/apps/web/src/components/ecosystem/ecosystemContent.ts` | WordGeni turns sources, notes, memory, and ideas into structured, reviewable, publish-ready content. |
| WordGeni supports project memory, source provenance, verified drafts, and exports. | verified | `apps/WordGeni/apps/web/src/app/page.tsx`, `apps/WordGeni/SECURITY_AUDIT.md` | WordGeni keeps project memory, sources, provenance, drafts, and exports connected inside one writing workflow. |
| WordGeni uses prompt isolation and untrusted-context handling. | verified | `apps/WordGeni/SECURITY_AUDIT.md` | WordGeni separates trusted instructions from untrusted source/user context and applies AI guardrails around high-cost surfaces. |
| WordGeni supports MFA/passkeys, session revocation, and security audit events. | verified | `apps/WordGeni/SECURITY_AUDIT.md` | WordGeni protects accounts with MFA/passkeys, session controls, and persisted security audit events. |
| WordGeni guarantees AI output is always true. | remove/soften | AI verification is a review workflow, not a guarantee | WordGeni helps teams review grounding, provenance, and claim confidence before publishing. |

## CreVux

| Claim | Status | Evidence | Safe public wording |
|---|---|---|---|
| CreVux is an AI media studio for images, video, storyboards, and creative assets. | verified | `apps/CreVux/artifacts/image-gen/src/pages/landing.tsx`, `apps/CreVux/artifacts/image-gen/src/components/landing/LandingEliteMain.tsx` | CreVux helps creators move from prompts and references into generated images, video workflows, storyboards, assets, and reusable creative history. |
| CreVux supports reference uploads, private upload provenance, moderation, policy gates, and ownership checks. | verified | `apps/CreVux/SECURITY_AUDIT.md` | CreVux protects user-owned media with private upload provenance, moderation checks, policy gates, and workspace ownership validation. |
| CreVux uses credit-aware generation and job tracking. | verified | `apps/CreVux/artifacts/image-gen/src/components/landing/LandingEliteMain.tsx`, `apps/CreVux/SECURITY_AUDIT.md` | CreVux connects creative jobs, credits, billing paths, and history so users can track production work. |
| CreVux has complete device governance and all control-plane boundaries modeled. | remove/soften | `apps/CreVux/SECURITY_AUDIT.md` remaining risks | CreVux has strong workspace/media hardening and documents remaining work around richer device governance and connected-app boundaries. |
