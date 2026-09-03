# XFlow Ecosystem

A six-product full-stack and AI systems portfolio focused on orchestration, agent workflows, verification, trust, audit evidence, creative tooling, and research-backed content.

This workspace is the best starting point for reviewing how I design and operate connected software systems across product UI, APIs, workers, PostgreSQL-backed services, AI runtimes, security boundaries, observability, and release verification.

## Start Here

If you are reviewing this portfolio for a software or AI engineering role, start with these three areas:

1. **XFlow** — control plane, workflow orchestration, API contracts, RBAC, auditability, provider integrations, and agent/MCP-facing workflows.
2. **WordGeni** — AI runtime, retrieval, provenance, prompts, safety, model routing, source ingestion, and human review.
3. **AudAiX** — evidence-driven audit automation using browser tooling, workers, security/accessibility checks, and production-readiness workflows.

For a concise overview, see the [Recruiter Brief](docs/ecosystem/recruiter-brief.md). For deeper implementation evidence, use the [case-study index](docs/ecosystem/case-studies/README.md).

## Engineering Profile

This ecosystem demonstrates practical work across:

- **Agentic AI systems** — dedicated agent runtimes, prompt and retrieval layers, tool-oriented workflows, context handling, model routing, and human-review boundaries.
- **MCP and tool integration** — XFlow includes builder-agent and MCP-facing developer flows for external tool consumption and controlled API access.
- **Full-stack product engineering** — React/Next.js frontends, API layers, workers, background jobs, typed contracts, auth, billing, and multi-surface product workflows.
- **PostgreSQL and data boundaries** — relational persistence, workspace isolation, schema ownership, audit trails, usage/entitlement data, and production verification paths.
- **Reliability and release engineering** — smoke tests, route integrity checks, RBAC matrices, environment validation, CI gates, live verification, and fail-closed production checks.
- **Security and governance** — explicit auth boundaries, encrypted token handling, audit events, secret-management rules, tenant isolation, and documented release standards.

The goal is not to present disconnected demos. The portfolio shows how multiple applications can share engineering standards while retaining clear product, security, data, and deployment boundaries.

## Core Products

| Product | Engineering focus | Status | Case study |
| --- | --- | --- | --- |
| **XFlow** | Control plane, workflow orchestration, provider contracts, RBAC, auditability, agent/MCP workflows | Implemented | [XFlow](docs/ecosystem/case-studies/xflow.md) |
| **WordGeni** | AI runtime, retrieval, provenance, prompt/safety layers, model routing, source-backed writing | Implemented | [WordGeni](docs/ecosystem/case-studies/wordgeni.md) |
| **AudAiX** | Automated audits, browser evidence, workers, monitoring, accessibility/security checks | Implemented | [AudAiX](docs/ecosystem/case-studies/audaix.md) |
| **Verixet** | Execution validation, release gates, billing/entitlement authority, verification | Implemented | [Verixet](docs/ecosystem/case-studies/verixet.md) |
| **Rataify** | Trust, risk, scam detection, and credibility workflows | Implemented | [Rataify](docs/ecosystem/case-studies/rataify.md) |
| **Crevux** | AI-assisted creative production, asset workflows, and generation/editing surfaces | Implemented | [Crevux](docs/ecosystem/case-studies/crevux.md) |

The core ecosystem is intentionally limited to these six products. Other repositories in the account are separate projects or experiments and are not part of this architecture narrative.

## System View

```text
                        ┌──────────────────────┐
                        │        XFlow         │
                        │  Control Plane / API │
                        │ Orchestration / RBAC │
                        └──────────┬───────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
      ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
      │  WordGeni   │       │   AudAiX    │       │   Crevux    │
      │ AI Runtime  │       │ Audit/Proof │       │ Creative AI │
      │ Retrieval   │       │ Workers     │       │ Workflows   │
      └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
             │                     │                     │
             └──────────────┬──────┴──────────────┬──────┘
                            │                     │
                            ▼                     ▼
                     ┌─────────────┐       ┌─────────────┐
                     │   Verixet   │       │   Rataify   │
                     │ Validation  │       │ Trust/Risk  │
                     │ Entitlement │       │ Signals     │
                     └─────────────┘       └─────────────┘
```

The exact deployment topology varies by product, but the architectural pattern is consistent: clear service boundaries, explicit contracts, database-backed state, verification gates, and observable handoffs between systems.

## What To Inspect

For engineering review, the strongest proof is in the implementation and verification paths rather than screenshots alone:

- API and provider contracts
- Auth and RBAC enforcement
- Agent runtime and retrieval boundaries
- MCP/tool-facing integration paths
- PostgreSQL schemas and workspace isolation
- Worker/background-job design
- Route and contract verification
- CI, smoke, environment, and release gates
- Security and secret-management documentation
- Production verification notes that distinguish implemented code from unverified live state

## Architecture and Governance

- [Architecture map](docs/ecosystem/architecture.md)
- [Product map](docs/ecosystem/product-map.md)
- [Security model](docs/ecosystem/security-model.md)
- [Release model](docs/ecosystem/release-model.md)
- [Professional readiness checklist](docs/ecosystem/checklists/professional-readiness.md)
- [Recruiter brief](docs/ecosystem/recruiter-brief.md)
- [Case studies](docs/ecosystem/case-studies/README.md)

## Verification Philosophy

A recurring theme across the ecosystem is separating **implemented behavior** from **verified production behavior**.

The repositories use linting, type checks, unit/integration tests, route checks, RBAC matrices, environment validation, smoke tests, and release gates where appropriate. Production claims remain explicitly bounded when live evidence has not been collected.

That distinction is deliberate: portfolio documentation should make system capability easy to inspect without presenting local or staged behavior as proof of a production deployment.

## Current Portfolio Readiness

| Area | Status |
| --- | --- |
| Core product architecture documented | Implemented |
| Recruiter-facing case studies | Implemented |
| Security and release models | Implemented |
| App-level verification commands | Implemented |
| Cross-app operating model | Implemented |
| Production deployment proof across every core app | Needs current verification |
| Unified public demo flow | In progress |

## Why This Repository Exists

This repository is the portfolio index for the XFlow ecosystem. It is designed to answer three questions quickly:

1. **Can I build full products end-to-end?** — The six applications span UI, APIs, workers, data, auth, billing, AI, audit, and operational tooling.
2. **Can I build AI systems beyond a single model call?** — The portfolio includes agent runtimes, retrieval, prompt/safety layers, tool/MCP workflows, context handling, model routing, and review boundaries.
3. **Can I operate software with engineering discipline?** — The ecosystem includes release gates, verification matrices, security boundaries, observability, documentation, and explicit production-proof requirements.

For hiring review, begin with the [Recruiter Brief](docs/ecosystem/recruiter-brief.md), then inspect XFlow, WordGeni, and AudAiX for the strongest examples of system architecture and implementation depth.
