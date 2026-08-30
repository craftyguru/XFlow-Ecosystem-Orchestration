import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const contractsDir = path.join(rootDir, "ecosystem-contracts");
const generatedPackageDir = path.join(rootDir, "packages", "ecosystem-contracts");
const generatedIndexPath = path.join(generatedPackageDir, "src", "index.ts");
const crevuxMobileSourcePath = path.join(generatedPackageDir, "src", "crevux-mobile-v1.ts");
const crevuxMobileContractOverride = process.env.XFLOW_CREVUX_MOBILE_CONTRACT_PATH;

const files = {
  apps: "apps.json",
  crevuxMobile: "crevux-mobile-v1.json",
  env: "env-contract.json",
  routes: "routes.json",
  tokenTypes: "token-types.json",
};

const errors = [];
const warnings = [];

function readJson(name) {
  const filePath = name === "crevuxMobile" && crevuxMobileContractOverride
    ? path.resolve(crevuxMobileContractOverride)
    : path.join(contractsDir, files[name]);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`Failed to read ${files[name]}: ${error.message}`);
    return null;
  }
}

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

const appsContract = readJson("apps");
const crevuxMobileContract = readJson("crevuxMobile");
const envContract = readJson("env");
const routesContract = readJson("routes");
const tokensContract = readJson("tokenTypes");

if (!appsContract || !crevuxMobileContract || !envContract || !routesContract || !tokensContract) {
  printReport();
  process.exit(1);
}

const apps = Array.isArray(appsContract.apps) ? appsContract.apps : [];
const envRows = Array.isArray(envContract.env) ? envContract.env : [];
const routes = Array.isArray(routesContract.routes) ? routesContract.routes : [];
const tokenTypes = Array.isArray(tokensContract.tokenTypes) ? tokensContract.tokenTypes : [];

validateCrevuxMobileContract(crevuxMobileContract);

if (apps.length === 0) fail("apps.json must contain a non-empty apps array.");
const expectedCanonicalSlugs = ["xflow", "verixet", "audaix", "rataify", "wordgeni", "crevux"];
if (!Array.isArray(appsContract.canonicalSlugs)) fail("apps.json must declare canonicalSlugs.");
if (appsContract.canonicalSlugs.length !== 6) {
  fail(`apps.json canonicalSlugs must contain exactly 6 ecosystem products, found ${appsContract.canonicalSlugs.length}.`);
}
if (apps.length !== 6) fail(`apps.json apps must contain exactly 6 ecosystem products, found ${apps.length}.`);
for (const slug of expectedCanonicalSlugs) {
  if (!appsContract.canonicalSlugs.includes(slug)) fail(`apps.json canonicalSlugs missing ${slug}.`);
}
if (apps.some((app) => app.slug === "pitstrike") || appsContract.canonicalSlugs.includes("pitstrike")) {
  fail("PitStrike must not appear in ecosystem product membership (canonicalSlugs/apps).");
}
const personal = Array.isArray(appsContract.externalPersonalApps) ? appsContract.externalPersonalApps : [];
const pitstrikePersonal = personal.find((app) => app.slug === "pitstrike");
if (!pitstrikePersonal || pitstrikePersonal.ecosystemProduct !== false) {
  fail("apps.json must declare PitStrike as an externalPersonalApp with ecosystemProduct false.");
}
if (envRows.length === 0) fail("env-contract.json must contain a non-empty env array.");
if (routes.length === 0) fail("routes.json must contain a non-empty routes array.");
if (tokenTypes.length === 0) fail("token-types.json must contain a non-empty tokenTypes array.");

const appSlugs = new Set();
const tokenIds = new Set();

for (const app of apps) {
  if (!isNonEmptyString(app.slug)) fail("Every app must have a slug.");
  if (app.slug && app.slug !== app.slug.toLowerCase()) fail(`Canonical app slug must be lowercase: ${app.slug}`);
  if (appSlugs.has(app.slug)) fail(`Duplicate canonical app slug: ${app.slug}`);
  appSlugs.add(app.slug);

  for (const field of ["displayName", "folderName", "domain", "role"]) {
    if (!isNonEmptyString(app[field])) fail(`App ${app.slug || "<unknown>"} is missing ${field}.`);
  }

  for (const boolField of ["ownsIdentity", "ownsBilling", "ownsEntitlements", "ownsUsageMetering"]) {
    if (typeof app[boolField] !== "boolean") fail(`App ${app.slug || "<unknown>"} ${boolField} must be boolean.`);
  }

  if (!Array.isArray(app.dependsOn)) fail(`App ${app.slug || "<unknown>"} dependsOn must be an array.`);
  if (!Array.isArray(app.legacyAliases)) fail(`App ${app.slug || "<unknown>"} legacyAliases must be an array.`);
}

