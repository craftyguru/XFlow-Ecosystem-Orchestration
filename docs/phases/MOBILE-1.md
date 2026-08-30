# MOBILE-1 — XFlow Android authentication proof

- Status: PLANNED
- Owning repository: XFlow
- Parent/base: approved integration baseline containing MOBILE-0 PASS
- Dependency: MOBILE-0 PASS

## Objective and product contract

Prove an Android public OAuth client using the external system browser, Authorization Code with PKCE S256, an exact verified HTTPS App Link, short-lived access tokens, single-use refresh rotation, revocation, logout, and account-deletion propagation. No secret is embedded in the APK and no WebView cookie flow is accepted.

## In scope / out of scope

In scope: test-environment client registration, redirect/scopes, public-client token path, refresh family, revocation, satellite validation contract, and proof client. Out of scope: Crevux generation, billing, schemas outside approved XFlow auth changes, production registration, and MOBILE-2.

## Acceptance and automated verification

- Existing confidential and Chronicle clients remain compatible.
- Tests cover PKCE/state, exact redirects, replayed codes, rotated refresh tokens, revocation, invalid audience/scope, and secret absence.
- XFlow lint, typecheck, focused/full auth tests, build, and applicable security gates pass on final code.

## Manual proof

Complete test-environment login/logout on an emulator and physical Android device; capture App Link verification and refresh-after-restart evidence.

## Risks, rollback, dependencies

Deep-link interception and token theft are primary risks. Gate the Android client registration/feature and disable it for rollback. Do not start without MOBILE-0 PASS.
