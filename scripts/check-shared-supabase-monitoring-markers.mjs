#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { readFileSync } from "node:fs";

const repoRoot = process.cwd();

const apps = [
  {
    app: "Verixet",
    source: "apps/Verixet/src/lib/supabase/runtime.server.ts",
    sourceMarkers: ["verixet_shared_supabase_dual_write_failed", "verixet_shared_supabase_dual_compare_mismatch"],
    planMarkers: [
      "verixet.shared_supabase.runtime.write_failed",
      "verixet.shared_supabase.runtime.dual_compare_mismatch",
      "verixet.shared_supabase.runtime.write_latency_ms",
      "verixet.usage_admission.denied",
      "stripe.webhook.replay_failed",
    ],
  },
  {
    app: "XFlow",
    source: "apps/XFlow/src/lib/supabase/runtime.server.ts",
    sourceMarkers: ["xflow_shared_supabase_dual_write_failed", "xflow_shared_supabase_dual_compare_mismatch"],
    planMarkers: [
      "xflow.shared_supabase.runtime.write_failed",
      "xflow.shared_supabase.runtime.dual_compare_mismatch",
      "xflow.shared_supabase.runtime.write_latency_ms",
      "xflow.control_plane.event_write_failed",
      "xflow.app_connection.mirror_failed",
    ],
  },
  {
    app: "AudAiX",
    source: "apps/AudAix/src/supabase/runtime.server.ts",
    sourceMarkers: ["audaix_shared_supabase_dual_write_failed", "audaix_shared_supabase_dual_compare_mismatch"],
    planMarkers: [
      "audaix.shared_supabase.runtime.write_failed",
      "audaix.shared_supabase.runtime.dual_compare_mismatch",
      "audaix.shared_supabase.runtime.write_latency_ms",
      "audaix.auth.session_exchange_failed",
      "audaix.verixet.usage_admission_failed",
      "audaix.report_storage.write_failed",
    ],
  },
  {
    app: "Rataify",
    source: "apps/RatAiFy/server/supabase/runtime.server.ts",
    sourceMarkers: ["rataify_shared_supabase_dual_write_failed", "rataify_shared_supabase_dual_compare_mismatch"],
    planMarkers: [
      "rataify.shared_supabase.runtime.write_failed",
      "rataify.shared_supabase.runtime.dual_compare_mismatch",
      "rataify.shared_supabase.runtime.write_latency_ms",
      "rataify.evidence_storage.write_failed",
      "rataify.review_flow.write_failed",
    ],
  },
  {
    app: "WordGeni",
    source: "apps/WordGeni/apps/api/src/supabase/runtime.server.ts",
    sourceMarkers: ["wordgeni_shared_supabase_dual_write_failed", "wordgeni_shared_supabase_dual_compare_mismatch"],
    planMarkers: [
      "wordgeni.shared_supabase.runtime.write_failed",
      "wordgeni.shared_supabase.runtime.dual_compare_mismatch",
      "wordgeni.shared_supabase.runtime.write_latency_ms",
      "wordgeni.worker.boot_missing",
      "wordgeni.source_storage.write_failed",
      "wordgeni.api_auth.token_failed",
    ],
  },
  {
    app: "Crevux",
    source: "apps/CreVux/artifacts/api-server/src/supabase/runtime.server.ts",
    sourceMarkers: ["crevux_shared_supabase_dual_write_failed", "crevux_shared_supabase_dual_compare_mismatch"],
    planMarkers: [
      "crevux.shared_supabase.runtime.write_failed",
      "crevux.shared_supabase.runtime.dual_compare_mismatch",
      "crevux.shared_supabase.runtime.write_latency_ms",
      "crevux.provider.callback_idempotency_failed",
      "crevux.asset_storage.write_failed",
      "crevux.credit_spend.write_failed",
    ],
  },
];

const failures = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

const plan = execFileSync(process.execPath, [path.join(repoRoot, "scripts/plan-supabase-monitoring-write-detection.mjs")], {
  cwd: repoRoot,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

for (const app of apps) {
  const source = read(app.source);
  for (const marker of app.sourceMarkers) {
    if (!source.includes(marker)) failures.push(`${app.app} source missing marker ${marker}`);
  }
  for (const marker of app.planMarkers) {
    if (!plan.includes(marker)) failures.push(`${app.app} monitoring plan missing marker ${marker}`);
  }
}

const tmp = mkdtempSync(path.join(tmpdir(), "phase7i-monitoring-"));
const logFile = path.join(tmp, "synthetic-dual-write-health.log");

try {
  writeFileSync(
    logFile,
    [
      "verixet shared dual-write failure detected",
      "xflow dual-compare mismatch detected",
      "audaix shared write latency p95 exceeded",
      "rataify usage admission denied",
      "xflow control-plane error detected",
      "wordgeni storage write failed",
      "crevux provider callback duplicate detected",
      "stripe webhook replay failed",
      "",
    ].join("\n"),
  );

  const output = execFileSync(process.execPath, [path.join(repoRoot, "scripts/check-shared-supabase-dual-write-health.mjs")], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, DUAL_WRITE_HEALTH_LOG_FILE: logFile },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const requiredCounters = [
    "dualWriteFailure",
    "compareMismatch",
    "sharedWriteLatency",
    "usageAdmissionError",
    "controlPlaneError",
    "storageWriteError",
    "providerCallbackError",
    "stripeReplayError",
  ];
  for (const counter of requiredCounters) {
    const match = output.match(new RegExp(`${counter}=(\\d+)`));
    if (!match || Number(match[1]) < 1) failures.push(`dual-write health checker did not detect ${counter}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error("check-shared-supabase-monitoring-markers: failed");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("check-shared-supabase-monitoring-markers: ok");
console.log(`apps=${apps.length}`);
console.log("sourceMarkers=present");
console.log("planMarkers=present");
console.log("dualWriteHealthSyntheticLogCounters=present");
