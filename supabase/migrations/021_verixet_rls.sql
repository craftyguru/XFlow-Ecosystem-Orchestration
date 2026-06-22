alter table verixet.billing_accounts enable row level security;
alter table verixet.stripe_connections enable row level security;
alter table verixet.checkout_sessions enable row level security;
alter table verixet.entitlement_decisions enable row level security;
alter table verixet.credit_ledger enable row level security;
alter table verixet.usage_admission_logs enable row level security;

drop policy if exists verixet_billing_accounts_select on verixet.billing_accounts;
create policy verixet_billing_accounts_select on verixet.billing_accounts for select
  using (core.has_workspace_app_access(workspace_id, 'verixet') or core.is_service_role());
drop policy if exists verixet_billing_accounts_service_write on verixet.billing_accounts;
create policy verixet_billing_accounts_service_write on verixet.billing_accounts for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'verixet');

drop policy if exists verixet_stripe_connections_select on verixet.stripe_connections;
create policy verixet_stripe_connections_select on verixet.stripe_connections for select
  using (core.has_workspace_app_access(workspace_id, 'verixet') or core.is_service_role());
drop policy if exists verixet_stripe_connections_service_write on verixet.stripe_connections;
create policy verixet_stripe_connections_service_write on verixet.stripe_connections for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'verixet');

drop policy if exists verixet_checkout_sessions_select on verixet.checkout_sessions;
create policy verixet_checkout_sessions_select on verixet.checkout_sessions for select
  using (core.has_workspace_app_access(workspace_id, 'verixet') or core.is_service_role());
drop policy if exists verixet_checkout_sessions_service_write on verixet.checkout_sessions;
create policy verixet_checkout_sessions_service_write on verixet.checkout_sessions for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'verixet');

drop policy if exists verixet_entitlement_decisions_select on verixet.entitlement_decisions;
create policy verixet_entitlement_decisions_select on verixet.entitlement_decisions for select
  using (core.has_workspace_app_access(workspace_id, 'verixet') or core.is_service_role());
drop policy if exists verixet_entitlement_decisions_service_write on verixet.entitlement_decisions;
create policy verixet_entitlement_decisions_service_write on verixet.entitlement_decisions for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'verixet');

drop policy if exists verixet_credit_ledger_select on verixet.credit_ledger;
create policy verixet_credit_ledger_select on verixet.credit_ledger for select
  using (core.has_workspace_app_access(workspace_id, 'verixet') or core.is_service_role());
drop policy if exists verixet_credit_ledger_service_write on verixet.credit_ledger;
create policy verixet_credit_ledger_service_write on verixet.credit_ledger for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'verixet');

drop policy if exists verixet_usage_admission_logs_select on verixet.usage_admission_logs;
create policy verixet_usage_admission_logs_select on verixet.usage_admission_logs for select
  using (core.has_workspace_app_access(workspace_id, 'verixet') or core.is_service_role());
drop policy if exists verixet_usage_admission_logs_service_write on verixet.usage_admission_logs;
create policy verixet_usage_admission_logs_service_write on verixet.usage_admission_logs for all
  using (core.is_service_role()) with check (core.is_service_role() and app_slug = 'verixet');

revoke all on schema verixet from anon, authenticated;
