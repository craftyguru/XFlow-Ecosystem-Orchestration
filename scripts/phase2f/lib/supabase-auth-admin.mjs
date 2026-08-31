import { FIXTURE_MARKER, IDENTITIES, isMissingEnvValue } from "./provisioner-core.mjs";

export const AUTH_MARKER_VERSION = "phase2f-production-fixtures-v1";

const EMAIL_ENV = {
  standard: "PHASE2F_STANDARD_EMAIL",
  denied: "PHASE2F_DENIED_EMAIL",
  outsider: "PHASE2F_OUTSIDER_EMAIL",
  entitled: "PHASE2F_ENTITLED_EMAIL",
  admin: "PHASE2F_ADMIN_EMAIL",
};

const PASSWORD_ENV = {
  standard: "PHASE2F_STANDARD_PASSWORD",
  denied: "PHASE2F_DENIED_PASSWORD",
  outsider: "PHASE2F_OUTSIDER_PASSWORD",
  entitled: "PHASE2F_ENTITLED_PASSWORD",
  admin: "PHASE2F_ADMIN_PASSWORD",
};

export class Phase2FAuthError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "Phase2FAuthError";
    this.details = details;
  }
}

export function redactText(value, secrets = []) {
  let text = String(value ?? "");
  for (const secret of secrets.filter(Boolean)) {
    text = text.split(String(secret)).join("[REDACTED]");
  }
  return text
    .replace(/(authorization:\s*bearer\s+)[^\s,}]+/gi, "$1[REDACTED]")
    .replace(/(apikey["']?\s*[:=]\s*["']?)[^"',}\s]+/gi, "$1[REDACTED]");
}

export function authSecretsFromEnv(env = {}) {
  return [
    env.PHASE2F_SUPABASE_SERVICE_ROLE_KEY,
    env.PHASE2F_SUPABASE_ANON_KEY,
    ...Object.values(PASSWORD_ENV).map((key) => env[key]),
  ].filter(Boolean);
}

function normalizedEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function extractProjectRef(url) {
  try {
    const host = new URL(url).hostname;
    const [ref, second] = host.split(".");
    return second === "supabase" ? ref : null;
  } catch {
    return null;
  }
}

export function resolveSupabaseAuthConfig(env = {}, { environment = "production" } = {}) {
  const errors = [];
  for (const key of ["PHASE2F_SUPABASE_URL", "PHASE2F_SUPABASE_SERVICE_ROLE_KEY", "PHASE2F_SUPABASE_ANON_KEY"]) {
    if (isMissingEnvValue(env[key])) errors.push(`missing required environment variable ${key}`);
  }
  if (env.PHASE2F_SUPABASE_URL && !/^https?:\/\//i.test(env.PHASE2F_SUPABASE_URL)) {
    errors.push("PHASE2F_SUPABASE_URL must be an http(s) URL");
  }
  if (environment === "production") {
    const expected = env.PHASE2F_EXPECTED_SUPABASE_PROJECT_REF || env.PHASE2F_EXPECTED_PROJECT_REF;
    const actual = extractProjectRef(env.PHASE2F_SUPABASE_URL);
    if (expected && actual && actual !== expected) {
      errors.push("PHASE2F_SUPABASE_URL project ref does not match expected project ref");
    }
    if (expected && !actual && !String(env.PHASE2F_SUPABASE_URL ?? "").includes(expected)) {
      errors.push("PHASE2F_SUPABASE_URL does not contain expected project ref");
    }
  }
  if (errors.length) throw new Phase2FAuthError("Supabase Auth configuration is not usable", { errors });
  return {
    url: env.PHASE2F_SUPABASE_URL.replace(/\/+$/, ""),
    serviceRoleKey: env.PHASE2F_SUPABASE_SERVICE_ROLE_KEY,
    anonKey: env.PHASE2F_SUPABASE_ANON_KEY,
    projectRef: extractProjectRef(env.PHASE2F_SUPABASE_URL),
  };
}

export function buildPhase2fAuthIdentities(env = {}, { includeOptional = false } = {}) {
  const identities = [];
  const errors = [];
  for (const identity of IDENTITIES.filter((item) => item.required || includeOptional)) {
    const emailKey = EMAIL_ENV[identity.key];
    const passwordKey = PASSWORD_ENV[identity.key];
    const email = env[emailKey];
    const password = env[passwordKey];
    if (isMissingEnvValue(email)) errors.push(`missing required environment variable ${emailKey}`);
    if (isMissingEnvValue(password)) errors.push(`missing required environment variable ${passwordKey}`);
    identities.push({
      ...identity,
      email: normalizedEmail(email),
      password,
      emailEnv: emailKey,
      passwordEnv: passwordKey,
      metadata: {
        ...FIXTURE_MARKER,
        adapter: "auth",
        persona: identity.key,
        label: FIXTURE_MARKER.label,
        fixtureVersion: AUTH_MARKER_VERSION,
        identityLabel: identity.label,
        role: identity.role,
      },
    });
  }
  if (errors.length) throw new Phase2FAuthError("Phase 2F auth identity configuration is incomplete", { errors });
  return identities;
}

function isMarkedPhase2F(user, identity) {
  const metadata = user?.user_metadata ?? user?.raw_user_meta_data ?? {};
  return (
    metadata?.label === FIXTURE_MARKER.label &&
    metadata?.isTest === true &&
    metadata?.fixtureVersion === AUTH_MARKER_VERSION &&
    metadata?.persona === identity.key &&
    metadata?.identityLabel === identity.label
  );
}

