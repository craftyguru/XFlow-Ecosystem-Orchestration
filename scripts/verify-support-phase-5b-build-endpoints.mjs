import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const checks = [
  {
    app: "xflow",
    file: "apps/XFlow/src/pages/api/_build.ts",
    expected: ["appSlug: \"xflow\"", "support-phase-5b", "support-route-phase-5b", "xflow-next-app"],
  },
  {
    app: "xflow-rewrite",
    file: "apps/XFlow/src/middleware.ts",
    expected: ["/api/_build", "/api/build-marker"],
  },
  {
    app: "xflow-health-marker",
    file: "apps/XFlow/src/app/api/health/route.ts",
    expected: ["appSlug: \"xflow\"", "support-phase-5b", "support-route-phase-5b", "xflow-health-route"],
  },
  {
    app: "verixet",
    file: "apps/Verixet/src/pages/api/_build.ts",
    expected: ["appSlug: \"verixet\"", "support-phase-5b", "support-route-phase-5b", "verixet-next-app"],
  },
  {
    app: "verixet-rewrite",
    file: "apps/Verixet/src/middleware.ts",
    expected: ["/api/_build", "/api/build-marker"],
  },
  {
    app: "verixet-build-marker",
    file: "apps/Verixet/src/app/api/build-marker/route.ts",
    expected: ["appSlug: \"verixet\"", "support-phase-5b", "support-route-phase-5b", "verixet-next-app"],
  },
  {
    app: "rataify",
    file: "apps/RatAiFy/server/routes/register-application-routes.ts",
    expected: ["/api/_build", "appSlug: \"rataify\"", "support-phase-5b", "support-route-phase-5b", "rataify-express-app"],
  },
  {
    app: "audaix",
    file: "apps/AudAix/src/app.ts",
    expected: ["/api/_build", "appSlug: \"audaix\"", "support-phase-5b", "support-route-phase-5b", "audaix-fastify-app"],
  },
  {
    app: "wordgeni",
    file: "apps/WordGeni/apps/web/src/pages/api/_build.ts",
    expected: ["appSlug: 'wordgeni'", "support-phase-5b", "support-route-phase-5b", "wordgeni-web-next-app"],
  },
  {
    app: "wordgeni-rewrite",
    file: "apps/WordGeni/apps/web/src/middleware.ts",
    expected: ["/api/_build", "/api/build-marker"],
  },
  {
    app: "wordgeni-build-marker",
    file: "apps/WordGeni/apps/web/src/app/api/build-marker/route.ts",
    expected: ["appSlug: 'wordgeni'", "support-phase-5b", "support-route-phase-5b", "wordgeni-web-next-app"],
  },
  {
    app: "crevux",
    file: "apps/CreVux/artifacts/api-server/src/app.ts",
    expected: ["/api/_build", "appSlug: \"crevux\"", "support-phase-5b", "support-route-phase-5b", "crevux-api-server"],
  },
];

let failed = false;
for (const check of checks) {
  const filePath = resolve(check.file);
  let source = "";
  try {
    source = readFileSync(filePath, "utf8");
  } catch (error) {
    failed = true;
    console.error(`[missing] ${check.app}: ${check.file}`);
    continue;
  }

  const missing = check.expected.filter((needle) => !source.includes(needle));
  if (missing.length > 0) {
    failed = true;
    console.error(`[invalid] ${check.app}: missing ${missing.join(", ")}`);
  } else {
    console.log(`[ok] ${check.app}: ${check.file}`);
  }
}

if (failed) process.exit(1);
