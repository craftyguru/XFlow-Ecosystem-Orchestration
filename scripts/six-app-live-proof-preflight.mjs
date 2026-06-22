const requiredUrls = [
  "XFLOW_PROOF_BASE_URL",
  "VERIXET_PROOF_BASE_URL",
  "RATAIFY_PROOF_BASE_URL",
  "AUDAIX_PROOF_BASE_URL",
  "WORDGENI_PROOF_BASE_URL",
  "CREVUX_PROOF_BASE_URL",
];

const requiredSecrets = [
  "VERIXET_DATABASE_URL",
  "STRIPE_SECRET_KEY",
  "VERIXET_BOOTSTRAP_SECRET",
  "XFLOW_PROOF_EVENT_BEARER",
];

const optionalSecrets = ["STRIPE_WEBHOOK_SECRET"];

function value(name) {
  return (process.env[name] ?? "").trim();
}

function configured(name) {
  return value(name).length > 0;
}

function redactStatus(name) {
  return { name, configured: configured(name) };
}

function validateHttpsUrl(name, errors) {
  const raw = value(name);
  if (!raw) {
    errors.push(`${name} is required.`);
    return;
  }
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") {
      errors.push(`${name} must use https for staged/live proof.`);
    }
  } catch {
    errors.push(`${name} must be a valid URL.`);
  }
}

function main() {
  const errors = [];
  for (const name of requiredUrls) validateHttpsUrl(name, errors);

  const hasXflowDb = configured("XFLOW_DATABASE_URL") || configured("DATABASE_URL");
  if (!hasXflowDb) errors.push("XFLOW_DATABASE_URL or DATABASE_URL is required for XFlow DB proof.");

  for (const name of requiredSecrets) {
    if (!configured(name)) errors.push(`${name} is required.`);
  }

  const hasProofAuth =
    configured("XFLOW_PROOF_SESSION_COOKIE") ||
    (configured("XFLOW_PROOF_EMAIL") && configured("XFLOW_PROOF_PASSWORD"));
  if (!hasProofAuth) {
    errors.push(
      "Proof user authentication is required: set XFLOW_PROOF_SESSION_COOKIE or XFLOW_PROOF_EMAIL plus XFLOW_PROOF_PASSWORD."
    );
  }

  const stripeKey = value("STRIPE_SECRET_KEY");
  if (stripeKey.startsWith("sk_live_")) {
    errors.push("STRIPE_SECRET_KEY is live mode. Live keys are refused for this proof.");
  } else if (stripeKey && !stripeKey.startsWith("sk_test_")) {
    errors.push("STRIPE_SECRET_KEY must be a Stripe test-mode key starting with sk_test_.");
  }

  const report = {
    ok: errors.length === 0,
    generatedAt: new Date().toISOString(),
    urls: requiredUrls.map(redactStatus),
    database: {
      XFLOW_DATABASE_URL: configured("XFLOW_DATABASE_URL"),
      DATABASE_URL: configured("DATABASE_URL"),
      VERIXET_DATABASE_URL: configured("VERIXET_DATABASE_URL"),
    },
    stripe: {
      STRIPE_SECRET_KEY: configured("STRIPE_SECRET_KEY")
        ? stripeKey.startsWith("sk_test_")
          ? "test_mode_configured"
          : "configured_but_not_test_mode"
        : "missing",
      STRIPE_WEBHOOK_SECRET: configured("STRIPE_WEBHOOK_SECRET"),
    },
    proofAuth: {
      XFLOW_PROOF_SESSION_COOKIE: configured("XFLOW_PROOF_SESSION_COOKIE"),
      XFLOW_PROOF_EMAIL: configured("XFLOW_PROOF_EMAIL"),
      XFLOW_PROOF_PASSWORD: configured("XFLOW_PROOF_PASSWORD"),
    },
    serviceTokens: [
      "XFLOW_PROOF_EVENT_BEARER",
      "VERIXET_BOOTSTRAP_SECRET",
      "VERIXET_BILLING_CHECKOUT_SECRET",
      "VERIXET_SIGNUP_HANDOFF_SECRET",
    ].map(redactStatus),
    optionalSecrets: optionalSecrets.map(redactStatus),
    errors,
  };

  console.log(JSON.stringify(report, null, 2));
  if (errors.length > 0) process.exitCode = 1;
}

main();
