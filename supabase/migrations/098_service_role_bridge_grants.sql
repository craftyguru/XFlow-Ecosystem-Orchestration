-- Minimal pre-validation bridge grants for server-only writes.
--
-- The Phase 1 validation in 099_validation_checks.sql verifies that Verixet can
-- write entitlement/usage decisions and core audit/usage events via the
-- service_role before broader Data API grants are applied in 100_api_role_grants.sql.
-- Do not grant anon or authenticated writes here.

grant usage on schema core to service_role;
grant usage on schema verixet to service_role;

grant insert on table verixet.entitlement_decisions to service_role;
grant insert on table verixet.usage_admission_logs to service_role;
grant insert on table core.audit_logs to service_role;
grant insert on table core.usage_events to service_role;