for (const app of apps) {
  for (const dependency of app.dependsOn || []) {
    if (!appSlugs.has(dependency)) fail(`App ${app.slug} depends on unknown app ${dependency}.`);
  }
}

for (const tokenType of tokenTypes) {
  if (!isNonEmptyString(tokenType.id)) fail("Every token type must have an id.");
  if (tokenType.id && tokenIds.has(tokenType.id)) fail(`Duplicate token type id: ${tokenType.id}`);
  tokenIds.add(tokenType.id);

  for (const field of ["owner", "allowedUse", "forbiddenUse", "exampleHeaderName", "rotationNotes"]) {
    if (!isNonEmptyString(tokenType[field])) fail(`Token type ${tokenType.id || "<unknown>"} is missing ${field}.`);
  }
  if (!Array.isArray(tokenType.allowedConsumers)) fail(`Token type ${tokenType.id || "<unknown>"} allowedConsumers must be an array.`);
  if (typeof tokenType.shouldBeAppScoped !== "boolean") fail(`Token type ${tokenType.id || "<unknown>"} shouldBeAppScoped must be boolean.`);
  if (typeof tokenType.shouldBeWorkspaceScoped !== "boolean") fail(`Token type ${tokenType.id || "<unknown>"} shouldBeWorkspaceScoped must be boolean.`);
}

const envKeys = new Map();
const allowedEnvironments = new Set(["local", "staging", "production", "all"]);

for (const row of envRows) {
  if (!appSlugs.has(row.app)) fail(`Env row ${row.name || "<unknown>"} references unknown app ${row.app}.`);
  if (!isNonEmptyString(row.name)) fail(`Env row for app ${row.app || "<unknown>"} is missing name.`);
  if (typeof row.required !== "boolean") fail(`Env ${row.app || "<unknown>"}/${row.name || "<unknown>"} required must be boolean.`);
  if (!allowedEnvironments.has(row.environment)) fail(`Env ${row.app || "<unknown>"}/${row.name || "<unknown>"} has invalid environment ${row.environment}.`);
  if (typeof row.secret !== "boolean") fail(`Env ${row.app || "<unknown>"}/${row.name || "<unknown>"} secret must be boolean.`);
  if (typeof row.safePlaceholderAllowed !== "boolean") fail(`Env ${row.app || "<unknown>"}/${row.name || "<unknown>"} safePlaceholderAllowed must be boolean.`);
  for (const field of ["purpose", "sourceOfTruth", "notes"]) {
    if (!isNonEmptyString(row[field])) fail(`Env ${row.app || "<unknown>"}/${row.name || "<unknown>"} is missing ${field}.`);
  }
  if (!Array.isArray(row.usedBy)) fail(`Env ${row.app || "<unknown>"}/${row.name || "<unknown>"} usedBy must be an array.`);

  const duplicateKey = `${row.app}:${row.name}:${row.environment}`;
  if (envKeys.has(duplicateKey) && row.alias !== true) {
    fail(`Duplicate env row for ${duplicateKey}. Mark true aliases with alias:true.`);
  }
  envKeys.set(duplicateKey, row);
}

const allowedAuthTypes = new Set(["public", "service", "ucl", "usage-ingest", "oauth-client", "oauth-user", "webhook", "none"]);
const uclRequiredHeaders = ["Authorization", "X-App-Slug", "X-Workspace-ID"];
const usageTokenType = tokenTypes.find((tokenType) => tokenType.id === "verixet_usage_ingest_token");

