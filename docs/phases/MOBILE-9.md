# MOBILE-9 — Security, privacy, performance, and release closeout

- Status: PLANNED
- Owning repositories: serialized root/XFlow/Verixet/Crevux work with one owner per worktree
- Dependencies: all capabilities selected for release are integrated and individually closed

## Objective and product contract

Prove the final release state: authentication, authorization, retention/deletion, media safety, accounting, telemetry privacy, accessibility, performance, resilience, signing, Play declarations, staged rollout, and rollback.

## In scope / out of scope

In scope: final threat-model closeout, dependency/security review, account deletion, backup/restore, data-safety declarations, crash/ANR/memory evidence, app-link proof, signing/release configuration, pre-launch report, and staged rollout plan. Out of scope: new features and production deployment without separate authorization.

## Acceptance and automated verification

Final unit/API/auth/instrumentation/E2E/security/build matrices pass against the exact release candidate. Cross-user access, replay, malicious media, stale URL, duplicate charge, deletion, recovery, performance, and compatibility suites pass.

## Manual proof

Physical Fold8 end-to-end proof, accessibility review, privacy/legal approval, Play pre-launch results, signing custody review, staged rollback rehearsal, and owner acceptance.

## Risks, rollback, dependencies

Release-state drift is the primary risk. Halt rollout or reduce staged percentage; do not declare PASS from earlier-phase tests or deploy without explicit authorization.
