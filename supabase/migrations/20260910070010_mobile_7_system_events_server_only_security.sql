-- Recovered exact statement bodies from production supabase_migrations.schema_migrations.
-- Semicolon terminators were already present in the single ledger statement.
-- Version: 20260910070010; name: mobile_7_system_events_server_only_security; statement-join MD5: 4c8472a903e87479181cab58520e1cd3

REVOKE ALL PRIVILEGES ON TABLE public.system_events FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON SEQUENCE public.system_events_id_seq FROM anon, authenticated;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;
