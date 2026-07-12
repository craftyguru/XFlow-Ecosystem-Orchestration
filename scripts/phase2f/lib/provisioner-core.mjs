import { createHash } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const ENV_FILE = resolve(ROOT, ".env.phase2f.local");
export const STATE_FILE = resolve(ROOT, ".phase2f-fixture-state.local.json");

export const FIXTURE_MARKER = Object.freeze({
  phase: "2F",
  label: "phase2f-production-proof",
  environment: "production-proof",
  isTest: true,
});

export const REVIEWED_ADAPTER_MANIFEST = Object.freeze({
  version: "phase2f-production-fixtures-v1",
  reviewedCommit: "161a410b8b96849d8790bbd2d857fab01f579928",
  fixtureMarkerVersion: "phase2f-production-proof",
  reviewedAdapters: ["auth", "xflow", "verixet", "rataify", "audaix", "crevux", "wordgeni"],
  schemas: {
    auth: ["auth.users"],
    xflow: ["core.workspaces", "core.workspace_members", "core.workspace_app_access", "core.app_connections", "xflow.app_links"],
    verixet: ["verixet.billing_accounts", "verixet.entitlement_decisions"],
    rataify: ["rataify.sites", "rataify.reviews", "rataify.issues", "rataify.evidence_items"],
    audaix: ["audaix.audits", "audaix.audit_reports", "audaix.audit_findings"],
    crevux: ["crevux.projects", "crevux.assets", "crevux.exports"],
    wordgeni: ["wordgeni.documents", "wordgeni.document_sources", "wordgeni.provenance_items"],
  },
  permittedOperationTypes: ["create-or-reuse-marked-fixture", "verify-marked-fixture", "delete-marked-fixture"],
  prohibitedOperationTypes: ["stripe-mutation", "provider-call", "checkout", "subscription", "invoice", "payment-method", "crawl", "scan-execution", "audit-execution", "ai-generation", "embedding", "ingestion", "paid-export"],
  cleanupDependencyOrder: ["wordgeni", "crevux", "audaix", "rataify", "verixet", "xflow", "auth"],
});

export const IDENTITIES = Object.freeze([
  { key: "standard", label: "ecosystem_test_standard", role: "member", required: true, entitlement: "none" },
  { key: "denied", label: "ecosystem_test_denied", role: "member", required: true, entitlement: "denied" },
  { key: "outsider", label: "ecosystem_test_outsider", role: "none", required: true, entitlement: "none" },
  { key: "entitled", label: "ecosystem_test_entitled", role: "member", required: false, entitlement: "non_billable_test" },
  { key: "admin", label: "ecosystem_test_admin", role: "workspace_admin", required: false, entitlement: "none" },
]);

export const REQUIRED_ENV = Object.freeze([
  "PHASE2F_STANDARD_EMAIL",
  "PHASE2F_STANDARD_PASSWORD",
  "PHASE2F_DENIED_EMAIL",
  "PHASE2F_DENIED_PASSWORD",
  "PHASE2F_OUTSIDER_EMAIL",
  "PHASE2F_OUTSIDER_PASSWORD",
  "PHASE2F_PROOF_WORKSPACE_SLUG",
]);

export const REQUIRED_PRODUCTION_ENV = Object.freeze([
  ...REQUIRED_ENV,
  "PHASE2F_DATABASE_URL",
  "PHASE2F_EXPECTED_PROJECT_REF",
  "PHASE2F_EXPECTED_DB_HOST",
  "PHASE2F_EXPECTED_DB_NAME",
  "PHASE2F_EXPECTED_ENVIRONMENT_NAME",
  "PHASE2F_REVIEWED_MANIFEST_VERSION",
]);

export const OPTIONAL_ENV = Object.freeze([
  "PHASE2F_ENTITLED_EMAIL",
  "PHASE2F_ENTITLED_PASSWORD",
  "PHASE2F_ADMIN_EMAIL",
  "PHASE2F_ADMIN_PASSWORD",
  "PHASE2F_SUPABASE_URL",
  "PHASE2F_SUPABASE_SERVICE_ROLE_KEY",
  "PHASE2F_EXPECTED_SUPABASE_PROJECT_REF",
]);