for (const route of routes) {
  if (!appSlugs.has(route.ownerApp)) fail(`Route ${route.path || "<unknown>"} references unknown ownerApp ${route.ownerApp}.`);
  if (!Array.isArray(route.consumerApps)) fail(`Route ${route.path || "<unknown>"} consumerApps must be an array.`);
  for (const consumer of route.consumerApps || []) {
    if (!appSlugs.has(consumer) && !["browser", "stripe"].includes(consumer)) {
      fail(`Route ${route.path || "<unknown>"} references unknown consumer app ${consumer}.`);
    }
  }
  for (const field of ["method", "path", "purpose", "authType", "responseEnvelope", "productionFailureMode", "notes"]) {
    if (!isNonEmptyString(route[field])) fail(`Route ${route.path || "<unknown>"} is missing ${field}.`);
  }
  if (!allowedAuthTypes.has(route.authType)) fail(`Route ${route.path || "<unknown>"} has unsupported authType ${route.authType}.`);
  if (!Array.isArray(route.requiredHeaders)) fail(`Route ${route.path || "<unknown>"} requiredHeaders must be an array.`);
  if (!Array.isArray(route.requiredBodyFields)) fail(`Route ${route.path || "<unknown>"} requiredBodyFields must be an array.`);

  if (route.tokenType !== null && route.tokenType !== undefined && !tokenIds.has(route.tokenType)) {
    fail(`Route ${route.path || "<unknown>"} references unknown tokenType ${route.tokenType}.`);
  }

  if (route.authType === "none" && route.public !== true) {
    fail(`Route ${route.path || "<unknown>"} claims authType none without public:true.`);
  }

  if (route.authType !== "public" && route.authType !== "none" && !route.tokenType) {
    fail(`Route ${route.path || "<unknown>"} authType ${route.authType} must specify tokenType.`);
  }

  if (route.authType === "public" && route.public !== true) {
    warn(`Route ${route.path || "<unknown>"} is public but does not explicitly set public:true.`);
  }

  if (route.authType === "ucl" || route.tokenType === "ucl_connection_token") {
    for (const header of uclRequiredHeaders) {
      if (!route.requiredHeaders.includes(header)) {
        fail(`UCL route ${route.path || "<unknown>"} must require ${header}.`);
      }
    }
  }

  if (route.authType === "usage-ingest" || route.tokenType === "verixet_usage_ingest_token") {
    if (route.tokenType !== "verixet_usage_ingest_token") {
      fail(`Usage route ${route.path || "<unknown>"} must use verixet_usage_ingest_token.`);
    }
    if (!usageTokenType?.shouldBeAppScoped) {
      fail("verixet_usage_ingest_token must be app-scoped.");
    }
    if (!route.requiredHeaders.includes("X-App-Slug")) {
      fail(`Usage route ${route.path || "<unknown>"} must require X-App-Slug.`);
    }
  }
}

validateGeneratedContractPackage();

printReport();

if (errors.length > 0) {
  process.exit(1);
}

function printReport() {
  console.log("Ecosystem contract validation");
  console.log("==============================");
  console.log(`Apps: ${apps.length}`);
  console.log(`Env rows: ${envRows.length}`);
  console.log(`Routes: ${routes.length}`);
  console.log(`Token types: ${tokenTypes.length}`);
  console.log(`Crevux mobile: ${crevuxMobileContract?.schemaVersion || "missing"}`);

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    for (const message of warnings) console.log(`- ${message}`);
  }

  if (errors.length > 0) {
    console.log("\nFailures:");
    for (const message of errors) console.log(`- ${message}`);
    console.log("\nResult: FAIL");
  } else {
    console.log("\nResult: PASS");
  }
}

