# Crevux Case Study

## Product Summary

Crevux is the creative production studio for generating, enhancing, exporting, and managing AI-assisted visual assets.

## Problem

Creative AI workflows need more than a prompt box. A serious media product needs project organization, asset galleries, credit and billing boundaries, signed exports, account settings, and a clear distinction between launch-ready workflows and experimental media surfaces.

## Solution

Crevux provides a studio-oriented web app for image creation, enhancement, project organization, gallery review, credits, settings, and controlled export paths.

The main workflow is: start a creation or enhancement task, organize generated assets into projects or galleries, manage usage/credits, and export through verified media paths.

## Key Features

- Visual asset generation and enhancement from prompts, references, and source images.
- Projects, galleries, account settings, usage, credits, and billing surfaces.
- Media upload and export lifecycle verification.
- Signed downloads, credit debits, plan limits, and cross-user blocking tests documented in the README.
- Launch discipline that keeps advanced video, storyboard, 3D, audio, builder, and internal operations surfaces fenced until ready.
- Local dashboard proof with empty project/asset/job arrays and no credentialed API calls.
- pnpm workspace boundaries across API server, web app, shared libraries, database schema, contracts, and entitlements.

## Technical Highlights

- Frontend stack: Vite and React image-generation web app with TypeScript.
- Backend/API stack: Express API server.
- Database/storage: Drizzle/PostgreSQL packages, migrations, export contracts, entitlement packages, and signed media/export paths documented in the README.
- Workflow features: generation, enhancement, asset management, projects, credits, billing, and export lifecycle.
- Verification: pnpm lint, typecheck, tests, build, smoke, database verification, Railway build, Stripe smoke, live smoke, and package-filtered API/web builds are documented.

## Architecture Role

Crevux is the creative production studio. It shows how the ecosystem handles visually rich product workflows while preserving governance, billing boundaries, export safety, and shared verification practices.

## Screenshots

![Crevux desktop dashboard](../../../apps/CreVux/docs/assets/screenshots/dashboard-desktop.png)

![Crevux mobile dashboard](../../../apps/CreVux/docs/assets/screenshots/dashboard-mobile.png)

## What This Demonstrates

- Product thinking around a complete creative workflow, not just asset generation.
- Full-stack engineering across web, API, shared packages, database schema, entitlements, and exports.
- UX consistency with a polished visual dashboard, creation actions, asset status, and honest empty states.
- Auth/security/release discipline through signed media, cross-user blocking, credit controls, and verification commands.
- Portfolio presentation strength through a screenshot-worthy product surface.

## Current Status

| Area | Status |
| --- | --- |
| Creative dashboard and core studio surfaces | Implemented |
| Local demo proof | Local demo proof available |
| Provider generation runtime QA | Needs runtime verification |
| Production deployment evidence | Needs runtime verification |
| Advanced media surfaces | In progress |

## Next Improvements

- Capture configured provider-generation proof after safe runtime QA.
- Promote advanced media surfaces only after QA and product clarity are complete.
- Expand staging proof for checkout, credits, exports, and provider generation.
- Continue shared package migration away from temporary vendored copies.
