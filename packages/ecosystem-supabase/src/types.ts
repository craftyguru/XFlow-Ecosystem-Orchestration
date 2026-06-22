import type { SupabaseClient, User } from "@supabase/supabase-js";

export type SupabaseEnv = Record<string, string | undefined>;

export type EcosystemAppSlug =
  | "xflow"
  | "verixet"
  | "audaix"
  | "rataify"
  | "wordgeni"
  | "crevux";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";
export type EntitlementDecision = "allow" | "deny" | "meter" | "trial";
export type AuditSeverity = "debug" | "info" | "warn" | "error" | "critical";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SharedSupabaseClient = SupabaseClient<any, any, any>;

export interface SupabaseClientOptions {
  env?: SupabaseEnv;
  global?: {
    headers?: Record<string, string>;
  };
  auth?: {
    persistSession?: boolean;
    autoRefreshToken?: boolean;
    detectSessionInUrl?: boolean;
  };
}

export interface CurrentWorkspaceOptions {
  workspaceId: string;
}

export interface WorkspaceMemberRequirement {
  workspaceId: string;
  userId?: string;
  roles?: readonly WorkspaceRole[];
}

export interface WorkspaceAppAccessRequirement {
  workspaceId: string;
  appSlug: EcosystemAppSlug;
}

export interface EntitlementRequirement {
  workspaceId: string;
  appSlug: EcosystemAppSlug;
  featureKey: string;
}

export interface UsageEventInput {
  workspaceId: string;
  appSlug: EcosystemAppSlug;
  featureKey: string;
  quantity?: number;
  unit?: string;
  idempotencyKey?: string;
  source?: string;
  createdBy?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AuditLogInput {
  workspaceId?: string | null;
  appSlug?: EcosystemAppSlug | null;
  actorUserId?: string | null;
  action: string;
  targetTable?: string | null;
  targetId?: string | null;
  severity?: AuditSeverity;
  metadata?: Record<string, unknown>;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  status: "active" | "invited" | "disabled";
}

export interface WorkspaceAppAccess {
  id: string;
  workspace_id: string;
  app_slug: EcosystemAppSlug;
  status: "active" | "disabled" | "trialing" | "pending";
}

export interface Entitlement {
  id: string;
  workspace_id: string;
  app_slug: EcosystemAppSlug;
  feature_key: string;
  decision: EntitlementDecision;
  source: string;
  reason: string | null;
  valid_from: string;
  valid_until: string | null;
}

export interface CurrentUserResult {
  user: User;
}
