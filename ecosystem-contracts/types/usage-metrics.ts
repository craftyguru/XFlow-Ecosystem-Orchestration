export const ECOSYSTEM_USAGE_APP_SLUGS = [
  "xflow",
  "verixet",
  "rataify",
  "audaix",
  "wordgeni",
  "crevux",
] as const;

export type EcosystemAppSlug = (typeof ECOSYSTEM_USAGE_APP_SLUGS)[number];
export type EcosystemUsageMetricOwner = EcosystemAppSlug | "ecosystem";
export type EcosystemUsageMetricVisibility = "user_visible" | "admin_visible" | "internal_only";
export type EcosystemUsageMetricAggregation = "sum" | "max" | "latest" | "count_distinct";
export type EcosystemUsageMetricUnit =
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

export type EcosystemUsageMetricAttribution =
  | "app_owned"
  | "shared_ecosystem"
  | "billing_credit"
  | "workspace_seat"
  | "storage"
  | "system_internal";

export type EcosystemUsageMetricDefinition = {
  metricKey: string;
  owner: EcosystemUsageMetricOwner;
  attribution: EcosystemUsageMetricAttribution;
  label: string;
  description: string;
  unit: EcosystemUsageMetricUnit;
  visibility: EcosystemUsageMetricVisibility;
  aggregation: EcosystemUsageMetricAggregation;
  limitKey?: string;
  allowedAppSlugs: EcosystemAppSlug[];
  displayGroup: "app_usage" | "ecosystem_usage" | "credits" | "workspace" | "storage" | "internal";
};

export type EcosystemUsageReportEvent = {
  workspaceId: string;
  userId?: string | null;
  sourceApp: EcosystemAppSlug;
  metricKey: string;
  quantity: number;
  occurredAt: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
};

const ALL_APPS = ECOSYSTEM_USAGE_APP_SLUGS;

