import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const contractUrl = new URL("../ecosystem-contracts/crevux-mobile-v1.json", import.meta.url);
const contract = JSON.parse(await readFile(contractUrl, "utf8"));
const validatorPath = fileURLToPath(new URL("./validate-ecosystem-contracts.mjs", import.meta.url));
const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

async function assertValidatorRejects(mutate, expectedFailure) {
  const mutated = structuredClone(contract);
  mutate(mutated);
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "crevux-mobile-contract-"));
  const mutatedContractPath = path.join(temporaryDirectory, "crevux-mobile-v1.json");
  try {
    await writeFile(mutatedContractPath, `${JSON.stringify(mutated, null, 2)}\n`, "utf8");
    const result = spawnSync(process.execPath, [validatorPath], {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { ...process.env, XFLOW_CREVUX_MOBILE_CONTRACT_PATH: mutatedContractPath },
    });
    assert.notEqual(result.status, 0, "mutated contract unexpectedly passed validation");
    assert.match(`${result.stdout}\n${result.stderr}`, expectedFailure);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

test("locks the approved product and authority boundaries", () => {
  assert.equal(contract.delivery.boundary, "shared-mobile-foundation-separate-product-app");
  assert.equal(contract.delivery.framework, "expo-react-native-with-first-party-kotlin-modules");
  assert.deepEqual(contract.authorities, {
    identityAndAccounts: "xflow",
    billingEntitlementsAndUsage: "verixet",
    projectsMediaEditingJobsAndProviders: "crevux",
  });
});

test("requires public-client PKCE, transaction-bound state, and safe token lifecycle", () => {
  assert.equal(contract.authentication.flow, "authorization_code");
  assert.equal(contract.authentication.pkceMethod, "S256");
  assert.equal(contract.authentication.clientType, "public");
  assert.equal(contract.authentication.embeddedClientSecretAllowed, false);
  assert.equal(contract.authentication.redirectKind, "verified_https_app_link");
  assert.equal(contract.authentication.browser, "external_system_browser");
  assert.equal(contract.authentication.statePolicy.required, true);
  assert.equal(contract.authentication.statePolicy.generation, "cryptographically_random_per_authorization_attempt");
  assert.deepEqual(contract.authentication.statePolicy.transactionBinding, [
    "authorization_request",
    "pkce_code_verifier",
    "redirect_uri",
    "client_instance",
  ]);
  assert.equal(contract.authentication.statePolicy.validation, "exact_constant_time_match");
  assert.equal(contract.authentication.statePolicy.singleUse, true);
  assert.equal(contract.authentication.statePolicy.expiry, "short_lived_server_defined");
  assert.equal(contract.authentication.tokenLifecycle.refreshReplayBehavior, "revoke_token_family_and_require_reauthentication");
  assert.equal(contract.authentication.tokenLifecycle.revocationRequired, true);
  assert.deepEqual(contract.authentication.tokenLifecycle.logoutOrder, [
    "stop_new_authenticated_work",
    "request_refresh_token_family_revocation",
    "invalidate_server_session",
    "delete_local_access_and_refresh_tokens",
    "clear_auth_bound_local_state",
  ]);
  assert.match(contract.authentication.tokenLifecycle.revocationFailureBehavior, /clear_local_tokens_fail_closed/);
  assert.ok(contract.unsupportedClaims.includes("provider_keys_in_apk"));
  assert.ok(contract.unsupportedClaims.includes("confidential_oauth_client_secret_in_apk"));
});

test("locks separate production and MOBILE-1 test OAuth trust domains", () => {
  assert.equal(contract.authentication.redirectUri, "https://crevux.com/mobile/oauth/callback");
  assert.deepEqual(contract.authentication.environmentSelection, {
    source: "explicit_build_configuration",
    missingUnknownOrMismatchedBehavior: "fail_closed_before_authorization_or_token_use",
    runtimeFallbackAllowed: false,
    crossEnvironmentTokenAcceptanceAllowed: false,
  });
  assert.deepEqual(contract.authentication.environmentProfiles, {
    production: {
      deploymentClassification: "production",
      clientId: "crevux-android",
      xflowOrigin: "https://xflowx.com",
      issuer: "https://xflowx.com",
      clientAudience: "crevux-android",
      redirectUri: "https://crevux.com/mobile/oauth/callback",
      packageName: "com.crevux.mobile",
      exactRedirectMatchRequired: true,
      wildcardOriginOrRedirectAllowed: false,
      digitalAssetLinksHost: "crevux.com",
      digitalAssetLinksCertificateProfile: "production_release_certificate",
    },
    test: {
      deploymentClassification: "staging",
      clientId: "crevux-android-test",
      xflowOrigin: "https://mobile-test.xflowx.com",
      issuer: "https://mobile-test.xflowx.com",
      clientAudience: "crevux-android-test",
      redirectUri: "https://mobile-test.crevux.com/mobile/oauth/callback",
      packageName: "com.crevux.mobile",
      exactRedirectMatchRequired: true,
      wildcardOriginOrRedirectAllowed: false,
      digitalAssetLinksHost: "mobile-test.crevux.com",
      digitalAssetLinksCertificateProfile: "dedicated_mobile_1_test_certificate",
    },
  });
  assert.deepEqual(contract.authentication.environmentIsolation, {
    separateClientRegistrationsRequired: true,
    issuerAndClientAudienceMustMatchSelectedProfile: true,
    crossEnvironmentTokensRejected: true,
    digitalAssetLinksCertificatesMustDiffer: true,
    testCertificateAllowedOnProductionHost: false,
    productionCertificateAllowedOnTestHost: false,
  });
});

test("specifies authentication, scope, workspace authorization, and ownership for every endpoint", () => {
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

  assert.equal(contract.endpoints.length, expectedScopes.size);
  for (const endpoint of contract.endpoints) {
    assert.equal(endpoint.authentication, "xflow_oauth_access_token", endpoint.operation);
    assert.deepEqual(endpoint.requiredScopes, [expectedScopes.get(endpoint.operation)], endpoint.operation);
    assert.equal(endpoint.workspaceAuthorization, "selected_workspace_membership_required", endpoint.operation);
    assert.ok(endpoint.resourceOwnership, endpoint.operation);
  }
  assert.equal(contract.endpoints.find(({ operation }) => operation === "create_project").ordinaryWorkspaceMemberAllowed, true);
});

test("defines durable mobile operations and safe idempotency", () => {
  const operations = new Set(contract.endpoints.map((endpoint) => endpoint.operation));
  for (const operation of [
    "create_project",
    "initiate_upload",
    "complete_upload",
    "create_generation_job",
    "get_generation_job",
    "request_job_cancellation",
    "create_retry_job",
    "list_project_versions",
    "get_gallery_export_metadata",
    "get_mobile_entitlements",
  ]) {
    assert.ok(operations.has(operation), `missing operation ${operation}`);
  }
  assert.equal(contract.idempotency.sameKeySameFingerprint, "return_original_resource");
  assert.equal(contract.idempotency.sameKeyDifferentFingerprint, "IDEMPOTENCY_CONFLICT");
  assert.equal(contract.idempotency.providerAttemptsRemainChildrenOfOneLogicalJob, true);
  assert.equal(contract.idempotency.infrastructureRetryIdentity, "same_logical_job_and_idempotency_identity");
  assert.deepEqual(contract.idempotency.userRetryPolicy, {
    createsNewChildJob: true,
    newJobIdRequired: true,
    newIdempotencyKeyRequired: true,
    recordsParentJob: true,
    eligibleParentStatuses: ["failed", "cancelled"],
    preservesLineage: true,
    freshEntitlementCheckRequired: true,
    freshUsageAndCostEstimateRequired: true,
    explicitUserSubmissionRequired: true,
    mayIncurNewCharge: true,
    reusePriorChargeAuthorizationAllowed: false,
  });
});

test("defines honest cancellation and provider-evidence accounting", () => {
  assert.deepEqual(contract.cancellationPolicy, {
    queuedBeforeProviderExecution: "cancel_without_provider_execution",
    providerStartedCancellationRequest: "only_when_adapter_supports_cancellation",
    localStateMayClaimProviderCancellationWithoutEvidence: false,
    unsupportedProviderCancellation: "JOB_NOT_CANCELLABLE",
    lateProviderResults: "quarantine_not_expose_as_normal_completed_results",
    usageAndRefundAccounting: "authoritative_provider_execution_evidence",
  });
});

test("requires the complete approved error taxonomy", () => {
  const expectedTaxonomy = {
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
  assert.deepEqual(contract.errorTaxonomy, expectedTaxonomy);
  assert.deepEqual(new Set(contract.errorCodes), new Set(Object.values(expectedTaxonomy).flat()));
});

test("fails closed on hostile or oversized uploads and supports safe resumability", () => {
  const media = contract.mediaSecurity;
  assert.equal(media.limitSource, "server_configured_and_returned_by_entitlements");
  assert.deepEqual(media.requiredLimits, ["maxCompressedBytes", "maxDecodedPixels", "maxWidth", "maxHeight", "maxFrameCount"]);
  assert.equal(media.missingLimitsBehavior, "fail_closed_before_upload");
  for (const flag of [
    "requireMagicByteAndDecodeValidation",
    "requireCompressedAndDecodedSizeLimits",
    "rejectMimeMagicMismatch",
    "rejectMalformedDecode",
    "rejectPolyglotFiles",
    "rejectUnsupportedAnimationOrFrameCount",
    "rejectDecompressionBombs",
    "scanBeforeAssetFinalization",
    "checksumRequiredBeforeCompletion",
    "rejectChecksumMismatch",
    "resumableCheckpointsRequired",
    "uploadExpiryRequired",
    "rejectExpiredUploadSession",
    "completionIsIdempotent",
    "orphanPartCleanupRequired",
    "crossWorkspaceCompletionRejected",
    "stripExifLocationByDefault",
  ]) assert.equal(media[flag], true, flag);
  assert.equal(media.checksumAlgorithm, "sha256");
});

test("requires immutable originals and complete version lineage", () => {
  assert.equal(contract.lineage.originalsAreImmutable, true);
  assert.equal(contract.lineage.versionsAreImmutable, true);
  assert.equal(contract.lineage.inPlaceOverwriteAllowed, false);
  assert.equal(contract.lineage.projectVersionRelationshipRequired, true);
  assert.equal(contract.lineage.refinementsRequireParentVersion, true);
  assert.deepEqual(contract.lineage.requiredVersionFields, [
    "projectId", "sourceAssetId", "promptSnapshot", "resultAssetIds", "providerProvenance", "modelProvenance", "jobId",
  ]);
  assert.deepEqual(contract.lineage.optionalVersionFields, ["parentVersionId", "maskAssetId"]);
  assert.equal(contract.lineage.versionsRecordParentSourceMaskPromptAndResults, true);
  assert.equal(contract.lineage.providerAttemptsAreAuditable, true);
});

test("reauthorizes signed-media renewal and makes Gallery export an explicit privacy boundary", () => {
  assert.equal(contract.signedMedia.lifetime, "minutes");
  assert.equal(contract.signedMedia.renewalRequiresFreshAuthentication, true);
  assert.equal(contract.signedMedia.renewalRechecksUserWorkspaceAndResourceAuthorization, true);
  assert.equal(contract.galleryExport.explicitUserInitiated, true);
  assert.equal(contract.galleryExport.boundary, "private_workspace_to_device_visible_media");
  assert.equal(contract.galleryExport.checksumVerificationRequiredBeforeMediaStoreCommit, true);
});

test("defines an auditable account-deletion lifecycle without inventing retention", () => {
  assert.equal(contract.accountDeletion.authority, "xflow");
  assert.deepEqual(contract.accountDeletion.immediateActions, ["revoke_token_family", "block_new_work"]);
  assert.equal(contract.accountDeletion.newWorkAfterDeletionBegins, "blocked_immediately");
  assert.equal(contract.accountDeletion.queuedJobs, "cancel");
  assert.equal(contract.accountDeletion.providerCancellationRequest, "when_supported_by_adapter");
  assert.equal(contract.accountDeletion.activeJobs, "request_provider_cancellation_when_supported_otherwise_quarantine_late_results");
  assert.equal(contract.accountDeletion.lateProviderResults, "quarantine_not_expose_as_normal_completed_results");
  assert.equal(contract.accountDeletion.assetDeletion, "delete_private_project_assets_after_terminal_state_or_bounded_cleanup_timeout");
  assert.equal(contract.accountDeletion.assetCleanupDeadline, "after_terminal_state_or_bounded_cleanup_timeout");
  assert.equal(contract.accountDeletion.tombstone, "content_free_minimal_audit_record");
  assert.equal(contract.accountDeletion.completion, "auditable_terminal_deletion_state");
  assert.equal(contract.accountDeletion.tombstoneRetention, "owner_legal_policy_required_no_default_in_contract");
});

test("validator rejects removal of billable child-job retry policy", async () => {
  await assertValidatorRejects((mutated) => { delete mutated.idempotency.userRetryPolicy; }, /User retry policy must require createsNewChildJob/);
});

test("validator rejects weakened cancellation honesty", async () => {
  await assertValidatorRejects((mutated) => { mutated.cancellationPolicy.localStateMayClaimProviderCancellationWithoutEvidence = true; }, /must not claim provider cancellation without evidence/);
});

test("validator rejects weakened immutable lineage", async () => {
  await assertValidatorRejects((mutated) => { mutated.lineage.originalsAreImmutable = false; }, /lineage must require originalsAreImmutable/);
});

test("validator rejects removal of any required error code", async () => {
  await assertValidatorRejects((mutated) => { mutated.errorCodes = mutated.errorCodes.filter((code) => code !== "AUTH_REQUIRED"); }, /missing distinct error AUTH_REQUIRED/);
});

test("validator rejects weakened checksum-mismatch behavior", async () => {
  await assertValidatorRejects((mutated) => { mutated.mediaSecurity.rejectChecksumMismatch = false; }, /must require rejectChecksumMismatch/);
});

test("validator rejects weakened upload-expiration behavior", async () => {
  await assertValidatorRejects((mutated) => { mutated.mediaSecurity.rejectExpiredUploadSession = false; }, /must require rejectExpiredUploadSession/);
});

test("validator rejects removal of cancellation late-result quarantine", async () => {
  await assertValidatorRejects((mutated) => { delete mutated.cancellationPolicy.lateProviderResults; }, /Late provider results after cancellation must be quarantined/);
});

test("validator rejects removal of deletion late-result quarantine", async () => {
  await assertValidatorRejects((mutated) => { delete mutated.accountDeletion.lateProviderResults; }, /Account deletion must quarantine late provider results/);
});

test("validator rejects a wildcard callback", async () => {
  await assertValidatorRejects((mutated) => { mutated.authentication.environmentProfiles.test.redirectUri = "https://mobile-test.crevux.com/*"; }, /test OAuth environment profile must match its exact approved registration/);
});

test("validator rejects a wildcard XFlow origin", async () => {
  await assertValidatorRejects((mutated) => { mutated.authentication.environmentProfiles.test.xflowOrigin = "https://*.xflowx.com"; }, /test OAuth environment profile must match its exact approved registration/);
});

test("validator rejects cross-environment token acceptance", async () => {
  await assertValidatorRejects((mutated) => { mutated.authentication.environmentSelection.crossEnvironmentTokenAcceptanceAllowed = true; }, /reject cross-environment tokens/);
});

test("validator rejects a shared production and test client registration", async () => {
  await assertValidatorRejects((mutated) => { mutated.authentication.environmentProfiles.test.clientId = "crevux-android"; }, /test OAuth environment profile must match its exact approved registration/);
});

test("validator rejects production issuer or audience in the test profile", async () => {
  await assertValidatorRejects((mutated) => { mutated.authentication.environmentProfiles.test.issuer = "https://xflowx.com"; }, /test OAuth environment profile must match its exact approved registration/);
  await assertValidatorRejects((mutated) => { mutated.authentication.environmentProfiles.test.clientAudience = "crevux-android"; }, /test OAuth environment profile must match its exact approved registration/);
});

test("validator rejects a shared Digital Asset Links certificate profile", async () => {
  await assertValidatorRejects((mutated) => { mutated.authentication.environmentProfiles.test.digitalAssetLinksCertificateProfile = "production_release_certificate"; }, /test OAuth environment profile must match its exact approved registration/);
});
