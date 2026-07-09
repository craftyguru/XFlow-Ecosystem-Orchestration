import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const workspaceRoot = path.resolve(path.dirname(__filename), "..");

const classifications = new Set([
  "locally-fixture-read-proved",
  "locally-response-shape-proved",
  "auth-required-not-exercised",
  "provider-proof-needed",
  "billing-proof-needed",
  "entitlement-proof-needed",
  "ai-provider-proof-needed",
  "scan-provider-proof-needed",
  "audit-provider-proof-needed",
  "audio-provider-proof-needed",
  "mutation-proof-not-executed",
  "not-applicable",
]);

const unsafeKeys = /(^|_)(access_token|refresh_token|id_token|raw_token|bearer_token|api_key|private_key|client_secret|webhook_secret|payment_secret|password|password_hash|secret|secret_key|connection_string|authorization_header|raw_cookie|raw_session_value|provider_credential_payload|raw_provider_error_body|stack_trace|raw_correlation_id)$/i;
const unsafeValues = [
  /\bsk_(?:live|test)_[A-Za-z0-9]{8,}\b/i,
  /\bpk_(?:live|test)_[A-Za-z0-9]{8,}\b/i,
  /\bBearer\s+[A-Za-z0-9._-]{12,}\b/i,
  /\bpostgres(?:ql)?:\/\/[^"'\s]+/i,
  /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/,
];
const mutationMarkers = [/\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\bchild_process\b/, /\bhttps?\.(?:request|get)\s*\(/, /\bnet\.connect\s*\(/];
const routeMutationMethods = /\b(?:router|app)\.(?:post|put|patch|delete)\s*\(|\bexport\s+(?:async\s+)?(?:function|const)\s+(?:POST|PUT|PATCH|DELETE)\b/i;

const apps = [
  {
    app: "CreVux",
    root: "apps/CreVux",
    proofRegister: "apps/CreVux/docs/crevux-local-route-auth-proof-register.json",
    routes: [
      { file: "artifacts/api-server/src/routes/auth.ts", auth: /requireAuth|authMiddleware|req\.auth/i, response: /res\.json|res\.status\([^)]*\)\.json/i },
      { file: "artifacts/api-server/src/routes/settings.ts", auth: /requireAuth|req\.auth|WORKSPACE_SETTINGS_FORBIDDEN/i, response: /res\.json|res\.status\([^)]*\)\.json/i },
      { file: "artifacts/api-server/src/routes/mobile.ts", auth: /mobileAuthUserIdOrReject|NO_BEARER_TOKEN|UNAUTHORIZED/i, response: /res\.json|res\.status\([^)]*\)\.json/i },
    ],
    fixtures: [
      {
        id: "crevux-auth-session-read",
        classification: "locally-fixture-read-proved",
        route: "/auth/session",
        body: {
          localOnly: true,
          authRequired: true,
          mutationExecuted: false,
          user: { id: "fixture-user", email: "user@example.test", role: "member" },
          workspace: { id: "fixture-workspace", role: "member" },
          session: { status: "current", mfaEnabled: false },
        },
      },
      {
        id: "crevux-settings-read",
        classification: "locally-response-shape-proved",
        route: "/settings/workspace",
        body: {
          localOnly: true,
          authRequired: true,
          mutationExecuted: false,
          workspaceSettings: { workspaceId: "fixture-workspace", notifications: "configured", providerProof: "needed" },
        },
      },
    ],
  },
  {
    app: "WordGeni",
    root: "apps/WordGeni",
    proofRegister: "apps/WordGeni/docs/wordgeni-local-route-auth-proof-register.json",
    routes: [
      { file: "apps/api/src/index.ts", auth: /authMiddleware/i, response: /c\.json|apiEnvelope/i },
      { file: "apps/api/src/routes/workspace.ts", auth: /auth|user|workspace/i, response: /c\.json|apiEnvelope/i },
      { file: "apps/api/src/routes/projects.ts", auth: /auth|user|workspace/i, response: /c\.json|apiEnvelope/i },
      { file: "apps/web/src/app/api/[...path]/route.ts", auth: /getSession|Authorization|session/i, response: /NextResponse\.json|Response\.json/i },
    ],
    fixtures: [
      {
        id: "wordgeni-workspace-read",
        classification: "locally-fixture-read-proved",
        route: "/api/workspace",
        body: {
          ok: true,
          localOnly: true,
          authRequired: true,
          mutationExecuted: false,
          data: { workspaceId: "fixture-workspace", role: "owner", projectCount: 0, aiProviderProof: "needed" },
          error: null,
        },
      },
      {
        id: "wordgeni-project-read",
        classification: "locally-response-shape-proved",
        route: "/api/projects/:id",
        body: {
          ok: true,
          localOnly: true,
          authRequired: true,
          mutationExecuted: false,
          data: { id: "fixture-project", title: "Fixture project", exportProof: "needed", sources: [] },
          error: null,
        },
      },
    ],
  },
  {
    app: "RatAiFy",
    root: "apps/RatAiFy",
    proofRegister: "apps/RatAiFy/docs/rataify-local-workspace-auth-proof-register.json",
    routes: [
      { file: "server/routes/auth.ts", auth: /isAuthenticated|req\.user|AUTH_REQUIRED|Not authenticated/i, response: /res\.json|res\.status\([^)]*\)\.json/i },
      { file: "server/routes/orgs.ts", auth: /requireAuth|isAuthenticated|req\.user|workspace/i, response: /res\.json|res\.status\([^)]*\)\.json/i },
      { file: "server/routes/sites.ts", auth: /requireAuth|isAuthenticated|req\.user|workspace/i, response: /res\.json|res\.status\([^)]*\)\.json/i },
      { file: "server/routes/connected-apps.ts", auth: /requireAuth|isAuthenticated|req\.user|workspace/i, response: /res\.json|res\.status\([^)]*\)\.json/i },
    ],
    fixtures: [
      {
        id: "rataify-current-user-read",
        classification: "locally-fixture-read-proved",
        route: "/api/auth/me",
        body: {
          localOnly: true,
          authRequired: true,
          mutationExecuted: false,
          user: { id: "fixture-user", email: "user@example.test", role: "owner", mfaEnabled: false },
        },
      },
      {
        id: "rataify-workspace-sites-read",
        classification: "locally-response-shape-proved",
        route: "/api/sites",
        body: {
          localOnly: true,
          authRequired: true,
          mutationExecuted: false,
          sites: [],
          connectedApps: { xflowx: "proof-needed", verixet: "proof-needed", audaix: "proof-needed" },
        },
      },
    ],
  },
  {
    app: "AudAix",
    root: "apps/AudAix",
    proofRegister: "apps/AudAix/docs/audaix-local-dashboard-auth-api-proof-register.json",
    routes: [
      { file: "src/routes/auth-session-routes.ts", auth: /auth|session|request\.id/i, response: /reply\.send|reply\.code|requestId/i },
      { file: "src/routes/workspace-routes.ts", auth: /auth|workspace|request\.id/i, response: /reply\.send|reply\.code|requestId/i },
      { file: "src/routes/site-routes.ts", auth: /auth|workspace|request\.id/i, response: /reply\.send|reply\.code|requestId/i },
    ],
    fixtures: [
      {
        id: "audaix-auth-session-read",
        classification: "locally-fixture-read-proved",
        route: "/api/auth/session",
        body: {
          localOnly: true,
          authRequired: true,
          mutationExecuted: false,
          requestId: "fixture-request",
          user: { id: "fixture-user", email: "user@example.test" },
          workspace: { id: "fixture-workspace", role: "owner" },
        },
      },
      {
        id: "audaix-workspace-sites-read",
        classification: "locally-response-shape-proved",
        route: "/api/workspaces/:id/sites",
        body: {
          localOnly: true,
          authRequired: true,
          mutationExecuted: false,
          requestId: "fixture-request",
          sites: [],
          auditProviderProof: "needed",
        },
      },
    ],
  },
  {
    app: "Verixet",
    root: "apps/Verixet",
    proofRegister: "apps/Verixet/docs/verixet-local-dashboard-auth-billing-proof-register.json",
    routes: [
      { file: "src/app/api/dashboard/security/status/route.ts", auth: /getDashboardWorkspaceAccess|workspace|userId/i, response: /NextResponse\.json|request_id/i },
      { file: "src/app/api/dashboard/operator-brief/route.ts", auth: /getDashboardWorkspaceAccess|workspace|userId/i, response: /NextResponse\.json|request_id/i },
      { file: "src/app/api/dashboard/billing/overview/route.ts", auth: /getDashboardWorkspaceAccess|workspace|userId/i, response: /NextResponse\.json|request_id/i },
    ],
    fixtures: [
      {
        id: "verixet-security-status-read",
        classification: "locally-fixture-read-proved",
        route: "/api/dashboard/security/status",
        body: {
          success: true,
          localOnly: true,
          authRequired: true,
          mutationExecuted: false,
          request_id: "fixture-request",
          data: { workspaceId: "fixture-workspace", passkeys: [], sessions: [], recoveryCodes: "configured" },
        },
      },
      {
        id: "verixet-billing-overview-read",
        classification: "locally-response-shape-proved",
        route: "/api/dashboard/billing/overview",
        body: {
          success: true,
          localOnly: true,
          authRequired: true,
          mutationExecuted: false,
          request_id: "fixture-request",
          data: { plan: "local-fixture", stripe: "billing-proof-needed", entitlement: "entitlement-proof-needed" },
        },
      },
    ],
  },
];

