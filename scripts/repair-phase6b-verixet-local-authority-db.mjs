#!/usr/bin/env node
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requireFromVerixet = createRequire(path.join(repoRoot, "apps", "Verixet", "package.json"));
const postgres = requireFromVerixet("postgres");

const envSources = new Map();

function loadDotenv(relativePath, options = {}) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return false;
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (options.override || process.env[key] === undefined) {
      process.env[key] = value;
      envSources.set(key, relativePath);
    }
  }
  return true;
}

function log(message) {
  console.log(`[phase6b-verixet-db-repair] ${message}`);
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function assertLocalOrStagingRepair() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing Phase 6B Verixet DB repair while NODE_ENV=production.");
  }
  if (process.env.PHASE6B_REPAIR_VERIXET_LOCAL_AUTHORITY_DB !== "true") {
    throw new Error(
      "Set PHASE6B_REPAIR_VERIXET_LOCAL_AUTHORITY_DB=true to confirm this local/staging-only repair.",
    );
  }
}

async function repair(sql) {
  await sql`create extension if not exists pgcrypto`;

  await sql`
    create table if not exists requests_log (
      id text primary key default gen_random_uuid()::text,
      user_id text,
      workspace_id text,
      api_key_id text,
      request_id text,
      endpoint text not null,
      outcome text not null default 'success',
      http_status integer,
      request_body jsonb,
      response_body jsonb,
      error_code text,
      engine_name text,
      request_body_truncated boolean not null default false,
      response_body_truncated boolean not null default false,
      outcome_reason text,
      latency_ms integer,
      client_ip text,
      client_region text,
      created_at timestamp with time zone not null default now()
    )
  `;
  await sql`alter table requests_log add column if not exists client_ip text`;
  await sql`alter table requests_log add column if not exists client_region text`;

  await sql`
    create table if not exists verixet_schema_meta (
      singleton text primary key not null,
      schema_version integer not null
    )
  `;
  await sql`
    insert into verixet_schema_meta (singleton, schema_version)
    values ('singleton', 3)
    on conflict (singleton) do update set schema_version = excluded.schema_version
  `;

  await sql`alter table workspaces add column if not exists slug text`;
  await sql`alter table workspaces add column if not exists owner_user_id text`;
  await sql`alter table workspaces add column if not exists ecosystem_workspace_id text`;
  await sql`alter table workspaces add column if not exists policy_mode text not null default 'advisory'`;
  await sql`alter table workspaces add column if not exists policy_pack text not null default 'ai_coding'`;
  await sql`alter table workspaces add column if not exists commerce_mode text not null default 'catalog_only'`;
  await sql`alter table workspaces add column if not exists billing_mode text not null default 'not_selected'`;
  await sql`
    update workspaces
    set slug = lower(regexp_replace(coalesce(nullif(name, ''), id), '[^a-zA-Z0-9]+', '-', 'g'))
    where slug is null or slug = ''
  `;
  await sql`create unique index if not exists workspaces_slug_unique on workspaces (slug)`;
  await sql`
    create unique index if not exists workspaces_ecosystem_workspace_id_unique
    on workspaces (ecosystem_workspace_id)
    where ecosystem_workspace_id is not null
  `;

  await sql`
    create table if not exists audit_events (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      actor_user_id text,
      action text not null,
      target_type text not null,
      target_id text,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create index if not exists audit_events_workspace_created_idx
    on audit_events (workspace_id, created_at)
  `;

  await sql`
    create table if not exists billing_accounts (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      name text not null,
      provider text not null default 'stripe',
      stripe_customer_id text,
      billing_email text,
      currency text not null default 'usd',
      status text not null default 'active',
      is_default boolean not null default false,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create unique index if not exists billing_accounts_provider_stripe_customer_unique
    on billing_accounts (provider, stripe_customer_id)
    where stripe_customer_id is not null
  `;
  await sql`
    create unique index if not exists billing_accounts_workspace_default_unique
    on billing_accounts (workspace_id)
    where is_default = true
  `;
  await sql`
    create index if not exists billing_accounts_workspace_id_idx
    on billing_accounts (workspace_id)
  `;

  await sql`
    create table if not exists subscriptions (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      user_id text,
      billing_account_id text,
      product_key text,
      plan_key text,
      price_key text,
      stripe_customer_id text,
      stripe_subscription_id text,
      status text not null,
      trial_ends_at timestamp with time zone,
      started_at timestamp with time zone,
      ends_at timestamp with time zone,
      payment_status text,
      cancel_at_period_end boolean not null default false,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create unique index if not exists subscriptions_stripe_subscription_unique
    on subscriptions (stripe_subscription_id)
    where stripe_subscription_id is not null
  `;
  await sql`
    create index if not exists subscriptions_workspace_app_env_status_idx
    on subscriptions (workspace_id, app_key, environment, status)
  `;

  await sql`
    create table if not exists credit_balances (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      user_id text,
      credit_key text not null,
      balance bigint not null default 0,
      expires_at timestamp with time zone,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create index if not exists credit_balances_workspace_app_env_credit_idx
    on credit_balances (workspace_id, app_key, environment, credit_key)
  `;
  await sql`
    create unique index if not exists credit_balances_workspace_app_env_user_credit_unique
    on credit_balances (workspace_id, app_key, environment, user_id, credit_key)
    where user_id is not null
  `;
  await sql`
    create unique index if not exists credit_balances_workspace_app_env_credit_null_user_unique
    on credit_balances (workspace_id, app_key, environment, credit_key)
    where user_id is null
  `;

  await sql`
    create table if not exists credit_transactions (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      user_id text,
      credit_balance_id text,
      credit_key text not null,
      transaction_type text not null,
      delta bigint not null,
      reason text,
      reference_type text,
      reference_id text,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create index if not exists credit_transactions_workspace_app_env_created_idx
    on credit_transactions (workspace_id, app_key, environment, created_at)
  `;
  await sql`
    create unique index if not exists credit_transactions_workspace_app_env_credit_reference_unique
    on credit_transactions (workspace_id, app_key, environment, credit_key, transaction_type, reference_id)
    where reference_id is not null
  `;

  await sql`
    create table if not exists usage_events (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      user_id text,
      feature_key text not null,
      units bigint not null default 0,
      cost_estimate_micro_usd bigint not null default 0,
      idempotency_key text,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create index if not exists usage_events_workspace_app_env_feature_created_idx
    on usage_events (workspace_id, app_key, environment, feature_key, created_at)
  `;
  await sql`
    create unique index if not exists usage_events_workspace_idempotency_unique
    on usage_events (workspace_id, idempotency_key)
    where idempotency_key is not null
  `;

  await sql`
    create table if not exists users (
      id text primary key default gen_random_uuid()::text,
      email text not null unique,
      ecosystem_user_id text,
      supabase_user_id text,
      session_version integer not null default 0,
      suspended_at timestamp with time zone,
      welcome_email_sent_at timestamp with time zone,
      stripe_customer_id text,
      stripe_subscription_id text,
      stripe_subscription_status text,
      created_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists auth_rate_buckets (
      bucket_key text primary key,
      count integer not null default 0,
      window_started_at timestamp with time zone not null,
      expires_at timestamp with time zone not null
    )
  `;
  await sql`
    create index if not exists auth_rate_buckets_expires_at_idx
    on auth_rate_buckets (expires_at)
  `;

  await sql`
    create table if not exists auth_security_events (
      id uuid primary key default gen_random_uuid(),
      event_type text not null,
      user_id text,
      ip text,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create index if not exists auth_security_events_type_created_idx
    on auth_security_events (event_type, created_at)
  `;
  await sql`
    create index if not exists auth_security_events_user_created_idx
    on auth_security_events (user_id, created_at)
  `;

  await sql`
    create table if not exists dashboard_sessions (
      id uuid primary key default gen_random_uuid(),
      user_id text not null,
      session_version integer not null,
      ip text,
      user_agent text,
      created_at timestamp with time zone not null default now(),
      last_seen_at timestamp with time zone not null default now(),
      expires_at timestamp with time zone not null,
      revoked_at timestamp with time zone
    )
  `;
  await sql`
    create index if not exists dashboard_sessions_user_created_idx
    on dashboard_sessions (user_id, created_at)
  `;
  await sql`
    create index if not exists dashboard_sessions_user_version_expires_idx
    on dashboard_sessions (user_id, session_version, expires_at)
  `;
  await sql`
    create index if not exists dashboard_sessions_expires_at_idx
    on dashboard_sessions (expires_at)
  `;
  await sql`
    create index if not exists dashboard_sessions_revoked_at_idx
    on dashboard_sessions (revoked_at)
  `;

  await sql`
    create table if not exists platform_super_admins (
      user_id text primary key,
      granted_by_user_id text,
      reason text,
      created_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists user_profiles (
      user_id text primary key,
      username text unique,
      display_name text,
      system_state text not null default 'pending_verification',
      created_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists legal_acceptances (
      id text primary key default gen_random_uuid()::text,
      user_id text not null,
      workspace_id text,
      terms_version text not null,
      privacy_version text not null,
      billing_terms_version text,
      risk_version text not null,
      acceptable_use_version text not null,
      cookie_version text not null,
      accepted_at timestamp with time zone not null default now(),
      source_app_slug text,
      source_surface text,
      ip text,
      user_agent text,
      ip_hash text,
      user_agent_hash text
    )
  `;

  await sql`alter table workspaces add column if not exists default_stripe_price_id text`;
  await sql`alter table workspaces add column if not exists last_verified_at timestamp with time zone`;
  await sql`alter table workspaces add column if not exists last_verified_run_id text`;
  await sql`alter table workspaces add column if not exists billing_verification_status text not null default 'none'`;
  await sql`alter table workspaces add column if not exists verification_override_at timestamp with time zone`;
  await sql`alter table workspaces add column if not exists verification_override_reason text`;
  await sql`alter table workspaces add column if not exists verification_override_actor_user_id text`;
  await sql`alter table workspaces add column if not exists require_step_up_for_billing_credentials boolean not null default false`;
  await sql`alter table workspaces alter column id set default gen_random_uuid()::text`;
  await sql`alter table workspaces alter column created_at set default now()`;
  await sql`alter table workspaces alter column updated_at set default now()`;
  await sql`alter table workspaces alter column plan set default 'elite'`;
  await sql`alter table workspace_members add column if not exists id text`;
  await sql`update workspace_members set id = gen_random_uuid()::text where id is null`;
  await sql`alter table workspace_members alter column id set default gen_random_uuid()::text`;
  await sql`alter table workspace_members alter column id set not null`;
  await sql`alter table workspace_members alter column created_at set default now()`;
  await sql`alter table audit_events alter column id set default gen_random_uuid()::text`;
  await sql`alter table billing_accounts alter column id set default gen_random_uuid()::text`;
  await sql`alter table subscriptions alter column id set default gen_random_uuid()::text`;
  await sql`alter table credit_balances alter column id set default gen_random_uuid()::text`;
  await sql`alter table credit_transactions alter column id set default gen_random_uuid()::text`;
  await sql`alter table usage_events alter column id set default gen_random_uuid()::text`;
  await sql`
    create unique index if not exists workspace_members_workspace_user_unique
    on workspace_members (workspace_id, user_id)
  `;

  await sql`
    create table if not exists stripe_webhook_events (
      event_id text primary key,
      created_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists stripe_webhook_processing (
      event_id text primary key,
      event_type text not null,
      processing_status text not null default 'pending',
      last_error text,
      quarantine_detail jsonb,
      replay_count integer not null default 0,
      workspace_id text,
      received_at timestamp with time zone not null default now(),
      processed_at timestamp with time zone
    )
  `;

  await sql`
    create table if not exists meter_apps (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      display_name text not null,
      environment text not null default 'live',
      source_system text,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create unique index if not exists meter_apps_workspace_app_env_unique
    on meter_apps (workspace_id, app_key, environment)
  `;

  await sql`
    create table if not exists api_keys (
      id text primary key default gen_random_uuid()::text,
      user_id text not null,
      workspace_id text not null,
      key_hash text not null unique,
      key_prefix text not null,
      label text,
      plan text not null default 'free',
      rate_limit integer not null default 1000,
      last_used_at timestamp with time zone,
      scopes jsonb not null default '[]'::jsonb,
      environment text not null default 'live',
      revoked_at timestamp with time zone,
      sunset_at timestamp with time zone,
      created_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists connected_apps (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      xflow_app_slug text,
      xflow_workspace_id text,
      callback_url text,
      control_plane_url text,
      status text not null default 'active',
      source text,
      metadata jsonb not null default '{}'::jsonb,
      linked_by_user_id text,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists meter_app_xflow_links (
      id text primary key default gen_random_uuid()::text,
      meter_app_id text unique not null,
      link_status text not null default 'unlinked',
      xflow_target_slug text,
      xflow_workspace_id text,
      xflow_app_id text,
      xflow_app_slug text,
      base_url_hint text,
      linked_at timestamp with time zone,
      last_link_sync_at timestamp with time zone,
      last_verify_at timestamp with time zone,
      last_verify_result jsonb,
      last_xflow_outbound_signal_verified_at timestamp with time zone,
      last_xflow_outbound_signal_correlation_id text,
      last_error text,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;
  await sql`alter table meter_app_xflow_links add column if not exists id text`;
  await sql`update meter_app_xflow_links set id = gen_random_uuid()::text where id is null`;
  await sql`alter table meter_app_xflow_links alter column id set default gen_random_uuid()::text`;
  await sql`alter table meter_app_xflow_links alter column id set not null`;
  await sql`alter table meter_app_xflow_links add column if not exists xflow_app_id text`;
  await sql`alter table meter_app_xflow_links add column if not exists base_url_hint text`;
  await sql`alter table meter_app_xflow_links add column if not exists last_verify_result jsonb`;
  await sql`alter table meter_app_xflow_links add column if not exists last_error text`;
  await sql`alter table meter_app_xflow_links alter column created_at set default now()`;
  await sql`alter table meter_app_xflow_links alter column updated_at set default now()`;

  await sql`
    create table if not exists app_catalog (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      display_name text not null,
      sync_source text not null default 'manual',
      metadata jsonb not null default '{}'::jsonb,
      last_synced_at timestamp with time zone,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists app_products (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      product_key text not null,
      name text not null,
      description text not null default '',
      stripe_product_id text,
      active boolean not null default true,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists app_prices (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      app_product_id text not null,
      price_key text not null,
      stripe_price_id text,
      price_kind text not null default 'subscription',
      amount_micro_usd bigint not null default 0,
      currency text not null default 'usd',
      interval text not null default 'month',
      usage_type text not null default 'flat',
      credit_amount bigint,
      active boolean not null default true,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists subscription_items (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      subscription_id text not null,
      price_key text,
      feature_key text,
      stripe_subscription_item_id text,
      quantity integer not null default 1,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists feature_limits (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      user_id text,
      feature_key text not null,
      plan_key text,
      entitlement_type text not null,
      monthly_limit bigint,
      credit_cost_units bigint,
      is_cost_bearing boolean not null default false,
      upgrade_path text,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists bundle_plans (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      bundle_key text not null,
      name text not null,
      description text not null default '',
      active boolean not null default true,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists bundle_app_access (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      bundle_plan_id text not null,
      target_app_key text not null,
      active boolean not null default true,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists commerce_products (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      meter_app_id text not null,
      product_key text not null,
      name text not null,
      description text not null default '',
      status text not null default 'draft',
      stripe_product_id text,
      created_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists commerce_prices (
      id text primary key default gen_random_uuid()::text,
      product_id text not null,
      price_key text not null,
      stripe_price_id text,
      amount_micro_usd bigint not null default 0,
      currency text not null default 'usd',
      interval text not null,
      usage_type text not null,
      active boolean not null default true,
      created_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists commerce_plans (
      id text primary key default gen_random_uuid()::text,
      product_id text not null,
      plan_key text not null,
      description text not null default '',
      created_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists commerce_entitlements (
      id text primary key default gen_random_uuid()::text,
      plan_id text not null,
      feature_key text not null,
      value jsonb not null default '{}'::jsonb,
      entitlement_type text not null,
      created_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists commerce_subscriptions (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      billing_account_id text not null,
      user_id text not null,
      meter_app_id text,
      site_id text,
      plan_key text,
      product_key text,
      price_key text,
      stripe_subscription_id text not null,
      stripe_customer_id text not null,
      stripe_price_id text,
      status text not null,
      started_at timestamp with time zone,
      ends_at timestamp with time zone,
      cancel_at_period_end boolean not null default false,
      commerce_price_id text,
      updated_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists entitlement_grants (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      billing_account_id text,
      meter_app_id text,
      site_id text,
      commerce_subscription_id text not null,
      user_id text not null,
      scope_type text not null,
      environment text not null default 'live',
      feature_key text not null,
      entitlement_type text not null,
      value jsonb not null default '{}'::jsonb,
      source_stripe_event_id text,
      effective_from timestamp with time zone,
      effective_until timestamp with time zone,
      revoked_at timestamp with time zone,
      revocation_reason text,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists stripe_customers (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      app_key text not null,
      environment text not null default 'live',
      user_id text,
      billing_account_id text,
      stripe_customer_id text not null,
      email text,
      is_default boolean not null default false,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists commerce_stripe_invoices (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      billing_account_id text,
      stripe_invoice_id text not null,
      status text not null,
      amount_due bigint not null default 0,
      amount_paid bigint not null default 0,
      currency text not null default 'usd',
      stripe_customer_id text,
      stripe_subscription_id text,
      last_stripe_event_id text,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;

  await sql`
    create table if not exists commerce_stripe_payment_intents (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      billing_account_id text,
      commerce_stripe_invoice_id text,
      stripe_invoice_id text,
      stripe_payment_intent_id text not null,
      status text not null,
      amount bigint not null,
      currency text not null default 'usd',
      last_stripe_event_id text,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create unique index if not exists commerce_stripe_payment_intents_pi_unique
    on commerce_stripe_payment_intents (stripe_payment_intent_id)
  `;
  await sql`
    create index if not exists commerce_stripe_payment_intents_workspace_id_idx
    on commerce_stripe_payment_intents (workspace_id)
  `;

  await sql`
    create table if not exists commerce_stripe_refunds (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      stripe_refund_id text not null,
      stripe_charge_id text not null,
      amount bigint not null,
      currency text not null default 'usd',
      status text not null,
      last_stripe_event_id text,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create unique index if not exists commerce_stripe_refunds_refund_unique
    on commerce_stripe_refunds (stripe_refund_id)
  `;
  await sql`
    create index if not exists commerce_stripe_refunds_workspace_id_idx
    on commerce_stripe_refunds (workspace_id)
  `;

  await sql`
    create table if not exists commerce_stripe_checkout_sessions (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      stripe_checkout_session_id text not null,
      payment_status text,
      async_payment_state text,
      amount_total bigint,
      currency text,
      last_stripe_event_id text,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create unique index if not exists commerce_stripe_checkout_sessions_session_unique
    on commerce_stripe_checkout_sessions (stripe_checkout_session_id)
  `;
  await sql`
    create index if not exists commerce_stripe_checkout_sessions_workspace_id_idx
    on commerce_stripe_checkout_sessions (workspace_id)
  `;

  await sql`
    create table if not exists commerce_reconciliation_logs (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      reconciliation_type text not null,
      status text not null,
      details jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create index if not exists commerce_reconciliation_logs_workspace_created_idx
    on commerce_reconciliation_logs (workspace_id, created_at)
  `;
  await sql`
    create index if not exists commerce_reconciliation_logs_type_created_idx
    on commerce_reconciliation_logs (reconciliation_type, created_at)
  `;

  await sql`
    create table if not exists guard_validation_runs (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      environment text not null,
      scope jsonb not null,
      status text not null,
      score integer not null,
      checks_run integer not null,
      started_at timestamp with time zone not null,
      finished_at timestamp with time zone not null,
      request_id text not null,
      api_key_id text,
      result_snapshot jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create index if not exists guard_validation_runs_workspace_started_idx
    on guard_validation_runs (workspace_id, started_at)
  `;
  await sql`
    create index if not exists guard_validation_runs_request_id_idx
    on guard_validation_runs (request_id)
  `;

  await sql`
    create table if not exists guard_overrides (
      id text primary key default gen_random_uuid()::text,
      workspace_id text not null,
      override_type text not null,
      subject text,
      reason text not null,
      created_by_api_key_id text,
      created_by_user_id text,
      expires_at timestamp with time zone,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now()
    )
  `;
  await sql`
    create index if not exists guard_overrides_workspace_created_idx
    on guard_overrides (workspace_id, created_at)
  `;
  await sql`
    create index if not exists guard_overrides_workspace_type_idx
    on guard_overrides (workspace_id, override_type)
  `;

  await cleanupAccessBillingControlRuntimeFixture(sql);
}

async function cleanupAccessBillingControlRuntimeFixture(sql) {
  const runtimeSlug = "access-billing-control-runtime-validation";
  const runtimeEmail = "access-billing-control-runtime-validation@localhost";
  const runtimeStripeCustomer = "cus_abc_runtime";

  const workspaceRows = await sql`
    select id from workspaces
    where slug = ${runtimeSlug}
       or name = 'Access & Billing Control Runtime Validation'
  `;
  const userRows = await sql`
    select id from users
    where email = ${runtimeEmail}
  `;
  const billingRows = await sql`
    select id from billing_accounts
    where stripe_customer_id = ${runtimeStripeCustomer}
       or billing_email = ${runtimeEmail}
  `;

  const workspaceIds = workspaceRows.map((row) => row.id);
  const userIds = userRows.map((row) => row.id);
  const billingAccountIds = billingRows.map((row) => row.id);

  if (workspaceIds.length > 0) {
    await sql`delete from stripe_webhook_processing where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from requests_log where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from audit_events where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from usage_events where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from credit_transactions where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from credit_balances where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from feature_limits where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from subscription_items where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from subscriptions where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from bundle_app_access where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from bundle_plans where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from app_prices where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from app_products where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from app_catalog where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from connected_apps where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from stripe_customers where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from commerce_stripe_invoices where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from commerce_stripe_payment_intents where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from commerce_stripe_refunds where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from commerce_stripe_checkout_sessions where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from commerce_reconciliation_logs where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from guard_validation_runs where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from guard_overrides where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from entitlement_grants where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from commerce_subscriptions where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from commerce_products where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from meter_app_xflow_links where meter_app_id in (select id from meter_apps where workspace_id in ${sql(workspaceIds)})`;
    await sql`delete from meter_apps where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from api_keys where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from workspace_members where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from billing_accounts where workspace_id in ${sql(workspaceIds)}`;
    await sql`delete from workspaces where id in ${sql(workspaceIds)}`;
  }

  if (billingAccountIds.length > 0) {
    await sql`delete from stripe_customers where billing_account_id in ${sql(billingAccountIds)}`;
    await sql`delete from commerce_stripe_invoices where billing_account_id in ${sql(billingAccountIds)}`;
    await sql`delete from entitlement_grants where billing_account_id in ${sql(billingAccountIds)}`;
    await sql`delete from commerce_subscriptions where billing_account_id in ${sql(billingAccountIds)}`;
    await sql`delete from subscriptions where billing_account_id in ${sql(billingAccountIds)}`;
    await sql`delete from billing_accounts where id in ${sql(billingAccountIds)}`;
  }

  await sql`
    delete from billing_accounts
    where stripe_customer_id = ${runtimeStripeCustomer}
       or billing_email = ${runtimeEmail}
  `;

  if (userIds.length > 0) {
    await sql`delete from legal_acceptances where user_id in ${sql(userIds)}`;
    await sql`delete from user_profiles where user_id in ${sql(userIds)}`;
    await sql`delete from workspace_members where user_id in ${sql(userIds)}`;
    await sql`delete from users where id in ${sql(userIds)}`;
  }

  await sql`delete from stripe_webhook_processing where event_id like 'evt_abc_runtime_%'`;
  await sql`delete from stripe_webhook_events where event_id like 'evt_abc_runtime_%'`;
}

async function verify(sql) {
  const required = [
    "workspaces",
    "audit_events",
    "billing_accounts",
    "subscriptions",
    "credit_balances",
    "credit_transactions",
    "usage_events",
  ];
  const rows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ${sql(required)}
  `;
  const found = new Set(rows.map((row) => row.table_name));
  const missing = required.filter((table) => !found.has(table));
  if (missing.length > 0) {
    throw new Error(`repair verification failed; missing tables: ${missing.join(", ")}`);
  }
}

async function main() {
  loadDotenv(".env.shared.local");
  loadDotenv(".env.phase6d.local");
  loadDotenv(path.join("apps", "Verixet", ".env.local"), { override: true });
  loadDotenv(path.join("apps", "Verixet", ".env"), { override: true });

  assertLocalOrStagingRepair();
  const databaseUrl = requireEnv("DATABASE_URL");
  log(`env: DATABASE_URL source=${envSources.get("DATABASE_URL") ?? "process"} (value not printed)`);

  const sql = postgres(databaseUrl, { prepare: false, max: 1, idle_timeout: 5, connect_timeout: 10 });
  try {
    await repair(sql);
    await verify(sql);
  } finally {
    await sql.end({ timeout: 5 });
  }
  log("ready: local/staging Verixet authority tables are available for Phase 6B proof");
}

main().catch((error) => {
  console.error(
    `[phase6b-verixet-db-repair] failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
