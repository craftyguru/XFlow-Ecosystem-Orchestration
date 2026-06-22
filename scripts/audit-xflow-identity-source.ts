#!/usr/bin/env tsx
import { createRequire } from "node:module";

type Row = Record<string, unknown>;

const require = createRequire(import.meta.url);

function loadPgClient(): any {
  try {
    return require("pg").Client;
  } catch {
    try {
      return require("../apps/XFlow/node_modules/pg").Client;
    } catch {
      console.error("The pg package is required. Run this from a repo install where XFlow dependencies are installed.");
      process.exit(2);
    }
  }
}

function getArg(name: string): string | null {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1).trim();
  const index = process.argv.indexOf(name);
  if (index >= 0) return process.argv[index + 1]?.trim() ?? null;
  return null;
}

function requireEmail(): string {
  const email = getArg("--email")?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Usage: npx tsx scripts/audit-xflow-identity-source.ts --email user@example.com");
    process.exit(2);
  }
  return email;
}

function getDbUrl(): string {
  const value = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? "";
  if (!value.trim()) {
    console.error("DATABASE_URL or SUPABASE_DB_URL is required. The value is never printed.");
    process.exit(2);
  }
  return value;
}

async function maybeOne(client: any, sql: string, params: unknown[]): Promise<Row | null> {
  try {
    const result = await client.query(sql, params);
    return result.rows[0] ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { unavailable: true, reason: message.replace(/postgres:\/\/[^@\s]+@/g, "postgres://[redacted]@") };
  }
}

async function tableExists(client: any, regclass: string): Promise<boolean> {
  const result = await client.query("select to_regclass($1) as reg", [regclass]);
  return Boolean(result.rows[0]?.reg);
}

function summarizeRecommendedRepair(input: {
  authUser: Row | null;
  legacyUser: Row | null;
  coreProfile: Row | null;
  workspaceMember: Row | null;
}): string {
  if (input.authUser && input.coreProfile && input.workspaceMember) {
    return "No repair needed: Supabase Auth identity, ecosystem profile, and workspace membership were found.";
  }
  if (!input.authUser && input.legacyUser) {
    return "Legacy-only XFlow account found. Dry-run repair should create/link a Supabase Auth user with the same user id, then mirror core.profiles and workspace membership. Do not delete the legacy user.";
  }
  if (input.authUser && !input.coreProfile) {
    return "Supabase Auth user exists but core.profiles is missing. Dry-run repair should upsert core.profiles for this auth.users id.";
  }
  if (input.authUser && !input.workspaceMember) {
    return "Supabase Auth user exists but workspace membership was not found. Dry-run repair should attach the user to the intended workspace after operator confirmation.";
  }
  return "No matching identity was found. Use XFlow signup or a staging-safe admin flow; do not seed production users from this diagnostic.";
}

const email = requireEmail();
const Client = loadPgClient();
const client = new Client({ connectionString: getDbUrl() });

async function main(): Promise<void> {
  await client.connect();

  try {
    const hasAuthUsers = await tableExists(client, "auth.users");
    const hasLegacyUsers = await tableExists(client, "public.users");
    const hasCoreProfiles = await tableExists(client, "core.profiles");
    const hasCoreWorkspaceMembers = await tableExists(client, "core.workspace_members");
    const hasLegacyWorkspaceMembers = await tableExists(client, "public.workspace_members");

    const authUser = hasAuthUsers
      ? await maybeOne(
          client,
          "select id, email, email_confirmed_at is not null as email_confirmed, created_at from auth.users where lower(email) = $1 limit 1",
          [email],
        )
      : null;
    const legacyUser = hasLegacyUsers
      ? await maybeOne(
          client,
          "select id, email, email_verified_at is not null as email_verified, created_at from public.users where lower(email) = $1 limit 1",
          [email],
        )
      : null;
    const authUserId = typeof authUser?.id === "string" ? authUser.id : null;
    const legacyUserId = typeof legacyUser?.id === "string" ? legacyUser.id : null;
    const targetUserId = authUserId ?? legacyUserId;

    const coreProfile =
      hasCoreProfiles && targetUserId
        ? await maybeOne(
            client,
            "select user_id, primary_email, display_name from core.profiles where user_id = $1 or lower(primary_email) = $2 limit 1",
            [targetUserId, email],
          )
        : null;
    const workspaceMember =
      hasCoreWorkspaceMembers && targetUserId
        ? await maybeOne(
            client,
            "select user_id, workspace_id, role from core.workspace_members where user_id = $1 limit 1",
            [targetUserId],
          )
        : null;
    const legacyWorkspaceMember =
      hasLegacyWorkspaceMembers && targetUserId
        ? await maybeOne(
            client,
            "select user_id, workspace_id, role_id from public.workspace_members where user_id = $1 limit 1",
            [targetUserId],
          )
        : null;

    const currentSessionSource = authUser
      ? "Supabase Auth identity available; XFlow should issue sessions from central Supabase verification."
      : legacyUser
        ? "Legacy public.users identity only; current working login may be from a legacy deployment/session path."
        : "No identity found for this email.";

    const report = {
      schemaVersion: 1,
      email,
      checks: {
        authUsersTableAvailable: hasAuthUsers,
        legacyUsersTableAvailable: hasLegacyUsers,
        coreProfilesTableAvailable: hasCoreProfiles,
        coreWorkspaceMembersTableAvailable: hasCoreWorkspaceMembers,
        legacyWorkspaceMembersTableAvailable: hasLegacyWorkspaceMembers,
      },
      existsInSupabaseAuthUsers: Boolean(authUser && !authUser.unavailable),
      existsInLegacyPublicUsers: Boolean(legacyUser && !legacyUser.unavailable),
      existsInCoreProfiles: Boolean(coreProfile && !coreProfile.unavailable),
      existsInCoreWorkspaceMembers: Boolean(workspaceMember && !workspaceMember.unavailable),
      existsInLegacyWorkspaceMembers: Boolean(legacyWorkspaceMember && !legacyWorkspaceMember.unavailable),
      currentWorkspaceRole: workspaceMember?.role ?? legacyWorkspaceMember?.role_id ?? null,
      currentAuthSessionSource: currentSessionSource,
      recommendedRepairAction: summarizeRecommendedRepair({ authUser, legacyUser, coreProfile, workspaceMember }),
      dryRunOnly: true,
    };

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`audit-xflow-identity-source failed: ${message.replace(/postgres:\/\/[^@\s]+@/g, "postgres://[redacted]@")}`);
  process.exit(1);
});
