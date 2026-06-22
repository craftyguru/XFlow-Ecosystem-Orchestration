import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(new URL("../apps/XFlow/package.json", import.meta.url));
const { chromium } = require("playwright");

const REQUIRED_NAV_LABELS = ["Product", "How it works", "Ecosystem", "Pricing", "Security", "Docs", "Sign in", "Get started"];
const REQUIRED_FOOTER_LABELS = ["Product", "Pricing", "Docs", "Security", "Privacy", "Terms", "Status", "Support", "Contact", "Ecosystem"];
const FORBIDDEN_PUBLIC_CASING = /\b(?:RatAiFy|RatAify|CreVux|CREVUX)\b/;
const PLACEHOLDER_COPY = /\b(?:lorem ipsum|todo\b|tbd\b|coming soon|placeholder copy|placeholder text|your (?:headline|copy|content) here|insert (?:copy|text) here)\b/i;
const LOCALHOST_RE = /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])\b/i;

const APPS = [
  { slug: "xflow", name: "XFlow", env: "XFLOW_PUBLIC_BASE_URL", defaultBaseUrl: "https://xflowx.com" },
  { slug: "verixet", name: "Verixet", env: "VERIXET_PUBLIC_BASE_URL", defaultBaseUrl: "https://verixet.com" },
  { slug: "rataify", name: "Rataify", env: "RATAIFY_PUBLIC_BASE_URL", defaultBaseUrl: "https://rataify.com" },
  { slug: "audaix", name: "AudAiX", env: "AUDAIX_PUBLIC_BASE_URL", defaultBaseUrl: "https://audaix.com" },
  { slug: "wordgeni", name: "WordGeni", env: "WORDGENI_PUBLIC_BASE_URL", defaultBaseUrl: "https://wordgeni.com" },
  { slug: "crevux", name: "Crevux", env: "CREVUX_PUBLIC_BASE_URL", defaultBaseUrl: "https://crevux.com" },
];

const PATH_RULES = [
  { path: "/", requirement: "must return 200", allowRedirect: false },
  { path: "/pricing", requirement: "must return 200 or intentionally redirect", allowRedirect: true },
  { path: "/security", requirement: "must return 200", allowRedirect: false },
  { path: "/privacy", requirement: "must return 200", allowRedirect: false },
  { path: "/terms", requirement: "must return 200", allowRedirect: false },
  { path: "/status", requirement: "must return 200 or link to central status", allowRedirect: true, allowCentralStatusLink: true },
  { path: "/support", requirement: "must return 200", allowRedirect: false },
  { path: "/docs", requirement: "must return 200 or valid docs destination", allowRedirect: true },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 1400 },
  { name: "tablet", width: 768, height: 1200 },
  { name: "mobile", width: 390, height: 1200 },
];

const OUTPUT_DIR = process.env.PUBLIC_QA_OUTPUT_DIR || "output/public-qa";
const LINK_TIMEOUT_MS = Number(process.env.PUBLIC_QA_LINK_TIMEOUT_MS || 12_000);
const NAV_LINK_LIMIT = Number(process.env.PUBLIC_QA_NAV_LINK_LIMIT || 120);
const SKIP_SCREENSHOTS = process.env.PUBLIC_QA_SKIP_SCREENSHOTS === "1";

const targetPaths = parseListEnv("PUBLIC_QA_PAGES", PATH_RULES.map((rule) => rule.path));
const screenshotPaths = parseListEnv("PUBLIC_QA_SCREENSHOT_PAGES", ["/", "/pricing", "/security", "/docs", "/status"]);

