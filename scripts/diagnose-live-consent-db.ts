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
      console.error("The pg package is required. Run from a checkout with XFlow dependencies installed.");
      process.exit(2);
    }
  }
}

function requireDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    console.error("DATABASE_URL is required. The value is never printed.");
    process.exit(2);
  }
  return value;
}

function databaseTarget(value: string): { host: string; database: string; username: string } {
  const parsed = new URL(value);
  return {
    host: parsed.hostname,
    database: parsed.pathname.replace(/^\//, "") || "(default)",
    username: parsed.username || "(unknown)",
  };
}

async function tableExists(client: any, regclass: string): Promise<boolean> {
  const result = await client.query("select to_regclass($1) as reg", [regclass]);
  return Boolean(result.rows[0]?.reg);
}

async function rows(client: any, sql: string, params: unknown[] = []): Promise<Row[]> {
  const result = await client.query(sql, params);
  return result.rows;
}

function expectedIdentityModel(input: {
  publicUserConsents: boolean;
  publicUsers: boolean;
  publicWorkspaces: boolean;
  authUsers: boolean;
  coreProfiles: boolean;
  coreWorkspaceMembers: boolean;
  publicUserConsentFks: Row[];
}): { status: "pass" | "warn" | "fail"; detail: string } {
  if (!input.publicUserConsents) {
    return {
      status: "fail",
      detail: "XFlow consent route writes public.user_consents, but public.user_consents is missing.",
    };
  }
  const userFk = input.publicUserConsentFks.find((fk) => fk.column_name === "user_id");
  const workspaceFk = input.publicUserConsentFks.find((fk) => fk.column_name === "workspace_id");
  if (!userFk || userFk.foreign_table_schema !== "public" || userFk.foreign_table_name !== "users") {
    return {
      status: "fail",
      detail: "public.user_consents.user_id does not reference public.users(id), which the current XFlow runtime expects.",
    };
  }
  if (!workspaceFk || workspaceFk.foreign_table_schema !== "public" || workspaceFk.foreign_table_name !== "workspaces") {
    return {
      status: "fail",
      detail:
        "public.user_consents.workspace_id does not reference public.workspaces(id), which the current XFlow runtime expects.",
    };
  }
  if (!input.publicUsers || !input.publicWorkspaces) {
    return {
      status: "fail",
      detail: "Current XFlow runtime consent persistence expects public.users and public.workspaces.",
    };
  }
  if (input.authUsers && input.coreProfiles && input.coreWorkspaceMembers) {
    return {
      status: "warn",
      detail:
        "Both legacy public.* and shared auth/core tables exist. Current XFlow consent route still writes public.user_consents tied to public.users.",
    };
  }
  return {
    status: "pass",
    detail: "Current XFlow consent route and database schema agree on public.user_consents -> public.users/workspaces.",
  };
}

async function main(): Promise<void> {
  const databaseUrl = requireDatabaseUrl();
  const Client = loadPgClient();
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const publicUserConsents = await tableExists(client, "public.user_consents");
    const publicUsers = await tableExists(client, "public.users");
    const publicWorkspaces = await tableExists(client, "public.workspaces");
    const authUsers = await tableExists(client, "auth.users");
    const coreProfiles = await tableExists(client, "core.profiles");
    const coreWorkspaceMembers = await tableExists(client, "core.workspace_members");

    const publicUserConsentColumns = publicUserConsents
      ? await rows(
          client,
          `
            select column_name, data_type, is_nullable, column_default
            from information_schema.columns
            where table_schema = 'public' and table_name = 'user_consents'
            order by ordinal_position
          `
        )
      : [];

    const publicUserConsentFks = publicUserConsents
      ? await rows(
          client,
          `
            select
              tc.constraint_name,
              kcu.column_name,
              ccu.table_schema as foreign_table_schema,
              ccu.table_name as foreign_table_name,
              ccu.column_name as foreign_column_name,
              rc.delete_rule
            from information_schema.table_constraints tc
            join information_schema.key_column_usage kcu
              on tc.constraint_name = kcu.constraint_name
             and tc.table_schema = kcu.table_schema
            join information_schema.constraint_column_usage ccu
              on ccu.constraint_name = tc.constraint_name
             and ccu.table_schema = tc.table_schema
            join information_schema.referential_constraints rc
              on rc.constraint_name = tc.constraint_name
             and rc.constraint_schema = tc.table_schema
            where tc.constraint_type = 'FOREIGN KEY'
              and tc.table_schema = 'public'
              and tc.table_name = 'user_consents'
            order by tc.constraint_name
          `
        )
      : [];

    const report = {
      schemaVersion: 1,
      database: databaseTarget(databaseUrl),
      checks: {
        publicUserConsents,
        publicUsers,
        publicWorkspaces,
        authUsers,
        coreProfiles,
        coreWorkspaceMembers,
      },
      publicUserConsentColumns,
      publicUserConsentForeignKeys: publicUserConsentFks,
      expectedIdentityModel: expectedIdentityModel({
        publicUserConsents,
        publicUsers,
        publicWorkspaces,
        authUsers,
        coreProfiles,
        coreWorkspaceMembers,
        publicUserConsentFks,
      }),
      secretsPrinted: false,
    };

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`diagnose-live-consent-db failed: ${message.replace(/postgres:\/\/[^@\s]+@/g, "postgres://[redacted]@")}`);
  process.exit(1);
});
