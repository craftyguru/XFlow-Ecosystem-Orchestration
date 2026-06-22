export const ECOSYSTEM_APP_SLUGS = [
  "xflow",
  "verixet",
  "rataify",
  "audaix",
  "wordgeni",
  "crevux",
] as const;

export type EcosystemAppSlug = (typeof ECOSYSTEM_APP_SLUGS)[number];

export const ECOSYSTEM_PLATFORM_ROLES = [
  "user",
  "workspace_admin",
  "superadmin",
  "platform_owner",
] as const;

export type EcosystemPlatformRole = (typeof ECOSYSTEM_PLATFORM_ROLES)[number];

export const ECOSYSTEM_APP_ROLES = ["viewer", "app_admin", "app_owner", "superadmin"] as const;

export type EcosystemAppRole = (typeof ECOSYSTEM_APP_ROLES)[number];

export const ECOSYSTEM_WORKSPACE_ROLES = ["viewer", "member", "admin", "owner"] as const;

export type EcosystemWorkspaceRole = (typeof ECOSYSTEM_WORKSPACE_ROLES)[number];

export type EcosystemRoleClaims = {
  userId: string;
  email: string;
  platformRoles: EcosystemPlatformRole[];
  appRoles: Array<{
    appSlug: EcosystemAppSlug;
    role: EcosystemAppRole;
  }>;
  workspaceRoles?: Array<{
    workspaceId: string;
    role: EcosystemWorkspaceRole;
  }>;
  permissionsVersion: number;
  roleUpdatedAt: string;
  issuedAt: string;
  sessionRoleHydratedAt: string;
};

export const CANONICAL_ECOSYSTEM_SUPERADMIN_EMAIL = "craftyguru@1ofakindpiece.com" as const;

const ECOSYSTEM_PLATFORM_ADMIN_ROLES = new Set<EcosystemPlatformRole>([
  "superadmin",
  "platform_owner",
]);

const ECOSYSTEM_APP_ADMIN_ROLES = new Set<EcosystemAppRole>([
  "app_admin",
  "app_owner",
  "superadmin",
]);

const ECOSYSTEM_APP_SUPERADMIN_ROLES = new Set<EcosystemAppRole>(["superadmin"]);

export function hasEcosystemPlatformAdminRole(
  claims: Pick<EcosystemRoleClaims, "platformRoles"> | null | undefined,
): boolean {
  return claims?.platformRoles?.some((role) => ECOSYSTEM_PLATFORM_ADMIN_ROLES.has(role)) ?? false;
}

export function hasEcosystemAppAdminRole(
  claims: Pick<EcosystemRoleClaims, "platformRoles" | "appRoles"> | null | undefined,
  appSlug: EcosystemAppSlug,
): boolean {
  if (hasEcosystemPlatformAdminRole(claims)) return true;
  return (
    claims?.appRoles?.some(
      (grant) => grant.appSlug === appSlug && ECOSYSTEM_APP_ADMIN_ROLES.has(grant.role),
    ) ?? false
  );
}

export function hasEcosystemAppSuperadminRole(
  claims: Pick<EcosystemRoleClaims, "platformRoles" | "appRoles"> | null | undefined,
  appSlug: EcosystemAppSlug,
): boolean {
  if (hasEcosystemPlatformAdminRole(claims)) return true;
  return (
    claims?.appRoles?.some(
      (grant) => grant.appSlug === appSlug && ECOSYSTEM_APP_SUPERADMIN_ROLES.has(grant.role),
    ) ?? false
  );
}

export function canUseEcosystemAdminSurfaces(
  claims: Pick<EcosystemRoleClaims, "platformRoles" | "appRoles"> | null | undefined,
  appSlug: EcosystemAppSlug,
): boolean {
  return hasEcosystemAppAdminRole(claims, appSlug);
}

export function canUseEcosystemSuperadminSurfaces(
  claims: Pick<EcosystemRoleClaims, "platformRoles" | "appRoles"> | null | undefined,
  appSlug: EcosystemAppSlug,
): boolean {
  return hasEcosystemAppSuperadminRole(claims, appSlug);
}