function parseListEnv(name, fallback) {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

function baseUrlFor(app) {
  const raw = process.env[app.env]?.trim() || app.defaultBaseUrl;
  return raw.replace(/\/+$/, "");
}

function pageUrl(baseUrl, pathname) {
  return `${baseUrl}${pathname}`;
}

function classifyUrl(value, currentUrl) {
  try {
    const url = new URL(value, currentUrl);
    if (["mailto:", "tel:", "sms:"].includes(url.protocol)) return { skip: true, reason: url.protocol };
    if (!["http:", "https:"].includes(url.protocol)) return { skip: true, reason: url.protocol };
    if (url.hash && !url.pathname.replace(/\/$/, "").localeCompare(new URL(currentUrl).pathname.replace(/\/$/, "")) && url.origin === new URL(currentUrl).origin) {
      return { skip: true, reason: "same-page-hash" };
    }
    return { skip: false, url };
  } catch {
    return { skip: true, reason: "invalid-url" };
  }
}

function isSamePageHash(rawHref, currentUrl) {
  try {
    const link = new URL(rawHref, currentUrl);
    const current = new URL(currentUrl);
    return link.origin === current.origin && link.pathname === current.pathname && link.search === current.search && Boolean(link.hash);
  } catch {
    return false;
  }
}

function hasHashTarget(rawHref, snapshot) {
  try {
    const hash = new URL(rawHref, "https://example.test").hash;
    if (!hash) return false;
    const id = decodeURIComponent(hash.slice(1));
    return snapshot.ids.includes(id) || snapshot.namedAnchors.includes(id);
  } catch {
    return false;
  }
}

function isSafeReturnTo(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || ["localhost", "127.0.0.1"].includes(url.hostname);
  } catch {
    return value.startsWith("/") && !value.startsWith("//");
  }
}

function isXFlowAuthority(href, app, currentUrl) {
  try {
    const url = new URL(href, currentUrl);
    return url.hostname === "xflowx.com" || (app.slug === "xflow" && url.origin === new URL(currentUrl).origin);
  } catch {
    return false;
  }
}

function screenshotFile(app, pathname, viewportName, suffix = "") {
  const normalizedPath = pathname === "/" ? "home" : pathname.replace(/^\/+/, "").replace(/[^a-z0-9-]+/gi, "-");
  const name = [app.slug, normalizedPath, viewportName, suffix].filter(Boolean).join("__");
  return path.join(OUTPUT_DIR, "screenshots", `${name}.png`);
}

async function requestStatus(request, url, options = {}) {
  const maxRedirects = options.allowRedirect ? 20 : 0;
  try {
    const response = await request.get(url, { timeout: LINK_TIMEOUT_MS, maxRedirects });
    return {
      ok: response.status() >= 200 && response.status() < 400,
      status: response.status(),
      finalUrl: response.url(),
    };
  } catch (error) {
    return { ok: false, status: 0, finalUrl: url, error: error.message };
  }
}

async function validateStaticFiles(request, app, baseUrl, failures) {
  for (const file of ["/robots.txt", "/sitemap.xml"]) {
    const result = await requestStatus(request, pageUrl(baseUrl, file), { allowRedirect: true });
    if (!result.ok) {
      failures.push(`${app.name} ${file}: expected reachable static file, got ${result.status || result.error}`);
    }
  }
}

async function validateRouteStatus(page, request, app, baseUrl, rule, failures) {
  const url = pageUrl(baseUrl, rule.path);
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25_000 }).catch((error) => ({ error }));
  if (response?.error) {
    failures.push(`${app.name} ${url}: navigation failed (${response.error.message})`);
    return null;
  }

  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);

  const status = response?.status() ?? 0;
  if (rule.allowRedirect) {
    const requestResult = await requestStatus(request, url, { allowRedirect: true });
    if (!requestResult.ok) failures.push(`${app.name} ${url}: ${rule.requirement}, got ${requestResult.status || requestResult.error}`);
  } else if (status !== 200) {
    failures.push(`${app.name} ${url}: ${rule.requirement}, got ${status}`);
  }

  return url;
}

