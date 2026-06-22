import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const slugs = ["xflow", "verixet", "rataify", "audaix", "wordgeni", "crevux"];

function read(path) {
  const absolute = join(root, path);
  if (!existsSync(absolute)) return "";
  return readFileSync(absolute, "utf8");
}

function has(path, pattern) {
  return pattern.test(read(path));
}

const checks = [
  {
    id: "canonical-xflow-slugs",
    severity: "PASS",
    path: "apps/XFlow/src/lib/ecosystem/apps.ts",
    ok: slugs.every((slug) => read("apps/XFlow/src/lib/ecosystem/apps.ts").includes(`"${slug}"`)),
    detail: "XFlow app registry includes all six lowercase canonical app slugs.",
  },
  {
    id: "xflow-signed-state",
    severity: "PASS",
    path: "apps/XFlow/src/lib/ecosystem/central-auth-state.ts",
    ok:
      has("apps/XFlow/src/lib/ecosystem/central-auth-state.ts", /createHmac\("sha256"/) &&
      has("apps/XFlow/src/lib/ecosystem/central-auth-state.ts", /timingSafeEqual/),
    detail: "XFlow central auth state is HMAC-signed and timing-safe validated.",
  },
  {
    id: "xflow-oauth-token-secret-required",
    severity: "PASS",
    path: "apps/XFlow/src/core/oauth/oauth-token-exchange.ts",
    ok:
      has("apps/XFlow/src/core/oauth/oauth-token-exchange.ts", /client_secret/) &&
      has("apps/XFlow/src/core/oauth/oauth-token-exchange.ts", /code_verifier/) &&
      has("apps/XFlow/src/core/oauth/oauth-token-exchange.ts", /redirect_uri does not match authorization request/),
    detail: "XFlow token exchange requires client secret, PKCE verifier, and matching redirect URI.",
  },
  {
    id: "xflow-userinfo-bearer-required",
    severity: "PASS",
    path: "apps/XFlow/src/core/oauth/oauth-userinfo.ts",
    ok: has("apps/XFlow/src/core/oauth/oauth-userinfo.ts", /authorizeOAuthWorkspaceLinkBearer/),
    detail: "XFlow userinfo is bearer-authorized.",
  },
  {
    id: "xflow-consent-table-follows-session-fk",
    severity: "FAIL",
    path: "apps/XFlow/drizzle/migrations/0047_user_consents.sql",
    ok:
      has("apps/XFlow/drizzle/migrations/0008_identity_runtime.sql", /user_sessions_user_id_users_id_fk/) &&
      has("apps/XFlow/drizzle/migrations/0047_user_consents.sql", /user_consents_user_id_users_id_fk/) &&
      has("apps/XFlow/drizzle/migrations/0047_user_consents.sql", /REFERENCES "public"\."users"\("id"\)/),
    detail: "XFlow account consent rows must attach to the same public.users(id) target as user_sessions.",
  },
  {
    id: "xflow-session-materializes-user-before-session",
    severity: "FAIL",
    path: "apps/XFlow/src/auth.ts",
    ok:
      has("apps/XFlow/src/auth.ts", /ensureLocalUserMaterialized/) &&
      has("apps/XFlow/src/auth.ts", /token\.id = ensuredLocalUser\.sessionUserId/) &&
      has("apps/XFlow/src/auth.ts", /createUserSession\(\{\s*sessionId,\s*userId: ensuredLocalUser\.sessionUserId/s),
    detail: "XFlow session creation must use the materialized canonical user row required by the user_sessions FK.",
  },
  {
    id: "xflow-email-signup-records-consent",
    severity: "FAIL",
    path: "apps/XFlow/src/app/api/auth/signup/start/route.ts",
    ok:
      has("apps/XFlow/src/app/api/auth/signup/start/route.ts", /termsAccepted:\s*z\.literal\(true\)/) &&
      has("apps/XFlow/src/app/api/auth/signup/start/route.ts", /privacyAccepted:\s*z\.literal\(true\)/) &&
      has("apps/XFlow/src/app/api/auth/signup/start/route.ts", /recordRequiredAccountConsents/) &&
      has("apps/XFlow/src/app/api/auth/signup/start/route.ts", /source:\s*"email_signup"/),
    detail: "XFlow email signup must validate and persist required account legal consent server-side.",
  },
  {
    id: "xflow-auth-callback-consent-gate",
    severity: "FAIL",
    path: "apps/XFlow/src/app/auth/callback/route.ts",
    ok:
      has("apps/XFlow/src/app/auth/callback/route.ts", /hasCurrentRequiredAccountConsents/) &&
      has("apps/XFlow/src/app/auth/callback/route.ts", /\/auth\/consent/) &&
      has("apps/XFlow/src/app/api/auth/consent/accept/route.ts", /recordRequiredAccountConsents/),
    detail: "XFlow OAuth/app handoff must route missing or stale consent to the central consent gate before app return.",
  },
  {
    id: "xflow-central-social-buttons-use-auth-start",
    severity: "FAIL",
    path: "apps/XFlow/src/app/(auth)",
    ok:
      has("apps/XFlow/src/app/(auth)/sign-in/page.tsx", /\/auth\/start/) &&
      has("apps/XFlow/src/app/(auth)/sign-in/page.tsx", /intent",\s*"signin"/) &&
      has("apps/XFlow/src/app/(auth)/sign-in/page.tsx", /provider",\s*provider/) &&
      has("apps/XFlow/src/app/(auth)/sign-up/SignUpClient.tsx", /\/auth\/start/) &&
      has("apps/XFlow/src/app/(auth)/sign-up/SignUpClient.tsx", /intent",\s*"signup"/) &&
      has("apps/XFlow/src/app/(auth)/sign-up/SignUpClient.tsx", /provider",\s*provider/),
    detail: "XFlow visible social auth buttons must start at /auth/start so callback consent gating is applied.",
  },
  {
    id: "verixet-canonical-catalog",
    severity: "PASS",
    path: "apps/Verixet/src/lib/billing/canonical-catalog.ts",
    ok: slugs.every((slug) => read("apps/Verixet/src/lib/billing/canonical-catalog.ts").includes(`"${slug}"`)),
    detail: "Verixet canonical billing catalog includes all six lowercase canonical app slugs.",
  },
  {
    id: "verixet-free-ui-six-apps",
    severity: "FAIL",
    path: "apps/Verixet/src/components/auth/SignUpForm.tsx",
    ok: !has("apps/Verixet/src/components/auth/SignUpForm.tsx", /free:[\s\S]*includedApps:\s*\["xflow"\]/),
    detail: "Verixet free signup UI must not present the free tier as XFlow-only.",
  },
  {
    id: "rataify-local-signup-production-gate",
    severity: "FAIL",
    path: "apps/RatAiFy/server/routes/auth.ts",
    ok:
      has("apps/RatAiFy/server/routes/auth.ts", /LOCAL_PUBLIC_SIGNUP_DISABLED/) &&
      !has("apps/RatAiFy/server/routes/auth.ts", /RATAIFY_LOCAL_PUBLIC_SIGNUP_ENABLED/),
    detail: "RatAiFy local signup must be hard-disabled in production and delegated to XFlow.",
  },
  {
    id: "rataify-canonical-six-app-model",
    severity: "FAIL",
    path: "apps/RatAiFy/server/services/ecosystem.ts",
    ok: !has("apps/RatAiFy/server/services/ecosystem.ts", /xflowx/) && slugs.every((slug) => read("apps/RatAiFy/server/services/ecosystem.ts").includes(`"${slug}"`)),
    detail: "RatAiFy ecosystem service must use the six lowercase canonical slugs, not legacy xflowx/four-app aliases.",
  },
  {
    id: "audaix-no-browser-local-signup",
    severity: "FAIL",
    path: "apps/AudAix/dashboard/src/pages/LoginPage.tsx",
    ok: !has("apps/AudAix/dashboard/src/pages/LoginPage.tsx", /supabase\.auth\.signUp/),
    detail: "AudAiX dashboard must not expose browser Supabase signup as a legacy fallback.",
  },
  {
    id: "audaix-six-app-bundle",
    severity: "FAIL",
    path: "apps/AudAix/src/routes/ecosystem-auth-routes.ts",
    ok: !has("apps/AudAix/src/routes/ecosystem-auth-routes.ts", /appCount:\s*4/) && slugs.every((slug) => read("apps/AudAix/src/routes/ecosystem-auth-routes.ts").includes(`"${slug}"`)),
    detail: "AudAiX full ecosystem bundle/starter list covers all six apps.",
  },
  {
    id: "wordgeni-no-browser-local-signup",
    severity: "FAIL",
    path: "apps/WordGeni/apps/web/src/context/AuthContext.tsx",
    ok: !has("apps/WordGeni/apps/web/src/context/AuthContext.tsx", /supabase\.auth\.signUp/),
    detail: "WordGeni web must not create local Supabase users from the browser.",
  },
  {
    id: "crevux-no-local-public-register",
    severity: "FAIL",
    path: "apps/CreVux/artifacts/api-server/src/routes/auth.ts",
    ok:
      has("apps/CreVux/artifacts/api-server/src/routes/auth.ts", /CENTRALIZED_SIGNUP_REQUIRED/) &&
      has("apps/CreVux/artifacts/api-server/src/routes/auth.ts", /CREVUX_LOCAL_PUBLIC_SIGNUP_ENABLED/) &&
      has("apps/CreVux/artifacts/api-server/src/routes/auth.ts", /NODE_ENV !== "production"/),
    detail: "CreVux public register route must be production-disabled and point to centralized XFlow signup.",
  },
  {
    id: "crevux-no-local-stripe-checkout",
    severity: "FAIL",
    path: "apps/CreVux/artifacts/api-server/src/routes/billing.ts",
    ok:
      has("apps/CreVux/artifacts/api-server/src/routes/billing.ts", /CENTRALIZED_BILLING_REQUIRED/) &&
      has("apps/CreVux/artifacts/api-server/src/routes/billing.ts", /CREVUX_LOCAL_BILLING_ENABLED/) &&
      has("apps/CreVux/artifacts/api-server/src/routes/billing.ts", /NODE_ENV !== "production"/),
    detail: "CreVux runtime billing must be production-disabled locally and delegate to Verixet.",
  },
  {
    id: "satellite-auth-buttons-route-to-xflow",
    severity: "FAIL",
    path: "apps/* auth entry UI",
    ok:
      has("apps/Verixet/src/components/auth/SignInForm.tsx", /Continue with XFlow/) &&
      has("apps/Verixet/src/components/auth/SignUpForm.tsx", /Continue with XFlow/) &&
      has("apps/RatAiFy/client/src/pages/auth-sign-in.tsx", /buildXFlowAuthUrl/) &&
      has("apps/RatAiFy/client/src/pages/auth-sign-up.tsx", /buildXFlowAuthUrl/) &&
      has("apps/AudAix/dashboard/src/pages/AuthPages.tsx", /Continue with XFlow/) &&
      has("apps/WordGeni/apps/web/src/components/auth/sign-in-form.tsx", /Continue with XFlow/) &&
      has("apps/WordGeni/apps/web/src/components/auth/sign-up-form.tsx", /Continue with XFlow/) &&
      has("apps/CreVux/artifacts/image-gen/src/pages/RegisterPage.tsx", /\/auth\/start/) &&
      has("apps/CreVux/artifacts/image-gen/src/pages/SignInPage.tsx", /Continue with XFlow/),
    detail: "Satellite auth entry buttons must route signin, signup, and social starts through XFlow.",
  },
  {
    id: "shared-user-consents-rls",
    severity: "FAIL",
    path: "supabase/migrations/101_user_consents.sql",
    ok:
      has("supabase/migrations/101_user_consents.sql", /create table if not exists core\.user_consents/) &&
      has("supabase/migrations/101_user_consents.sql", /enable row level security/) &&
      has("supabase/migrations/101_user_consents.sql", /user_consents_service_write/) &&
      has("supabase/migrations/101_user_consents.sql", /user_id = auth\.uid\(\)/),
    detail: "Shared consent mirror must have RLS, own-user read, and service-role-only writes.",
  },
  {
    id: "workspace-app-access-verixet-authority",
    severity: "FAIL",
    path: "supabase/migrations/002_core_rls.sql",
    ok:
      !has("supabase/migrations/002_core_rls.sql", /create policy workspace_app_access_admin_write/) &&
      has("supabase/migrations/002_core_rls.sql", /workspace_app_access_service_write/) &&
      has("supabase/migrations/002_core_rls.sql", /core\.is_service_role\(\)/),
    detail: "workspace_app_access writes are reserved for service-role Verixet/shared authority.",
  },
  {
    id: "no-broad-authenticated-schema-writes",
    severity: "RISK",
    path: "supabase/migrations/100_api_role_grants.sql",
    ok: !has("supabase/migrations/100_api_role_grants.sql", /grant select, insert, update, delete on all tables in schema .* to authenticated/),
    detail: "Authenticated must not have broad write grants across custom schemas.",
  },
];

let failures = 0;
for (const check of checks) {
  const status = check.ok ? "PASS" : check.severity;
  if (!check.ok && (check.severity === "FAIL" || check.severity === "RISK")) failures += 1;
  console.log(`${status} ${check.id} :: ${check.path}`);
  console.log(`  ${check.detail}`);
}

console.log(`\nSummary: ${checks.length - failures}/${checks.length} checks pass or are informational; ${failures} blockers/risks remain.`);
process.exit(failures > 0 ? 1 : 0);
