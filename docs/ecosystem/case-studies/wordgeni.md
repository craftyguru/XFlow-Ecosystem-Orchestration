# WordGeni Case Study

## Product Summary

WordGeni is the writing and research workspace for turning ideas, sources, and project memory into verified, publish-ready content.

## Problem

AI writing tools can produce fluent text, but professional writing workflows need source context, provenance, workspace memory, reviewable edits, ingestion boundaries, and deployment separation between web, API, workers, agents, and shared packages.

## Solution

WordGeni focuses the writing workflow around source-backed drafting. It organizes projects, sources, drafts, AI editing support, provenance signals, and export preparation across a monorepo with clear package boundaries.

The main workflow is: create a project, add sources, draft with AI support, review provenance and edits, then prepare verified output for export.

## Key Features

- Research-backed drafting with source context and provenance signals.
- Project, source, draft, review, and export workflow positioning.
- Separate web, API, ingestion worker, agent runtime, and shared package surfaces.
- Shared libraries for schemas, editor behavior, provenance, retrieval, telemetry, prompts, safety, and model routing.
- Dashboard with product purpose, readiness, primary actions, empty project state, and secondary suggestions.
- Local screenshot route that disables project API loading and shows an honest empty state.
- Deployment validation, env audit, production proof validation, smoke, e2e, and mobile verification commands documented in the README.

## Technical Highlights

- Frontend stack: Next.js App Router web app with TypeScript.
- Backend/API stack: Hono API app, same-origin API proxy, route tests, and documented deployable API surface.
- Database/auth/workers: Postgres/Drizzle schema, auth, billing, observability, integrations, Temporal ingestion worker, source-processing activities, and agent runtime package are documented.
- Shared packages: editor, schema, retrieval, exporter, telemetry, UI, prompt, provenance, safety, and env libraries.
- Verification: pnpm lint, typecheck, tests, build, smoke, e2e, deploy validation, env audit, and production proof validation are documented.

## Architecture Role

WordGeni is the writing and research workspace. It contributes source-grounded content workflows to the ecosystem while following the same governance, verification, and local proof discipline as the other core apps.

## Screenshots

![WordGeni desktop dashboard](../../../apps/WordGeni/docs/assets/screenshots/dashboard-desktop.png)

![WordGeni mobile dashboard](../../../apps/WordGeni/docs/assets/screenshots/dashboard-mobile.png)

## What This Demonstrates

- Product thinking around provenance, source grounding, and reviewable AI writing workflows.
- Full-stack engineering across web, API, worker, agent runtime, shared packages, and deployment boundaries.
- UX consistency through purpose, readiness, actions, empty state, and next-step guidance.
- AI/product workflow design through retrieval, prompt, safety, provenance, telemetry, and model-routing package boundaries.
- Security/release discipline through explicit env, auth, billing, worker, and production-proof validation docs.

## Current Status

| Area | Status |
| --- | --- |
| Writing dashboard and monorepo surfaces | Implemented |
| Local demo proof | Local demo proof available |
| Ingestion/API runtime QA | Needs runtime verification |
| Production deployment evidence | Needs runtime verification |
| Live provider integrations | Needs runtime verification |

## Next Improvements

- Capture a configured project/source proof after safe runtime QA.
- Expand live verification for auth, API health, ingestion workers, billing, and AI provider paths.
- Continue tightening launch messaging around research-backed drafting and provenance.
- Keep package, env, domain, and metadata branding consistent.