export const SUPPORT_CATEGORIES = [
  "general",
  "sales",
  "billing",
  "technical",
  "account",
  "bug",
  "feature_request",
  "security",
  "abuse",
  "refund",
  "entitlement",
  "integration",
] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const SUPPORT_STATUSES = [
  "new",
  "open",
  "pending_user",
  "pending_internal",
  "escalated",
  "resolved",
  "closed",
] as const;

export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

export const SUPPORT_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export type SupportPriority = (typeof SUPPORT_PRIORITIES)[number];

export const ASSISTANT_CONVERSATION_STATUSES = [
  "active",
  "escalated",
  "resolved",
  "archived",
] as const;

export type AssistantConversationStatus =
  (typeof ASSISTANT_CONVERSATION_STATUSES)[number];

export const ASSISTANT_MESSAGE_ROLES = [
  "system",
  "user",
  "assistant",
  "tool",
  "admin",
] as const;

export type AssistantMessageRole = (typeof ASSISTANT_MESSAGE_ROLES)[number];

export type Metadata = Record<string, unknown>;

export type NullableActorContext = {
  userId: string | null;
  workspaceId: string | null;
  visitorSessionId: string | null;
};

export type TimestampedRecord = {
  createdAt: string;
  updatedAt: string;
};

export type EcosystemThemeMetadata = {
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string | null;
  iconLabel: string;
  metadata: Metadata;
};

export type EcosystemAppProfile = TimestampedRecord & {
  id: string;
  appSlug: EcosystemAppSlug;
  displayName: string;
  domain: string;
  shortDescription: string;
  longDescription: string;
  ecosystemRole: string;
  primaryAudience: string;
  coreFeatures: string[];
  publicUrl: string;
  signupUrl: string;
  pricingUrl: string;
  supportUrl: string;
  supportEmail: string | null;
  relatedApps: EcosystemAppSlug[];
  pricingSummary: string;
  freePlanSummary: string;
  paidPlanSummary: string;
  supportCategories: SupportCategory[];
  theme: EcosystemThemeMetadata;
  metadata: Metadata;
};

export type EcosystemFAQ = TimestampedRecord & {
  id: string;
  appSlug: EcosystemAppSlug;
  question: string;
  answer: string;
  category: SupportCategory;
  tags: string[];
  sourceUrl: string | null;
  status: "draft" | "published" | "archived";
  priority: number;
  metadata: Metadata;
};

export type AssistantCitation = {
  label: string;
  url: string | null;
  appSlug: EcosystemAppSlug | null;
  sourceType: "app_profile" | "faq" | "pricing_catalog" | "entitlement" | "support_doc" | "runtime";
  metadata: Metadata;
};

export type AssistantSuggestedLink = {
  label: string;
  href: string;
  appSlug: EcosystemAppSlug | null;
  metadata: Metadata;
};

export const ASSISTANT_ACTION_RISK_LEVELS = ["low", "medium", "high"] as const;

export type AssistantActionRiskLevel = (typeof ASSISTANT_ACTION_RISK_LEVELS)[number];

export type AssistantActionRequiredRole = EcosystemWorkspaceRole;

export const ASSISTANT_ACTION_STATUSES = ["succeeded", "failed", "blocked"] as const;

export type AssistantActionStatus = (typeof ASSISTANT_ACTION_STATUSES)[number];

export type AssistantProposedAction = {
  actionId: string;
  id?: string;
  type?:
    | "navigate"
    | "open_tool"
    | "open_chronicle_tab"
    | "start_support_escalation"
    | "draft_chronicle_event"
    | "explain_setup"
    | "show_status";
  appSlug: EcosystemAppSlug;
  label: string;
  description: string;
  requiredRole: AssistantActionRequiredRole;
  riskLevel: AssistantActionRiskLevel;
  requiresConfirmation: boolean;
  href?: string;
  toolId?: string;
  chronicleTab?: string;
  promptSeed?: string;
  payloadPreview?: Metadata;
  inputs?: Metadata;
  confirmationLabel?: string | null;
};

