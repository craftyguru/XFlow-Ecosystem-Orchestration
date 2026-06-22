#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createHmac, randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requireFromSupabasePackage = createRequire(path.join(ROOT, "packages", "ecosystem-supabase", "package.json"));

const NOW = new Date().toISOString();
const OUTPUT_DIR = path.join(ROOT, "output");
const DEV_OUTPUT_DIR = path.join(OUTPUT_DIR, "dev");
const SUMMARY_FILE = process.env.AUTH_PERSONA_SETUP_SUMMARY_FILE
  ? path.resolve(ROOT, process.env.AUTH_PERSONA_SETUP_SUMMARY_FILE)
  : path.join(OUTPUT_DIR, "authenticated-persona-fixture-setup-summary-2026-05-10.json");
const FIXTURE_FILE = process.env.AUTH_PERSONA_FIXTURE_OUTPUT_FILE
  ? path.resolve(ROOT, process.env.AUTH_PERSONA_FIXTURE_OUTPUT_FILE)
  : path.join(DEV_OUTPUT_DIR, "auth-personas.fixture.local.json");

const WRITE_TEMPLATE = process.argv.includes("--write-template");
const SEED_PERSONAS = process.argv.includes("--seed-personas");
const MINT_SESSIONS = process.argv.includes("--mint-sessions");
const MINT_XFLOW_COOKIES = process.argv.includes("--mint-xflow-cookies");
const CLEANUP = process.argv.includes("--cleanup");
const ALLOW_LOCAL_FIXTURES = process.argv.includes("--allow-local-fixtures");
const ALLOW_STAGING_FIXTURES = process.argv.includes("--allow-staging-fixtures");
const SEED_SHARED_SUPABASE = process.argv.includes("--seed-shared-supabase");
const ALLOW_PRODUCTION_FIXTURES = process.env.AUTH_PERSONA_ALLOW_PRODUCTION_FIXTURES === "1";
const CONFIRM_PRODUCTION_DISPOSABLE = process.env.AUTH_PERSONA_PRODUCTION_FIXTURES_ARE_DISPOSABLE === "1";
const SUPABASE_IS_STAGING = process.env.AUTH_PERSONA_SUPABASE_IS_STAGING === "1";
const RUN_ID = (process.env.AUTH_PERSONA_FIXTURE_RUN_ID || "local").toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 32);

const SOURCE = "auth_persona_security_fixture";
const APP_SLUGS = ["xflow", "verixet", "rataify", "audaix", "wordgeni", "crevux"];
const ENV_FILE_ARG = process.argv.find((arg) => arg.startsWith("--persona-env-file="))?.slice("--persona-env-file=".length);
const envFiles = [
  ENV_FILE_ARG,
  ".env.security-local",
  ".env.shared.local",
  ".env.phase6d.local",
  ".env.proof.local",
].filter(Boolean);

const apps = [
  { app: "XFlow", slug: "xflow", env: "XFLOW_PROOF_BASE_URL", fallback: "https://xflowx.com" },
  { app: "Verixet", slug: "verixet", env: "VERIXET_PROOF_BASE_URL", fallback: "https://verixet.com" },
  { app: "RatAiFy", slug: "rataify", env: "RATAIFY_PROOF_BASE_URL", fallback: "https://rataify.com" },
  { app: "AudAiX", slug: "audaix", env: "AUDAIX_PROOF_BASE_URL", fallback: "https://audaix.com" },
  { app: "WordGeni", slug: "wordgeni", env: "WORDGENI_PROOF_BASE_URL", fallback: "https://wordgeni.com" },
  { app: "CreVux", slug: "crevux", env: "CREVUX_PROOF_BASE_URL", fallback: "https://crevux.com" },
];

const workspaceA = {
  slug: `security-fixture-workspace-a-${RUN_ID}`,
  name: "Security Fixture Workspace A",
};
const workspaceB = {
  slug: `security-fixture-workspace-b-${RUN_ID}`,
  name: "Security Fixture Workspace B",
};

