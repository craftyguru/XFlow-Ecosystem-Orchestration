import test from "node:test";
import assert from "node:assert/strict";
import {
  SupabaseAuthAdminClient,
  buildPhase2fAuthIdentities,
  cleanupCreatedAuthFixtures,
  provisionAuthFixtures,
  redactText,
  resolveSupabaseAuthConfig,
  verifyAuthFixtures,
} from "./supabase-auth-admin.mjs";

function env(overrides = {}) {
  return {
    PHASE2F_STANDARD_EMAIL: "standard@example.invalid",
    PHASE2F_STANDARD_PASSWORD: "standard-private-password",
    PHASE2F_DENIED_EMAIL: "denied@example.invalid",
    PHASE2F_DENIED_PASSWORD: "denied-private-password",
    PHASE2F_OUTSIDER_EMAIL: "outsider@example.invalid",
    PHASE2F_OUTSIDER_PASSWORD: "outsider-private-password",
    PHASE2F_PROOF_WORKSPACE_SLUG: "ecosystem-production-proof-test",
    PHASE2F_EXPECTED_PROJECT_REF: "expected-ref",
    PHASE2F_SUPABASE_URL: "https://expected-ref.supabase.co",
    PHASE2F_SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
    PHASE2F_SUPABASE_ANON_KEY: "anon-secret",
    ...overrides,
  };
}

function markedUser({ id, email, persona, identityLabel }) {
  return {
    id,
    email,
    user_metadata: {
      phase: "2F",
      label: "phase2f-production-proof",
      environment: "production-proof",
      isTest: true,
      adapter: "auth",
      persona,
      fixtureVersion: "phase2f-production-fixtures-v1",
      identityLabel,
      role: persona === "outsider" ? "none" : "member",
    },
  };
}

function makeFetch({ initialUsers = [], failSignInFor = new Set() } = {}) {
  const calls = [];
  const users = [...initialUsers];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });
    const path = new URL(url).pathname;
    const search = new URL(url).search;
    if (path === "/auth/v1/admin/users" && options.method !== "POST") {
      return response(200, { users });
    }
    if (path === "/auth/v1/admin/users" && options.method === "POST") {
      const body = JSON.parse(options.body);
      const persona = body.user_metadata.persona;
      const user = markedUser({
        id: `user-${persona}`,
        email: body.email,
        persona,
        identityLabel: body.user_metadata.identityLabel,
      });
      users.push(user);
      return response(200, { user });
    }
    if (path === "/auth/v1/token" && search === "?grant_type=password") {
      const body = JSON.parse(options.body);
      if (failSignInFor.has(body.email)) return response(400, { error: "invalid_grant" });
      return response(200, { access_token: "discard-me", user: { id: `signed-${body.email}` } });
    }
    if (path.startsWith("/auth/v1/admin/users/") && options.method === "DELETE") {
      const id = decodeURIComponent(path.split("/").at(-1));
      const index = users.findIndex((user) => user.id === id);
      if (index >= 0) users.splice(index, 1);
      return response(200, {});
    }
    return response(404, { error: "not found" });
  };
  return { fetchImpl, calls, users };
}

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(body);
    },
  };
}

test("configured emails and passwords are consumed without live defaults", () => {
  const identities = buildPhase2fAuthIdentities(env());
  assert.deepEqual(
    identities.map((identity) => identity.email),
    ["standard@example.invalid", "denied@example.invalid", "outsider@example.invalid"],
  );
  assert.equal(identities[0].password, "standard-private-password");
  assert.equal(identities.some((identity) => identity.email.includes("phase2f.standard@example.invalid")), false);
});

test("placeholder and service role config are refused", () => {
  assert.throws(() => buildPhase2fAuthIdentities(env({ PHASE2F_STANDARD_PASSWORD: "REQUIRES_PRIVATE_INPUT" })), /incomplete/);
  assert.throws(() => resolveSupabaseAuthConfig(env({ PHASE2F_SUPABASE_SERVICE_ROLE_KEY: "replace_me" })), /not usable/);
  try {
    resolveSupabaseAuthConfig(env({ PHASE2F_SUPABASE_URL: "https://other-ref.supabase.co" }));
    assert.fail("expected project-ref mismatch");
  } catch (error) {
    assert.ok(error.details.errors.some((entry) => entry.includes("project ref")));
  }
});

