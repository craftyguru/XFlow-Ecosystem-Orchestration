#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const { createClient } = require(path.join(repoRoot, "packages", "ecosystem-supabase", "node_modules", "@supabase", "supabase-js"));

const buckets = [
  { app: "XFlow", bucket: "xflow-artifacts", slug: "xflow" },
  { app: "Verixet", bucket: "verixet-billing-artifacts", slug: "verixet" },
  { app: "AudAiX", bucket: "audaix-reports", slug: "audaix" },
  { app: "Rataify", bucket: "rataify-evidence", slug: "rataify" },
  { app: "WordGeni", bucket: "wordgeni-exports", slug: "wordgeni" },
  { app: "Crevux", bucket: "crevux-assets", slug: "crevux" },
];

function loadDotenv(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return false;
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return true;
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function projectRefFromUrl(value) {
  try {
    const host = new URL(value).hostname;
    return host.endsWith(".supabase.co") ? host.split(".")[0] : host;
  } catch {
    return "unknown";
  }
}

async function objectExists(bucket, objectPath) {
  const folder = objectPath.split("/").slice(0, -1).join("/");
  const name = objectPath.split("/").at(-1);
  const { data, error } = await bucket.list(folder, { limit: 100, search: name });
  if (error) return { ok: false, error };
  return { ok: Array.isArray(data) && data.some((item) => item.name === name) };
}

async function proveBucket(client, target, options) {
  const bucket = client.storage.from(target.bucket);
  const content = `phase7f storage proof\napp=${target.app}\nbucket=${target.bucket}\nnonce=${crypto.randomUUID()}\n`;
  const bytes = Buffer.from(content, "utf8");
  const hash = crypto.createHash("sha256").update(bytes).digest("hex");
  const objectPath = `phase7f-storage-proof/${target.slug}/proof-${Date.now()}-${crypto.randomUUID()}.txt`;

  if (options.dryRun) {
    const exists = await client.storage.getBucket(target.bucket);
    if (exists.error) {
      return { app: target.app, bucket: target.bucket, status: "pending", dryRun: true, blocker: exists.error.message };
    }
    return { app: target.app, bucket: target.bucket, status: "dry_run_ok", dryRun: true };
  }

  const upload = await bucket.upload(objectPath, bytes, {
    contentType: "text/plain",
    upsert: false,
  });
  if (upload.error) {
    return { app: target.app, bucket: target.bucket, status: "fail", step: "upload", blocker: upload.error.message };
  }

  const download = await bucket.download(objectPath);
  if (download.error) {
    return { app: target.app, bucket: target.bucket, status: "fail", step: "download", blocker: download.error.message, objectPath };
  }
  const downloaded = Buffer.from(await download.data.arrayBuffer());
  const downloadedHash = crypto.createHash("sha256").update(downloaded).digest("hex");
  if (downloaded.length !== bytes.length || downloadedHash !== hash) {
    return {
      app: target.app,
      bucket: target.bucket,
      status: "fail",
      step: "verify",
      blocker: "downloaded content hash/length mismatch",
      objectPath,
    };
  }

  const remove = await bucket.remove([objectPath]);
  if (remove.error) {
    return { app: target.app, bucket: target.bucket, status: "fail", step: "delete", blocker: remove.error.message, objectPath };
  }

  const exists = await objectExists(bucket, objectPath);
  if (exists.error) {
    return { app: target.app, bucket: target.bucket, status: "fail", step: "confirm_delete", blocker: exists.error.message, objectPath };
  }
  if (exists.ok) {
    return { app: target.app, bucket: target.bucket, status: "fail", step: "confirm_delete", blocker: "object still listed after delete", objectPath };
  }

  return {
    app: target.app,
    bucket: target.bucket,
    status: "pass",
    objectPrefix: `phase7f-storage-proof/${target.slug}/`,
    uploadedBytes: bytes.length,
    sha256: hash,
    deleted: true,
  };
}

async function main() {
  loadDotenv(".env.shared.local");
  const dryRun = process.argv.includes("--dry-run") || process.argv.includes("--list-only");
  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const results = [];
  for (const bucket of buckets) {
    results.push(await proveBucket(client, bucket, { dryRun }));
  }

  const passed = results.filter((result) => result.status === "pass").length;
  const failed = results.filter((result) => result.status === "fail").length;
  const pending = results.filter((result) => result.status === "pending").length;
  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    projectRef: projectRefFromUrl(supabaseUrl),
    dryRun,
    summary: { passed, failed, pending, total: results.length },
    results,
  }, null, 2));

  if (!dryRun && (failed > 0 || pending > 0)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`prove-shared-supabase-storage failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