const personas = [
  {
    key: "normal_user",
    label: "normal authenticated user",
    aliases: ["NORMAL", "NORMAL_USER"],
    email: `security+normal-${RUN_ID}@example.test`,
    role: "user",
    workspaceKey: "a",
    workspaceRole: "member",
    appSlug: "xflow",
    entitlementState: "active",
    subscriptionState: "active",
  },
  {
    key: "workspace_admin",
    label: "workspace admin",
    aliases: ["WORKSPACE_ADMIN"],
    email: `security+workspace-admin-${RUN_ID}@example.test`,
    role: "workspace_admin",
    workspaceKey: "a",
    workspaceRole: "admin",
    appSlug: "xflow",
    entitlementState: "active",
    subscriptionState: "active",
  },
  {
    key: "app_admin",
    label: "app admin",
    aliases: ["APP_ADMIN"],
    email: `security+app-admin-${RUN_ID}@example.test`,
    role: "app_admin",
    workspaceKey: "a",
    workspaceRole: "admin",
    appSlug: "rataify",
    entitlementState: "active",
    subscriptionState: "active",
  },
  {
    key: "support_admin",
    label: "support admin",
    aliases: ["SUPPORT_ADMIN"],
    email: `security+support-admin-${RUN_ID}@example.test`,
    role: "support_admin",
    workspaceKey: "a",
    workspaceRole: "viewer",
    appSlug: "xflow",
    entitlementState: "none",
    subscriptionState: "none",
  },
  {
    key: "security_admin",
    label: "security admin",
    aliases: ["SECURITY_ADMIN"],
    email: `security+security-admin-${RUN_ID}@example.test`,
    role: "security_admin",
    workspaceKey: "a",
    workspaceRole: "viewer",
    appSlug: "xflow",
    entitlementState: "none",
    subscriptionState: "none",
  },
  {
    key: "superadmin",
    label: "superadmin/platform owner",
    aliases: ["SUPERADMIN", "PLATFORM_OWNER"],
    email: `security+platform-owner-${RUN_ID}@example.test`,
    role: "superadmin",
    workspaceKey: "a",
    workspaceRole: "owner",
    appSlug: "xflow",
    entitlementState: "active",
    subscriptionState: "active",
  },
  {
    key: "expired_user",
    label: "expired/past_due subscription user",
    aliases: ["EXPIRED", "EXPIRED_USER", "PAST_DUE"],
    email: `security+past-due-${RUN_ID}@example.test`,
    role: "user",
    workspaceKey: "a",
    workspaceRole: "member",
    appSlug: "xflow",
    entitlementState: "past_due",
    subscriptionState: "past_due",
  },
  {
    key: "canceled_user",
    label: "canceled subscription user",
    aliases: ["CANCELED", "CANCELLED", "CANCELED_USER", "CANCELLED_USER"],
    email: `security+canceled-${RUN_ID}@example.test`,
    role: "user",
    workspaceKey: "a",
    workspaceRole: "member",
    appSlug: "xflow",
    entitlementState: "canceled",
    subscriptionState: "canceled",
  },
  {
    key: "cross_workspace_user",
    label: "cross-workspace user",
    aliases: ["CROSS_WORKSPACE", "CROSS_WORKSPACE_USER"],
    email: `security+cross-workspace-${RUN_ID}@example.test`,
    role: "user",
    workspaceKey: "b",
    workspaceRole: "member",
    appSlug: "xflow",
    entitlementState: "active",
    subscriptionState: "active",
  },
];

function loadEnvFile(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return false;
  const source = fs.readFileSync(full, "utf8");
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
  return true;
}

const loadedEnvFiles = envFiles.filter(loadEnvFile);

function ensureOutputDirs() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(DEV_OUTPUT_DIR, { recursive: true });
}

function baseUrl(app) {
  return (process.env[app.env] || app.fallback).replace(/\/+$/, "");
}

function hostType(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local")) return "local";
    if (host.includes("staging") || host.includes("preview") || host.includes("dev") || host.includes("test")) return "staging";
    return "production-like";
  } catch {
    return "invalid";
  }
}

function envNamesFor(persona, suffix) {
  return [...new Set([...persona.aliases, persona.key.toUpperCase()].map((alias) => `AUTH_PERSONA_${alias}_${suffix}`))];
}

function hasAnyEnv(names) {
  return names.some((name) => Boolean(String(process.env[name] || "").trim()));
}

