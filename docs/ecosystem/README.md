# XFlow Ecosystem Hub

The XFlow ecosystem is a six-app portfolio for controlling workflows, validating execution, assessing trust, producing evidence, and supporting creative and writing workflows from one governed platform.

## Ecosystem Pitch

XFlow connects six specialized apps through shared identity, governance, verification, and release discipline so each product can stand alone while still proving it belongs to a larger operating system.

The core ecosystem is limited to XFlow, Verixet, Rataify, AudAiX, Crevux, and WordGeni. Other apps in the workspace are personal projects, experiments, or separate portfolio products and are not part of the core ecosystem narrative.

## What The Platform Does

- Coordinates workspace identity, app access, connection state, and ecosystem workflow routing.
- Separates product roles so control-plane, billing, validation, audit, trust, creative, and writing workflows do not blur together.
- Uses repeatable verification and release hygiene instead of relying on informal demo readiness.
- Keeps shared documentation, governance files, support/security policies, and release templates consistent across app repos.

## Why It Exists

The portfolio is designed to show professional product engineering across several connected apps: clear ownership boundaries, evidence-backed claims, practical launch readiness, and a reviewer path that does not require private context. Status is intentionally conservative: shipped code and docs are marked as implemented, active work is marked in progress, future surfaces are planned, and deployment claims remain needs verification unless proven.

## Product Map

| Product | Role | Status | Primary repo |
| --- | --- | --- | --- |
| XFlow | Ecosystem control plane and workflow orchestration | implemented | [XFlow repo](../../apps/XFlow) |
| Verixet | Execution validation, billing authority, usage metering, and release gate | implemented | [Verixet repo](../../apps/Verixet) |
| Rataify | Trust, risk, scam detection, and website credibility layer | implemented | [Rataify repo](../../apps/RatAiFy) |
| AudAiX | Audit, evidence, monitoring, and intelligence layer | implemented | [AudAiX repo](../../apps/AudAix) |
| Crevux | Creative production and asset workflow studio | implemented | [Crevux repo](../../apps/CreVux) |
| WordGeni | AI writing, research, source, and provenance workspace | implemented | [WordGeni repo](../../apps/WordGeni) |

See [product-map.md](product-map.md) for a role-by-role diagram and deeper product summaries.

See [product-proof.md](product-proof.md) for the current screenshot inventory, verified captures, and local proof harness notes.

See the [case-study index](case-studies/README.md) and [recruiter brief](recruiter-brief.md) for reviewer-facing product summaries grounded in current docs and screenshot proof.

## Architecture Map

XFlow owns the ecosystem control plane, Verixet owns release and entitlement authority, and the satellite apps own domain workflows. The shared model is hub-and-spoke with explicit service boundaries rather than one large application.

See [architecture.md](architecture.md).

## UX And Navigation Standards

Phase 4 audit docs define the target product-family experience without changing runtime app code:

- [UX audit](ux-audit.md)
- [Navigation standard](navigation-standard.md)
- [Dashboard standard](dashboard-standard.md)
- [UI state standard](ui-state-standard.md)

## Shared Standards

- Canonical core product names: XFlow, Verixet, Rataify, AudAiX, Crevux, WordGeni.
- Every core app repo should expose clear README, license/governance, security, support, changelog, issue, PR, and release-note surfaces.
- Public-facing claims must be evidence-backed or marked needs verification.
- Support and security guidance must avoid fake public contact addresses.
- Local links are preferred until a public docs URL is verified live.

## Verification And Release Model

Each core app keeps repo-local scripts and CI posture, while the ecosystem docs define the release hygiene pattern: local-safe checks first, live checks only when configured, and status labels that distinguish implemented work from verified deployment.

See [release-model.md](release-model.md).

## Security And Support Model

Security reporting is private-first. Public issues should not contain undisclosed vulnerabilities, live secrets, customer data, tokens, private logs, or exploitable details. Support guidance is honest for private/internal repos and uses repository owner or configured support channels unless a real public contact is already documented.

See [security-model.md](security-model.md).

## Repo Index

| Repo | README | Governance | Position |
| --- | --- | --- | --- |
| [XFlow](../../apps/XFlow) | [README](../../apps/XFlow/README.md) | implemented | control plane |
| [Verixet](../../apps/Verixet) | [README](../../apps/Verixet/README.md) | implemented | execution gate |
| [Rataify](../../apps/RatAiFy) | [README](../../apps/RatAiFy/README.md) | implemented | trust/risk layer |
| [AudAiX](../../apps/AudAix) | [README](../../apps/AudAix/README.md) | implemented | audit/evidence layer |
| [Crevux](../../apps/CreVux) | [README](../../apps/CreVux/README.md) | implemented | creative studio |
| [WordGeni](../../apps/WordGeni) | [README](../../apps/WordGeni/README.md) | implemented | writing workspace |

## Roadmap

| Item | Status |
| --- | --- |
| Central docs hub and product map | implemented |
| App README professionalization | implemented |
| Governance and release templates across the six core apps | implemented |
| Public deployment proof for the six core apps | needs verification |
| Unified live ecosystem demo path | planned |
| Cross-app release evidence packet | in progress |
| Portfolio screenshots and media proof refresh | in progress; see [product-proof.md](product-proof.md) |
| Public docs URL | needs verification |

## Portfolio Positioning

This workspace is positioned as a professional product ecosystem, not a pile of demos. The reviewer story is the engineering discipline: app boundaries, shared governance, release evidence, security posture, and honest status labeling. The portfolio can be read by recruiters, investors, or developers without requiring private production access.

Reviewer entry points:

- [Recruiter brief](recruiter-brief.md)
- [Case-study index](case-studies/README.md)
- [Product proof inventory](product-proof.md)

## Readiness Checklist

Use [checklists/professional-readiness.md](checklists/professional-readiness.md) to review each core app before external presentation.
