import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const phase6ResultsDoc = "docs/shared-supabase-phase6-staging-results.md";
const phase6bDoc = "docs/shared-supabase-phase6b-browser-flow-results.md";
const apps = ["Verixet", "XFlow", "AudAiX", "Rataify", "WordGeni", "Crevux"];
const errors = [];

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(absolute(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(absolute(relativePath), "utf8");
}

function run(script) {
  const result = spawnSync(process.execPath, [script], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    errors.push(`${script} failed`);
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    if (output) errors.push(output);
    return "";
  }
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function parseAppResults(text, docLabel) {
  const summary = { pass: 0, fail: 0, pending: 0 };
  for (const app of apps) {
    const section = text.match(new RegExp(`## ${app}\\s+([\\s\\S]*?)(?=\\n## |\\n# |$)`, "i"));
    if (!section) {
      errors.push(`${docLabel} missing section: ${app}`);
      continue;
    }
    const result = section[1].match(/\|\s*Result\s*\|\s*(pass|fail|pending)\s*\|/i);
    if (!result) {
      errors.push(`${docLabel} ${app} missing Result row with pass/fail/pending`);
      continue;
    }
    summary[result[1].toLowerCase()] += 1;
  }
  return summary;
}

function assertUnsafePosture(text, docLabel) {
  if (!/production cutover (?:is |remains )?unsafe/i.test(text)) {
    errors.push(`${docLabel} must explicitly state production cutover is unsafe`);
  }
  if (!/old Supabase projects (?:are |remain )?unsafe to pause/i.test(text)) {
    errors.push(`${docLabel} must explicitly state old Supabase projects are unsafe to pause`);
  }
  if (/production cutover (?:is )?safe/i.test(text) || /old Supabase projects (?:are )?safe to pause/i.test(text)) {
    errors.push(`${docLabel} must not mark production cutover or old Supabase pause safe`);
  }
}

function assertNoPrematureSharedReadMode(text) {
  const summary = parseAppResults(text, "Phase 6B tracker");
  const allPassed = summary.fail === 0 && summary.pending === 0;
  const unsafeRecommendation = text
    .split(/\r?\n/)
    .some(
      (line) =>
        /(?:recommend|set|switch).*READ_MODE=shared/i.test(line) &&
        !/(?:^\s*(?:do not|never)\b|\bdoes not\b|\bmust not\b)/i.test(line),
    );

  if (!allPassed && unsafeRecommendation) {
    errors.push("Phase 6B tracker must not recommend READ_MODE=shared before all browser/API flows pass");
  }
}

const phase6Output = run("scripts/validate-supabase-phase6-results.mjs");
if (phase6Output && !/passed=6,\s*failed=0,\s*pending=0/i.test(phase6Output)) {
  errors.push("Existing Phase 6 smoke results must remain passed=6, failed=0, pending=0");
}

if (!exists(phase6ResultsDoc)) {
  errors.push(`Missing Phase 6 smoke results doc: ${phase6ResultsDoc}`);
} else {
  const phase6Text = read(phase6ResultsDoc);
  const summary = parseAppResults(phase6Text, "Phase 6 smoke results");
  if (summary.pass !== 6 || summary.fail !== 0 || summary.pending !== 0) {
    errors.push(`Phase 6 smoke results must be passed=6, failed=0, pending=0; got passed=${summary.pass}, failed=${summary.fail}, pending=${summary.pending}`);
  }
}

let browserSummary = { pass: 0, fail: 0, pending: 0 };

if (!exists(phase6bDoc)) {
  errors.push(`Missing Phase 6B browser/API results tracker: ${phase6bDoc}`);
} else {
  const text = read(phase6bDoc);
  assertUnsafePosture(text, "Phase 6B tracker");
  browserSummary = parseAppResults(text, "Phase 6B tracker");
  assertNoPrematureSharedReadMode(text);
}

if (errors.length > 0) {
  console.error("validate-supabase-phase6b-browser-flows: failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `validate-supabase-phase6b-browser-flows: ok (passed=${browserSummary.pass}, failed=${browserSummary.fail}, pending=${browserSummary.pending})`,
);