function safeFixtureMode(targets) {
  const unsafe = targets.filter((target) => target.type !== "local" && target.type !== "staging");
  if (unsafe.length > 0) {
    return {
      ok: false,
      reason: `Refusing fixture mutation: production-like target URLs detected for ${unsafe.map((target) => target.app).join(", ")}.`,
    };
  }
  if (ALLOW_LOCAL_FIXTURES) {
    const nonLocal = targets.filter((target) => target.type !== "local");
    if (nonLocal.length > 0) {
      return {
        ok: false,
        reason: `--allow-local-fixtures requires all proof URLs to be local. Non-local targets: ${nonLocal.map((target) => target.app).join(", ")}.`,
      };
    }
    return { ok: true, environment: "local" };
  }
  if (ALLOW_STAGING_FIXTURES) {
    const nonStaging = targets.filter((target) => target.type !== "local" && target.type !== "staging");
    if (nonStaging.length > 0) {
      return {
        ok: false,
        reason: `--allow-staging-fixtures accepts only local/staging proof URLs. Non-staging targets: ${nonStaging.map((target) => target.app).join(", ")}.`,
      };
    }
    return { ok: true, environment: "staging" };
  }
  return { ok: false, reason: "Pass --allow-local-fixtures or --allow-staging-fixtures before seeding, cleanup, or session minting." };
}

function supabaseSafety(url) {
  if (!url) return { ok: false, reason: "SUPABASE_URL is missing." };
  const type = hostType(url);
  if (type === "local") return { ok: true, type };
  if ((type === "staging" || SUPABASE_IS_STAGING) && ALLOW_STAGING_FIXTURES) return { ok: true, type: SUPABASE_IS_STAGING ? "staging-confirmed" : type };
  return {
    ok: false,
    type,
    reason: "Refusing Supabase fixture mutation unless SUPABASE_URL is local/staging or AUTH_PERSONA_SUPABASE_IS_STAGING=1 is set with --allow-staging-fixtures.",
  };
}

function randomPassword() {
  return `Persona-${randomBytes(18).toString("base64url")}!9`;
}

function sanitize(text) {
  return String(text || "")
    .replace(/\b(sk_live|sk_test|rk_live|whsec|sb_secret)_[A-Za-z0-9_-]+/g, "[redacted-secret]")
    .replace(/\b(?:Bearer|token|session|cookie|password)\s+[A-Za-z0-9._~+/-]{12,}/gi, "[redacted-auth]")
    .replace(/(?<==)[A-Za-z0-9._~+/-]{32,}\b/g, "[redacted-long-value]")
    .slice(0, 1200);
}

function writeJson(file, data) {
  ensureOutputDirs();
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, { encoding: "utf8" });
}

function fixtureTemplate() {
  const fixture = {};
  for (const persona of personas) {
    fixture[persona.key] = {
      bearer: "",
      cookie: "",
      workspaceId: persona.workspaceKey === "b" ? workspaceB.slug : workspaceA.slug,
      foreignWorkspaceId: persona.workspaceKey === "b" ? workspaceA.slug : workspaceB.slug,
      appSlug: persona.appSlug,
      apps: Object.fromEntries(APP_SLUGS.map((slug) => [slug, { bearer: "", cookie: "" }])),
    };
  }
  return fixture;
}

async function loadSupabase() {
  const { createClient } = requireFromSupabasePackage("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for fixture seeding.");
  }
  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const anon = anonKey
    ? createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;
  return { admin, anon, url };
}

async function single(query, label) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

async function maybeSingle(query, label) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data ?? null;
}

async function findAuthUserByEmail(admin, email) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = (data?.users ?? []).find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if ((data?.users ?? []).length < 1000) break;
  }
  return null;
}

async function ensureUser(admin, persona, password) {
  const existing = await findAuthUserByEmail(admin, persona.email);
  const metadata = {
    fixture: SOURCE,
    runId: RUN_ID,
    role: persona.role,
    persona: persona.key,
  };
  if (existing?.id) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: metadata,
      app_metadata: {
        ...(existing.app_metadata || {}),
        ecosystem_role: persona.role,
        fixture: SOURCE,
        fixture_run_id: RUN_ID,
      },
    });
    if (error) throw new Error(`update auth user ${persona.key}: ${error.message}`);
    return { id: data.user.id, email: data.user.email };
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: persona.email,
    password,
    email_confirm: true,
    user_metadata: metadata,
    app_metadata: {
      ecosystem_role: persona.role,
      fixture: SOURCE,
      fixture_run_id: RUN_ID,
    },
  });
  if (error) throw new Error(`create auth user ${persona.key}: ${error.message}`);
  return { id: data.user.id, email: data.user.email };
}

