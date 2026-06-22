#!/usr/bin/env node

const apps = [
  {
    app: "Verixet",
    authority: "billing, entitlements, usage admission, credits, Stripe",
    runtimeFlags: {
      enabled: "VERIXET_SHARED_SUPABASE_RUNTIME_ENABLED",
      dualWrite: "VERIXET_SHARED_SUPABASE_DUAL_WRITE_ENABLED",
      readMode: "VERIXET_SHARED_SUPABASE_READ_MODE",
      failClosed: "VERIXET_SHARED_SUPABASE_FAIL_CLOSED",
    },
    logMarkers: [
      "verixet.shared_supabase.runtime.write_failed",
      "verixet.shared_supabase.runtime.dual_compare_mismatch",
      "verixet.shared_supabase.runtime.write_latency_ms",
      "verixet.usage_admission.denied",
      "stripe.webhook.replay_failed",
    ],
    oldDbTables: ["usage_events", "billing_accounts", "subscriptions", "credit_balances", "credit_transactions", "audit_events"],
    sharedTables: ["core.usage_events", "core.billing_events", "core.audit_logs", "verixet.entitlement_decisions", "verixet.usage_admission_logs", "verixet.credit_ledger"],
    manualDashboardChecks: [
      "Alert on any shared runtime write failure in Verixet logs.",
      "Alert on dual-compare mismatch count greater than zero over a 15 minute window.",
      "Alert on p95 shared write latency above the agreed rollout threshold.",
      "Alert on usage admission 5xx/denied spikes during dual-write.",
      "Alert on Stripe webhook replay/idempotency failures.",
    ],
  },
  {
    app: "XFlow",
    authority: "control-plane, app connections, UCL, workflow orchestration",
    runtimeFlags: {
      enabled: "XFLOW_SHARED_SUPABASE_RUNTIME_ENABLED",
      dualWrite: "XFLOW_SHARED_SUPABASE_DUAL_WRITE_ENABLED",
      readMode: "XFLOW_SHARED_SUPABASE_READ_MODE",
      failClosed: "XFLOW_SHARED_SUPABASE_FAIL_CLOSED",
    },
    logMarkers: [
      "xflow.shared_supabase.runtime.write_failed",
      "xflow.shared_supabase.runtime.dual_compare_mismatch",
      "xflow.shared_supabase.runtime.write_latency_ms",
      "xflow.control_plane.event_write_failed",
      "xflow.app_connection.mirror_failed",
    ],
    oldDbTables: ["app_connections", "workspace_app_access", "control_plane_events", "app_links", "deployment_checks", "workflow_runs", "audit_logs"],
    sharedTables: ["core.app_connections", "core.workspace_app_access", "core.audit_logs", "xflow.control_plane_events", "xflow.app_links", "xflow.deployment_checks", "xflow.workflow_runs"],
    manualDashboardChecks: [
      "Alert on XFlow shared runtime write failures.",
      "Alert on control-plane/app-connection mirror failures.",
      "Alert on dual-compare mismatches for connection/control-plane reads.",
      "Track app connection and deployment-check old-vs-shared row parity.",
    ],
  },
  {
    app: "AudAiX",
    authority: "audits, reports, monitors, findings, scan jobs",
    runtimeFlags: {
      enabled: "AUDAIX_SHARED_SUPABASE_RUNTIME_ENABLED",
      dualWrite: "AUDAIX_SHARED_SUPABASE_DUAL_WRITE_ENABLED",
      readMode: "AUDAIX_SHARED_SUPABASE_READ_MODE",
      failClosed: "AUDAIX_SHARED_SUPABASE_FAIL_CLOSED",
    },
    logMarkers: [
      "audaix.shared_supabase.runtime.write_failed",
      "audaix.shared_supabase.runtime.dual_compare_mismatch",
      "audaix.shared_supabase.runtime.write_latency_ms",
      "audaix.auth.session_exchange_failed",
      "audaix.verixet.usage_admission_failed",
      "audaix.report_storage.write_failed",
    ],
    oldDbTables: ["sites", "audits", "audit_reports", "audit_findings", "scan_jobs", "security_audit_logs"],
    sharedTables: ["core.usage_events", "core.audit_logs", "audaix.audits", "audaix.audit_reports", "audaix.monitors", "audaix.audit_findings", "audaix.scan_jobs"],
    manualDashboardChecks: [
      "Alert on shared audit/report mirror failures.",
      "Alert on auth/session exchange 401/invalid-token spikes.",
      "Alert on Verixet usage admission 4xx/5xx from audit creation.",
      "Alert on report artifact storage failures.",
    ],
  },
  {
    app: "Rataify",
    authority: "sites, reviews, issues, risk events, evidence",
    runtimeFlags: {
      enabled: "RATAIFY_SHARED_SUPABASE_RUNTIME_ENABLED",
      dualWrite: "RATAIFY_SHARED_SUPABASE_DUAL_WRITE_ENABLED",
      readMode: "RATAIFY_SHARED_SUPABASE_READ_MODE",
      failClosed: "RATAIFY_SHARED_SUPABASE_FAIL_CLOSED",
    },
    logMarkers: [
      "rataify.shared_supabase.runtime.write_failed",
      "rataify.shared_supabase.runtime.dual_compare_mismatch",
      "rataify.shared_supabase.runtime.write_latency_ms",
      "rataify.evidence_storage.write_failed",
      "rataify.review_flow.write_failed",
    ],
    oldDbTables: ["users", "sites", "reviews", "issues", "risk_events", "evidence_items", "audit_logs"],
    sharedTables: ["core.usage_events", "core.audit_logs", "rataify.sites", "rataify.reviews", "rataify.issues", "rataify.risk_events", "rataify.evidence_items"],
    manualDashboardChecks: [
      "Alert on shared site/review/issue mirror failures.",
      "Alert on evidence storage write/read failures.",
      "Track review/issue old-vs-shared row parity.",
    ],
  },
  {
    app: "WordGeni",
    authority: "documents, sources, memory cards, writing sessions, provenance",
    runtimeFlags: {
      enabled: "WORDGENI_SHARED_SUPABASE_RUNTIME_ENABLED",
      dualWrite: "WORDGENI_SHARED_SUPABASE_DUAL_WRITE_ENABLED",
      readMode: "WORDGENI_SHARED_SUPABASE_READ_MODE",
      failClosed: "WORDGENI_SHARED_SUPABASE_FAIL_CLOSED",
    },
    logMarkers: [
      "wordgeni.shared_supabase.runtime.write_failed",
      "wordgeni.shared_supabase.runtime.dual_compare_mismatch",
      "wordgeni.shared_supabase.runtime.write_latency_ms",
      "wordgeni.worker.boot_missing",
      "wordgeni.source_storage.write_failed",
      "wordgeni.api_auth.token_failed",
    ],
    oldDbTables: ["documents", "document_sources", "memory_cards", "writing_sessions", "provenance_items", "usage_events", "audit_logs"],
    sharedTables: ["core.usage_events", "core.audit_logs", "wordgeni.documents", "wordgeni.document_sources", "wordgeni.memory_cards", "wordgeni.writing_sessions", "wordgeni.provenance_items"],
    manualDashboardChecks: [
      "Alert on document/source/provenance mirror failures.",
      "Alert on worker boot proof missing or worker queue failures.",
      "Alert on API auth/token failures.",
      "Track source upload storage failures.",
    ],
  },
  {
    app: "Crevux",
    authority: "projects, assets, generation jobs, exports, provider runs, credit spend",
    runtimeFlags: {
      enabled: "CREVUX_SHARED_SUPABASE_RUNTIME_ENABLED",
      dualWrite: "CREVUX_SHARED_SUPABASE_DUAL_WRITE_ENABLED",
      readMode: "CREVUX_SHARED_SUPABASE_READ_MODE",
      failClosed: "CREVUX_SHARED_SUPABASE_FAIL_CLOSED",
    },
    logMarkers: [
      "crevux.shared_supabase.runtime.write_failed",
      "crevux.shared_supabase.runtime.dual_compare_mismatch",
      "crevux.shared_supabase.runtime.write_latency_ms",
      "crevux.provider.callback_idempotency_failed",
      "crevux.asset_storage.write_failed",
      "crevux.credit_spend.write_failed",
    ],
    oldDbTables: ["users", "projects", "assets", "generation_jobs", "asset_exports", "ai_usage_events", "provider_runs", "credit_transactions"],
    sharedTables: ["core.usage_events", "core.audit_logs", "crevux.projects", "crevux.assets", "crevux.generation_jobs", "crevux.exports", "crevux.provider_runs", "crevux.credit_spend_events"],
    manualDashboardChecks: [
      "Alert on project/asset/job mirror failures.",
      "Alert on provider callback idempotency failures.",
      "Alert on crevux-assets storage failures.",
      "Alert on credit spend mirror failures.",
    ],
  },
];

function oldDbQueryShape(table) {
  return `select count(*) as writes from ${table} where created_at >= :window_start;`;
}

const plan = {
  generatedAt: new Date().toISOString(),
  note: "Planning output only. No database queries are executed and no secrets are read.",
  evidenceRows: {
    monitoring: [
      "Dual-write failure alert",
      "Dual-compare mismatch alert",
      "Latency/error dashboard",
      "Verixet usage admission alert",
      "XFlow control-plane write alert",
      "Storage/provider/Stripe alert",
    ],
    oldDbWriteDetection: apps.map((app) => app.app),
  },
  apps: apps.map((app) => ({
    ...app,
    oldDbWriteDetection: {
      timestampWindow: "Use a 15 minute window during production dual-write; repeat with a 24 hour window before old DB pause.",
      expectedDuringDualWrite: "Old DB writes are expected to continue because legacy DB remains source of truth.",
      expectedAfterFutureSharedReadCutover: "Old DB writes should drop to zero for migrated paths before old project pause.",
      readOnlyQueryShapes: app.oldDbTables.map((table) => ({
        table,
        query: oldDbQueryShape(table),
      })),
    },
  })),
};

console.log(JSON.stringify(plan, null, 2));
