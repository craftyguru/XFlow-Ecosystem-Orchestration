# Remaining Security Risks

Date: 2026-05-10

## Summary

No unresolved blocker-class issue was left in the code paths fixed during this pass. The remaining items are release-gate, staging-verification, or policy-hardening work that should be handled before a high-confidence production security signoff.

## Remaining Risks

| Severity | Risk | Recommended next action |
| --- | --- | --- |
| Medium | Supabase RLS proof was static only; live DB RLS tests require staging credentials and `RUN_RLS_DB_TESTS=1`. | Run live RLS tests against disposable staging database. |
| Medium | Broad authenticated select grants rely on RLS. | Keep migration-level proof and review every new table for least privilege. |
| Medium | Superadmin/passkey/MFA enforcement is app-local where present; a portable cross-app MFA freshness claim should be centralized through XFlow. | Define and enforce a shared claim in XFlow handoff/session model. |
| Medium | Authenticated persona proof is now complete for the local harness, but equivalent disposable staging proof still needs a separate non-production staging target. | Run the same harness against an explicitly marked staging Supabase and staging app URLs. |
| Low | Trust/footer copy was not exhaustively rendered in browser for all six deployed frontends during this pass. | Run visual/browser pass after security gates are green. |

## Fixes Applied

The XFlow release-gate risks previously listed here were fixed on 2026-05-10. `apps/XFlow` now passes `npm run typecheck` and `npm run verify:ci`; the consent page/API route entries are covered by the route manifest and auth matrices.

The 2026-05-10 live attack-simulation pass added source fixes for XFlow, AudAiX, and CreVux direct-access findings. Those services were redeployed through their linked Railway production services and re-proved with `output/live-attack-simulation-after-deploy-nocache-2026-05-10.json`, which passed 270/270 probes.

The 2026-05-10 authenticated persona pass added `scripts/authenticated-persona-security-simulation.mjs` and ran it against the proof URLs. Available probes passed 78/78, but 9 authenticated persona classes remain blocked because no staging-safe session fixtures were provided.

The 2026-05-10 fixture pass added `scripts/setup-staging-security-personas.mjs`, added requested persona env aliases to the harness, and generated `output/dev/auth-personas.fixture.local.json` as an ignored local template. The helper now supports local/staging seeding and session minting, but refused seeding/mutation against production-like proof URLs and printed only redacted readiness data.

The 2026-05-10 local authenticated harness is now complete on this Windows machine. Local Supabase, all six app ports, disposable persona seeding, XFlow cookie minting, app-specific route contracts, and the authenticated simulation passed with 645/645 probes, 0 failed, and 0 blocked.

See `docs/security/security-fixes-applied.md`.

## Verification Commands Run

All requested commands were attempted. Passed commands and failed commands are listed in `docs/security/ecosystem-security-audit.md`.