async function ensureCoreApps(admin) {
  const rows = [
    { slug: "xflow", display_name: "XFlow", authority_role: "auth_control_plane", owns_control_plane: true },
    { slug: "verixet", display_name: "Verixet", authority_role: "billing_entitlements", owns_billing: true, owns_entitlements: true, owns_usage_metering: true },
    { slug: "rataify", display_name: "RatAiFy", authority_role: "satellite_risk" },
    { slug: "audaix", display_name: "AudAiX", authority_role: "satellite_audit" },
    { slug: "wordgeni", display_name: "WordGeni", authority_role: "satellite_writing" },
    { slug: "crevux", display_name: "CreVux", authority_role: "satellite_creative" },
  ].map((row) => ({
    owns_billing: false,
    owns_entitlements: false,
    owns_usage_metering: false,
    owns_control_plane: false,
    status: "active",
    metadata: { fixture: SOURCE, runId: RUN_ID },
    ...row,
  }));
  await single(admin.schema("core").from("ecosystem_apps").upsert(rows, { onConflict: "slug" }), "upsert ecosystem apps");
}

async function ensureWorkspace(admin, workspace, createdBy) {
  return single(
    admin
      .schema("core")
      .from("workspaces")
      .upsert(
        {
          slug: workspace.slug,
          name: workspace.name,
          created_by: createdBy,
          status: "active",
          metadata: { fixture: SOURCE, runId: RUN_ID },
        },
        { onConflict: "slug" },
      )
      .select("id, slug")
      .single(),
    `upsert workspace ${workspace.slug}`,
  );
}

async function seedAccess(admin, persona, user, workspacesByKey) {
  const workspace = workspacesByKey[persona.workspaceKey];
  await single(
    admin.schema("core").from("profiles").upsert(
      {
        user_id: user.id,
        display_name: persona.label,
        primary_email: persona.email,
      },
      { onConflict: "user_id" },
    ),
    `upsert profile ${persona.key}`,
  );
  await single(
    admin.schema("core").from("workspace_members").upsert(
      {
        workspace_id: workspace.id,
        user_id: user.id,
        role: persona.workspaceRole,
        status: "active",
        created_by: user.id,
      },
      { onConflict: "workspace_id,user_id" },
    ),
    `upsert workspace member ${persona.key}`,
  );
  for (const appSlug of APP_SLUGS) {
    await single(
      admin.schema("core").from("workspace_app_access").upsert(
        {
          workspace_id: workspace.id,
          app_slug: appSlug,
          status: "active",
          granted_by: user.id,
          metadata: { fixture: SOURCE, runId: RUN_ID, persona: persona.key },
        },
        { onConflict: "workspace_id,app_slug" },
      ),
      `upsert workspace app access ${persona.key} ${appSlug}`,
    );
  }
}

function xflowRuntimeRoleForPersona(persona) {
  if (persona.workspaceRole === "owner") return "owner";
  if (persona.workspaceRole === "admin") return "admin";
  if (persona.key === "support_admin" || persona.key === "security_admin") return "admin";
  return "viewer";
}

async function ensureXflowRuntimeWorkspaceAccess(admin, persona, user, workspace) {
  const roleName = xflowRuntimeRoleForPersona(persona);
  const roleId = `security-fixture-${roleName}`;
  const now = new Date().toISOString();
  await single(
    admin.from("roles").upsert(
      {
        id: roleId,
        name: roleName,
        description: `Security fixture ${roleName} role`,
        created_at: now,
        updated_at: now,
      },
      { onConflict: "name" },
    ),
    `upsert XFlow runtime role ${roleName}`,
  );
  await single(
    admin.from("workspaces").upsert(
      {
        id: workspace.id,
        slug: workspace.slug,
        name: persona.workspaceKey === "b" ? workspaceB.name : workspaceA.name,
        created_at: now,
        updated_at: now,
      },
      { onConflict: "slug" },
    ),
    `upsert XFlow runtime workspace ${workspace.slug}`,
  );
  await single(
    admin.from("workspace_members").upsert(
      {
        workspace_id: workspace.id,
        user_id: user.id,
        role_id: roleId,
        created_at: now,
        updated_at: now,
      },
      { onConflict: "workspace_id,user_id" },
    ),
    `upsert XFlow runtime workspace member ${persona.key}`,
  );
}

function entitlementDecision(persona) {
  if (persona.entitlementState === "past_due") return { decision: "deny", reason: "subscription_past_due" };
  if (persona.entitlementState === "canceled") return { decision: "deny", reason: "subscription_canceled" };
  if (persona.entitlementState === "none") return { decision: "deny", reason: "role_without_paid_entitlement" };
  return { decision: "allow", reason: "active_fixture_subscription" };
}

