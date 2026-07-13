const WORDGENI_RULES = [
  { methods: ["POST"], pattern: /^\/api\/ai\/tasks$/ },
  { methods: ["POST", "PATCH"], pattern: /^\/api\/ai\/[A-Za-z0-9_./-]+$/ },
  { methods: ["POST"], pattern: /^\/api\/sources\/(upload|note)$/ },
  { methods: ["GET"], pattern: /^\/api\/sources\/[0-9a-fA-F-]{36}$/ },
  { methods: ["POST"], pattern: /^\/api\/genie\/chat$/ },
  { methods: ["GET", "POST", "PATCH"], pattern: /^\/api\/genie\/[A-Za-z0-9_./-]+$/ },
  { methods: ["POST"], pattern: /^\/api\/voice-draft\/(transcribe|structure)$/ },
];

const CREVUX_RULES = [
  { methods: ["POST"], pattern: /^\/api\/openai\/generate-image$/ },
  { methods: ["GET"], pattern: /^\/api\/images(?:\/\d+)?$/ },
  { methods: ["POST"], pattern: /^\/api\/images\/\d+\/edit$/ },
  { methods: ["GET"], pattern: /^\/api\/projects$/ },
  { methods: ["GET"], pattern: /^\/api\/assets(?:\/(?:\d+|[0-9a-fA-F-]{36}))?$/ },
  { methods: ["PATCH"], pattern: /^\/api\/assets\/\d+$/ },
  { methods: ["POST"], pattern: /^\/api\/assets\/upload$/ },
  { methods: ["GET"], pattern: /^\/api\/video\/jobs\/(?:list|\d+)$/ },
  { methods: ["POST"], pattern: /^\/api\/video\/generate$/ },
  { methods: ["GET", "POST"], pattern: /^\/api\/storyboards$/ },
  { methods: ["GET", "PATCH"], pattern: /^\/api\/storyboards\/\d+$/ },
  { methods: ["POST"], pattern: /^\/api\/storyboards\/\d+\/shots$/ },
  { methods: ["PATCH"], pattern: /^\/api\/storyboards\/\d+\/shots\/\d+$/ },
  { methods: ["GET"], pattern: /^\/api\/ai\/credits\/(balance|ledger)$/ },
  { methods: ["GET", "POST", "PATCH"], pattern: /^\/api\/(copilot|studio)\/[A-Za-z0-9_./-]+$/ },
];

function normalizePath(path) {
  if (typeof path !== "string" || !path.startsWith("/")) {
    throw new Error("Path must be an absolute API path beginning with '/'.");
  }
  const parsed = new URL(path, "https://xflow.invalid");
  if (parsed.origin !== "https://xflow.invalid" || parsed.pathname.includes("..")) {
    throw new Error("Only relative, builder-safe API paths are accepted.");
  }
  return `${parsed.pathname}${parsed.search}`;
}

export function assertBuilderSafeRequest(product, method, path) {
  const normalizedMethod = String(method || "GET").toUpperCase();
  const normalizedPath = normalizePath(path);
  const pathname = new URL(normalizedPath, "https://xflow.invalid").pathname;
  const rules = product === "wordgeni" ? WORDGENI_RULES : product === "crevux" ? CREVUX_RULES : [];
  const allowed = rules.some((rule) => rule.methods.includes(normalizedMethod) && rule.pattern.test(pathname));
  if (!allowed) {
    throw new Error(`${normalizedMethod} ${pathname} is not registered as a builder-safe ${product} route.`);
  }
  return { method: normalizedMethod, path: normalizedPath };
}

export function joinApiUrl(origin, path) {
  const base = String(origin || "").replace(/\/+$/, "");
  const normalizedPath = normalizePath(path);
  if (base.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${base}${normalizedPath.slice(4)}`;
  }
  return `${base}${normalizedPath}`;
}