function validateGeneratedContractPackage() {
  const packageJsonPath = path.join(generatedPackageDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    fail("Generated contract package is missing packages/ecosystem-contracts/package.json.");
    return;
  }
  if (!fs.existsSync(generatedIndexPath)) {
    fail("Generated contract package is missing packages/ecosystem-contracts/src/index.ts.");
    return;
  }

  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch (error) {
    fail(`Generated contract package package.json is invalid JSON: ${error.message}`);
    return;
  }

  if (packageJson.name !== "@xflow-ecosystem/contracts") {
    fail(`Generated contract package has unexpected name: ${packageJson.name}`);
  }

  const generatedSource = fs.readFileSync(generatedIndexPath, "utf8");
  if (!generatedSource.includes("GENERATED FILE")) {
    fail("Generated contract package index.ts is missing the generated-file marker.");
  }
  if (!fs.existsSync(crevuxMobileSourcePath)) {
    fail("Generated contract package is missing packages/ecosystem-contracts/src/crevux-mobile-v1.ts.");
    return;
  }
  if (!generatedSource.includes('export * from "./crevux-mobile-v1.js"')) {
    fail("Generated contract package index.ts does not export the Crevux mobile v1 contract.");
  }
  const crevuxMobileSource = fs.readFileSync(crevuxMobileSourcePath, "utf8");
  const parityValues = collectStringLeaves({
    schemaVersion: crevuxMobileContract.schemaVersion,
    apiNamespace: crevuxMobileContract.apiNamespace,
    delivery: crevuxMobileContract.delivery,
    authorities: crevuxMobileContract.authorities,
    authentication: crevuxMobileContract.authentication,
    identifiers: crevuxMobileContract.identifiers,
    idempotency: crevuxMobileContract.idempotency,
    endpoints: crevuxMobileContract.endpoints,
    jobStatuses: crevuxMobileContract.jobStatuses,
    cancellationPolicy: crevuxMobileContract.cancellationPolicy,
    errorCodes: crevuxMobileContract.errorCodes,
    errorTaxonomy: crevuxMobileContract.errorTaxonomy,
    mediaSecurity: crevuxMobileContract.mediaSecurity,
    signedMedia: crevuxMobileContract.signedMedia,
    galleryExport: crevuxMobileContract.galleryExport,
    accountDeletion: crevuxMobileContract.accountDeletion,
    lineage: crevuxMobileContract.lineage,
    unsupportedClaims: crevuxMobileContract.unsupportedClaims,
  });
  for (const value of parityValues) {
    if (!crevuxMobileSource.includes(JSON.stringify(value))) {
      fail(`Crevux mobile TypeScript contract is missing ${value}.`);
    }
  }

  for (const slug of appSlugs) {
    if (!generatedSource.includes(JSON.stringify(slug))) {
      fail(`Generated contract package index.ts is missing canonical app slug ${slug}.`);
    }
  }

  for (const tokenId of tokenIds) {
    if (!generatedSource.includes(JSON.stringify(tokenId))) {
      fail(`Generated contract package index.ts is missing token type ${tokenId}.`);
    }
  }
}