async function seedEntitlements(admin, persona, user, workspacesByKey) {
  const workspace = workspacesByKey[persona.workspaceKey];
  const { decision, reason } = entitlementDecision(persona);
  for (const appSlug of APP_SLUGS) {
    await single(
      admin.schema("core").from("entitlements").upsert(
        {
          workspace_id: workspace.id,
          app_slug: appSlug,
          feature_key: `${appSlug}.paid_feature`,
          decision,
          source: "verixet",
          reason,
          valid_until: decision === "allow" ? null : new Date(Date.now() - 60_000).toISOString(),
          metadata: {
            fixture: SOURCE,
            runId: RUN_ID,
            persona: persona.key,
            subscriptionState: persona.subscriptionState,
          },
        },
        { onConflict: "workspace_id,app_slug,feature_key" },
      ),
      `upsert entitlement ${persona.key} ${appSlug}`,
    );
  }
  await single(
    admin.schema("core").from("billing_events").upsert(
      {
        workspace_id: workspace.id,
        app_slug: "verixet",
        provider: "fixture",
        provider_event_id: `${SOURCE}:${RUN_ID}:${persona.key}:subscription`,
        event_type: `subscription.${persona.subscriptionState}`,
        authority: "verixet",
        metadata: {
          fixture: SOURCE,
          runId: RUN_ID,
          persona: persona.key,
          userId: user.id,
          subscriptionState: persona.subscriptionState,
        },
      },
      { onConflict: "provider,provider_event_id" },
    ),
    `upsert billing event ${persona.key}`,
  );
}

async function seedAudit(admin, persona, user, workspacesByKey) {
  const workspace = workspacesByKey[persona.workspaceKey];
  await single(
    admin.schema("core").from("audit_logs").insert({
      workspace_id: workspace.id,
      app_slug: "xflow",
      actor_user_id: user.id,
      action: "security_fixture.persona_seeded",
      target_table: "auth.users",
      target_id: persona.key,
      severity: "info",
      metadata: { fixture: SOURCE, runId: RUN_ID, role: persona.role },
    }),
    `insert audit ${persona.key}`,
  );
}

async function mintSupabaseBearer(anon, persona, password) {
  if (!anon) return { blocked: "SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY missing" };
  const { data, error } = await anon.auth.signInWithPassword({ email: persona.email, password });
  if (error || !data?.session?.access_token) {
    return { blocked: `Supabase sign-in failed for ${persona.key}` };
  }
  return { bearer: data.session.access_token };
}

function setCookieValues(headers) {
  const getSetCookie = headers.getSetCookie;
  if (typeof getSetCookie === "function") {
    try {
      return getSetCookie.call(headers);
    } catch {}
  }
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}

function appendSetCookieToJar(headers, jar) {
  for (const header of setCookieValues(headers)) {
    for (const part of header.split(/,(?=\s*[^;,=\s]+=[^;,]+)/)) {
      const pair = part.split(";", 1)[0]?.trim();
      if (!pair || !pair.includes("=")) continue;
      const [name, ...rest] = pair.split("=");
      if (name) jar.set(name, rest.join("="));
    }
  }
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

function redactRedirectLocation(location) {
  if (!location) return "";
  try {
    const url = new URL(location, "https://redacted.local");
    for (const key of [...url.searchParams.keys()]) {
      if (/token|secret|code|state|session|bearer|password|key|cookie|csrf/i.test(key)) {
        url.searchParams.set(key, "[redacted]");
      }
    }
    return url.toString().replace("https://redacted.local", "");
  } catch {
    return location.replace(/([?&](?:token|secret|code|state|session|bearer|password|key|cookie|csrf)=)[^&]+/gi, "$1[redacted]");
  }
}

async function fetchWithJar(url, jar, init = {}, timeoutMs = 30000) {
  const cookie = cookieHeader(jar);
  const response = await fetch(url, {
    ...init,
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(init.headers ?? {}),
    },
  });
  appendSetCookieToJar(response.headers, jar);
  return response;
}

