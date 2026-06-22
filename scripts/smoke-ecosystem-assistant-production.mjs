#!/usr/bin/env node

import { randomUUID } from "node:crypto";

const APP_SLUGS = new Set(["xflow", "audaix", "verixet", "crevux", "rataify", "wordgeni"]);
const SECRET_PATTERN = /([A-Za-z0-9+/=_-]{24,})/g;

function arg(name, fallback = "") {
  const prefix = `--${name}=`;
  const found = process.argv.slice(2).find((value) => value.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function cleanUrl(value) {
  const raw = String(value || "").trim().replace(/\/+$/, "");
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

function fail(message, extra = {}) {
  return { passed: false, message, ...extra };
}

function pass(message, extra = {}) {
  return { passed: true, message, ...extra };
}

function redact(value) {
  return String(value || "").replace(SECRET_PATTERN, "[redacted]");
}

function isHtml(text, contentType) {
  return /text\/html/i.test(contentType || "") || /^\s*<!doctype html/i.test(text || "") || /^\s*<html[\s>]/i.test(text || "");
}

const appSlug = arg("app", process.env.ECOSYSTEM_ASSISTANT_SMOKE_APP_SLUG).toLowerCase();
const appBaseUrl = cleanUrl(arg("app-base-url", process.env.ECOSYSTEM_ASSISTANT_SMOKE_APP_BASE_URL));
const xflowBaseUrl = cleanUrl(arg("xflow-base-url", process.env.XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_BASE_URL || process.env.XFLOW_ASSISTANT_BASE_URL));
const adminCookie = arg("xflow-admin-cookie", process.env.XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_COOKIE || process.env.ECOSYSTEM_ASSISTANT_SMOKE_XFLOW_ADMIN_COOKIE);
const databaseUrl = process.env.ECOSYSTEM_ASSISTANT_SMOKE_DATABASE_URL || process.env.XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_DATABASE_URL || "";
const timeoutMs = Number(arg("timeout-ms", process.env.ECOSYSTEM_ASSISTANT_SMOKE_TIMEOUT_MS || "15000"));
const visitorSessionId = `prod-smoke-${appSlug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const summary = {
  ok: false,
  appSlug,
  appBaseUrl,
  xflowBaseUrl,
  env: {
    ECOSYSTEM_ASSISTANT_SMOKE_APP_SLUG: Boolean(appSlug),
    ECOSYSTEM_ASSISTANT_SMOKE_APP_BASE_URL: Boolean(appBaseUrl),
    XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_BASE_URL: Boolean(xflowBaseUrl),
    XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_COOKIE: Boolean(adminCookie),
    ECOSYSTEM_ASSISTANT_SMOKE_DATABASE_URL: Boolean(databaseUrl),
    ECOSYSTEM_ASSISTANT_SMOKE_TIMEOUT_MS: timeoutMs,
  },
  visitorSessionId,
  created: {
    assistantConversationId: null,
    supportConversationId: null,
  },
  checks: [],
};

function record(check) {
  summary.checks.push(check);
  return check;
}

async function requestJson(label, url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        accept: "application/json",
        ...(options.body ? { "content-type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";
    let json = null;
    let parseError = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (error) {
      parseError = error instanceof Error ? error.message : String(error);
      json = null;
    }
    return {
      label,
      url,
      status: response.status,
      ok: response.ok,
      contentType,
      htmlInsteadOfJson: isHtml(text, contentType),
      json,
      text: redact(text).slice(0, 1200),
      parseError,
      requestId: response.headers.get("x-request-id") || json?.requestId || json?.request_id || "",
    };
  } catch (error) {
    return {
      label,
      url,
      status: null,
      ok: false,
      contentType: null,
      htmlInsteadOfJson: false,
      json: null,
      text: "",
      error: error instanceof Error ? error.message : String(error),
      requestId: "",
    };
  } finally {
    clearTimeout(timer);
  }
}

function envelopeData(result) {
  return result?.json?.data && typeof result.json.data === "object" ? result.json.data : null;
}

function details(result) {
  return {
    appSlug,
    status: result.status,
    requestId: result.requestId,
    url: result.url,
    contentType: result.contentType,
    htmlInsteadOfJson: result.htmlInsteadOfJson,
    parseError: result.parseError,
    error: result.error,
    bodyPreview: result.text,
  };
}

async function readSupportAppSlugFromDatabase(supportConversationId) {
  if (!databaseUrl) {
    return { skipped: "ECOSYSTEM_ASSISTANT_SMOKE_DATABASE_URL or XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_DATABASE_URL is not configured" };
  }
  try {
    const { Client } = await import("pg");
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    try {
      const result = await client.query("select id, app_slug from support_conversations where id = $1", [supportConversationId]);
      return result.rows[0] || null;
    } finally {
      await client.end();
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  if (!APP_SLUGS.has(appSlug)) {
    record(fail("missing or invalid app slug", {
      expected: [...APP_SLUGS],
      configured: appSlug || null,
      acceptedInputs: ["--app", "ECOSYSTEM_ASSISTANT_SMOKE_APP_SLUG"],
    }));
    return;
  }
  if (!appBaseUrl) {
    record(fail("missing or invalid app base URL", {
      acceptedInputs: ["--app-base-url", "ECOSYSTEM_ASSISTANT_SMOKE_APP_BASE_URL"],
    }));
    return;
  }
  if (!xflowBaseUrl) {
    record(fail("missing or invalid XFlow base URL", {
      acceptedInputs: ["--xflow-base-url", "XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_BASE_URL", "XFLOW_ASSISTANT_BASE_URL"],
    }));
    return;
  }

  const chat = await requestJson("chat", `${appBaseUrl}/api/ecosystem-assistant/chat`, {
    method: "POST",
    body: JSON.stringify({
      appSlug,
      requestId: randomUUID(),
      message: `What does ${appSlug} do and how does it connect to XFlow?`,
      visitorSessionId,
      currentPath: "/production-smoke/ecosystem-assistant",
      metadata: { smoke: true, productionSmoke: true },
    }),
  });
  const chatData = envelopeData(chat);
  summary.created.assistantConversationId = chatData?.conversationId || null;
  record(chat.status === 200 && Boolean(chatData?.conversationId) ? pass("chat 200", details(chat)) : fail("chat 200", details(chat)));

  const usedAppSlugs = Array.isArray(chatData?.usedAppSlugs) ? chatData.usedAppSlugs : [];
  record(
    usedAppSlugs.includes(appSlug) && usedAppSlugs.includes("xflow")
      ? pass("usedAppSlugs includes app and xflow", { usedAppSlugs })
      : fail("usedAppSlugs includes app and xflow", { usedAppSlugs }),
  );

  const pricing = await requestJson("pricing guardrail", `${appBaseUrl}/api/ecosystem-assistant/chat`, {
    method: "POST",
    body: JSON.stringify({
      appSlug,
      requestId: randomUUID(),
      conversationId: summary.created.assistantConversationId,
      message: "What plan should I choose and where is pricing decided?",
      visitorSessionId,
      currentPath: "/pricing",
      metadata: { smoke: true, productionSmoke: true },
    }),
  });
  const pricingData = envelopeData(pricing);
  const pricingText = `${pricingData?.answer || ""} ${JSON.stringify(pricingData?.citations || [])}`.toLowerCase();
  record(
    pricing.status === 200 && (pricingText.includes("verixet") || pricingText.includes("catalog"))
      ? pass("pricing guardrail cites Verixet/catalog", details(pricing))
      : fail("pricing guardrail cites Verixet/catalog", details(pricing)),
  );

  const noEmail = await requestJson("no-email escalation", `${appBaseUrl}/api/ecosystem-assistant/escalate`, {
    method: "POST",
    body: JSON.stringify({
      appSlug,
      requestId: randomUUID(),
      conversationId: summary.created.assistantConversationId,
      subject: `${appSlug} production smoke without email`,
      message: "Anonymous escalation without email should be rejected.",
      visitorSessionId,
      currentPath: "/support",
      metadata: { smoke: true, productionSmoke: true },
    }),
  });
  record(noEmail.status === 400 ? pass("no-email escalation 400", details(noEmail)) : fail("no-email escalation 400", details(noEmail)));

  const withEmail = await requestJson("email escalation", `${appBaseUrl}/api/ecosystem-assistant/escalate`, {
    method: "POST",
    body: JSON.stringify({
      appSlug,
      requestId: randomUUID(),
      conversationId: summary.created.assistantConversationId,
      email: `ecosystem-assistant-${appSlug}-${Date.now()}@example.test`,
      subject: `${appSlug} production smoke escalation`,
      message: "Production smoke support escalation. No action required.",
      visitorSessionId,
      currentPath: "/support",
      metadata: { smoke: true, productionSmoke: true },
    }),
  });
  const escalationData = envelopeData(withEmail);
  summary.created.supportConversationId = escalationData?.supportConversationId || null;
  record(
    withEmail.status === 201 && Boolean(summary.created.supportConversationId)
      ? pass("email escalation 201", details(withEmail))
      : fail("email escalation 201", details(withEmail)),
  );

  if (adminCookie && summary.created.supportConversationId) {
    const admin = await requestJson(
      "XFlow support appSlug",
      `${xflowBaseUrl}/api/admin/support/conversations?appSlug=${encodeURIComponent(appSlug)}&limit=20`,
      { headers: { cookie: adminCookie } },
    );
    const data = envelopeData(admin);
    const conversations = Array.isArray(data?.conversations) ? data.conversations : Array.isArray(data?.items) ? data.items : [];
    const matched = conversations.some(
      (conversation) => conversation?.id === summary.created.supportConversationId && conversation?.appSlug === appSlug,
    );
    record(
      admin.status === 200 && matched
        ? pass("XFlow support appSlug confirmed", { supportConversationId: summary.created.supportConversationId, returnedCount: conversations.length })
        : fail("XFlow support appSlug confirmed", { ...details(admin), supportConversationId: summary.created.supportConversationId, returnedCount: conversations.length }),
    );
  } else {
    const supportRow = await readSupportAppSlugFromDatabase(summary.created.supportConversationId);
    if (supportRow?.id) {
      record(
        supportRow.app_slug === appSlug
          ? pass("XFlow support appSlug confirmed via DB", { supportConversationId: supportRow.id, appSlug: supportRow.app_slug })
          : fail("XFlow support appSlug confirmed via DB", { supportConversationId: supportRow.id, expectedAppSlug: appSlug, actualAppSlug: supportRow.app_slug }),
      );
    } else {
      record(fail("XFlow support appSlug confirmed", {
        reason: supportRow?.skipped || supportRow?.error || (adminCookie
          ? "support conversation was not created"
          : "XFLOW_ECOSYSTEM_ASSISTANT_SMOKE_COOKIE or ECOSYSTEM_ASSISTANT_SMOKE_DATABASE_URL is required"),
      }));
    }
  }
}

try {
  await main();
  summary.ok = summary.checks.every((check) => check.passed);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.ok ? 0 : 1);
} catch (error) {
  summary.ok = false;
  summary.fatal = error instanceof Error ? error.message : String(error);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(1);
}
