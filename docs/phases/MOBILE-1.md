# MOBILE-1 — XFlow Android authentication proof

- Status: PLANNED
- Owning repository: XFlow
- Parent/base: approved integration baseline containing MOBILE-0 PASS
- Dependency: MOBILE-0 PASS

## Objective and product contract

Prove the staging-classified `crevux-android-test` Android public OAuth client using `https://mobile-test.xflowx.com`, the external system browser, Authorization Code with PKCE S256, exact callback `https://mobile-test.crevux.com/mobile/oauth/callback`, short-lived access tokens, single-use refresh rotation, revocation, logout, and account-deletion propagation. The package is `com.crevux.mobile`. No secret is embedded in the APK and no WebView cookie flow is accepted.

## In scope / out of scope

In scope: the separate `crevux-android-test` registration, exact test redirect/scopes, public-client token path, refresh family, revocation, environment-bound satellite validation contract, dedicated test certificate association at `mobile-test.crevux.com`, and proof client. Out of scope: Crevux generation, billing, schemas outside approved XFlow auth changes, production registration or production Digital Asset Links, and MOBILE-2.

## Acceptance and automated verification

- Existing confidential and Chronicle clients remain compatible.
- Tests cover PKCE/state, exact redirects, replayed codes, rotated refresh tokens, revocation, invalid audience/scope, and secret absence.
- The test deployment is explicitly classified `staging`; environment selection is explicit and fails closed when missing, unknown, or inconsistent.
- Tests require issuer `https://mobile-test.xflowx.com` and client audience `crevux-android-test`, reject production-issued or production-audience tokens, and prove that codes, tokens, and token families cannot cross environments.
- The test and production clients are separate registrations with no wildcard origin or callback. Digital Asset Links for `mobile-test.crevux.com` contain only package `com.crevux.mobile` and the dedicated test certificate association; production associations remain unchanged.
- XFlow lint, typecheck, focused/full auth tests, build, and applicable security gates pass on final code.

## Manual proof

Complete test-environment login/logout on an emulator and physical Android device; capture exact App Link verification, callback routing, issuer/audience validation, cross-environment rejection, refresh-after-restart, replay-family revocation, and logout evidence.

## Risks, rollback, dependencies

Deep-link interception, environment confusion, and token theft are primary risks. Gate the Android test client registration/feature and disable it for rollback. Rollback removes only the test registration, test deployment, test DNS, test Digital Asset Links association, disposable test data, and test token families; it does not change production registrations or certificates. Do not start without MOBILE-0 PASS.