async function mintXflowCookie(persona, password) {
  const origin = baseUrl(apps[0]);
  const jar = new Map();
  const intent = await fetch(`${origin}/api/auth/login/intent`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: persona.email, password }),
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  }).catch(() => null);
  if (!intent || intent.status >= 500) {
    return { blocked: `XFlow login intent failed for ${persona.key} (status ${intent?.status ?? "unreachable"})` };
  }
  const csrf = await fetchWithJar(`${origin}/api/auth/csrf`, jar, { headers: { accept: "application/json" } });
  const body = await csrf.json().catch(() => null);
  if (!body?.csrfToken || csrf.status !== 200) return { blocked: `XFlow CSRF bootstrap failed for ${persona.key}` };
  const form = new URLSearchParams({
    csrfToken: body.csrfToken,
    email: persona.email,
    password,
    redirect: "false",
    callbackUrl: `${origin}/overview`,
    json: "true",
  });
  const callback = await fetchWithJar(`${origin}/api/auth/callback/credentials`, jar, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form,
  }).catch(() => null);
  if (!callback) return { blocked: `XFlow credential callback unreachable for ${persona.key}` };
  if (callback.status >= 400 && callback.status !== 302) {
    return { blocked: `XFlow credential callback failed for ${persona.key} (status ${callback.status})` };
  }
  const cookie = cookieHeader(jar);
  if (!cookie) return { blocked: `XFlow credential login did not return cookies for ${persona.key}` };
  const hasSessionCookie = [...jar.keys()].some((name) => /(?:authjs|next-auth)\.session-token$/.test(name));
  if (!hasSessionCookie) {
    const location = redactRedirectLocation(callback.headers.get("location") || "");
    const locationDetail = location ? `, location ${location}` : "";
    return { blocked: `XFlow credential login did not return a session cookie for ${persona.key} (status ${callback.status}${locationDetail})` };
  }
  const session = await fetch(`${origin}/api/auth/session`, {
    headers: { cookie },
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  }).catch(() => null);
  if (!session || session.status !== 200) {
    return { blocked: `XFlow session verification failed for ${persona.key} (status ${session?.status ?? "unreachable"})` };
  }
  const sessionBody = await session.json().catch(() => null);
  if (!sessionBody?.user) {
    return { blocked: `XFlow session verification returned no user for ${persona.key}` };
  }
  return { cookie };
}

async function mintAudAixCookie(persona, bearer) {
  if (!bearer) return { blocked: `AudAiX bearer missing for ${persona.key}` };
  const app = apps.find((candidate) => candidate.slug === "audaix");
  if (!app) return { blocked: "AudAiX app target missing" };
  const origin = baseUrl(app);
  const jar = new Map();
  const exchange = await fetchWithJar(`${origin}/v1/auth/session/exchange`, jar, {
    method: "POST",
    headers: {
      authorization: `Bearer ${bearer}`,
      accept: "application/json",
    },
  }).catch(() => null);
  if (!exchange || exchange.status !== 200) return { blocked: `AudAiX session exchange failed for ${persona.key}` };
  const cookie = cookieHeader(jar);
  if (!cookie) return { blocked: `AudAiX session exchange did not return cookies for ${persona.key}` };
  const verify = await fetch(`${origin}/v1/auth/session`, {
    headers: { cookie, accept: "application/json" },
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  }).catch(() => null);
  if (!verify || verify.status !== 200) return { blocked: `AudAiX session verification failed for ${persona.key}` };
  return { cookie };
}

async function mintWordGeniCookie(persona, user) {
  const secret = process.env.JWT_SECRET || "ci-jwt-secret-min-32-characters-for-build-only!!";
  const role = persona.role === "superadmin" ? "admin" : persona.role;
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    role,
    fixture: SOURCE,
    persona: persona.key,
    iat: now,
    exp: now + 60 * 60 * 2,
  })).toString("base64url");
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  const token = `${header}.${payload}.${signature}`;
  return { cookie: `auth-token=${token}; api-auth-token=${token}` };
}

