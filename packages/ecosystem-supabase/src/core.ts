import type {
  AuditLogInput,
  CurrentUserResult,
  CurrentWorkspaceOptions,
  Entitlement,
  EntitlementRequirement,
  SharedSupabaseClient,
  UsageEventInput,
  WorkspaceAppAccess,
  WorkspaceAppAccessRequirement,
  WorkspaceMember,
  WorkspaceMemberRequirement,
} from "./types";

type QueryClient = ReturnType<SharedSupabaseClient["schema"]>;

function core(client: SharedSupabaseClient): QueryClient {
  return client.schema("core");
}

function fail(message: string): never {
  throw new Error(message);
}

function assertNoError(error: unknown, context: string): void {
  if (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`${context}: ${detail}`);
  }
}

export async function getCurrentUser(client: SharedSupabaseClient): Promise<CurrentUserResult> {
  const { data, error } = await client.auth.getUser();
  assertNoError(error, "Failed to load current Supabase user");
  if (!data.user) fail("Authentication required");
  return { user: data.user };
}

export async function getCurrentWorkspace(client: SharedSupabaseClient, options: CurrentWorkspaceOptions): Promise<unknown> {
  const { data, error } = await core(client).from("workspaces").select("*").eq("id", options.workspaceId).maybeSingle();
  assertNoError(error, "Failed to load current workspace");
  if (!data) fail("Workspace not found or access denied");
  return data;
}

export async function requireWorkspaceMember(
  client: SharedSupabaseClient,
  requirement: WorkspaceMemberRequirement,
): Promise<WorkspaceMember> {
  const userId = requirement.userId ?? (await getCurrentUser(client)).user.id;
  const { data, error } = await core(client)
    .from("workspace_members")
    .select("id, workspace_id, user_id, role, status")
    .eq("workspace_id", requirement.workspaceId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  assertNoError(error, "Failed to verify workspace membership");
  if (!data) fail("Workspace membership required");

  const member = data as WorkspaceMember;
  if (requirement.roles && !requirement.roles.includes(member.role)) {
    fail(`Workspace role required: ${requirement.roles.join(", ")}`);
  }

  return member;
}

export async function requireWorkspaceAppAccess(
  client: SharedSupabaseClient,
  requirement: WorkspaceAppAccessRequirement,
): Promise<WorkspaceAppAccess> {
  await requireWorkspaceMember(client, { workspaceId: requirement.workspaceId });

  const { data, error } = await core(client)
    .from("workspace_app_access")
    .select("id, workspace_id, app_slug, status")
    .eq("workspace_id", requirement.workspaceId)
    .eq("app_slug", requirement.appSlug)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  assertNoError(error, "Failed to verify workspace app access");
  if (!data) fail(`Workspace does not have access to app: ${requirement.appSlug}`);

  return data as WorkspaceAppAccess;
}

export async function requireEntitlement(
  client: SharedSupabaseClient,
  requirement: EntitlementRequirement,
): Promise<Entitlement> {
  await requireWorkspaceAppAccess(client, {
    workspaceId: requirement.workspaceId,
    appSlug: requirement.appSlug,
  });

  const { data, error } = await core(client)
    .from("entitlements")
    .select("id, workspace_id, app_slug, feature_key, decision, source, reason, valid_from, valid_until")
    .eq("workspace_id", requirement.workspaceId)
    .eq("app_slug", requirement.appSlug)
    .eq("feature_key", requirement.featureKey)
    .maybeSingle();

  assertNoError(error, "Failed to verify entitlement");
  if (!data) fail(`Missing entitlement for ${requirement.appSlug}:${requirement.featureKey}`);

  const entitlement = data as Entitlement;
  if (entitlement.source !== "verixet") {
    fail("Entitlement decision must come from Verixet authority");
  }
  if (!["allow", "meter", "trial"].includes(entitlement.decision)) {
    fail(`Entitlement denied for ${requirement.appSlug}:${requirement.featureKey}`);
  }

  const now = Date.now();
  if (Date.parse(entitlement.valid_from) > now) fail("Entitlement is not active yet");
  if (entitlement.valid_until && Date.parse(entitlement.valid_until) <= now) fail("Entitlement has expired");

  return entitlement;
}

export async function recordUsageEvent(client: SharedSupabaseClient, input: UsageEventInput): Promise<unknown> {
  const { data, error } = await core(client)
    .from("usage_events")
    .insert({
      workspace_id: input.workspaceId,
      app_slug: input.appSlug,
      feature_key: input.featureKey,
      quantity: input.quantity ?? 1,
      unit: input.unit ?? "event",
      idempotency_key: input.idempotencyKey,
      source: input.source ?? "app_server",
      created_by: input.createdBy ?? null,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  assertNoError(error, "Failed to record usage event");
  return data;
}

export async function writeAuditLog(client: SharedSupabaseClient, input: AuditLogInput): Promise<unknown> {
  const { data, error } = await core(client)
    .from("audit_logs")
    .insert({
      workspace_id: input.workspaceId ?? null,
      app_slug: input.appSlug ?? null,
      actor_user_id: input.actorUserId ?? null,
      action: input.action,
      target_table: input.targetTable ?? null,
      target_id: input.targetId ?? null,
      severity: input.severity ?? "info",
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  assertNoError(error, "Failed to write audit log");
  return data;
}