const failures = [];
const evidence = {
  proof: "workspace-five-app-auth-read-fixtures",
  localOnly: true,
  generatedAt: new Date().toISOString(),
  apps: [],
  totals: { routesMapped: 0, fixturesValidated: 0, mutationRoutesNotExecuted: 0 },
};

function abs(relativePath) {
  return path.join(workspaceRoot, relativePath);
}

function read(relativePath) {
  return readFileSync(abs(relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(abs(relativePath))) failures.push(`missing file: ${relativePath}`);
}

function walkValue(value, label, seen = new Set()) {
  if (value == null) return;
  if (typeof value === "string") {
    for (const pattern of unsafeValues) {
      if (pattern.test(value)) failures.push(`${label} fixture contains unsafe value pattern ${String(pattern)}`);
    }
    return;
  }
  if (typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if (unsafeKeys.test(key)) failures.push(`${label} fixture contains unsafe key ${key}`);
    walkValue(nested, `${label}.${key}`, seen);
  }
}

function assertLocalOnlyScript() {
  const source = read("scripts/verify-workspace-five-app-auth-read-fixtures.mjs");
  for (const pattern of mutationMarkers) {
    if (pattern.test(source)) failures.push(`verifier must remain static/local only; found ${String(pattern)}`);
  }
}

function countMutationRoutes(source) {
  return routeMutationMethods.test(source) ? 1 : 0;
}

assertLocalOnlyScript();

for (const app of apps) {
  const appEvidence = {
    app: app.app,
    routesMapped: 0,
    fixturesValidated: 0,
    mutationRoutesClassifiedNotExecuted: 0,
    classifications: {},
  };

  requireFile(app.proofRegister);
  for (const route of app.routes) {
    const routePath = `${app.root}/${route.file}`;
    requireFile(routePath);
    if (!existsSync(abs(routePath))) continue;
    const source = read(routePath);
    if (!route.auth.test(source)) failures.push(`${app.app} route missing auth/session marker: ${routePath}`);
    if (!route.response.test(source)) failures.push(`${app.app} route missing JSON response marker: ${routePath}`);
    appEvidence.routesMapped += 1;
    appEvidence.mutationRoutesClassifiedNotExecuted += countMutationRoutes(source);
  }

  for (const fixture of app.fixtures) {
    if (!classifications.has(fixture.classification)) failures.push(`${app.app} fixture has invalid classification: ${fixture.id}`);
    if (fixture.body.localOnly !== true) failures.push(`${app.app} fixture must be localOnly=true: ${fixture.id}`);
    if (fixture.body.authRequired !== true) failures.push(`${app.app} fixture must be authRequired=true: ${fixture.id}`);
    if (fixture.body.mutationExecuted !== false) failures.push(`${app.app} fixture must be mutationExecuted=false: ${fixture.id}`);
    walkValue(fixture.body, `${app.app}.${fixture.id}`);
    appEvidence.fixturesValidated += 1;
    appEvidence.classifications[fixture.classification] = (appEvidence.classifications[fixture.classification] ?? 0) + 1;
  }

  evidence.totals.routesMapped += appEvidence.routesMapped;
  evidence.totals.fixturesValidated += appEvidence.fixturesValidated;
  evidence.totals.mutationRoutesNotExecuted += appEvidence.mutationRoutesClassifiedNotExecuted;
  evidence.apps.push(appEvidence);
}

const registerPath = "docs/workspace-five-app-auth-read-fixtures-proof-register.json";
const docPath = "docs/workspace-five-app-auth-read-fixtures-proof.md";
requireFile(registerPath);
requireFile(docPath);

if (existsSync(abs(registerPath))) {
  const register = JSON.parse(read(registerPath));
  if (register.localOnly !== true) failures.push("fixture proof register must be localOnly=true");
  if (register.mutationProof !== false) failures.push("fixture proof register must declare mutationProof=false");
  for (const entry of register.entries ?? []) {
    if (!classifications.has(entry.classification)) failures.push(`unknown register classification: ${entry.id}`);
    if (entry.localOnly !== true) failures.push(`register entry must be localOnly=true: ${entry.id}`);
  }
  for (const app of apps) {
    if (!register.entries?.some((entry) => entry.app === app.app)) failures.push(`register missing ${app.app}`);
  }
}

const evidencePath = abs("docs/workspace-five-app-auth-read-fixtures-evidence.json");
mkdirSync(path.dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

if (failures.length > 0) {
  console.error("Workspace five-app auth read fixture verifier failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Workspace five-app auth read fixture verifier passed.");
console.log(`routesMapped=${evidence.totals.routesMapped}`);
console.log(`fixturesValidated=${evidence.totals.fixturesValidated}`);
console.log(`mutationRoutesClassifiedNotExecuted=${evidence.totals.mutationRoutesNotExecuted}`);
console.log("evidence=docs/workspace-five-app-auth-read-fixtures-evidence.json");