async function cleanupFixtures(admin) {
  const summary = [];
  for (const persona of personas) {
    const user = await findAuthUserByEmail(admin, persona.email);
    if (user?.id) {
      const { error } = await admin.auth.admin.deleteUser(user.id);
      summary.push({ persona: persona.key, authUserDeleted: !error, error: error?.message ? sanitize(error.message) : "" });
    } else {
      summary.push({ persona: persona.key, authUserDeleted: false, error: "not found" });
    }
  }
  for (const workspace of [workspaceA, workspaceB]) {
    const row = await maybeSingle(admin.schema("core").from("workspaces").select("id").eq("slug", workspace.slug).maybeSingle(), `lookup ${workspace.slug}`);
    if (!row?.id) {
      summary.push({ workspace: workspace.slug, deleted: false, error: "not found" });
      continue;
    }
    for (const table of ["entitlements", "workspace_app_access", "workspace_members", "app_connections", "usage_events", "billing_events", "audit_logs"]) {
      const { error } = await admin.schema("core").from(table).delete().eq("workspace_id", row.id);
      if (error) summary.push({ workspace: workspace.slug, table: `core.${table}`, deleted: false, error: sanitize(error.message) });
    }
    for (const table of ["usage_admission_logs", "credit_ledger", "entitlement_decisions", "checkout_sessions", "stripe_connections", "billing_accounts"]) {
      const { error } = await admin.schema("verixet").from(table).delete().eq("workspace_id", row.id);
      if (error) summary.push({ workspace: workspace.slug, table: `verixet.${table}`, deleted: false, error: sanitize(error.message) });
    }
    const { error } = await admin.schema("core").from("workspaces").delete().eq("id", row.id);
    summary.push({ workspace: workspace.slug, deleted: !error, error: error?.message ? sanitize(error.message) : "" });
  }
  return summary;
}

async function seedAndMint() {
  const { admin, anon, url } = await loadSupabase();
  const safety = supabaseSafety(url);
  if (!safety.ok) throw new Error(safety.reason);

  if (CLEANUP) {
    const cleanup = await cleanupFixtures(admin);
    return { cleanup, fixtureWritten: false, personas: [] };
  }

  const passwordByPersona = new Map(personas.map((persona) => [persona.key, randomPassword()]));
  const users = {};
  const fixture = fixtureTemplate();
  const blocked = [];

  await ensureCoreApps(admin);

  for (const persona of personas) {
    users[persona.key] = await ensureUser(admin, persona, passwordByPersona.get(persona.key));
  }

  const workspacesByKey = {
    a: await ensureWorkspace(admin, workspaceA, users.normal_user.id),
    b: await ensureWorkspace(admin, workspaceB, users.cross_workspace_user.id),
  };

  for (const persona of personas) {
    const user = users[persona.key];
    await seedAccess(admin, persona, user, workspacesByKey);
    await seedEntitlements(admin, persona, user, workspacesByKey);
    await seedAudit(admin, persona, user, workspacesByKey);
  }

  if (MINT_SESSIONS) {
    for (const persona of personas) {
      const user = users[persona.key];
      const workspace = workspacesByKey[persona.workspaceKey];
      const foreignWorkspace = persona.workspaceKey === "b" ? workspacesByKey.a : workspacesByKey.b;
      const minted = await mintSupabaseBearer(anon, persona, passwordByPersona.get(persona.key));
      if (minted.blocked) blocked.push({ persona: persona.key, reason: minted.blocked });
      let xflow = {};
      if (MINT_XFLOW_COOKIES) {
        xflow = await mintXflowCookie(persona, passwordByPersona.get(persona.key));
        if (xflow.blocked) blocked.push({ persona: persona.key, reason: xflow.blocked });
        if (xflow.cookie) {
          await ensureXflowRuntimeWorkspaceAccess(admin, persona, user, workspace);
        }
      }
      let audaix = {};
      if (minted.bearer) {
        audaix = await mintAudAixCookie(persona, minted.bearer);
        if (audaix.blocked) blocked.push({ persona: persona.key, reason: audaix.blocked });
      }
      const wordgeni = await mintWordGeniCookie(persona, user);
      fixture[persona.key] = {
        bearer: minted.bearer || "",
        cookie: xflow.cookie || "",
        workspaceId: workspace.id,
        foreignWorkspaceId: foreignWorkspace.id,
        appSlug: persona.appSlug,
        apps: Object.fromEntries(APP_SLUGS.map((slug) => [slug, {
          bearer: minted.bearer || "",
          cookie: slug === "xflow" ? xflow.cookie || "" : slug === "audaix" ? audaix.cookie || "" : slug === "wordgeni" ? wordgeni.cookie || "" : "",
        }])),
      };
    }
    writeJson(FIXTURE_FILE, fixture);
  }

  return {
    cleanup: null,
    fixtureWritten: MINT_SESSIONS,
    fixturePath: path.relative(ROOT, FIXTURE_FILE),
    blocked,
    personas: personas.map((persona) => ({
      persona: persona.key,
      email: persona.email,
      role: persona.role,
      workspace: persona.workspaceKey === "b" ? workspaceB.name : workspaceA.name,
      workspaceRole: persona.workspaceRole,
      subscriptionState: persona.subscriptionState,
      sessionMaterial: MINT_SESSIONS ? (blocked.some((item) => item.persona === persona.key) ? "partial or blocked" : "written to ignored fixture file") : "not minted",
    })),
  };
}