async function collectPageSnapshot(page) {
  return page.evaluate(() => {
    const rawAnchors = Array.from(document.querySelectorAll("a")).map((anchor) => ({
      text: (anchor.textContent ?? "").replace(/\s+/g, " ").trim(),
      href: anchor.href,
      rawHref: anchor.getAttribute("href") ?? "",
      area:
        anchor.closest("header") ? "header" :
        anchor.closest("footer") ? "footer" :
        anchor.closest("main") ? "main" :
        "document",
      className: anchor.getAttribute("class") ?? "",
      role: anchor.getAttribute("role") ?? "",
      ariaLabel: anchor.getAttribute("aria-label") ?? "",
    }));
    const meta = {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      ogImage:
        document.querySelector('meta[property="og:image"]')?.getAttribute("content") ??
        document.querySelector('meta[name="twitter:image"]')?.getAttribute("content") ??
        "",
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      viewport: {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      },
      animatedVisibleElements: Array.from(document.querySelectorAll("body *")).filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const durations = style.animationDuration.split(",").map((part) => Number.parseFloat(part) || 0);
        const hasAnimation = durations.some((duration) => duration > 0.05) && style.animationName !== "none";
        return hasAnimation && rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
      }).length,
    };
    return {
      text: document.body?.textContent ?? "",
      html: document.documentElement?.outerHTML ?? "",
      anchors: rawAnchors,
      ids: Array.from(document.querySelectorAll("[id]")).map((element) => element.id),
      namedAnchors: Array.from(document.querySelectorAll("a[name]")).map((anchor) => anchor.getAttribute("name") ?? ""),
      meta,
    };
  });
}

async function validateMetadataAndCopy(request, app, url, snapshot, failures) {
  if (!snapshot.meta.title.trim()) failures.push(`${app.name} ${url}: missing document title`);
  if (!snapshot.meta.description.trim()) failures.push(`${app.name} ${url}: missing meta description`);
  if (!snapshot.meta.ogImage.trim()) {
    failures.push(`${app.name} ${url}: missing OG image metadata`);
  } else {
    const ogUrl = new URL(snapshot.meta.ogImage, url).toString();
    const result = await requestStatus(request, ogUrl, { allowRedirect: true });
    if (!result.ok) failures.push(`${app.name} ${url}: OG image is not reachable (${ogUrl}, ${result.status || result.error})`);
  }

  if (FORBIDDEN_PUBLIC_CASING.test(snapshot.text)) failures.push(`${app.name} ${url}: mixed public brand casing appears`);
  if (PLACEHOLDER_COPY.test(snapshot.text)) failures.push(`${app.name} ${url}: placeholder copy appears in rendered text`);
  if (snapshot.anchors.some((anchor) => LOCALHOST_RE.test(anchor.rawHref))) failures.push(`${app.name} ${url}: raw public link contains localhost`);
  if (!snapshot.text.includes(app.name)) failures.push(`${app.name} ${url}: canonical app name ${app.name} missing from rendered text`);
}

function validateChrome(app, url, snapshot, failures) {
  for (const label of REQUIRED_NAV_LABELS) {
    if (!snapshot.text.includes(label)) failures.push(`${app.name} ${url}: missing required nav label ${label}`);
  }
  for (const label of REQUIRED_FOOTER_LABELS) {
    if (!snapshot.text.includes(label)) failures.push(`${app.name} ${url}: missing required footer label ${label}`);
  }
}

function validateAuthCtas(app, url, snapshot, failures) {
  const signInLinks = uniqueAnchors(snapshot.anchors.filter((anchor) => /^sign in$/i.test(anchor.text || anchor.ariaLabel)));
  const getStartedLinks = uniqueAnchors(snapshot.anchors.filter((anchor) => /^(get started|sign up|start)$/i.test(anchor.text || anchor.ariaLabel)));

  if (signInLinks.length === 0) failures.push(`${app.name} ${url}: missing Sign in CTA`);
  for (const anchor of signInLinks) {
    if (isSamePageHash(anchor.rawHref || anchor.href, url)) continue;
    if (!isXFlowAuthority(anchor.href, app, url)) failures.push(`${app.name} ${url}: Sign in CTA does not route to XFlow authority (${anchor.rawHref})`);
  }

  if (getStartedLinks.length === 0) failures.push(`${app.name} ${url}: missing Get started/signup CTA`);
  for (const anchor of getStartedLinks) {
    if (isSamePageHash(anchor.rawHref || anchor.href, url)) {
      if (!hasHashTarget(anchor.rawHref || anchor.href, snapshot)) {
        failures.push(`${app.name} ${url}: Get started/signup in-page CTA target is missing (${anchor.rawHref})`);
      }
      continue;
    }
    if (!isXFlowAuthority(anchor.href, app, url)) {
      failures.push(`${app.name} ${url}: Get started/signup CTA does not route to XFlow authority (${anchor.rawHref})`);
      continue;
    }
    const href = new URL(anchor.href, url);
    for (const param of ["app", "selectedAppSlug", "sourceApp", "returnTo"]) {
      if (!href.searchParams.get(param)) failures.push(`${app.name} ${url}: Get started/signup CTA missing ${param} (${anchor.rawHref})`);
    }
    if (href.searchParams.get("intent") !== "signup") failures.push(`${app.name} ${url}: Get started/signup CTA intent is not signup (${anchor.rawHref})`);
    if (!isSafeReturnTo(href.searchParams.get("returnTo"))) failures.push(`${app.name} ${url}: Get started/signup CTA has unsafe returnTo (${anchor.rawHref})`);
  }
}

