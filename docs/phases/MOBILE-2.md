# MOBILE-2 — Android shell and secure intake

- Status: PLANNED
- Owning repository: Crevux
- Parent/base: approved Crevux integration baseline plus MOBILE-1 proof contract
- Dependency: MOBILE-1 PASS

## Objective and product contract

Create a professional Expo development build with first-party Kotlin foundation code for verified App Links, one-image Share Target, Photo Picker, CameraX, app-private import, and recoverable offline drafts.

## In scope / out of scope

In scope: Android configuration, URI grants, defensive copy/decode metadata, encrypted bounded cache, import preview, and process-death recovery. Out of scope: cloud upload/generation, masks, Gallery export, paid work, and production release.

## Acceptance and automated verification

- Share, picker, and camera imports never require broad storage permission.
- Reject spoofed MIME, malformed content, unsupported schemes, excessive sizes, multi-item shares, and lost grants safely.
- Mobile lint/typecheck/tests/build plus Android unit/instrumentation tests pass.

## Manual proof

Import from Samsung Gallery, picker, and camera on emulator and physical Android; verify restart recovery and cache clear.

## Risks, rollback, dependencies

Untrusted intents and large-image memory pressure are primary risks. Remove/disable intent filters and native modules to roll back without backend impact.