export const SCHEMA_EVIDENCE = Object.freeze({
  xflow: [
    "apps/XFlow/drizzle/schema/users.ts",
    "apps/XFlow/drizzle/schema/workspaces.ts",
    "apps/XFlow/drizzle/schema/apps.ts",
    "apps/XFlow/drizzle/schema/connections.ts",
    "apps/XFlow/drizzle/schema/ecosystem-entitlements.ts",
  ],
  verixet: ["apps/Verixet/src/db/schema.ts"],
  rataify: ["apps/RatAiFy/shared/schema.ts"],
  audaix: ["apps/AudAix/scripts/smoke-shared-supabase-local.ts"],
  crevux: [
    "apps/Crevux/lib/db/src/schema/users.ts",
    "apps/Crevux/lib/db/src/schema/workspaces.ts",
    "apps/Crevux/lib/db/src/schema/projects.ts",
    "apps/Crevux/lib/db/src/schema/assets.ts",
    "apps/Crevux/lib/db/src/schema/assetExports.ts",
  ],
  wordgeni: ["apps/WordGeni/apps/api/src/db/schema.ts"],
});

export function parseArgs(argv) {
  const flags = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      flags.set(arg, next);
      i += 1;
    } else {
      flags.set(arg, true);
    }
  }
  return {
    dryRun: flags.has("--dry-run"),
    environment: String(flags.get("--environment") || "dry-run"),
    confirmProductionFixtures: flags.has("--confirm-production-fixtures"),
    confirmTestFixtures: flags.has("--confirm-test-fixtures"),
    enableReviewedWriteAdapters: flags.has("--enable-reviewed-write-adapters"),
    includeOptional: flags.has("--include-optional"),
    manifestVersion: String(flags.get("--manifest-version") || flags.get("--reviewed-manifest-version") || ""),
    json: flags.has("--json"),
  };
}

export function parseEnvFile(text) {
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

export function loadLocalEnv() {
  const processEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("PHASE2F_") || key === "DATABASE_URL"));
  try {
    return { ...parseEnvFile(readFileSync(ENV_FILE, "utf8")), ...processEnv };
  } catch (error) {
    if (error.code === "ENOENT") return processEnv;
    throw error;
  }
}

export function validateRuntime(args, env) {
  const errors = [];
  if (args.environment === "production" && !args.dryRun) {
    if (args.environment !== "production") errors.push("real execution requires --environment production");
    if (!args.confirmProductionFixtures) errors.push("real execution requires --confirm-production-fixtures");
    if (!args.enableReviewedWriteAdapters) errors.push("real execution requires --enable-reviewed-write-adapters");
    if (env.PHASE2F_REVIEWED_MANIFEST_VERSION !== REVIEWED_ADAPTER_MANIFEST.version && args.manifestVersion !== REVIEWED_ADAPTER_MANIFEST.version) {
      errors.push(`production execution requires reviewed manifest version ${REVIEWED_ADAPTER_MANIFEST.version}`);
    }
    for (const key of REQUIRED_PRODUCTION_ENV) {
      if (!env[key]) errors.push(`missing required environment variable ${key}`);
    }
  } else if (!args.dryRun && args.environment !== "local") {
    errors.push("non-production validation execution currently supports --environment local only");
  } else if (!args.dryRun && args.environment === "local" && !args.confirmTestFixtures) {
    errors.push("local validation execution requires --confirm-test-fixtures");
  }
  if (env.PHASE2F_SUPABASE_URL && env.PHASE2F_EXPECTED_SUPABASE_PROJECT_REF) {
    const expected = env.PHASE2F_EXPECTED_SUPABASE_PROJECT_REF;
    if (!env.PHASE2F_SUPABASE_URL.includes(expected)) {
      errors.push("PHASE2F_SUPABASE_URL does not contain PHASE2F_EXPECTED_SUPABASE_PROJECT_REF");
    }
  }
  return errors;
}

export function targetBindingFor({ environment, target, manifestVersion = REVIEWED_ADAPTER_MANIFEST.version }) {
  const input = `${environment}:${target.hostname}:${target.port}:${target.database}`;
  return {
    environment,
    manifestVersion,
    targetHash: createHash("sha256").update(input).digest("hex"),
    databaseName: target.database,
  };
}

export function validateStateTargetBinding({ state, binding }) {
  if (!state?.targetBinding) return [];
  const errors = [];
  for (const key of ["environment", "manifestVersion", "targetHash"]) {
    if (state.targetBinding[key] !== binding[key]) errors.push(`state-file target binding mismatch for ${key}`);
  }
  return errors;
}

