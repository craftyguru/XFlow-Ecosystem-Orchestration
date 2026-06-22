export const ECOSYSTEM_STATUS_CONTRACT_VERSION = "2026-05-ecosystem-status-v1" as const;

export const ECOSYSTEM_STATUS_APP_SLUGS = [
  "xflow",
  "verixet",
  "audaix",
  "rataify",
  "wordgeni",
  "crevux",
] as const;

export type EcosystemStatusAppSlug = (typeof ECOSYSTEM_STATUS_APP_SLUGS)[number];
export type EcosystemStatusTier = "free" | "starter" | "pro" | "elite";
export type EcosystemStatusGrantSource =
  | "free_baseline"
  | "individual_subscription"
  | "main4_bundle_subscription"
  | "creator_bundle_subscription"
  | "ecosystem_bundle_subscription"
  | "manual_admin_grant"
  | "trial";
export type EcosystemStatusBundle = "main4" | "creator" | "ecosystem";
export type EcosystemStatusBillingInterval = "monthly" | "yearly";
export type EcosystemStatusUsageUnit =
  | "requests"
  | "credits"
  | "audits"
  | "reports"
  | "generations"
  | "images"
  | "videos"
  | "words"
  | "documents"
  | "storage_mb"
  | "seats"
  | "events"
  | "other";
export type EcosystemStatusUsageMetricStatus = "ok" | "warning" | "exceeded" | "unlimited" | "unavailable";

export type EcosystemStatusWarning = {
  code: string;
  message: string;
  appSlug?: EcosystemStatusAppSlug | null;
};

export type EcosystemStatusError = {
  code: string;
  message: string;
};

export type EcosystemStatusRequest = {
  workspaceId: string;
  userId?: string | null;
  sourceApp: "xflow";
  include?: {
    effectiveAccess?: boolean;
    billingLifecycle?: boolean;
    planChangeCapabilities?: boolean;
    usageSummary?: boolean;
    portalLinks?: boolean;
  };
};

export type EcosystemStatusUsageMetric = {
  metricKey: string;
  label: string;
  used: number;
  limit: number | "unlimited" | null;
  unit: EcosystemStatusUsageUnit;
  percentUsed: number | null;
  status: EcosystemStatusUsageMetricStatus;
};

export type EcosystemStatusUsageApp = {
  appSlug: EcosystemStatusAppSlug;
  appName: string;
  tier: EcosystemStatusTier;
  usage: EcosystemStatusUsageMetric[];
  warnings: string[];
};

export type EcosystemStatusCreditBalance = {
  creditType: string;
  label: string;
  remaining: number;
  unit: "credits";
  expiresAt: string | null;
};

export type EcosystemStatusUsageSummary = {
  available: boolean;
  generatedAt: string;
  period: {
    start: string | null;
    end: string | null;
    source: "billing_period" | "calendar_month" | "rolling_30d" | "unknown";
  };
  apps: EcosystemStatusUsageApp[];
  ecosystem: {
    available: boolean;
    usage: EcosystemStatusUsageMetric[];
    warnings: string[];
  };
  credits: {
    available: boolean;
    balances: EcosystemStatusCreditBalance[];
  };
  summary?: null;
  warnings: string[];
};

export type EcosystemPortalSessionRequest = {
  workspaceId: string;
  userId?: string | null;
  sourceApp: "xflow";
  returnUrl: string;
};

export type EcosystemPortalSessionResponse = {
  ok: true;
  mode: "portal_session" | "billing_dashboard_fallback";
  redirectUrl: string;
  expiresAt: string | null;
  warnings: string[];
};

export type EcosystemStatusAppAccess = {
  appSlug: EcosystemStatusAppSlug;
  appName: string;
  hasAccess: boolean;
  tier: EcosystemStatusTier;
  source: EcosystemStatusGrantSource;
  winningPlanSlug: string;
  includedByBundle: EcosystemStatusBundle | null;
  billingInterval: EcosystemStatusBillingInterval | null;
  warnings: EcosystemStatusWarning[];
};

export type EcosystemStatusLifecycleState =
  | "free_baseline"
  | "active_paid"
  | "trialing"
  | "past_due"
  | "canceling_at_period_end"
  | "canceled"
  | "expired"
  | "incomplete"
  | "portal_required"
  | "manual_resolution_required";

export type EcosystemStatusResponse = {
  contractVersion: typeof ECOSYSTEM_STATUS_CONTRACT_VERSION;
  source: "verixet";
  generatedAt: string;
  workspaceId: string;
  userId: string | null;
  authority: {
    identity: "xflow";
    billing: "verixet";
    entitlements: "verixet";
    usage: "verixet";
  };
  effectiveAccess: {
    apps: EcosystemStatusAppAccess[];
    activePlanSlugs: string[];
    activeSubscriptionCount: number;
    highestTier: EcosystemStatusTier;
    highestPackage: "free" | "individual_apps" | "creator_bundle" | "main4_bundle" | "ecosystem_bundle" | "mixed";
    freeBaselineIncluded: boolean;
  };
  billingLifecycle: {
    states: EcosystemStatusLifecycleState[];
    hasActivePaidAccess: boolean;
    hasPendingCancellation: boolean;
    hasPastDue: boolean;
    needsPortal: boolean;
    manualResolutionRequired: boolean;
    safeCustomerPortalAvailable: boolean;
  };
  planChange: {
    previewAvailable: boolean;
    executionAvailable: boolean;
    checkoutHandoffAvailable: boolean;
    portalAvailable: boolean;
  };
  usage: EcosystemStatusUsageSummary;
  links: {
    billingDashboardUrl: string;
    pricingUrl: string;
    customerPortalUrl: string | null;
    customerPortalAvailable?: boolean;
    customerPortalHandoffUrl?: string | null;
  };
  warnings: EcosystemStatusWarning[];
  errors: EcosystemStatusError[];
};