export const ECOSYSTEM_USAGE_METRIC_CATALOG = [
  {
    metricKey: "ai_copilot_turn",
    owner: "ecosystem",
    attribution: "shared_ecosystem",
    label: "AI Copilot Turns",
    description: "Shared AI assistant interactions across ecosystem surfaces.",
    unit: "requests",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "ai_copilot_turn",
    allowedAppSlugs: [...ALL_APPS],
    displayGroup: "ecosystem_usage",
  },
  {
    metricKey: "ai_analysis_job",
    owner: "ecosystem",
    attribution: "shared_ecosystem",
    label: "AI Analysis Jobs",
    description: "Shared AI analysis jobs not yet attributed to a single app.",
    unit: "requests",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "ai_analysis_job",
    allowedAppSlugs: [...ALL_APPS],
    displayGroup: "ecosystem_usage",
  },
  {
    metricKey: "event_ingest",
    owner: "ecosystem",
    attribution: "shared_ecosystem",
    label: "Event Ingest",
    description: "Shared ecosystem event ingestion volume.",
    unit: "events",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "event_ingest",
    allowedAppSlugs: [...ALL_APPS],
    displayGroup: "ecosystem_usage",
  },
  {
    metricKey: "deployment_log_fetch",
    owner: "ecosystem",
    attribution: "system_internal",
    label: "Deployment Log Fetches",
    description: "Internal deployment log retrieval volume.",
    unit: "requests",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "deployment_log_fetch",
    allowedAppSlugs: ["xflow", "audaix", "verixet"],
    displayGroup: "internal",
  },
  {
    metricKey: "storage_upload",
    owner: "ecosystem",
    attribution: "storage",
    label: "Storage Uploads",
    description: "Shared storage upload usage.",
    unit: "storage_mb",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "storage_upload",
    allowedAppSlugs: [...ALL_APPS],
    displayGroup: "storage",
  },
  {
    metricKey: "sentiment_analysis",
    owner: "rataify",
    attribution: "app_owned",
    label: "Sentiment Analyses",
    description: "Rataify sentiment analysis runs.",
    unit: "requests",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "sentiment_analysis",
    allowedAppSlugs: ["rataify"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "reputation_scan",
    owner: "rataify",
    attribution: "app_owned",
    label: "Reputation Scans",
    description: "Rataify reputation scan runs.",
    unit: "reports",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "reputation_scan",
    allowedAppSlugs: ["rataify"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "rataify_assistant_message",
    owner: "rataify",
    attribution: "app_owned",
    label: "Assistant Messages",
    description: "Internal Rataify assistant message usage.",
    unit: "requests",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify_assistant_message",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "rataify_privacy_scan",
    owner: "rataify",
    attribution: "app_owned",
    label: "Privacy Scans",
    description: "Internal Rataify privacy scan runs.",
    unit: "reports",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify_privacy_scan",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "rataify_policy_generation",
    owner: "rataify",
    attribution: "app_owned",
    label: "Policy Generations",
    description: "Internal Rataify policy generation runs.",
    unit: "generations",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify_policy_generation",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "rataify_copy_analysis",
    owner: "rataify",
    attribution: "app_owned",
    label: "Copy Analyses",
    description: "Internal Rataify copy analysis runs.",
    unit: "requests",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify_copy_analysis",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "rataify_inbox_analysis",
    owner: "rataify",
    attribution: "app_owned",
    label: "Inbox Analyses",
    description: "Internal Rataify inbox analysis runs.",
    unit: "requests",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify_inbox_analysis",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "rataify_report_export",
    owner: "rataify",
    attribution: "app_owned",
    label: "Report Exports",
    description: "Internal Rataify report export activity.",
    unit: "reports",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify_report_export",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "rataify_storage_upload",
    owner: "rataify",
    attribution: "storage",
    label: "Storage Uploads",
    description: "Internal Rataify storage upload usage.",
    unit: "storage_mb",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify_storage_upload",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "rataify_connected_app_verify",
    owner: "rataify",
    attribution: "app_owned",
    label: "Connected App Verifications",
    description: "Internal Rataify connected app verification activity.",
    unit: "requests",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify_connected_app_verify",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "rataify_site_import",
    owner: "rataify",
    attribution: "app_owned",
    label: "Site Imports",
    description: "Internal Rataify site import activity.",
    unit: "events",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify_site_import",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "rataify_summary_read",
    owner: "rataify",
    attribution: "app_owned",
    label: "Summary Reads",
    description: "Internal Rataify summary read activity.",
    unit: "requests",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify_summary_read",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "entitlement_check",
    owner: "verixet",
    attribution: "system_internal",
    label: "Entitlement Checks",
    description: "Internal entitlement evaluation calls.",
    unit: "requests",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "entitlement_check",
    allowedAppSlugs: [...ALL_APPS],
    displayGroup: "internal",
  },
  {
    metricKey: "workflow_run",
    owner: "ecosystem",
    attribution: "shared_ecosystem",
    label: "Workflow Runs",
    description: "Shared workflow executions without explicit app ownership.",
    unit: "requests",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "workflow_run",
    allowedAppSlugs: ["xflow", "verixet", "audaix"],
    displayGroup: "ecosystem_usage",
  },
  {
    metricKey: "api_event",
    owner: "ecosystem",
    attribution: "shared_ecosystem",
    label: "API Events",
    description: "Shared API and event volume.",
    unit: "events",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "api_event",
    allowedAppSlugs: [...ALL_APPS],
    displayGroup: "ecosystem_usage",
  },
  {
    metricKey: "diagnostic_ai_job",
    owner: "audaix",
    attribution: "app_owned",
    label: "Diagnostic AI Jobs",
    description: "AudAiX diagnostic AI jobs.",
    unit: "requests",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "diagnostic_ai_job",
    allowedAppSlugs: ["audaix"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "xflow_signal_run",
    owner: "xflow",
    attribution: "app_owned",
    label: "Signal Runs",
    description: "XFlow signal run executions.",
    unit: "requests",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "xflow_signal_run",
    allowedAppSlugs: ["xflow"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "audaix.live_audit",
    owner: "audaix",
    attribution: "app_owned",
    label: "Live Audits",
    description: "AudAiX live audits.",
    unit: "audits",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "audaix.live_audit",
    allowedAppSlugs: ["audaix"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "audaix.repo_final_check",
    owner: "audaix",
    attribution: "app_owned",
    label: "Repo Final Checks",
    description: "AudAiX repository final checks.",
    unit: "audits",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "audaix.repo_final_check",
    allowedAppSlugs: ["audaix"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "audaix.scheduled_monitoring",
    owner: "audaix",
    attribution: "app_owned",
    label: "Scheduled Monitoring Runs",
    description: "AudAiX scheduled monitoring runs.",
    unit: "reports",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "audaix.scheduled_monitoring",
    allowedAppSlugs: ["audaix"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "xflow.ecosystem_audit",
    owner: "xflow",
    attribution: "app_owned",
    label: "Ecosystem Audits",
    description: "XFlow ecosystem audits.",
    unit: "audits",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "xflow.ecosystem_audit",
    allowedAppSlugs: ["xflow"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "rataify.audit_proof_badge",
    owner: "rataify",
    attribution: "app_owned",
    label: "Proof Badge Refreshes",
    description: "Rataify audit proof badge refreshes.",
    unit: "reports",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "rataify.audit_proof_badge",
    allowedAppSlugs: ["rataify"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "rataify.proof_import",
    owner: "rataify",
    attribution: "app_owned",
    label: "Proof Imports",
    description: "Rataify AudAiX proof import operations.",
    unit: "reports",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify.proof_import",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "rataify.proof_refresh",
    owner: "rataify",
    attribution: "app_owned",
    label: "Proof Refreshes",
    description: "Rataify AudAiX proof refresh operations.",
    unit: "reports",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify.proof_refresh",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "rataify.proof_visibility_update",
    owner: "rataify",
    attribution: "app_owned",
    label: "Proof Visibility Updates",
    description: "Rataify proof public badge visibility changes.",
    unit: "events",
    visibility: "internal_only",
    aggregation: "sum",
    limitKey: "rataify.proof_visibility_update",
    allowedAppSlugs: ["rataify"],
    displayGroup: "internal",
  },
  {
    metricKey: "wordgeni.document",
    owner: "wordgeni",
    attribution: "app_owned",
    label: "Documents",
    description: "WordGeni document creation or processing.",
    unit: "documents",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "wordgeni.document",
    allowedAppSlugs: ["wordgeni"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "wordgeni.ai_generation",
    owner: "wordgeni",
    attribution: "app_owned",
    label: "AI Generations",
    description: "WordGeni AI generation runs.",
    unit: "generations",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "wordgeni.ai_generation",
    allowedAppSlugs: ["wordgeni"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "crevux.image_credit",
    owner: "crevux",
    attribution: "app_owned",
    label: "Image Credits",
    description: "Crevux image generation credit usage.",
    unit: "images",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "crevux.image_credit",
    allowedAppSlugs: ["crevux"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "crevux.video_credit",
    owner: "crevux",
    attribution: "app_owned",
    label: "Video Credits",
    description: "Crevux video generation credit usage.",
    unit: "videos",
    visibility: "user_visible",
    aggregation: "sum",
    limitKey: "crevux.video_credit",
    allowedAppSlugs: ["crevux"],
    displayGroup: "app_usage",
  },
  {
    metricKey: "ai_action_credits",
    owner: "ecosystem",
    attribution: "billing_credit",
    label: "AI Action Credits",
    description: "Spendable AI action credit balance.",
    unit: "credits",
    visibility: "user_visible",
    aggregation: "latest",
    allowedAppSlugs: [...ALL_APPS],
    displayGroup: "credits",
  },
  {
    metricKey: "media_image_credits",
    owner: "crevux",
    attribution: "billing_credit",
    label: "Media Image Credits",
    description: "Spendable media image credit balance.",
    unit: "credits",
    visibility: "user_visible",
    aggregation: "latest",
    allowedAppSlugs: ["crevux"],
    displayGroup: "credits",
  },
  {
    metricKey: "media_advanced_video_credits",
    owner: "crevux",
    attribution: "billing_credit",
    label: "Media Advanced Video Credits",
    description: "Spendable advanced media video credit balance.",
    unit: "credits",
    visibility: "user_visible",
    aggregation: "latest",
    allowedAppSlugs: ["crevux"],
    displayGroup: "credits",
  },
  {
    metricKey: "storage_gb",
    owner: "ecosystem",
    attribution: "storage",
    label: "Storage GB",
    description: "Storage add-on balance.",
    unit: "storage_mb",
    visibility: "user_visible",
    aggregation: "latest",
    allowedAppSlugs: [...ALL_APPS],
    displayGroup: "storage",
  },
] as const satisfies readonly EcosystemUsageMetricDefinition[];

export const PLANNED_ECOSYSTEM_USAGE_METRICS = [
  "rataify.review_ingest",
  "audaix.diagnostic_report",
  "wordgeni.words_generated",
  "crevux.storage_asset_mb",
] as const;

export function getEcosystemUsageMetricDefinition(metricKey: string): EcosystemUsageMetricDefinition | null {
  return ECOSYSTEM_USAGE_METRIC_CATALOG.find((metric) => metric.metricKey === metricKey) ?? null;
}

export function validateEcosystemUsageReportEvent(event: EcosystemUsageReportEvent):
  | { ok: true; metric: EcosystemUsageMetricDefinition }
  | { ok: false; reason: "unknown_metric" | "invalid_source_app" | "invalid_quantity" | "missing_idempotency_key" } {
  const metric = getEcosystemUsageMetricDefinition(event.metricKey);
  if (!metric) return { ok: false, reason: "unknown_metric" };
  if (!metric.allowedAppSlugs.includes(event.sourceApp)) return { ok: false, reason: "invalid_source_app" };
  if (!Number.isFinite(event.quantity) || event.quantity <= 0) return { ok: false, reason: "invalid_quantity" };
  if (!event.idempotencyKey.trim()) return { ok: false, reason: "missing_idempotency_key" };
  return { ok: true, metric };
}
