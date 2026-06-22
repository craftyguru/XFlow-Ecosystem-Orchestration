import assert from "node:assert/strict";
import tls from "node:tls";

const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

const MAIN_6_HOST_CHECKS = [
  {
    app: "XFlow",
    expectedLabel: "XFlow",
    canonicalHost: "xflowx.com",
    mirrorHost: "www.xflowx.com",
    rootMarkers: ["XFlow"],
    loginPath: "/login",
    signupPath: "/signup",
    allowedLoginHosts: ["xflowx.com"],
    acceptedMirrorStatuses: [301, 308],
  },
  {
    app: "Verixet",
    expectedLabel: "Verixet",
    canonicalHost: "verixet.com",
    mirrorHost: "www.verixet.com",
    rootMarkers: ["Verixet"],
    loginPath: "/login",
    signupPath: "/signup",
    allowedLoginHosts: ["xflowx.com", "verixet.com"],
    acceptedMirrorStatuses: [301, 308],
  },
  {
    app: "RatAiFy",
    expectedLabel: "RatAify",
    canonicalHost: "rataify.com",
    mirrorHost: "www.rataify.com",
    rootMarkers: ["RatAify", "Rataify"],
    loginPath: "/login",
    signupPath: "/signup",
    allowedLoginHosts: ["xflowx.com", "rataify.com"],
    acceptedMirrorStatuses: [301, 308],
  },
  {
    app: "AudAiX",
    expectedLabel: "AudAiX",
    canonicalHost: "audaix.com",
    mirrorHost: "www.audaix.com",
    rootMarkers: ["AudAiX"],
    loginPath: "/login",
    signupPath: "/signup",
    allowedLoginHosts: ["xflowx.com", "audaix.com"],
    acceptedMirrorStatuses: [301, 308],
  },
  {
    app: "WordGeni",
    expectedLabel: "WordGeni",
    canonicalHost: "wordgeni.com",
    mirrorHost: "www.wordgeni.com",
    rootMarkers: ["WordGeni"],
    loginPath: "/login",
    signupPath: "/signup",
    allowedLoginHosts: ["xflowx.com", "wordgeni.com"],
    acceptedMirrorStatuses: [301, 308],
  },
  {
    app: "CreVux",
    expectedLabel: "CREVUX",
    canonicalHost: "crevux.com",
    mirrorHost: "www.crevux.com",
    rootMarkers: ["CREVUX", "Crevux"],
    loginPath: "/login",
    signupPath: "/signup",
    allowedLoginHosts: ["xflowx.com", "crevux.com"],
    acceptedMirrorStatuses: [301, 308],
  },
];

const OPTIONAL_OWNED_DOMAIN_CHECKS = [
  {
    app: "UrSite",
    expectedLabel: "UrSite",
    canonicalHost: "ursite.ai",
    mirrorHost: "www.ursite.ai",
    rootMarkers: ["UrSite"],
    loginPath: "/login",
    signupPath: "/signup",
    allowedLoginHosts: ["ursite.ai", "www.ursite.ai"],
    acceptedMirrorStatuses: [301, 308],
  },
  {
    app: "JournOwl",
    expectedLabel: "JournOwl",
    canonicalHost: "journowl.app",
    mirrorHost: "www.journowl.app",
    rootMarkers: ["JournOwl"],
    loginPath: "/login",
    signupPath: "/signup",
    allowedLoginHosts: ["journowl.app"],
    acceptedMirrorStatuses: [301, 308],
  },
  {
    app: "PitStrike",
    expectedLabel: "PitStrike",
    canonicalHost: "pitstrike.com",
    mirrorHost: "www.pitstrike.com",
    rootMarkers: ["PitStrike"],
    loginPath: "/login",
    signupPath: "/signup",
    allowedLoginHosts: ["pitstrike.com", "www.pitstrike.com"],
    acceptedMirrorStatuses: [301, 308],
  },
  {
    app: "1ofakindpiece",
    expectedLabel: "1 of a Kind Piece",
    canonicalHost: "1ofakindpiece.com",
    mirrorHost: "www.1ofakindpiece.com",
    rootMarkers: ["1 of a Kind Piece"],
    loginPath: "/login",
    signupPath: "/signup",
    allowedLoginHosts: ["1ofakindpiece.com", "www.1ofakindpiece.com"],
    acceptedMirrorStatuses: [301, 308],
  },
];

function resolveHostChecks() {
  const scope = process.argv.find((arg) => arg.startsWith("--scope="))?.split("=")[1] ?? "main6";
  if (scope === "all") {
    return [...MAIN_6_HOST_CHECKS, ...OPTIONAL_OWNED_DOMAIN_CHECKS];
  }
  if (scope !== "main6") {
    throw new Error(`Unknown smoke scope "${scope}". Supported scopes: main6, all`);
  }
  return MAIN_6_HOST_CHECKS;
}

function fail(message) {
  throw new Error(message);
}

function short(text, limit = 160) {
  return text.replace(/\s+/g, " ").trim().slice(0, limit);
}

function snippetOf(body) {
  return short(body || "");
}

