const SECRET_KEY_PATTERN =
  /(["']?)(stripeCustomerId|stripe_customer_id|stripeSubscriptionId|stripe_subscription_id|stripeSubscriptionItemId|stripe_subscription_item_id|paymentMethodId|payment_method_id|authorization|cookie|set-cookie|password|secret|apiKey|token)\1\s*[:=]/gi;

const SECRET_VALUE_PATTERNS = [
  /\b(cus|sub|si|pi)_[A-Za-z0-9]{6,}\b/g,
  /\b(sk_live|sk_test|whsec)_[A-Za-z0-9_]{6,}\b/g,
];

const PLAN_SLUG_PATTERN = /\b[a-z0-9]+_(free|starter|pro|elite)\b/gi;

export function scanTextForLeaks(text, options = {}) {
  const label = options.label ?? "inline";
  const findings = [];
  for (const match of text.matchAll(SECRET_KEY_PATTERN)) {
    findings.push({
      label,
      type: "sensitive_key",
      match: match[2],
      index: match.index ?? 0,
    });
  }
  for (const pattern of SECRET_VALUE_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      findings.push({
        label,
        type: "sensitive_value",
        match: match[0].slice(0, 12),
        index: match.index ?? 0,
      });
    }
  }
  return findings;
}

export function assertNoLeaks(text, options = {}) {
  const findings = scanTextForLeaks(text, options);
  if (findings.length > 0) {
    const err = new Error(`Leak scanner found ${findings.length} issue(s) in ${options.label ?? "inline"}.`);
    err.findings = findings;
    throw err;
  }
  return true;
}

export function redactSecretLikeValues(value) {
  if (value == null) return value;
  if (typeof value === "string") {
    return value
      .replaceAll(/(cus|sub|si|pi)_[A-Za-z0-9]+/g, "$1_[redacted]")
      .replaceAll(/(sk_live|sk_test|whsec)_[A-Za-z0-9_]+/g, "$1_[redacted]")
      .replaceAll(/(authorization|cookie|set-cookie|password|secret|apiKey|token)\s*[:=]\s*[^,\n\r}]+/gi, "$1: [redacted]");
  }
  if (Array.isArray(value)) return value.map((item) => redactSecretLikeValues(item));
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        /authorization|cookie|set-cookie|password|secret|apiKey|token/i.test(key)
          ? "[redacted]"
          : redactSecretLikeValues(entry),
      ]),
    );
  }
  return value;
}

export function containsAllowedPublicPlanSlug(text) {
  return PLAN_SLUG_PATTERN.test(text);
}