function validateCrevuxMobileContract(contract) {
  if (contract.schemaVersion !== "2026-08-crevux-mobile-v1") {
    fail("crevux-mobile-v1.json has an unexpected schemaVersion.");
  }
  if (contract.apiNamespace !== "/api/mobile/v1") {
    fail("Crevux mobile API namespace must be /api/mobile/v1.");
  }
  if (contract.delivery?.boundary !== "shared-mobile-foundation-separate-product-app" || contract.delivery?.framework !== "expo-react-native-with-first-party-kotlin-modules") {
    fail("Crevux Android delivery must use the approved shared foundation, separate app, and Expo/React Native plus first-party Kotlin boundary.");
  }
  if (contract.authorities?.identityAndAccounts !== "xflow") {
    fail("XFlow must own Crevux mobile identity and accounts.");
  }
  if (contract.authorities?.billingEntitlementsAndUsage !== "verixet") {
    fail("Verixet must own Crevux mobile billing, entitlements, and usage.");
  }
  if (contract.authorities?.projectsMediaEditingJobsAndProviders !== "crevux") {
    fail("Crevux must own mobile projects, media, editing jobs, and providers.");
  }
  if (contract.authentication?.pkceMethod !== "S256" || contract.authentication?.clientType !== "public") {
    fail("Crevux Android auth must be a public OAuth client using PKCE S256.");
  }
  if (contract.authentication?.embeddedClientSecretAllowed !== false) {
    fail("The Crevux Android contract must prohibit embedded client secrets.");
  }
  for (const prohibited of ["provider_keys_in_apk", "confidential_oauth_client_secret_in_apk"]) {
    if (!contract.unsupportedClaims?.includes(prohibited)) fail(`Crevux Android must prohibit ${prohibited}.`);
  }
  if (contract.authentication?.redirectKind !== "verified_https_app_link") {
    fail("The Crevux Android callback must use a verified HTTPS App Link.");
  }
  const state = contract.authentication?.statePolicy;
  if (state?.required !== true || state?.singleUse !== true || state?.validation !== "exact_constant_time_match") {
    fail("Crevux Android OAuth state must be required, exact-match validated, and single-use.");
  }
  for (const binding of ["authorization_request", "pkce_code_verifier", "redirect_uri", "client_instance"]) {
    if (!state?.transactionBinding?.includes(binding)) fail(`OAuth state is not bound to ${binding}.`);
  }
  if (!state?.expiry || !state?.failureBehavior) fail("OAuth state must define expiry and fail-closed behavior.");
  const tokenLifecycle = contract.authentication?.tokenLifecycle;
  if (tokenLifecycle?.refreshReplayBehavior !== "revoke_token_family_and_require_reauthentication") {
    fail("Refresh-token replay must revoke the token family and require reauthentication.");
  }
  if (tokenLifecycle?.revocationRequired !== true || !Array.isArray(tokenLifecycle?.logoutOrder)) {
    fail("Token-family revocation and ordered logout are required.");
  }
  for (const step of ["stop_new_authenticated_work", "request_refresh_token_family_revocation", "delete_local_access_and_refresh_tokens"]) {
    if (!tokenLifecycle?.logoutOrder?.includes(step)) fail(`Logout order is missing ${step}.`);
  }
  if (contract.identifiers?.format !== "uuid" || contract.identifiers?.authorizationScope !== "authenticated_user_and_workspace") {
    fail("Crevux mobile identifiers must be UUIDs scoped to user and workspace authorization.");
  }
  if (contract.idempotency?.sameKeyDifferentFingerprint !== "IDEMPOTENCY_CONFLICT") {
    fail("Crevux mobile idempotency must reject key reuse with a different request fingerprint.");
  }
  const retry = contract.idempotency?.userRetryPolicy;
  if (contract.idempotency?.providerAttemptsRemainChildrenOfOneLogicalJob !== true || contract.idempotency?.infrastructureRetryIdentity !== "same_logical_job_and_idempotency_identity") {
    fail("Infrastructure and provider-attempt retries must retain one logical job and idempotency identity.");
  }
  for (const flag of [
    "createsNewChildJob", "newJobIdRequired", "newIdempotencyKeyRequired", "recordsParentJob", "preservesLineage",
    "freshEntitlementCheckRequired", "freshUsageAndCostEstimateRequired", "explicitUserSubmissionRequired", "mayIncurNewCharge",
  ]) {
    if (retry?.[flag] !== true) fail(`User retry policy must require ${flag}.`);
  }
  if (retry?.reusePriorChargeAuthorizationAllowed !== false) {
    fail("User retry must never silently reuse a prior charge authorization.");
  }
  for (const status of ["failed", "cancelled"]) {
    if (!retry?.eligibleParentStatuses?.includes(status)) fail(`User retry policy must record a ${status} parent job.`);
  }
  const operations = new Set((contract.endpoints || []).map((endpoint) => endpoint.operation));
  for (const operation of [
    "create_project",
    "initiate_upload",
    "complete_upload",
    "create_mask_asset",
    "create_generation_job",
    "get_generation_job",
    "request_job_cancellation",
    "list_project_versions",
    "get_gallery_export_metadata",
    "get_mobile_entitlements",
  ]) {
    if (!operations.has(operation)) fail(`Crevux mobile contract is missing operation ${operation}.`);
  }
  const expectedScopes = new Map([
    ["create_project", "crevux.write"],
    ["list_projects", "crevux.read"],
    ["get_project", "crevux.read"],
    ["initiate_upload", "crevux.write"],
    ["complete_upload", "crevux.write"],
    ["create_mask_asset", "crevux.write"],
    ["create_generation_job", "crevux.generate"],
    ["get_generation_job", "crevux.read"],
    ["request_job_cancellation", "crevux.generate"],
    ["create_retry_job", "crevux.generate"],
    ["list_project_versions", "crevux.read"],
    ["get_gallery_export_metadata", "crevux.read"],
    ["get_mobile_entitlements", "workspace.read"],
    ["stream_job_events_optional", "crevux.read"],
  ]);
  for (const endpoint of contract.endpoints || []) {
    if (endpoint.authentication !== "xflow_oauth_access_token") fail(`${endpoint.operation} must require an XFlow OAuth access token.`);
    if (endpoint.workspaceAuthorization !== "selected_workspace_membership_required") fail(`${endpoint.operation} must require selected-workspace membership.`);
    if (!isNonEmptyString(endpoint.resourceOwnership)) fail(`${endpoint.operation} must define resource ownership.`);
    const expectedScope = expectedScopes.get(endpoint.operation);
    if (!expectedScope || endpoint.requiredScopes?.length !== 1 || endpoint.requiredScopes[0] !== expectedScope) {
      fail(`${endpoint.operation} must require exactly ${expectedScope || "its approved scope"}.`);
    }
  }
  const createProject = (contract.endpoints || []).find((endpoint) => endpoint.operation === "create_project");
  if (createProject?.ordinaryWorkspaceMemberAllowed !== true) {
    fail("Ordinary authorized workspace members must be allowed to create projects without workspace-admin role.");
  }
  const cancellation = contract.cancellationPolicy;
  if (cancellation?.queuedBeforeProviderExecution !== "cancel_without_provider_execution") {
    fail("Queued jobs must cancel before provider execution.");
  }
  if (cancellation?.providerStartedCancellationRequest !== "only_when_adapter_supports_cancellation") {
    fail("Provider-started cancellation may be requested only when the adapter supports it.");
  }
  if (cancellation?.localStateMayClaimProviderCancellationWithoutEvidence !== false) {
    fail("Local cancellation state must not claim provider cancellation without evidence.");
  }
  if (cancellation?.unsupportedProviderCancellation !== "JOB_NOT_CANCELLABLE") {
    fail("Unsupported provider cancellation must return or record JOB_NOT_CANCELLABLE.");
  }
  if (cancellation?.lateProviderResults !== "quarantine_not_expose_as_normal_completed_results") {
    fail("Late provider results after cancellation must be quarantined.");
  }
  if (cancellation?.usageAndRefundAccounting !== "authoritative_provider_execution_evidence") {
    fail("Cancellation usage/refund accounting must follow authoritative provider execution evidence.");
  }
  const errors = new Set(contract.errorCodes || []);
  const requiredErrorTaxonomy = {
    authentication: ["AUTH_REQUIRED"],
    tokenExpiration: ["TOKEN_EXPIRED"],
    scopeFailure: ["INSUFFICIENT_SCOPE"],
    workspaceAuthorization: ["WORKSPACE_FORBIDDEN"],
    validationAndMedia: ["VALIDATION_FAILED", "INVALID_MEDIA", "MEDIA_TOO_LARGE", "DIMENSIONS_TOO_LARGE"],
    uploadIntegrity: ["UPLOAD_EXPIRED", "CHECKSUM_MISMATCH"],
    idempotency: ["IDEMPOTENCY_CONFLICT"],
    entitlement: ["ENTITLEMENT_REQUIRED"],
    usage: ["USAGE_LIMIT"],
    payment: ["PAYMENT_REQUIRED"],
    billingAuthority: ["BILLING_AUTHORITY_UNAVAILABLE"],
    rateLimit: ["RATE_LIMITED"],
    safety: ["SAFETY_REFUSAL"],
    provider: ["PROVIDER_UNAVAILABLE", "PROVIDER_FAILURE"],
    cancellation: ["JOB_NOT_CANCELLABLE"],
    retryableInfrastructure: ["INFRASTRUCTURE_RETRYABLE"],
    internal: ["INTERNAL_ERROR"],
  };
  for (const code of Object.values(requiredErrorTaxonomy).flat()) {
    if (!errors.has(code)) fail(`Crevux mobile contract is missing distinct error ${code}.`);
  }
  for (const [category, expectedCodes] of Object.entries(requiredErrorTaxonomy)) {
    const actualCodes = contract.errorTaxonomy?.[category];
    if (!Array.isArray(actualCodes) || actualCodes.length !== expectedCodes.length || expectedCodes.some((code, index) => actualCodes[index] !== code)) {
      fail(`Crevux mobile error taxonomy category ${category} must contain exactly ${expectedCodes.join(", ")}.`);
    }
  }
  const media = contract.mediaSecurity;
  for (const limit of ["maxCompressedBytes", "maxDecodedPixels", "maxWidth", "maxHeight", "maxFrameCount"]) {
    if (!media?.requiredLimits?.includes(limit)) fail(`Crevux mobile upload policy is missing ${limit}.`);
  }
  if (media?.limitSource !== "server_configured_and_returned_by_entitlements" || media?.missingLimitsBehavior !== "fail_closed_before_upload") {
    fail("Upload limits must be server-configured/capability-returned and fail closed when unavailable.");
  }
  for (const flag of [
    "rejectMimeMagicMismatch", "rejectMalformedDecode", "rejectPolyglotFiles", "rejectUnsupportedAnimationOrFrameCount",
    "rejectDecompressionBombs", "scanBeforeAssetFinalization", "checksumRequiredBeforeCompletion", "rejectChecksumMismatch",
    "resumableCheckpointsRequired", "uploadExpiryRequired", "rejectExpiredUploadSession", "completionIsIdempotent", "orphanPartCleanupRequired",
    "crossWorkspaceCompletionRejected", "stripExifLocationByDefault", "privateStorageByDefault",
  ]) {
    if (media?.[flag] !== true) fail(`Crevux mobile media security must require ${flag}.`);
  }
  if (media?.checksumAlgorithm !== "sha256") fail("Crevux mobile uploads must use SHA-256 checksums.");
  if (contract.signedMedia?.lifetime !== "minutes" || contract.signedMedia?.renewalRequiresFreshAuthentication !== true || contract.signedMedia?.renewalRechecksUserWorkspaceAndResourceAuthorization !== true) {
    fail("Signed media must be short-lived and reauthorize every renewal.");
  }
  if (contract.galleryExport?.explicitUserInitiated !== true || contract.galleryExport?.boundary !== "private_workspace_to_device_visible_media") {
    fail("Gallery export must be explicit and disclose the private-to-device-visible boundary.");
  }
  const deletion = contract.accountDeletion;
  for (const action of ["revoke_token_family", "block_new_work"]) {
    if (!deletion?.immediateActions?.includes(action)) fail(`Account deletion is missing immediate action ${action}.`);
  }
  if (deletion?.newWorkAfterDeletionBegins !== "blocked_immediately" || deletion?.queuedJobs !== "cancel" || deletion?.providerCancellationRequest !== "when_supported_by_adapter") {
    fail("Account deletion must immediately block work, cancel queued jobs, and request only supported provider cancellation.");
  }
  if (deletion?.lateProviderResults !== "quarantine_not_expose_as_normal_completed_results") {
    fail("Account deletion must quarantine late provider results.");
  }
  if (deletion?.activeJobs !== "request_provider_cancellation_when_supported_otherwise_quarantine_late_results" || deletion?.assetDeletion !== "delete_private_project_assets_after_terminal_state_or_bounded_cleanup_timeout" || deletion?.assetCleanupDeadline !== "after_terminal_state_or_bounded_cleanup_timeout" || deletion?.tombstone !== "content_free_minimal_audit_record" || deletion?.completion !== "auditable_terminal_deletion_state") {
    fail("Account deletion must define queued/active job, asset deletion, content-free tombstone, and auditable completion behavior.");
  }
  if (deletion?.tombstoneRetention !== "owner_legal_policy_required_no_default_in_contract") {
    fail("Tombstone retention must remain owner/legal policy-controlled without an invented default.");
  }
  const lineage = contract.lineage;
  for (const flag of ["originalsAreImmutable", "versionsAreImmutable", "projectVersionRelationshipRequired", "refinementsRequireParentVersion", "versionsRecordParentSourceMaskPromptAndResults", "providerAttemptsAreAuditable"]) {
    if (lineage?.[flag] !== true) fail(`Crevux mobile lineage must require ${flag}.`);
  }
  if (lineage?.inPlaceOverwriteAllowed !== false) fail("Crevux mobile lineage must prohibit in-place overwrite of originals and versions.");
  for (const field of ["projectId", "sourceAssetId", "promptSnapshot", "resultAssetIds", "providerProvenance", "modelProvenance", "jobId"]) {
    if (!lineage?.requiredVersionFields?.includes(field)) fail(`Crevux mobile version lineage is missing required field ${field}.`);
  }
  for (const field of ["parentVersionId", "maskAssetId"]) {
    if (!lineage?.optionalVersionFields?.includes(field)) fail(`Crevux mobile version lineage must represent optional field ${field}.`);
  }
}

function collectStringLeaves(value, output = new Set()) {
  if (typeof value === "string") {
    output.add(value);
  } else if (Array.isArray(value)) {
    for (const entry of value) collectStringLeaves(entry, output);
  } else if (value && typeof value === "object") {
    for (const entry of Object.values(value)) collectStringLeaves(entry, output);
  }
  return output;
}