function op(input) {
  const required = ["id", "app", "category", "action", "target", "deterministicKey", "preconditions", "idempotencyRule", "verification", "cleanup", "costControls", "schemaEvidence"];
  for (const key of required) {
    if (input[key] == null || (Array.isArray(input[key]) && input[key].length === 0)) {
      throw new Error(`operation ${input.id || "(unknown)"} missing ${key}`);
    }
  }
  return Object.freeze({ mode: "planned", ...input });
}

export function buildPlan({ includeOptional = false } = {}) {
  const workspaceSlug = "${PHASE2F_PROOF_WORKSPACE_SLUG}";
  const identities = IDENTITIES.filter((identity) => identity.required || includeOptional);
  const operations = [
    ...identities.map((identity) =>
      op({
        id: `identity.${identity.key}`,
        app: "ecosystem",
        category: "identity",
        action: "create-or-reuse-auth-user-and-app-mirrors",
        target: identity.label,
        deterministicKey: `phase2f:${identity.label}`,
        preconditions: [
          "email and password are present in the ignored env file",
          "existing user with same email is absent or has phase2f test marker",
          "no unrestricted platform-admin grant is created",
        ],
        idempotencyRule: "lookup by normalized email and phase2f metadata before create",
        verification: "auth user exists, app-local mirror exists where required, and no secret value is returned",
        cleanup: "delete only if email, metadata marker, and state-file user id all match",
        costControls: ["no provider call", "no Stripe call", "no email/SMS side effect unless app auth provider requires it"],
        schemaEvidence: [SCHEMA_EVIDENCE.xflow[0], SCHEMA_EVIDENCE.verixet[0], SCHEMA_EVIDENCE.rataify[0], SCHEMA_EVIDENCE.crevux[0], SCHEMA_EVIDENCE.wordgeni[0]],
      }),
    ),
    op({
      id: "xflow.workspace",
      app: "xflow",
      category: "workspace",
      action: "create-or-reuse-proof-workspace",
      target: workspaceSlug,
      deterministicKey: "phase2f:workspace:${PHASE2F_PROOF_WORKSPACE_SLUG}",
      preconditions: ["slug starts with ecosystem-production-proof-", "no non-test workspace uses the slug"],
      idempotencyRule: "lookup XFlow workspaces.slug before insert",
      verification: "workspaces row exists and workspace_members includes standard/denied members only",
      cleanup: "delete only when workspace slug, state id, and test marker match and no non-test dependent data exists",
      costControls: ["no app connection secret mutation", "no provider integration mutation"],
      schemaEvidence: [SCHEMA_EVIDENCE.xflow[1], SCHEMA_EVIDENCE.xflow[2], SCHEMA_EVIDENCE.xflow[3]],
    }),
    op({
      id: "xflow.app-catalog",
      app: "xflow",
      category: "catalog",
      action: "designate-app-catalog-readiness-records",
      target: "apps/app_connections metadata-only rows for Verixet handoff and six app catalog",
      deterministicKey: "phase2f:xflow:catalog",
      preconditions: ["proof workspace exists", "no token_encrypted or webhook_secret_encrypted values are written"],
      idempotencyRule: "upsert by workspace_id and app slug",
      verification: "catalog rows are readable and connection status is metadata-only/test",
      cleanup: "remove only rows with phase2f marker and proof workspace id",
      costControls: ["no secret write", "no outbound verification call"],
      schemaEvidence: [SCHEMA_EVIDENCE.xflow[2], SCHEMA_EVIDENCE.xflow[3]],
    }),
    op({
      id: "verixet.billing-account",
      app: "verixet",
      category: "billing",
      action: "create-or-reuse-non-stripe-test-billing-account",
      target: "billing_accounts metadata test account",
      deterministicKey: "phase2f:verixet:billing-account",
      preconditions: ["workspace mirror exists", "stripe_customer_id is null", "provider remains non-mutating/test where schema allows"],
      idempotencyRule: "lookup by workspace_id and metadata.phase2f label",
      verification: "billing account is active/default test metadata and has no Stripe customer id",
      cleanup: "delete only metadata-marked test billing account with null stripe_customer_id",
      costControls: ["no Stripe customer", "no subscription", "no checkout", "no webhook"],
      schemaEvidence: [SCHEMA_EVIDENCE.verixet[0]],
    }),
    op({
      id: "verixet.entitlement-denied",
      app: "verixet",
      category: "entitlement",
      action: "verify-denied-subject-has-no-active-grant",
      target: "ecosystem_test_denied",
      deterministicKey: "phase2f:verixet:denied-entitlement",
      preconditions: ["denied user exists", "workspace mirror exists"],
      idempotencyRule: "do not create an entitlement grant for denied subject",
      verification: "active entitlement_grants query returns zero rows for denied user/workspace",
      cleanup: "not applicable; verifier fails if any active grant exists",
      costControls: ["no billing mutation", "no Stripe mutation"],
      schemaEvidence: [SCHEMA_EVIDENCE.verixet[0]],
    }),
    op({
      id: "verixet.entitlement-optional",
      app: "verixet",
      category: "entitlement",
      action: "optional-non-billable-test-grant",
      target: "ecosystem_test_entitled",
      deterministicKey: "phase2f:verixet:non-billable-entitlement",
      preconditions: ["optional entitled identity is explicitly included", "commerce subscription dependency is satisfied by an approved non-billable test record"],
      idempotencyRule: "lookup by workspace_id, user_id, environment=production-proof, metadata phase2f marker",
      verification: "grant is active, environment is production-proof, source Stripe event id is null/test, and no Stripe ids are present",
      cleanup: "revoke by setting revoked_at only when marker and state id match",
      costControls: ["no Stripe subscription", "no checkout", "no invoice", "no payment method"],
      schemaEvidence: [SCHEMA_EVIDENCE.verixet[0]],
    }),
    op({
      id: "rataify.fixture",
      app: "rataify",
      category: "stored-fixture",
      action: "create-or-reuse-metadata-only-site-scan-report",
      target: "orgs/sites/scans/pages/issues/report_export_requests",
      deterministicKey: "phase2f:rataify:stored-report",
      preconditions: ["org is linked to proof workspace", "site URL is .invalid or explicitly test-owned", "no live scan job is queued"],
      idempotencyRule: "lookup by ecosystem_workspace_id and app_site_slug/fixture marker",
      verification: "stored scan status is completed and report export is metadata_only/completed_metadata_only",
      cleanup: "delete only marker-linked site/report rows after dependent test rows are removed",
      costControls: ["no crawl", "no browser provider", "no AI provider", "no external analysis"],
      schemaEvidence: SCHEMA_EVIDENCE.rataify,
    }),
    op({
      id: "audaix.fixture",
      app: "audaix",
      category: "stored-fixture",
      action: "create-or-reuse-stored-audit-report-evidence",
      target: "audaix.audits/audit_reports/audit_findings/scan_jobs",
      deterministicKey: "phase2f:audaix:stored-audit",
      preconditions: ["core proof workspace exists", "audaix schema tables exist", "metadata marker is available"],
      idempotencyRule: "lookup by workspace_id and metadata.phase2f label",
      verification: "audit/report/finding rows exist with completed/published stored statuses",
      cleanup: "delete only rows where metadata marker and workspace id match",
      costControls: ["no Lighthouse", "no crawler", "no repo inspection", "no AI provider", "no monitor job"],
      schemaEvidence: SCHEMA_EVIDENCE.audaix,
    }),
    op({
      id: "crevux.fixture",
      app: "crevux",
      category: "stored-fixture",
      action: "create-or-reuse-project-asset-export-placeholder",
      target: "projects/assets/asset_exports",
      deterministicKey: "phase2f:crevux:stored-asset",
      preconditions: ["local workspace is linked to proof workspace", "asset metadata is placeholder/test-only"],
      idempotencyRule: "lookup by workspace id and asset metadata phase2f marker",
      verification: "project, asset, and completed metadata-only export row are readable by owner and denied to outsider",
      cleanup: "delete only marker-linked export, asset, and project rows",
      costControls: ["no image/video/audio generation", "no rendering", "no storage expansion", "no paid export provider"],
      schemaEvidence: SCHEMA_EVIDENCE.crevux,
    }),
    op({
      id: "wordgeni.fixture",
      app: "wordgeni",
      category: "stored-fixture",
      action: "create-or-reuse-document-source-provenance-export",
      target: "projects/sources/documents/provenance_events/exports",
      deterministicKey: "phase2f:wordgeni:stored-document",
      preconditions: ["workspace and project exist", "source content is static fixture text", "embedding vector is empty/non-provider"],
      idempotencyRule: "lookup by workspace slug/project name/source metadata phase2f marker",
      verification: "document/source/provenance/export rows are readable without invoking provider jobs",
      cleanup: "delete only marker-linked export/provenance/document/source/project rows",
      costControls: ["no writing", "no embedding", "no ingestion worker", "no retrieval", "no paid export provider"],
      schemaEvidence: SCHEMA_EVIDENCE.wordgeni,
    }),
  ];
  return {
    marker: FIXTURE_MARKER,
    manifest: REVIEWED_ADAPTER_MANIFEST,
    identities,
    operations,
    summary: {
      operationCount: operations.length,
      apps: [...new Set(operations.map((operation) => operation.app))],
      productionWritesEnabled: "calculated-at-runtime",
      realExecutionBoundary: "requires environment confirmation, reviewed adapter manifest, target validation, clean state binding, and provider/billing guard",
    },
  };
}