test("passwords only reach create and sign-in requests", async () => {
  const identities = buildPhase2fAuthIdentities(env());
  const { fetchImpl, calls } = makeFetch();
  const client = new SupabaseAuthAdminClient({ config: resolveSupabaseAuthConfig(env()), fetchImpl });
  const result = await provisionAuthFixtures({ client, identities });
  assert.equal(result.ok, true);
  const requestBodies = calls.map((call) => call.options.body ?? "").filter(Boolean);
  assert.equal(requestBodies.filter((body) => body.includes("standard-private-password")).length, 2);
  assert.equal(JSON.stringify(result).includes("standard-private-password"), false);
});

test("exact marked users are reused and verified", async () => {
  const identities = buildPhase2fAuthIdentities(env());
  const { fetchImpl } = makeFetch({
    initialUsers: identities.map((identity) =>
      markedUser({ id: `existing-${identity.key}`, email: identity.email, persona: identity.key, identityLabel: identity.label }),
    ),
  });
  const client = new SupabaseAuthAdminClient({ config: resolveSupabaseAuthConfig(env()), fetchImpl });
  const result = await provisionAuthFixtures({ client, identities });
  assert.equal(result.ok, true);
  assert.deepEqual(result.results.map((entry) => entry.status), ["reused", "reused", "reused"]);
  const verify = await verifyAuthFixtures({ client, identities });
  assert.equal(verify.ok, true);
});

test("non-test and ambiguous collisions are refused", async () => {
  const identities = buildPhase2fAuthIdentities(env());
  const clientA = new SupabaseAuthAdminClient({
    config: resolveSupabaseAuthConfig(env()),
    fetchImpl: makeFetch({ initialUsers: [{ id: "real", email: identities[0].email, user_metadata: {} }] }).fetchImpl,
  });
  const nonTest = await provisionAuthFixtures({ client: clientA, identities: [identities[0]] });
  assert.equal(nonTest.ok, false);
  assert.equal(nonTest.results[0].status, "collision");

  const duplicate = markedUser({ id: "a", email: identities[0].email, persona: "standard", identityLabel: identities[0].label });
  const clientB = new SupabaseAuthAdminClient({
    config: resolveSupabaseAuthConfig(env()),
    fetchImpl: makeFetch({ initialUsers: [duplicate, { ...duplicate, id: "b" }] }).fetchImpl,
  });
  const ambiguous = await provisionAuthFixtures({ client: clientB, identities: [identities[0]] });
  assert.equal(ambiguous.results[0].reason, "multiple_users_match_email");
});

test("credential mismatch does not reset or recreate a marked user", async () => {
  const identities = buildPhase2fAuthIdentities(env());
  const user = markedUser({ id: "existing", email: identities[0].email, persona: "standard", identityLabel: identities[0].label });
  const { fetchImpl, calls } = makeFetch({ initialUsers: [user], failSignInFor: new Set([identities[0].email]) });
  const client = new SupabaseAuthAdminClient({ config: resolveSupabaseAuthConfig(env()), fetchImpl });
  const result = await provisionAuthFixtures({ client, identities: [identities[0]] });
  assert.equal(result.results[0].status, "credential_mismatch");
  assert.equal(calls.some((call) => call.options.method === "POST" && new URL(call.url).pathname === "/auth/v1/admin/users"), false);
});

test("cleanup deletes only users created by this run", async () => {
  const identities = buildPhase2fAuthIdentities(env());
  const { fetchImpl, users } = makeFetch();
  const client = new SupabaseAuthAdminClient({ config: resolveSupabaseAuthConfig(env()), fetchImpl });
  const provision = await provisionAuthFixtures({ client, identities });
  const cleanup = await cleanupCreatedAuthFixtures({ client, identities, createdUserIds: [provision.results[0].user.id] });
  assert.equal(cleanup.ok, true);
  assert.equal(users.some((user) => user.id === provision.results[0].user.id), false);
  assert.equal(users.length, 2);
});

test("optional identity consumes optional configured values only when included", () => {
  assert.equal(buildPhase2fAuthIdentities(env()).length, 3);
  const withOptional = buildPhase2fAuthIdentities(
    env({
      PHASE2F_ENTITLED_EMAIL: "entitled@example.invalid",
      PHASE2F_ENTITLED_PASSWORD: "entitled-private-password",
      PHASE2F_ADMIN_EMAIL: "admin@example.invalid",
      PHASE2F_ADMIN_PASSWORD: "admin-private-password",
    }),
    { includeOptional: true },
  );
  assert.equal(withOptional.length, 5);
});

test("dynamic redaction removes configured passwords and keys", () => {
  const redacted = redactText("standard-private-password service-role-secret anon-secret", [
    "standard-private-password",
    "service-role-secret",
    "anon-secret",
  ]);
  assert.equal(redacted, "[REDACTED] [REDACTED] [REDACTED]");
});