function publicUserRef(user) {
  return { id: user?.id, email: normalizedEmail(user?.email) };
}

export class SupabaseAuthAdminClient {
  constructor({ config, fetchImpl = globalThis.fetch }) {
    if (!fetchImpl) throw new Phase2FAuthError("fetch is unavailable for Supabase Auth Admin client");
    this.config = config;
    this.fetch = fetchImpl;
  }

  adminHeaders() {
    return {
      apikey: this.config.serviceRoleKey,
      authorization: `Bearer ${this.config.serviceRoleKey}`,
      "content-type": "application/json",
    };
  }

  anonHeaders() {
    return {
      apikey: this.config.anonKey,
      "content-type": "application/json",
    };
  }

  async request(path, { method = "GET", headers = this.adminHeaders(), body } = {}) {
    const response = await this.fetch(`${this.config.url}${path}`, {
      method,
      headers,
      body: body == null ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Phase2FAuthError(`Supabase Auth request failed with status ${response.status}`, {
        status: response.status,
        body: payload?.error_description || payload?.message || payload?.error || "redacted",
      });
    }
    return payload;
  }

  async listUsers() {
    const users = [];
    for (let page = 1; page <= 20; page += 1) {
      const payload = await this.request(`/auth/v1/admin/users?page=${page}&per_page=1000`);
      const batch = Array.isArray(payload?.users) ? payload.users : Array.isArray(payload) ? payload : [];
      users.push(...batch);
      if (batch.length < 1000) break;
    }
    return users;
  }

  async findUsersByEmail(email) {
    const target = normalizedEmail(email);
    return (await this.listUsers()).filter((user) => normalizedEmail(user.email) === target);
  }

  async createUser(identity) {
    const payload = await this.request("/auth/v1/admin/users", {
      method: "POST",
      body: {
        email: identity.email,
        password: identity.password,
        email_confirm: true,
        app_metadata: { provider: "email", providers: ["email"] },
        user_metadata: identity.metadata,
      },
    });
    return payload?.user ?? payload;
  }

  async deleteUser(userId) {
    await this.request(`/auth/v1/admin/users/${encodeURIComponent(userId)}`, { method: "DELETE" });
  }

  async signIn(identity) {
    const payload = await this.request("/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: this.anonHeaders(),
      body: {
        email: identity.email,
        password: identity.password,
      },
    });
    return Boolean(payload?.access_token && payload?.user?.id);
  }
}

async function classifyExisting(client, identity) {
  const matches = await client.findUsersByEmail(identity.email);
  if (matches.length > 1) {
    return { status: "collision", reason: "multiple_users_match_email", matches: matches.map(publicUserRef) };
  }
  if (matches.length === 0) return { status: "absent" };
  const user = matches[0];
  if (!isMarkedPhase2F(user, identity)) {
    return { status: "collision", reason: "existing_user_is_not_exact_phase2f_fixture", user: publicUserRef(user) };
  }
  return { status: "reusable", user };
}

export async function provisionAuthFixtures({ client, identities }) {
  const results = [];
  const created = [];
  for (const identity of identities) {
    const existing = await classifyExisting(client, identity);
    if (existing.status === "collision") {
      results.push({ role: identity.key, status: "collision", reason: existing.reason, user: existing.user, matches: existing.matches });
      continue;
    }
    let user = existing.user;
    let status = "reused";
    if (existing.status === "absent") {
      user = await client.createUser(identity);
      status = "created";
      created.push(user?.id);
    }
    try {
      const ok = await client.signIn(identity);
      if (!ok) {
        results.push({ role: identity.key, status: "credential_mismatch", user: publicUserRef(user) });
        continue;
      }
    } catch {
      results.push({ role: identity.key, status: "credential_mismatch", user: publicUserRef(user) });
      continue;
    }
    results.push({ role: identity.key, status, user: publicUserRef(user), createdByThisRun: status === "created" });
  }
  return {
    ok: results.every((result) => ["created", "reused"].includes(result.status)),
    results,
    createdUserIds: created,
  };
}

export async function verifyAuthFixtures({ client, identities }) {
  const results = [];
  for (const identity of identities) {
    const existing = await classifyExisting(client, identity);
    if (existing.status !== "reusable") {
      results.push({ role: identity.key, status: existing.status === "absent" ? "failed" : "collision", reason: existing.reason });
      continue;
    }
    try {
      const ok = await client.signIn(identity);
      results.push({ role: identity.key, status: ok ? "verified" : "credential_mismatch", user: publicUserRef(existing.user) });
    } catch {
      results.push({ role: identity.key, status: "credential_mismatch", user: publicUserRef(existing.user) });
    }
  }
  return { ok: results.every((result) => result.status === "verified"), results };
}

export async function cleanupCreatedAuthFixtures({ client, identities, createdUserIds = [] }) {
  const allowed = new Map();
  for (const identity of identities) {
    const existing = await classifyExisting(client, identity);
    if (existing.status === "reusable") allowed.set(existing.user.id, identity.key);
  }
  const results = [];
  for (const userId of createdUserIds) {
    if (!allowed.has(userId)) {
      results.push({ userId, status: "refused", reason: "user_not_marked_as_current_phase2f_fixture" });
      continue;
    }
    await client.deleteUser(userId);
    results.push({ role: allowed.get(userId), status: "deleted" });
  }
  return { ok: results.every((result) => result.status === "deleted"), results };
}
