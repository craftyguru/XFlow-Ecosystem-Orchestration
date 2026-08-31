# Canonical ecosystem database bootstrap

The ecosystem orchestration repository is the sole canonical authority for shared authentication
and profile schema: Supabase `auth`, `core`, shared profile/onboarding structures, RLS, grants, and
shared functions. XFlow does not own or duplicate that hosted schema.

## Authoritative order

1. Start an empty Supabase-compatible Auth/PostgreSQL environment.
2. Apply every repository-owned file in `supabase/migrations` in filename order.
3. Execute the shared-schema validation and RLS gates.
4. Apply XFlow's repository-owned `drizzle/migrations` in journal order.

XFlow migration `0052_first_run_onboarding_state.sql` alters `core.profiles`; therefore the shared
schema is a hard prerequisite, not an optional bootstrap convenience.

## Executable proof

From an orchestration checkout with an XFlow checkout at `apps/XFlow`:

```powershell
npm run test:shared-schema-bootstrap
npm run prove:shared-schema-bootstrap -- --xflow-dir=apps/XFlow
```

The proof creates a disposable, loopback-only Supabase CLI stack with Auth and PostgreSQL. It does
not use a hosted project or production data. It verifies:

- missing `core.profiles` fails before Drizzle records migration state;
- incompatible text/UUID/Auth relationships fail closed;
- empty platform database -> canonical shared schema -> XFlow current succeeds;
- canonical shared schema + XFlow through `0051` upgrades through `0052` and current;
- applying validation/migration runners to an already-current database does not change history.

The temporary project, Docker containers, volumes, and generated partial migration fixture are
removed in a `finally` cleanup. Migration sources remain in their owning repositories.

`063_private_rls_helpers.sql` is the idempotent prerequisite for the storyboard policies in `064`.
It matches the helpers reasserted by the later production hardening migration, so an environment
whose history already passed that hardening may safely record the missing prerequisite using the
CLI's `--include-all` behavior. No already-published migration is edited.

## Local XFlow compatibility shim

XFlow's `scripts/bootstrap-local-nav-qa-auth-schema.ts` is retained only as a local navigation-QA
compatibility fixture. Its text-ID tables are not schema parity, are not valid hosted bootstrap, and
must not become a second schema authority.

## Drift

This phase does not read production or staging databases. Until a separately authorized, safe
schema-only managed connection is available, production/staging drift is **MANUAL VERIFICATION
REQUIRED**. Verification must inspect metadata only; it must not read rows or mutate any database.
