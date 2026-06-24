# AudAiX Case Study

## Product Summary

AudAiX is the audit and evidence intelligence layer for website audits, monitoring, security checks, performance insights, and production-readiness scoring.

## Problem

Website teams need more than disconnected screenshots or one-off audit notes. They need a system that collects evidence, stores findings, tracks readiness, and makes review workflows repeatable across sites, reports, artifacts, and monitoring state.

## Solution

AudAiX provides an audit dashboard and backend workflow for registering sites, running browser-driven audits, collecting evidence, and reviewing findings and reports.

The main workflow is: register a site or workspace, run audit and evidence collection, review findings and readiness, then use reports or connector delivery paths where configured.

## Key Features

- Website, storefront, app, and project registration in isolated workspaces.
- URL-level audits through Playwright, Lighthouse, axe, route discovery, and visual evidence capture.
- Findings, reports, artifacts, schedules, baselines, trends, alerts, and connector delivery history.
- Dashboard for launch readiness, evidence review, monitoring, billing, copilot, and ecosystem connections.
- Local dashboard proof route with empty portfolio data and no evidence/API mutations.
- Connector positioning for Rataify, XFlow, and Verixet.
- Verification commands for dashboard, e2e, production env validation, production verification, and workspace-site smoke paths.

## Technical Highlights

- Frontend stack: React and Vite dashboard with TypeScript.
- Backend/API stack: Fastify and TypeScript backend with worker model.
- Database/storage: SQLite by default with optional Supabase/Postgres paths documented.
- Automation: Playwright-driven audits, Lighthouse and axe evidence capture, route discovery, artifact workflows, and connector delivery history.
- Security posture: production auth requirements, explicit CORS, artifact signing secrets, JWT/JWKS validation, and disabled API docs unless intentionally exposed.

## Architecture Role

AudAiX is the audit/evidence intelligence layer. It gives the ecosystem a way to collect browser evidence, review findings, and connect audit outputs to trust, control-plane, and validation workflows.

## Screenshots

![AudAiX desktop dashboard](../../../apps/AudAix/docs/assets/screenshots/dashboard-desktop.png)

![AudAiX mobile dashboard](../../../apps/AudAix/docs/assets/screenshots/dashboard-mobile.png)

## What This Demonstrates

- Product thinking around evidence-backed readiness instead of subjective audit notes.
- Full-stack engineering across backend workers, browser automation, dashboard UX, and storage paths.
- AI/product workflow design through copilot and evidence intelligence positioning documented in the app README.
- UX consistency through portfolio status, primary actions, empty state, and evidence hierarchy.
- Security and release discipline through auth posture, CORS, artifact signing, workspace boundaries, and verification commands.

## Current Status

| Area | Status |
| --- | --- |
| Audit dashboard and evidence workflow surfaces | Implemented |
| Local demo proof | Local demo proof available |
| Full evidence/report runtime QA | Needs runtime verification |
| Production deployment evidence | Needs runtime verification |
| Supabase/Postgres verification paths | In progress |

## Next Improvements

- Capture a configured audit workspace proof after safe runtime QA.
- Expand Supabase/Postgres verification while preserving fast local SQLite development.
- Keep connector delivery history and acknowledgement tracking visible in the dashboard.
- Add more proof around artifact signing, MFA posture, CORS, and docs exposure.