export type AssistantActionExecutionRequest = Partial<NullableActorContext> & {
  appSlug: EcosystemAppSlug;
  actionId: string;
  workspaceId: string;
  conversationId?: string | null;
  assistantMessageId?: string | null;
  confirmed?: boolean;
  inputs?: Metadata;
  requestId?: string | null;
  metadata?: Metadata;
};

export type AssistantActionExecutionResponse = {
  actionId: string;
  appSlug: EcosystemAppSlug;
  status: AssistantActionStatus;
  resultSummary: string;
  riskLevel: AssistantActionRiskLevel;
  requiresConfirmation: boolean;
  logId: string | null;
  snapshotId?: string | null;
  requestId: string;
};

export type AssistantConversation = TimestampedRecord &
  NullableActorContext & {
    id: string;
    appSlug: EcosystemAppSlug;
    requestId: string | null;
    status: AssistantConversationStatus;
    category: SupportCategory;
    priority: SupportPriority;
    title: string | null;
    metadata: Metadata;
  };

export type AssistantMessage = TimestampedRecord & {
  id: string;
  conversationId: string;
  appSlug: EcosystemAppSlug;
  requestId: string | null;
  role: AssistantMessageRole;
  content: string;
  citations: AssistantCitation[];
  metadata: Metadata;
};

export type AssistantToolCall = TimestampedRecord & {
  id: string;
  conversationId: string;
  messageId: string | null;
  appSlug: EcosystemAppSlug;
  requestId: string | null;
  toolName: string;
  status: "queued" | "running" | "succeeded" | "failed" | "blocked";
  input: Metadata;
  output: Metadata | null;
  error: string | null;
  latencyMs: number | null;
  metadata: Metadata;
};

export type AssistantChatRequest = Partial<NullableActorContext> & {
  appSlug: EcosystemAppSlug;
  message: string;
  conversationId?: string | null;
  requestId?: string | null;
  currentPath?: string | null;
  metadata?: Metadata;
};

export type AssistantChatResponse = {
  conversationId: string;
  assistantMessageId?: string | null;
  workspaceId?: string | null;
  answer: string;
  citations: AssistantCitation[];
  suggestedLinks: AssistantSuggestedLink[];
  proposedActions: AssistantProposedAction[];
  canEscalate: boolean;
  confidence: "low" | "medium" | "high";
  usedAppSlugs: EcosystemAppSlug[];
  requestId: string;
};

export type AssistantEscalationRequest = Partial<NullableActorContext> & {
  appSlug: EcosystemAppSlug;
  conversationId: string;
  email?: string | null;
  subject?: string | null;
  category?: SupportCategory;
  priority?: SupportPriority;
  requestId?: string | null;
  metadata?: Metadata;
};

export type AssistantEscalationResponse = {
  supportConversationId: string;
  status: SupportStatus;
  appSlug: EcosystemAppSlug;
  requestId: string;
};

export type SupportConversation = TimestampedRecord &
  NullableActorContext & {
    id: string;
    appSlug: EcosystemAppSlug;
    requestId: string | null;
    assistantConversationId: string | null;
    requesterEmail: string | null;
    subject: string;
    status: SupportStatus;
    category: SupportCategory;
    priority: SupportPriority;
    metadata: Metadata;
  };

export type SupportMessage = TimestampedRecord & {
  id: string;
  supportConversationId: string;
  appSlug: EcosystemAppSlug;
  requestId: string | null;
  senderType: "visitor" | "user" | "admin" | "system";
  senderUserId: string | null;
  body: string;
  attachments: Array<{
    id: string;
    fileName: string;
    contentType: string;
    url: string;
    sizeBytes: number | null;
    metadata: Metadata;
  }>;
  metadata: Metadata;
};

