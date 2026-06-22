import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resultsDoc = "docs/shared-supabase-phase6-staging-results.md";
const apps = ["Verixet", "XFlow", "AudAiX", "Rataify", "WordGeni", "Crevux"];
const allowedStatuses = new Set(["pass", "fail", "pending"]);
const errors = [];

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function fail(message) {
  errors.push(message);
}

if (!fs.existsSync(absolute(resultsDoc))) {
  fail(`Missing results tracker: ${resultsDoc}`);
} else {
  const text = fs.readFileSync(absolute(resultsDoc), "utf8");

  if (!/production cutover (?:is |remains )?unsafe/i.test(text)) {
    fail("Results tracker must explicitly state production cutover is unsafe.");
  }

  if (!/old Supabase projects (?:are |remain )?unsafe to pause/i.test(text)) {
    fail("Results tracker must explicitly state old Supabase projects are unsafe to pause.");
  }

  const summary = { pass: 0, fail: 0, pending: 0 };

  for (const app of apps) {
    const sectionMatch = text.match(new RegExp(`## ${app}\\s+([\\s\\S]*?)(?=\\n## |\\n# |$)`, "i"));
    if (!sectionMatch) {
      fail(`Missing app results section: ${app}`);
      continue;
    }

    const resultMatch = sectionMatch[1].match(/\|\s*Result\s*\|\s*(pass|fail|pending)\s*\|/i);
    if (!resultMatch) {
      fail(`${app} section must include a Result row with pass/fail/pending.`);
      continue;
    }

    const status = resultMatch[1].toLowerCase();
    if (!allowedStatuses.has(status)) {
      fail(`${app} result has invalid status: ${status}`);
      continue;
    }
    summary[status] += 1;
  }

  if (errors.length === 0) {
    console.log(`validate-supabase-phase6-results: ok (passed=${summary.pass}, failed=${summary.fail}, pending=${summary.pending})`);
  }
}

if (errors.length > 0) {
  console.error("validate-supabase-phase6-results: failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
