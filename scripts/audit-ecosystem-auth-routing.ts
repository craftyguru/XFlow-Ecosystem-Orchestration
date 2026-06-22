#!/usr/bin/env tsx
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

type AppSlug = "xflow" | "verixet" | "rataify" | "audaix" | "wordgeni" | "crevux";
type Status = "pass" | "warn" | "fail";

type AppConfig = {
  slug: AppSlug;
  name: string;
  navFile: string;
  supportingFiles: string[];
  signinPatterns: RegExp[];
  signupPatterns: RegExp[];
  xflowPatterns: RegExp[];
};

const repoRoot = process.cwd();

const APPS: AppConfig[] = [
  {
    slug: "xflow",
    name: "XFlow",
    navFile: "apps/XFlow/src/components/showcase/ShowcaseNav.tsx",
    supportingFiles: ["apps/XFlow/src/app/(auth)/sign-in/page.tsx", "apps/XFlow/src/app/(auth)/sign-up/SignUpClient.tsx"],
    signinPatterns: [/href="\/sign-in"/, />\s*Sign in\s*</],
    signupPatterns: [/href="\/auth\/start\?app=xflow/, />\s*Sign up\s*</],
    xflowPatterns: [/new URL\("\/auth\/start", window\.location\.origin\)/, /XFlow/],
  },
  {
    slug: "verixet",
    name: "Verixet",
    navFile: "apps/Verixet/src/components/marketing/MarketingHeader.tsx",
    supportingFiles: [
      "apps/Verixet/src/lib/ecosystem/central-auth-handoff.ts",
      "apps/Verixet/src/components/auth/SignInForm.tsx",
      "apps/Verixet/src/components/auth/SignUpForm.tsx",
    ],
    signinPatterns: [/const signInHref = buildVerixetCentralAuthUrl\(\{ mode: "signin" \}\)/, /href=\{signInHref\}/],
    signupPatterns: [/const signUpHref = buildVerixetCentralAuthUrl\(\{ mode: "signup" \}\)/, /href=\{signUpHref\}/],
    xflowPatterns: [/new URL\("\/auth\/start", xflowAuthOrigin\(\)\)/, /selectedAppSlug/, /sourceApp/, /returnTo/],
  },
  {
    slug: "rataify",
    name: "RatAiFy",
    navFile: "apps/RatAiFy/client/src/components/marketing/rataify/RataifyHeader.tsx",
    supportingFiles: ["apps/RatAiFy/client/src/lib/xflowAuthUrl.ts", "apps/RatAiFy/client/src/pages/auth-sign-in.tsx", "apps/RatAiFy/client/src/pages/auth-sign-up.tsx"],
    signinPatterns: [/const signInHref = buildXFlowAuthUrl\(\{ intent: "signin" \}\)/, />\s*Sign in\s*</],
    signupPatterns: [/const signUpHref = buildXFlowAuthUrl\(\{ intent: "signup" \}\)/, />\s*Sign up\s*</],
    xflowPatterns: [/new URL\("\/auth\/start", xflowOrigin\)|new URL\("\/auth\/start", xflowOrigin\(\)\)/, /selectedAppSlug/, /sourceApp/, /returnTo/],
  },
  {
    slug: "audaix",
    name: "AudAiX",
    navFile: "apps/AudAix/dashboard/src/components/navigation/SitewideNav.tsx",
    supportingFiles: ["apps/AudAix/dashboard/src/lib/centralAuth.ts", "apps/AudAix/dashboard/src/pages/AuthPages.tsx"],
    signinPatterns: [/const signInTo = buildAudAixCentralAuthUrl\(\{ mode: "signin" \}\)/, /href=\{signInTo\}/],
    signupPatterns: [/const signUpTo = buildAudAixCentralAuthUrl\(\{ mode: "signup" \}\)/, /href=\{signUpTo\}/],
    xflowPatterns: [/new URL\("\/auth\/start", xflowAuthOrigin\(\)\)/, /selectedAppSlug/, /sourceApp/, /returnTo/],
  },
  {
    slug: "wordgeni",
    name: "WordGeni",
    navFile: "apps/WordGeni/apps/web/src/components/layout/PublicNavbar.tsx",
    supportingFiles: [
      "apps/WordGeni/apps/web/src/components/auth/sign-in-form.tsx",
      "apps/WordGeni/apps/web/src/components/auth/sign-up-form.tsx",
      "apps/WordGeni/apps/web/src/lib/xflow-auth-config.ts",
    ],
    signinPatterns: [/href=\{SIGN_IN_HREF\}/, />\s*Sign in\s*</i],
    signupPatterns: [/href=\{SIGN_UP_HREF\}/, /Sign up/i],
    xflowPatterns: [/https:\/\/xflowx\.com\/auth\/start/, /selectedAppSlug=wordgeni|selectedAppSlug/, /returnTo/],
  },
  {
    slug: "crevux",
    name: "CreVux",
    navFile: "apps/CreVux/artifacts/image-gen/src/components/landing/MarketingSiteChrome.tsx",
    supportingFiles: ["apps/CreVux/artifacts/image-gen/src/pages/SignInPage.tsx", "apps/CreVux/artifacts/image-gen/src/pages/RegisterPage.tsx"],
    signinPatterns: [/const signInHref = buildCrevuxCentralAuthUrl\("signin"\)/, />\s*Sign in\s*</],
    signupPatterns: [/const signUpHref = buildCrevuxCentralAuthUrl\("signup"\)/, />\s*Sign up\s*</],
    xflowPatterns: [/new URL\("\/auth\/start", xflowAuthOrigin\(\)\)/, /selectedAppSlug/, /sourceApp/, /returnTo/],
  },
];

function read(relPath: string): string {
  const fullPath = path.join(repoRoot, relPath);
  if (!existsSync(fullPath)) return "";
  return readFileSync(fullPath, "utf8");
}

function allMatch(source: string, patterns: RegExp[]): boolean {
  return patterns.every((pattern) => pattern.test(source));
}

function detectLocalProductionSignup(source: string, slug: AppSlug): string[] {
  const findings: string[] = [];
  const sourceWithoutCompletionEndpoints = source.replace(/\/api\/auth\/signup\/complete/g, "");
  if (slug !== "xflow" && /\/api\/auth\/signup(?!\/complete)|createUserWithEmailAndPassword|signUp\(/i.test(sourceWithoutCompletionEndpoints)) {
    findings.push("possible local production signup surface");
  }
  if (/Log in\/sign up/i.test(source)) findings.push("combined login/signup label");
  return findings;
}

const results = APPS.map((app) => {
  const nav = read(app.navFile);
  const supporting = app.supportingFiles.map(read).join("\n");
  const combined = `${nav}\n${supporting}`;
  const signinExists = allMatch(nav, app.signinPatterns);
  const signupExists = allMatch(nav, app.signupPatterns);
  const routesToXFlow = app.slug === "xflow" ? true : allMatch(combined, app.xflowPatterns);
  const appSlugPassed = app.slug === "xflow" ? true : new RegExp(`app["']?,?\\s*[:=]?\\s*["']${app.slug}["']|APP_SLUG = "${app.slug}"|selectedAppSlug=${app.slug}`).test(combined);
  const returnToPassed = /returnTo|redirect_uri/.test(combined);
  const localSignupFindings = detectLocalProductionSignup(combined, app.slug);
  const status: Status =
    signinExists && signupExists && routesToXFlow && appSlugPassed && returnToPassed && localSignupFindings.length === 0
      ? "pass"
      : signinExists && signupExists && routesToXFlow
        ? "warn"
        : "fail";

  return {
    app: app.name,
    slug: app.slug,
    navFile: app.navFile,
    signinExists,
    signupExists,
    signinTarget: app.slug === "xflow" ? "/sign-in" : "XFlow /auth/start via central wrapper",
    signupTarget: app.slug === "xflow" ? "/auth/sign-up" : "XFlow /auth/start via central wrapper",
    routesToXFlow,
    appSlugPassed,
    returnToOrRedirectUriPassed: returnToPassed,
    localProductionSignupExposed: localSignupFindings.length > 0,
    findings: localSignupFindings,
    status,
  };
});

const failures = results.filter((result) => result.status === "fail");
const warnings = results.filter((result) => result.status === "warn");

console.log(JSON.stringify({ schemaVersion: 1, results, summary: { pass: results.length - failures.length - warnings.length, warn: warnings.length, fail: failures.length } }, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