export function validatePlan(plan) {
  const errors = [];
  const ids = new Set();
  for (const operation of plan.operations) {
    if (ids.has(operation.id)) errors.push(`duplicate operation id ${operation.id}`);
    ids.add(operation.id);
    for (const key of ["deterministicKey", "preconditions", "idempotencyRule", "verification", "cleanup", "costControls"]) {
      if (!operation[key] || (Array.isArray(operation[key]) && operation[key].length === 0)) {
        errors.push(`${operation.id} missing ${key}`);
      }
    }
    for (const evidence of operation.schemaEvidence) {
      try {
        readFileSync(resolve(ROOT, evidence), "utf8");
      } catch {
        errors.push(`${operation.id} schema evidence missing: ${evidence}`);
      }
    }
  }
  return errors;
}

export function validateProviderBillingGuard(plan) {
  const prohibited = [
    /create\s+stripe/i,
    /mutate\s+stripe/i,
    /create\s+checkout/i,
    /create\s+subscription/i,
    /create\s+invoice/i,
    /attach\s+payment/i,
    /enqueue\s+provider/i,
    /call\s+provider/i,
    /run\s+ai/i,
    /create\s+embedding/i,
    /run\s+crawl/i,
    /execute\s+scan/i,
    /execute\s+audit/i,
    /render\s+media/i,
    /transcribe/i,
    /run\s+ingestion/i,
    /run\s+paid\s+export/i,
  ];
  const errors = [];
  for (const operation of plan.operations) {
    const text = `${operation.action} ${operation.target} ${operation.idempotencyRule}`.replace(/no [^",\]]+/gi, "");
    for (const pattern of prohibited) {
      if (pattern.test(text)) errors.push(`${operation.id} references prohibited operation ${pattern}`);
    }
  }
  return errors;
}

export function redactResult(result) {
  return JSON.parse(
    JSON.stringify(result, (key, value) => {
      if (/password|token|secret|cookie|key/i.test(key)) return value ? "[REDACTED]" : value;
      return value;
    }),
  );
}

export function readState() {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export function writeStateAtomic(nextState) {
  const temp = `${STATE_FILE}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temp, `${JSON.stringify(redactResult(nextState), null, 2)}\n`, "utf8");
  renameSync(temp, STATE_FILE);
}

export function buildRunResult({ command, args, env = loadLocalEnv() }) {
  const plan = buildPlan({ includeOptional: args.includeOptional });
  const runtimeErrors = validateRuntime(args, env);
  const planErrors = validatePlan(plan);
  const guardErrors = validateProviderBillingGuard(plan);
  const missingEnv = (args.environment === "production" ? REQUIRED_PRODUCTION_ENV : REQUIRED_ENV).filter((key) => !env[key]);
  const productionGate = {
    defaultDeny: true,
    manifestVersion: REVIEWED_ADAPTER_MANIFEST.version,
    reviewedAdapters: REVIEWED_ADAPTER_MANIFEST.reviewedAdapters,
    providerBillingGuardPassed: guardErrors.length === 0,
    preTargetChecksPassed: runtimeErrors.length === 0 && planErrors.length === 0 && guardErrors.length === 0,
    productionWritesEnabled: false,
  };
  return redactResult({
    ok: runtimeErrors.length === 0 && planErrors.length === 0 && guardErrors.length === 0,
    command,
    dryRun: args.dryRun,
    environment: args.environment,
    confirmProductionFixtures: args.confirmProductionFixtures,
    envFile: ENV_FILE,
    stateFile: STATE_FILE,
    missingEnv: args.dryRun ? missingEnv : [],
    runtimeErrors,
    planErrors,
    guardErrors,
    productionGate,
    plan,
  });
}
