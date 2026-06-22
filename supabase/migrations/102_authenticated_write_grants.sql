revoke insert, update, delete on table core.workspace_app_access from authenticated, anon;
revoke insert, update, delete on table core.app_connections from authenticated, anon;
revoke insert, update, delete on table core.entitlements from authenticated, anon;
revoke insert, update, delete on table core.usage_events from authenticated, anon;
revoke insert, update, delete on table core.billing_events from authenticated, anon;
revoke insert, update, delete on table core.audit_logs from authenticated, anon;

grant select on table core.workspace_app_access to authenticated;
grant select on table core.app_connections, core.entitlements, core.usage_events, core.billing_events, core.audit_logs to authenticated;