function readiness(targets) {
  return personas.map((persona) => {
    const bearerNames = envNamesFor(persona, "BEARER");
    const cookieNames = envNamesFor(persona, "COOKIE");
    return {
      persona: persona.label,
      role: persona.role,
      emailPattern: persona.email,
      workspaceAssignment: persona.workspaceKey === "b" ? workspaceB.name : workspaceA.name,
      appAccess: APP_SLUGS,
      entitlementState: persona.entitlementState,
      subscriptionState: persona.subscriptionState,
      bearerEnvNames: bearerNames,
      cookieEnvNames: cookieNames,
      bearerProvided: hasAnyEnv(bearerNames),
      cookieProvided: hasAnyEnv(cookieNames),
      status: hasAnyEnv(bearerNames) || hasAnyEnv(cookieNames) ? "ready for harness" : "blocked until fixture session is minted or provided",
      targetSafety: targets.every((target) => target.type === "local" || target.type === "staging") ? "local/staging" : "production-like target present",
    };
  });
}

async function main() {
  ensureOutputDirs();
  const targets = apps.map((app) => ({ app: app.app, url: baseUrl(app), type: hostType(baseUrl(app)) }));
  const mode = safeFixtureMode(targets);
  let operation = null;
  let operationError = "";

  if (WRITE_TEMPLATE) {
    writeJson(FIXTURE_FILE, fixtureTemplate());
    operation = { templateWritten: path.relative(ROOT, FIXTURE_FILE) };
  }

  const wantsMutation = SEED_PERSONAS || MINT_SESSIONS || CLEANUP || SEED_SHARED_SUPABASE;
  if (wantsMutation) {
    if (!mode.ok) {
      operationError = mode.reason;
    } else if (SEED_SHARED_SUPABASE && !SEED_PERSONAS && !MINT_SESSIONS && !CLEANUP) {
      operationError = "--seed-shared-supabase is retained for compatibility; use --seed-personas for the full persona fixture flow.";
    } else {
      try {
        operation = await seedAndMint();
      } catch (error) {
        operationError = error instanceof Error ? sanitize(error.message) : sanitize(String(error));
      }
    }
  }

  const summary = {
    generatedAt: NOW,
    loadedEnvFiles,
    runId: RUN_ID,
    targetSafety: {
      targets,
      fixtureMode: mode,
      productionFixtureFlags: {
        AUTH_PERSONA_ALLOW_PRODUCTION_FIXTURES: ALLOW_PRODUCTION_FIXTURES ? "set" : "not set",
        AUTH_PERSONA_PRODUCTION_FIXTURES_ARE_DISPOSABLE: CONFIRM_PRODUCTION_DISPOSABLE ? "set" : "not set",
        AUTH_PERSONA_SUPABASE_IS_STAGING: SUPABASE_IS_STAGING ? "set" : "not set",
      },
    },
    requestedActions: {
      writeTemplate: WRITE_TEMPLATE,
      seedPersonas: SEED_PERSONAS,
      mintSessions: MINT_SESSIONS,
      mintXflowCookies: MINT_XFLOW_COOKIES,
      cleanup: CLEANUP,
      allowLocalFixtures: ALLOW_LOCAL_FIXTURES,
      allowStagingFixtures: ALLOW_STAGING_FIXTURES,
    },
    fixtureAvailability: readiness(targets),
    operation,
    operationError,
    notes: [
      "No passwords, bearer tokens, cookies, OAuth codes, refresh tokens, or raw env values are printed in this summary.",
      "Real session material is written only to output/dev/auth-personas.fixture.local.json, which is ignored by git.",
      "Fixture mutation requires --allow-local-fixtures or --allow-staging-fixtures and refuses production-like proof URLs by default.",
      "XFlow remains the auth authority; Verixet-owned entitlement state is represented in core entitlement/billing rows with source/authority set to verixet.",
    ],
  };
  writeJson(SUMMARY_FILE, summary);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(`[persona-fixture-setup] failed: ${error instanceof Error ? sanitize(error.message) : sanitize(String(error))}`);
  process.exit(1);
});