export type SupportAssignment = TimestampedRecord & {
  id: string;
  supportConversationId: string;
  appSlug: EcosystemAppSlug;
  requestId: string | null;
  assigneeUserId: string;
  assignedByUserId: string;
  scope: "global" | "app";
  status: "active" | "released";
  metadata: Metadata;
};

export type SupportEvent = TimestampedRecord & {
  id: string;
  supportConversationId: string;
  appSlug: EcosystemAppSlug;
  requestId: string | null;
  actorUserId: string | null;
  eventType: string;
  metadata: Metadata;
};

export type AdminNotification = TimestampedRecord & {
  id: string;
  appSlug: EcosystemAppSlug | null;
  workspaceId: string | null;
  requestId: string | null;
  recipientScope: "xflow_global" | "app_admin" | "user";
  recipientUserId: string | null;
  type: string;
  title: string;
  body: string;
  status: "unread" | "read" | "archived";
  metadata: Metadata;
};

export type ApiErrorShape = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiSuccessEnvelope<T> = {
  ok: true;
  data: T;
  error: null;
  requestId: string;
};

export type ApiErrorEnvelope = {
  ok: false;
  data: null;
  error: ApiErrorShape;
  requestId: string;
};

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export type AdminAppScope =
  | { type: "xflow_global" }
  | { type: "app"; appSlug: EcosystemAppSlug }
  | null
  | undefined;

const APP_SLUG_SET = new Set<string>(ECOSYSTEM_APP_SLUGS);

const APP_SLUG_ALIASES: Record<string, EcosystemAppSlug> = {
  xflow: "xflow",
  xflowx: "xflow",
  verixet: "verixet",
  rataify: "rataify",
  rataifyx: "rataify",
  rataiFy: "rataify",
  rataify_ai: "rataify",
  audaix: "audaix",
  audaixx: "audaix",
  audaix_ai: "audaix",
  wordgeni: "wordgeni",
  wordgenix: "wordgeni",
  writexet: "wordgeni",
  crevux: "crevux",
  crevox: "crevux",
};

export function normalizeEcosystemAppSlug(value: unknown): EcosystemAppSlug | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
  return APP_SLUG_ALIASES[normalized] ?? null;
}

export function isValidEcosystemAppSlug(value: unknown): value is EcosystemAppSlug {
  return typeof value === "string" && APP_SLUG_SET.has(value);
}

export function assertValidEcosystemAppSlug(value: unknown): asserts value is EcosystemAppSlug {
  if (!isValidEcosystemAppSlug(value)) {
    throw new Error(`Invalid ecosystem app slug: ${String(value)}`);
  }
}

export function createRequestId(): string {
  const random = Math.random().toString(36).slice(2, 12);
  return `req_${Date.now().toString(36)}_${random}`;
}

export function createApiSuccess<T>(data: T, requestId: string): ApiSuccessEnvelope<T> {
  return {
    ok: true,
    data,
    error: null,
    requestId,
  };
}

export function createApiError(
  code: string,
  message: string,
  requestId: string,
  details?: unknown,
): ApiErrorEnvelope {
  return {
    ok: false,
    data: null,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
    requestId,
  };
}

export function canAdminAccessAppScope(
  adminScope: AdminAppScope,
  appSlug: EcosystemAppSlug,
): boolean {
  if (!adminScope) return false;
  if (adminScope.type === "xflow_global") return true;
  return adminScope.appSlug === appSlug;
}

const PRICING_AUTHORITY_SUMMARY =
  "Pricing is resolved from the active pricing authority/catalog and should not be hardcoded in the assistant profile.";

const NOW_SEED_TIMESTAMP = "2026-05-07T00:00:00.000Z";
const XFLOW_SIGNUP_URL = "https://xflowx.com/auth/sign-up";
const XFLOW_AUTH_START_URL = "https://xflowx.com/auth/start";
const APP_SIGNUP_RETURN_TO: Record<EcosystemAppSlug, string> = {
  xflow: "https://xflowx.com/dashboard",
  verixet: "https://verixet.com/dashboard",
  rataify: "https://rataify.com/dashboard",
  audaix: "https://audaix.com/dashboard",
  wordgeni: "https://wordgeni.com/dashboard",
  crevux: "https://crevux.com/dashboard",
};

