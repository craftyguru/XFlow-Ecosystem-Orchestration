# Professional Readiness Checklist

Use this checklist before presenting any core app externally.

## README Quality

- [ ] Product name is canonical and consistent.
- [ ] First screen explains what the app does and why it exists.
- [ ] Quick Start uses commands that exist in `package.json`.
- [ ] Architecture and verification sections are present.
- [ ] Ecosystem position links back to the central docs hub.
- [ ] Local links resolve from GitHub.

## License And Governance

- [ ] `LICENSE` matches `package.json` license metadata.
- [ ] `CODE_OF_CONDUCT.md` exists.
- [ ] `CONTRIBUTING.md` exists and uses repo-specific commands.
- [ ] `SECURITY.md` gives private reporting guidance.
- [ ] `SUPPORT.md` explains bug, feature, and security channels honestly.

## Release Hygiene

- [ ] `CHANGELOG.md` follows Keep a Changelog-style sections.
- [ ] Current package version has a baseline entry dated `2026-06-24` or newer.
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` exists.
- [ ] `.github/release.yml` categorizes release notes.
- [ ] Issue templates exist for bugs and feature requests.

## Screenshots And Product Media

- [ ] README uses real screenshots or product media when available.
- [ ] Missing screenshots are not represented as shipped evidence.
- [ ] Product media does not show secrets, private data, or misleading metrics.
- [ ] Public-facing screenshots match current app branding.

## UX Polish

- [ ] Main navigation and first-run flow are understandable.
- [ ] Empty states are honest and actionable.
- [ ] Mobile and narrow-screen layouts are acceptable for public apps.
- [ ] No fake production state is shown as real user data.

## CI And Security

- [ ] Lint, typecheck, test, and build commands are documented where defined.
- [ ] Live checks are separated from local-safe checks.
- [ ] Security-sensitive routes have targeted tests or review notes.
- [ ] Dependency and secret hygiene checks are documented where available.

## Deployment Docs

- [ ] Required environment variables are documented without live secrets.
- [ ] Deployment target and start command are clear.
- [ ] Migration or database setup is documented where applicable.
- [ ] Rollback or recovery notes exist for production-facing apps.

## Monitoring

- [ ] Health or readiness endpoints are documented where implemented.
- [ ] Logging and request correlation expectations are clear.
- [ ] Alerting or incident paths are documented where implemented.
- [ ] Monitoring claims are marked needs verification unless current evidence exists.

## SEO And Accessibility For Public Apps

- [ ] Page titles and descriptions are product-specific.
- [ ] Social preview assets are real and current.
- [ ] Basic accessibility checks are part of the release path where applicable.
- [ ] Public docs or marketing URLs are only linked after verification.
