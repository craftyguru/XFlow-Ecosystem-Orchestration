# Ownership Verification E2E QA Checklist

Scope: XFlow canonical ownership verification with RatAiFy and AudAiX consumers. PitStrike, JournOwl, UrSite, and 1ofAKindPiece remain standalone unless they are active-workspace XFlow-managed app records.

## Scenario 1: New XFlow App
- Add an app with a primary URL.
- Confirm save succeeds as an unverified draft.
- Confirm Ownership is Pending or Not verified.
- Confirm Setup complete is not shown.
- Confirm DNS TXT, HTML meta, and HTML file instructions appear.
- Confirm Recheck can mark ownership verified or failed with a visible reason.

## Scenario 2: Legacy XFlow App
- Open an existing app without an ownership record.
- Confirm the app remains visible.
- Confirm it shows: "This app was added before ownership verification existed. Verify ownership to unlock trusted ecosystem status."
- Confirm Verify ownership opens/generates instructions.
- Confirm the app is not hidden or treated as broken.

## Scenario 3: URL Changed
- Change an app primary URL after ownership was verified.
- Confirm the existing ownership status becomes Stale.
- Confirm the UI requires a recheck before trusted ecosystem status returns.

## Scenario 4: RatAiFy Trusted Scan Blocked
- Use an XFlow-linked RatAiFy target with XFlow ownership pending, unverified, failed, stale, or missing.
- Start a trusted scan.
- Confirm the scan is blocked.
- Confirm the blocked state says ownership verification is required.
- Confirm the Verify in XFlow deep-link appears.

## Scenario 5: RatAiFy Trusted Scan Allowed
- Use an XFlow-linked RatAiFy target with XFlow ownership verified or manually verified.
- Start a trusted scan or trust evidence publish.
- Confirm the flow is allowed.
- Confirm UI says Ownership verified by XFlow or Manually verified in XFlow, not bare "Verified."

## Scenario 6: AudAiX Public Audit Allowed
- Add/run a public URL audit without ownership verification.
- Confirm the audit runs.
- Confirm UI/API metadata says `audit_scope=public_url`, `ownership_verified=false`, and `trust_level=limited_public`.
- Confirm UI says "Public URL audit — ownership not verified."

## Scenario 7: AudAiX Security Scan Blocked
- Use an XFlow-linked AudAiX target without XFlow ownership verification.
- Start a security scan, monitoring, private report, or trusted evidence publish.
- Confirm the flow is blocked.
- Confirm the Verify ownership in XFlow deep-link appears.

## Scenario 8: AudAiX Security Scan Allowed
- Use an XFlow-linked AudAiX target with XFlow ownership verified or manually verified.
- Start a security scan.
- Confirm the flow is allowed.
- Confirm UI says Verified-owned audit, Ownership verified by XFlow, and Trust level: Verified workspace.

## Scenario 9: Standalone Apps
- Check PitStrike, JournOwl, UrSite, and 1ofAKindPiece.
- Confirm they are not forced into ownership gates as standalone/showcase/domain-hygiene sites.
- Confirm ownership gates apply only if one is explicitly added as an active-workspace XFlow-managed app record.
