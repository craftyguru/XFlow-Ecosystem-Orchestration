#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";

const apps = [
  { name: "Verixet", prefix: "VERIXET" },
  { name: "XFlow", prefix: "XFLOW" },
  { name: "AudAiX", prefix: "AUDAIX" },
  { name: "Rataify", prefix: "RATAIFY" },
  { name: "WordGeni", prefix: "WORDGENI" },
  { name: "Crevux", prefix: "CREVUX" },
];

const strict = process.env.PHASE7A_HEALTH_STRICT === "true";
const failures = [];

function value(name) {
  return process.env[name];
}

function flag(prefix, suffix) {
  return value(`${prefix}_SHARED_SUPABASE_${suffix}`);
}

function present(name) {
  return value(name) ? "present" : "missing";
}

console.log("shared-supabase-dual-write-health: non-destructive summary");
console.log(`SUPABASE_URL=${present("SUPABASE_URL")}`);
console.log(`SUPABASE_ANON_KEY=${present("SUPABASE_ANON_KEY")}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY=${present("SUPABASE_SERVICE_ROLE_KEY")}`);
console.log(`DATABASE_URL=${present("DATABASE_URL")}`);
console.log(`DIRECT_DATABASE_URL=${present("DIRECT_DATABASE_URL")}`);

for (const app of apps) {
  const runtime = flag(app.prefix, "RUNTIME_ENABLED") || "unset";
  const dualWrite = flag(app.prefix, "DUAL_WRITE_ENABLED") || "unset";
  const readMode = flag(app.prefix, "READ_MODE") || "unset";
  const failClosed = flag(app.prefix, "FAIL_CLOSED") || "unset";

  console.log(`${app.name}: runtime=${runtime}, dualWrite=${dualWrite}, readMode=${readMode}, failClosed=${failClosed}`);

  if (readMode === "shared") failures.push(`${app.name} has READ_MODE=shared; Phase 7A requires legacy or dual_compare`);
  if (failClosed === "true") failures.push(`${app.name} has FAIL_CLOSED=true; Phase 7A requires false`);
}

const logFile = process.env.DUAL_WRITE_HEALTH_LOG_FILE;
if (logFile) {
  if (!existsSync(logFile)) {
    failures.push(`DUAL_WRITE_HEALTH_LOG_FILE does not exist: ${logFile}`);
  } else {
    const text = readFileSync(logFile, "utf8");
    const counters = {
      dualWriteFailure: (text.match(/dual[-_ ]write[^.\n]*(fail|error)/gi) || []).length,
      compareMismatch: (text.match(/dual[-_ ]compare[^.\n]*mismatch|compare[^.\n]*mismatch/gi) || []).length,
      sharedWriteLatency: (text.match(/shared[^.\n]*write[^.\n]*latency/gi) || []).length,
      usageAdmissionError: (text.match(/usage[^.\n]*admission[^.\n]*(fail|error|denied)/gi) || []).length,
      controlPlaneError: (text.match(/control[-_ ]plane[^.\n]*(fail|error)/gi) || []).length,
      storageWriteError: (text.match(/storage[^.\n]*write[^.\n]*(fail|error)/gi) || []).length,
      providerCallbackError: (text.match(/provider[^.\n]*callback[^.\n]*(fail|error|duplicate)/gi) || []).length,
      stripeReplayError: (text.match(/stripe[^.\n]*(webhook|replay)[^.\n]*(fail|error|duplicate)/gi) || []).length,
    };
    console.log(`logFile=${logFile}`);
    for (const [key, count] of Object.entries(counters)) {
      console.log(`${key}=${count}`);
    }
    if (strict) {
      for (const [key, count] of Object.entries(counters)) {
        if (count > 0) failures.push(`${key} count is ${count}`);
      }
    }
  }
} else {
  console.log("DUAL_WRITE_HEALTH_LOG_FILE=missing");
}

if (failures.length) {
  console.error("shared-supabase-dual-write-health: failed");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(strict ? 1 : 0);
}

console.log("shared-supabase-dual-write-health: ok");