function xflowSignupUrl(appSlug: EcosystemAppSlug): string {
  if (appSlug === "xflow") return XFLOW_SIGNUP_URL;
  return `${XFLOW_AUTH_START_URL}?app=${appSlug}&selectedAppSlug=${appSlug}&sourceApp=${appSlug}&intent=signup&returnTo=${encodeURIComponent(APP_SIGNUP_RETURN_TO[appSlug])}`;
}

export const ECOSYSTEM_APP_PROFILE_SEEDS = [
  {
    id: "profile_xflow",
    appSlug: "xflow",
    displayName: "XFlow",
    domain: "control-plane.identity.xflow",
    shortDescription: "Central control plane for the connected AI business ecosystem.",
    longDescription:
      "XFlow coordinates connected apps, routes operational signals, manages workspace linking, and gives operators one place to monitor activity across the ecosystem.",
    ecosystemRole: "Global ecosystem assistant router, app registry, admin monitoring, and cross-app orchestration layer.",
    primaryAudience: "Operators and teams that need one command layer across multiple AI business tools.",
    coreFeatures: [
      "Ecosystem command center",
      "Cross-app routing",
      "Workspace linking",
      "Operational monitoring",
      "Admin visibility",
    ],
    publicUrl: "https://xflowx.com",
    signupUrl: xflowSignupUrl("xflow"),
    pricingUrl: "https://xflowx.com/pricing",
    supportUrl: "https://xflowx.com/support",
    supportEmail: null,
    relatedApps: ["verixet", "rataify", "audaix", "wordgeni", "crevux"],
    pricingSummary: PRICING_AUTHORITY_SUMMARY,
    freePlanSummary:
      "Free access, if available, must be resolved from the active pricing authority/catalog before it is shown to a user.",
    paidPlanSummary:
      "Paid plan details must be resolved from the active pricing authority/catalog and should not be hardcoded in the assistant profile.",
    supportCategories: ["general", "technical", "integration", "account"],
    theme: {
      accentColor: "#22d3ee",
      backgroundColor: "#06111f",
      textColor: "#e6f7ff",
      logoUrl: null,
      iconLabel: "XF",
      metadata: { tone: "control-plane", gradient: "cyan-blue" },
    },
    metadata: {},
    createdAt: NOW_SEED_TIMESTAMP,
    updatedAt: NOW_SEED_TIMESTAMP,
  },
  {
    id: "profile_verixet",
    appSlug: "verixet",
    displayName: "Verixet",
    domain: "billing.governance.verixet",
    shortDescription: "Billing, entitlement, usage, and access authority for the ecosystem.",
    longDescription:
      "Verixet governs plans, subscriptions, usage, credits, access decisions, and entitlement checks so connected apps do not invent billing or access state.",
    ecosystemRole: "Pricing, billing, entitlements, usage, checkout, and access governance truth.",
    primaryAudience: "Teams that need governed billing, plan enforcement, and auditable access decisions.",
    coreFeatures: [
      "Checkout governance",
      "Entitlement checks",
      "Usage metering",
      "Billing state",
      "Access policy decisions",
    ],
    publicUrl: "https://verixet.com",
    signupUrl: xflowSignupUrl("verixet"),
    pricingUrl: "https://verixet.com/pricing",
    supportUrl: "https://verixet.com/support",
    supportEmail: null,
    relatedApps: ["xflow", "rataify", "audaix", "wordgeni", "crevux"],
    pricingSummary: PRICING_AUTHORITY_SUMMARY,
    freePlanSummary:
      "Free access, if available, must be resolved from the active pricing authority/catalog before it is shown to a user.",
    paidPlanSummary:
      "Paid plan details must be resolved from the active pricing authority/catalog and should not be hardcoded in the assistant profile.",
    supportCategories: ["billing", "entitlement", "account", "technical"],
    theme: {
      accentColor: "#a78bfa",
      backgroundColor: "#0f1028",
      textColor: "#f4f0ff",
      logoUrl: null,
      iconLabel: "VX",
      metadata: { tone: "governance", gradient: "violet-cyan" },
    },
    metadata: {},
    createdAt: NOW_SEED_TIMESTAMP,
    updatedAt: NOW_SEED_TIMESTAMP,
  },
  {
    id: "profile_rataify",
    appSlug: "rataify",
    displayName: "Rataify",
    domain: "trust.reviews.rataify",
    shortDescription: "Trust, reviews, reputation, risk, and social proof workflows.",
    longDescription:
      "Rataify helps teams monitor reputation signals, manage reviews, detect risk, generate trust assets, and turn customer feedback into action.",
    ecosystemRole: "Reputation, trust, review intelligence, risk radar, and proof workflows.",
    primaryAudience: "Businesses that need stronger trust signals, review operations, and reputation recovery workflows.",
    coreFeatures: [
      "Review management",
      "Risk monitoring",
      "Trust badges",
      "Reputation workflows",
      "Customer feedback analysis",
    ],
    publicUrl: "https://rataify.com",
    signupUrl: xflowSignupUrl("rataify"),
    pricingUrl: "https://rataify.com/pricing",
    supportUrl: "https://rataify.com/support",
    supportEmail: null,
    relatedApps: ["xflow", "verixet", "audaix", "wordgeni", "crevux"],
    pricingSummary: PRICING_AUTHORITY_SUMMARY,
    freePlanSummary:
      "Free access, if available, must be resolved from the active pricing authority/catalog before it is shown to a user.",
    paidPlanSummary:
      "Paid plan details must be resolved from the active pricing authority/catalog and should not be hardcoded in the assistant profile.",
    supportCategories: ["general", "technical", "integration", "feature_request"],
    theme: {
      accentColor: "#fbbf24",
      backgroundColor: "#16130b",
      textColor: "#fff7db",
      logoUrl: null,
      iconLabel: "RA",
      metadata: { tone: "trust", gradient: "gold-green" },
    },
    metadata: {
      integrationNote:
        "Existing Rataify support routes should be consolidated before deeper shared support integration.",
    },
    createdAt: NOW_SEED_TIMESTAMP,
    updatedAt: NOW_SEED_TIMESTAMP,
  },
  {
    id: "profile_audaix",
    appSlug: "audaix",
    displayName: "AudAiX",
    domain: "audit.monitoring.audaix",
    shortDescription: "Audit, monitoring, diagnostics, and improvement intelligence.",
    longDescription:
      "AudAiX audits websites, apps, APIs, accessibility, SEO, performance, security posture, and system health so teams can find issues and improve them.",
    ecosystemRole: "Audit intelligence, monitoring, diagnostics, and evidence-backed improvement signals.",
    primaryAudience: "Operators and builders that need continuous audits, diagnostics, and improvement recommendations.",
    coreFeatures: [
      "AI audit checks",
      "Monitoring dashboards",
      "Diagnostics",
      "Accessibility and performance review",
      "Security posture signals",
    ],
    publicUrl: "https://audaix.com",
    signupUrl: xflowSignupUrl("audaix"),
    pricingUrl: "https://audaix.com/pricing",
    supportUrl: "https://audaix.com/support",
    supportEmail: null,
    relatedApps: ["xflow", "verixet", "rataify", "wordgeni", "crevux"],
    pricingSummary: PRICING_AUTHORITY_SUMMARY,
    freePlanSummary:
      "Free access, if available, must be resolved from the active pricing authority/catalog before it is shown to a user.",
    paidPlanSummary:
      "Paid plan details must be resolved from the active pricing authority/catalog and should not be hardcoded in the assistant profile.",
    supportCategories: ["technical", "integration", "bug", "general"],
    theme: {
      accentColor: "#34d399",
      backgroundColor: "#061b16",
      textColor: "#e7fff5",
      logoUrl: null,
      iconLabel: "AX",
      metadata: { tone: "audit", gradient: "green-cyan" },
    },
    metadata: {},
    createdAt: NOW_SEED_TIMESTAMP,
    updatedAt: NOW_SEED_TIMESTAMP,
  },
  {
    id: "profile_wordgeni",
    appSlug: "wordgeni",
    displayName: "WordGeni",
    domain: "writing.intelligence.wordgeni",
    shortDescription: "Writing, content, research, SEO, and growth intelligence.",
    longDescription:
      "WordGeni helps teams turn sources, ideas, strategy, brand voice, and ecosystem signals into sharper writing, briefs, campaigns, documents, and response copy.",
    ecosystemRole: "Writing intelligence, source-grounded drafting, content strategy, and growth copy workflows.",
    primaryAudience: "Creators, founders, agencies, and teams that need high-quality writing and campaign support.",
    coreFeatures: [
      "Source-grounded drafting",
      "Content strategy",
      "SEO briefs",
      "Campaign copy",
      "Research and document workflows",
    ],
    publicUrl: "https://wordgeni.com",
    signupUrl: xflowSignupUrl("wordgeni"),
    pricingUrl: "https://wordgeni.com/pricing",
    supportUrl: "https://wordgeni.com/support",
    supportEmail: null,
    relatedApps: ["xflow", "verixet", "rataify", "audaix", "crevux"],
    pricingSummary: PRICING_AUTHORITY_SUMMARY,
    freePlanSummary:
      "Free access, if available, must be resolved from the active pricing authority/catalog before it is shown to a user.",
    paidPlanSummary:
      "Paid plan details must be resolved from the active pricing authority/catalog and should not be hardcoded in the assistant profile.",
    supportCategories: ["general", "technical", "feature_request", "account"],
    theme: {
      accentColor: "#facc15",
      backgroundColor: "#171707",
      textColor: "#fffbd8",
      logoUrl: null,
      iconLabel: "WG",
      metadata: { tone: "writing", gradient: "yellow-amber" },
    },
    metadata: {},
    createdAt: NOW_SEED_TIMESTAMP,
    updatedAt: NOW_SEED_TIMESTAMP,
  },
  {
    id: "profile_crevux",
    appSlug: "crevux",
    displayName: "Crevux",
    domain: "ai.media.crevux",
    shortDescription: "Creative studio for images, videos, assets, storyboards, and media workflows.",
    longDescription:
      "Crevux helps teams create visual assets, videos, storyboards, brand media, campaign visuals, and reusable creative production workflows.",
    ecosystemRole: "Creative production, visual media generation, asset workflows, and media automation.",
    primaryAudience: "Creative teams, founders, agencies, and operators that need campaign-ready visual media.",
    coreFeatures: [
      "Image generation",
      "Video workflows",
      "Storyboard tools",
      "Creative asset library",
      "Media production automation",
    ],
    publicUrl: "https://crevux.com",
    signupUrl: xflowSignupUrl("crevux"),
    pricingUrl: "https://crevux.com/pricing",
    supportUrl: "https://crevux.com/support",
    supportEmail: null,
    relatedApps: ["xflow", "verixet", "rataify", "audaix", "wordgeni"],
    pricingSummary: PRICING_AUTHORITY_SUMMARY,
    freePlanSummary:
      "Free access, if available, must be resolved from the active pricing authority/catalog before it is shown to a user.",
    paidPlanSummary:
      "Paid plan details must be resolved from the active pricing authority/catalog and should not be hardcoded in the assistant profile.",
    supportCategories: ["general", "technical", "feature_request", "account"],
    theme: {
      accentColor: "#f472b6",
      backgroundColor: "#1d0b1a",
      textColor: "#ffe8f5",
      logoUrl: null,
      iconLabel: "CV",
      metadata: { tone: "creative", gradient: "pink-violet" },
    },
    metadata: {},
    createdAt: NOW_SEED_TIMESTAMP,
    updatedAt: NOW_SEED_TIMESTAMP,
  },
] as const satisfies readonly EcosystemAppProfile[];