function uniqueAnchors(anchors) {
  const seen = new Set();
  return anchors.filter((anchor) => {
    const key = `${anchor.area}|${anchor.text}|${anchor.ariaLabel}|${anchor.rawHref}|${anchor.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function validateAuthRoutes(request, app, baseUrl, failures) {
  const signInProbes = ["/signin", "/sign-in", "/login"];
  const signupProbes = ["/signup", "/sign-up", "/register", "/get-started"];

  const signInResults = await Promise.all(signInProbes.map((probe) => requestStatus(request, pageUrl(baseUrl, probe), { allowRedirect: true })));
  const signInOk = signInResults.some((result) => result.ok && isXFlowAuthority(result.finalUrl, app, baseUrl));
  if (!signInOk) {
    failures.push(`${app.name}: no signin route probe resolves to XFlow authority (${signInProbes.join(", ")})`);
  }

  const signupResults = await Promise.all(signupProbes.map((probe) => requestStatus(request, pageUrl(baseUrl, probe), { allowRedirect: true })));
  const signupOk = signupResults.some((result) => result.ok && isXFlowAuthority(result.finalUrl, app, baseUrl));
  if (!signupOk) {
    failures.push(`${app.name}: no signup/get-started route probe resolves to XFlow authority (${signupProbes.join(", ")})`);
  }
}

async function validateChromeLinks(request, app, currentUrl, snapshot, failures) {
  const chromeLinks = snapshot.anchors
    .filter((anchor) => anchor.area === "header" || anchor.area === "footer")
    .slice(0, NAV_LINK_LIMIT);

  for (const anchor of chromeLinks) {
    const classified = classifyUrl(anchor.rawHref || anchor.href, currentUrl);
    if (classified.skip) continue;
    const result = await requestStatus(request, classified.url.toString(), { allowRedirect: true });
    if (!result.ok) failures.push(`${app.name} ${currentUrl}: ${anchor.area} link "${anchor.text || anchor.ariaLabel || anchor.rawHref}" is dead (${classified.url}, ${result.status || result.error})`);
  }
}

async function validateDeadCtas(request, app, currentUrl, snapshot, failures) {
  const ctas = snapshot.anchors.filter((anchor) => {
    const label = `${anchor.text} ${anchor.ariaLabel}`;
    return /get started|sign in|sign up|pricing|checkout|support|docs|security|contact|ecosystem|review|open|explore|start|try|book|request/i.test(label);
  });

  for (const anchor of ctas) {
    const classified = classifyUrl(anchor.rawHref || anchor.href, currentUrl);
    if (classified.skip) continue;
    const result = await requestStatus(request, classified.url.toString(), { allowRedirect: true });
    if (!result.ok) failures.push(`${app.name} ${currentUrl}: CTA "${anchor.text || anchor.ariaLabel || anchor.rawHref}" is dead (${classified.url}, ${result.status || result.error})`);
  }
}

async function validateMobileAndReducedMotion(page, app, url, failures) {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.setViewportSize({ width: 390, height: 1200 });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25_000 });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);

  const snapshot = await collectPageSnapshot(page);
  if (snapshot.meta.viewport.scrollWidth > snapshot.meta.viewport.clientWidth + 1) {
    failures.push(`${app.name} ${url}: mobile horizontal overflow (${snapshot.meta.viewport.scrollWidth}px > ${snapshot.meta.viewport.clientWidth}px)`);
  }
  if (!snapshot.meta.reducedMotion) {
    failures.push(`${app.name} ${url}: reduced-motion media preference was not active in browser context`);
  }
  if (snapshot.meta.animatedVisibleElements > 0) {
    failures.push(`${app.name} ${url}: ${snapshot.meta.animatedVisibleElements} visible CSS animation(s) still running under prefers-reduced-motion`);
  }
}

async function captureScreenshots(page, app, baseUrl, failures) {
  if (SKIP_SCREENSHOTS) return;
  await mkdir(path.join(OUTPUT_DIR, "screenshots"), { recursive: true });

  for (const pathname of screenshotPaths) {
    for (const viewport of VIEWPORTS) {
      const url = pageUrl(baseUrl, pathname);
      await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25_000 });
        await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
        await page.screenshot({ path: screenshotFile(app, pathname, viewport.name), fullPage: true });
      } catch (error) {
        failures.push(`${app.name} ${url}: screenshot failed at ${viewport.name} (${error.message})`);
      }
    }

    const darkUrl = pageUrl(baseUrl, pathname);
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 1400 });
    try {
      await page.goto(darkUrl, { waitUntil: "domcontentloaded", timeout: 25_000 });
      await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
      await page.screenshot({ path: screenshotFile(app, pathname, "desktop", "dark"), fullPage: true });
    } catch (error) {
      failures.push(`${app.name} ${darkUrl}: dark-mode screenshot failed (${error.message})`);
    }
  }
}

async function inspectPage(page, request, app, baseUrl, rule, failures) {
  const url = await validateRouteStatus(page, request, app, baseUrl, rule, failures);
  if (!url) return;

  const snapshot = await collectPageSnapshot(page);
  await validateMetadataAndCopy(request, app, url, snapshot, failures);
  validateChrome(app, url, snapshot, failures);
  validateAuthCtas(app, url, snapshot, failures);
  await validateChromeLinks(request, app, url, snapshot, failures);
  await validateDeadCtas(request, app, url, snapshot, failures);

  if (rule.allowCentralStatusLink && snapshot.anchors.some((anchor) => /status/i.test(anchor.text) && classifyUrl(anchor.rawHref || anchor.href, url).skip === false)) {
    return;
  }
}

async function main() {
  const failures = [];
  const results = [];
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const request = page.request;

  for (const app of APPS) {
    const baseUrl = baseUrlFor(app);
    console.log(`\nQA ${app.name} ${baseUrl}`);
    await validateStaticFiles(request, app, baseUrl, failures);
    await validateAuthRoutes(request, app, baseUrl, failures);

    for (const rule of PATH_RULES.filter((item) => targetPaths.includes(item.path))) {
      const before = failures.length;
      await inspectPage(page, request, app, baseUrl, rule, failures);
      const status = failures.length === before ? "PASS" : "FAIL";
      const line = `${status} ${app.name} ${pageUrl(baseUrl, rule.path)}`;
      results.push(line);
      console.log(line);
    }

    for (const pathname of screenshotPaths) {
      await validateMobileAndReducedMotion(page, app, pageUrl(baseUrl, pathname), failures).catch((error) => {
        failures.push(`${app.name} ${pageUrl(baseUrl, pathname)}: mobile/reduced-motion validation failed (${error.message})`);
      });
    }

    await captureScreenshots(page, app, baseUrl, failures);
  }

  await browser.close();

  const uniqueFailures = [...new Set(failures)];
  const report = {
    generatedAt: new Date().toISOString(),
    apps: APPS.map((app) => ({ name: app.name, baseUrl: baseUrlFor(app) })),
    targetPaths,
    screenshotPaths: SKIP_SCREENSHOTS ? [] : screenshotPaths,
    results,
    failures: uniqueFailures,
  };
  await writeFile(path.join(OUTPUT_DIR, "public-qa-report.json"), `${JSON.stringify(report, null, 2)}\n`);

  if (uniqueFailures.length > 0) {
    for (const failure of uniqueFailures) console.error(`FAIL ${failure}`);
    console.error(`\nPublic ecosystem QA gate failed: ${uniqueFailures.length} issue(s). Report: ${path.join(OUTPUT_DIR, "public-qa-report.json")}`);
    process.exit(1);
  }

  console.log(`\nPublic ecosystem QA gate passed. Report: ${path.join(OUTPUT_DIR, "public-qa-report.json")}`);
}

await main();
