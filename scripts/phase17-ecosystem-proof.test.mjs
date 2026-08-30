import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const script = path.join(root, "scripts", "phase17-ecosystem-proof.mjs");
const requiredNestedApps = [
  ["craftyguru/verixet", "apps/Verixet"],
  ["craftyguru/xflowx", "apps/XFlow"],
  ["craftyguru/WordGeni", "apps/WordGeni"],
  ["craftyguru/Crevux", "apps/CreVux"],
  ["craftyguru/AudAiX", "apps/AudAix"],
  ["craftyguru/Rataify", "apps/RatAiFy"],
];
const completeWorkspacePresent = requiredNestedApps.every(([, appPath]) =>
  fs.existsSync(path.join(root, appPath)),
);

function runProof(args, env = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    env: {
      ...process.env,
      XFLOW_PROOF_BASE_URL: "",
      VERIXET_PROOF_BASE_URL: "",
      RATAIFY_PROOF_BASE_URL: "",
      AUDAIX_PROOF_BASE_URL: "",
      WORDGENI_PROOF_BASE_URL: "",
      CREVUX_PROOF_BASE_URL: "",
      VERIXET_ECOSYSTEM_STATUS_SERVICE_TOKEN: "",
      VERIXET_PROOF_WORKSPACE_ID: "",
      ...env,
    },
    encoding: "utf8",
  });
}

test(
  "static mode creates redacted proof reports without HTTP warnings",
  { skip: completeWorkspacePresent ? false : "requires the six independently checked-out app repositories" },
  (t) => {
    const reportDir = path.join("output", "phase18-proof-script-static-test");
    const absoluteReportDir = path.join(root, reportDir);
    fs.rmSync(absoluteReportDir, { recursive: true, force: true });
    t.after(() => fs.rmSync(absoluteReportDir, { recursive: true, force: true }));

    const result = runProof(["--mode=static", `--report-dir=${reportDir}`]);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    const reportPath = path.join(root, reportDir, "phase17-ecosystem-proof-report.json");
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    assert.equal(report.mode, "static");
    assert.equal(report.failCount, 0);
    assert.equal(report.httpSmoke.length, 0);
  },
);

test("GitHub static proof materializes every required nested app repository", () => {
  const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "ecosystem-proof.yml"), "utf8");
  const proofScript = fs.readFileSync(script, "utf8");

  for (const [repository, appPath] of requiredNestedApps) {
    assert.match(workflow, new RegExp(`repository: ${repository.replace("/", "\\/")}`));
    assert.match(workflow, new RegExp(`path: ${appPath.replace("/", "\\/")}`));
  }

  assert.match(workflow, /ECOSYSTEM_APP_REPO_READ_TOKEN/);
  assert.match(workflow, /node-version: 22\.18\.0/);
  assert.doesNotMatch(proofScript, /apps\/Crevux/);
});

test("http mode fails closed when required proof HTTP env is missing", (t) => {
  const reportDir = path.join("output", "phase18-proof-script-http-test");
  const absoluteReportDir = path.join(root, reportDir);
  fs.rmSync(absoluteReportDir, { recursive: true, force: true });
  t.after(() => fs.rmSync(absoluteReportDir, { recursive: true, force: true }));

  const result = runProof(["--mode=http", `--report-dir=${reportDir}`], {
    VERIXET_ECOSYSTEM_STATUS_SERVICE_TOKEN: "sk_test_should_not_print",
  });

  assert.notEqual(result.status, 0);
  assert.equal(result.stdout.includes("sk_test_should_not_print"), false);
  assert.equal(result.stderr.includes("sk_test_should_not_print"), false);

  const reportPath = path.join(root, reportDir, "phase17-ecosystem-proof-report.json");
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  assert.equal(report.mode, "http");
  assert.equal(report.failCount > 0, true);
});

test("validate-env-only checks HTTP env without running static or HTTP proof", (t) => {
  const reportDir = path.join("output", "phase18-proof-script-env-test");
  const absoluteReportDir = path.join(root, reportDir);
  fs.rmSync(absoluteReportDir, { recursive: true, force: true });
  t.after(() => fs.rmSync(absoluteReportDir, { recursive: true, force: true }));

  const result = runProof(["--mode=http", "--validate-env-only", `--report-dir=${reportDir}`]);

  assert.notEqual(result.status, 0);
  const reportPath = path.join(root, reportDir, "phase17-ecosystem-proof-report.json");
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  assert.equal(report.contracts.length, 0);
  assert.equal(report.httpSmoke.length > 0, true);
  assert.equal(report.failCount > 0, true);
});