function bodyLooksLikeFallback(body) {
  return /application not found/i.test(body);
}

function bodyMatchesMarkers(body, markers) {
  return markers.some((marker) => body.toLowerCase().includes(marker.toLowerCase()));
}

async function fetchOnce(url) {
  const response = await fetch(url, {
    redirect: "manual",
    headers: { "user-agent": DESKTOP_UA },
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.text().catch(() => "");
  return { response, body };
}

async function follow(url) {
  const chain = [];
  let current = url;
  for (let i = 0; i < 8; i += 1) {
    const { response, body } = await fetchOnce(current);
    const location = response.headers.get("location");
    chain.push({
      url: current,
      status: response.status,
      location,
      server: response.headers.get("server"),
      body,
    });
    if (location && response.status >= 300 && response.status < 400) {
      current = new URL(location, current).toString();
      continue;
    }
    break;
  }
  return chain;
}

async function verifyTls(host) {
  await new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host,
        port: 443,
        servername: host,
        rejectUnauthorized: true,
        timeout: 15_000,
      },
      () => {
        const authorized = socket.authorized;
        const error = socket.authorizationError;
        socket.end();
        if (!authorized) {
          reject(new Error(error || `TLS not authorized for ${host}`));
          return;
        }
        resolve();
      }
    );
    socket.once("error", reject);
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error(`TLS timeout for ${host}`));
    });
  });
}

function assertNoUnsafeRedirect(location, allowedHosts, context) {
  if (!location) return;
  const target = new URL(location, "https://placeholder.invalid");
  if (["javascript:", "data:", "file:"].includes(target.protocol)) {
    fail(`${context} redirected to unsafe protocol ${target.protocol}`);
  }
  if (target.hostname === "localhost" || target.hostname === "0.0.0.0" || target.hostname.startsWith("127.")) {
    fail(`${context} redirected to local address ${target.hostname}`);
  }
  if (target.hostname === "placeholder.invalid") return;
  if (!allowedHosts.includes(target.hostname)) {
    fail(`${context} redirected to unapproved host ${target.hostname}`);
  }
}

async function verifyHostPair(config) {
  await verifyTls(config.canonicalHost);
  await verifyTls(config.mirrorHost);

  const canonicalRoot = await follow(`https://${config.canonicalHost}/`);
  const mirrorRoot = await follow(`https://${config.mirrorHost}/`);
  const canonicalFinal = canonicalRoot.at(-1);
  const mirrorFirst = mirrorRoot[0];
  const mirrorFinal = mirrorRoot.at(-1);

  if (!canonicalFinal || canonicalFinal.status >= 400) {
    fail(`${config.app} canonical host ${config.canonicalHost} is not healthy`);
  }
  if (bodyLooksLikeFallback(canonicalFinal.body)) {
    fail(`${config.app} canonical host ${config.canonicalHost} returned fallback content`);
  }
  if (!bodyMatchesMarkers(canonicalFinal.body, config.rootMarkers)) {
    fail(
      `${config.app} canonical host ${config.canonicalHost} did not look like the expected app: ${snippetOf(
        canonicalFinal.body
      )}`
    );
  }

  if (!mirrorFirst) {
    fail(`${config.app} mirror host ${config.mirrorHost} did not respond`);
  }
  if (bodyLooksLikeFallback(mirrorFinal?.body || mirrorFirst.body)) {
    fail(`${config.app} mirror host ${config.mirrorHost} returned fallback content`);
  }
  const acceptedMirrorStatuses = config.acceptedMirrorStatuses ?? [301, 308];
  assert.ok(
    acceptedMirrorStatuses.includes(mirrorFirst.status),
    `${config.app} mirror host ${config.mirrorHost} must permanently redirect to canonical host`
  );
  assert.ok(mirrorFirst.location, `${config.app} mirror host ${config.mirrorHost} must include Location header`);
  const mirrorTarget = new URL(mirrorFirst.location, `https://${config.mirrorHost}`);
  assert.equal(
    mirrorTarget.hostname,
    config.canonicalHost,
    `${config.app} mirror host ${config.mirrorHost} must redirect to ${config.canonicalHost}`
  );

  for (const [label, route] of [
    ["login", config.loginPath],
    ["signup", config.signupPath],
  ]) {
    const chain = await follow(`https://${config.canonicalHost}${route}`);
    const first = chain[0];
    if (!first) {
      fail(`${config.app} ${label} route did not respond`);
    }
    assertNoUnsafeRedirect(
      first.location,
      config.allowedLoginHosts,
      `${config.app} ${label} route`
    );
    if (chain.length >= 8) {
      fail(`${config.app} ${label} route exceeded redirect limit`);
    }
  }
}

async function main() {
  const hostChecks = resolveHostChecks();
  const failures = [];
  for (const check of hostChecks) {
    try {
      await verifyHostPair(check);
      console.log(`PASS ${check.app}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${check.app}: ${message}`);
      console.error(`FAIL ${check.app} ${message}`);
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} domain hygiene check(s) failed.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nAll domain hygiene checks passed.`);
}

await main();
