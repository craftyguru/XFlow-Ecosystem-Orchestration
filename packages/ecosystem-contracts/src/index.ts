// GENERATED FILE. Do not edit by hand.
// Source: ecosystem-contracts/*.json

export type CanonicalAppSlug = "xflow" | "verixet" | "audaix" | "rataify" | "wordgeni" | "crevux";
export type TokenTypeId = "control_plane_service_token" | "ucl_connection_token" | "verixet_usage_ingest_token" | "oauth_access_token" | "oauth_client_secret" | "stripe_secret_key" | "stripe_webhook_secret" | "turnstile_secret_key" | "sendgrid_api_key" | "db_connection_string" | "sentry_dsn" | "media_download_signing_secret" | "jwt_secret";
export type ContractEnvironment = "local" | "staging" | "production" | "all";

export interface EcosystemAppContract {
  slug: CanonicalAppSlug;
  displayName: string;
  folderName: string;
  domain: string;
  role: string;
  ownsIdentity: boolean;
  ownsBilling: boolean;
  ownsEntitlements: boolean;
  ownsUsageMetering: boolean;
  dependsOn: CanonicalAppSlug[];
  legacyAliases: string[];
}

export interface EcosystemEnvContract {
  app: CanonicalAppSlug;
  name: string;
  required: boolean;
  environment: ContractEnvironment;
  secret: boolean;
  safePlaceholderAllowed: boolean;
  purpose: string;
  sourceOfTruth: string;
  usedBy: string[];
  notes: string;
  alias?: boolean;
}

export interface EcosystemRouteContract {
  ownerApp: CanonicalAppSlug;
  consumerApps: Array<CanonicalAppSlug | "browser" | "stripe">;
  method: string;
  path: string;
  purpose: string;
  requiredHeaders: string[];
  requiredBodyFields: string[];
  authType: "public" | "service" | "ucl" | "usage-ingest" | "oauth-client" | "oauth-user" | "webhook" | "none";
  tokenType: TokenTypeId | null;
  responseEnvelope: string;
  productionFailureMode: string;
  notes: string;
  public?: boolean;
}

export interface EcosystemTokenTypeContract {
  id: TokenTypeId;
  owner: CanonicalAppSlug | "cloudflare" | "sendgrid" | "database-provider" | "sentry";
  allowedConsumers: Array<CanonicalAppSlug>;
  allowedUse: string;
  forbiddenUse: string;
  exampleHeaderName: string;
  shouldBeAppScoped: boolean;
  shouldBeWorkspaceScoped: boolean;
  rotationNotes: string;
}

export const canonicalAppSlugs = [
  "xflow",
  "verixet",
  "audaix",
  "rataify",
  "wordgeni",
  "crevux"
] as readonly CanonicalAppSlug[];

export const ecosystemApps = [
  {
    "slug": "xflow",
    "displayName": "XFlow",
    "folderName": "apps/XFlow",
    "domain": "control-plane.identity.xflow",
    "role": "Ecosystem control plane, OAuth identity authority, app hub, UCL routing, event routing",
    "ownsIdentity": true,
    "ownsBilling": false,
    "ownsEntitlements": false,
    "ownsUsageMetering": false,
    "dependsOn": [
      "verixet"
    ],
    "legacyAliases": [
      "XFlow",
      "XFlowX"
    ]
  },
  {
    "slug": "verixet",
    "displayName": "Verixet",
    "folderName": "apps/Verixet",
    "domain": "billing.governance.verixet",
    "role": "Billing, governance, Stripe, entitlement, workspace billing, and usage authority",
    "ownsIdentity": false,
    "ownsBilling": true,
    "ownsEntitlements": true,
    "ownsUsageMetering": true,
    "dependsOn": [
      "xflow"
    ],
    "legacyAliases": [
      "Verixet"
    ]
  },
  {
    "slug": "audaix",
    "displayName": "AudAiX",
    "folderName": "apps/AudAix",
    "domain": "audit.monitoring.audaix",
    "role": "Audit, monitoring, improvement workflows",
    "ownsIdentity": false,
    "ownsBilling": false,
    "ownsEntitlements": false,
    "ownsUsageMetering": false,
    "dependsOn": [
      "xflow",
      "verixet"
    ],
    "legacyAliases": [
      "AudAiX",
      "AudAix",
      "audaix"
    ]
  },
  {
    "slug": "rataify",
    "displayName": "RatAiFy",
    "folderName": "apps/RatAiFy",
    "domain": "trust.reviews.rataify",
    "role": "Trust, reviews, risk, privacy, reputation workflows",
    "ownsIdentity": false,
    "ownsBilling": false,
    "ownsEntitlements": false,
    "ownsUsageMetering": false,
    "dependsOn": [
      "xflow",
      "verixet"
    ],
    "legacyAliases": [
      "Rataify"
    ]
  },
  {
    "slug": "wordgeni",
    "displayName": "WordGeni",
    "folderName": "apps/WordGeni",
    "domain": "writing.intelligence.wordgeni",
    "role": "Writing intelligence workflows and Crevux companion requests",
    "ownsIdentity": false,
    "ownsBilling": false,
    "ownsEntitlements": false,
    "ownsUsageMetering": false,
    "dependsOn": [
      "xflow",
      "verixet",
      "crevux"
    ],
    "legacyAliases": [
      "WordGeni",
      "wordgeni",
      "writexet",
      "@writexet/*"
    ]
  },
  {
    "slug": "crevux",
    "displayName": "Crevux",
    "folderName": "apps/CreVux",
    "domain": "ai.media.crevux",
    "role": "AI media studio and media generation workflows",
    "ownsIdentity": false,
    "ownsBilling": false,
    "ownsEntitlements": false,
    "ownsUsageMetering": false,
    "dependsOn": [
      "xflow",
      "verixet",
      "wordgeni"
    ],
    "legacyAliases": [
      "CreVux",
      "Crevux",
      "workspace",
      "@workspace/*"
    ]
  }
] as const satisfies readonly EcosystemAppContract[];

export const ecosystemEnv = [
  {
    "app": "xflow",
    "name": "APP_BASE_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Public XFlow origin.",
    "sourceOfTruth": "Railway/public domain",
    "usedBy": [
      "runtime routes",
      "auth helpers"
    ],
    "notes": "Must match deployed XFlow URL."
  },
  {
    "app": "xflow",
    "name": "APP_SLUG",
    "required": true,
    "environment": "all",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Canonical app slug.",
    "sourceOfTruth": "ecosystem-contracts/apps.json",
    "usedBy": [
      "ecosystem helpers",
      "control-plane helpers"
    ],
    "notes": "Canonical value is xflow."
  },
  {
    "app": "xflow",
    "name": "NEXTAUTH_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "NextAuth callback origin.",
    "sourceOfTruth": "Railway/public domain",
    "usedBy": [
      "NextAuth routes"
    ],
    "notes": "Must match XFlow public URL."
  },
  {
    "app": "xflow",
    "name": "NEXTAUTH_SECRET",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Session signing secret.",
    "sourceOfTruth": "secret manager",
    "usedBy": [
      "auth/session"
    ],
    "notes": "Server only."
  },
  {
    "app": "xflow",
    "name": "AUTH_OIDC_CLIENT_ID",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "OIDC client id.",
    "sourceOfTruth": "OAuth provider",
    "usedBy": [
      "OAuth helpers"
    ],
    "notes": "Required when OIDC is enabled."
  },
  {
    "app": "xflow",
    "name": "AUTH_OIDC_CLIENT_SECRET",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "OIDC client secret.",
    "sourceOfTruth": "OAuth provider",
    "usedBy": [
      "OAuth helpers"
    ],
    "notes": "Server only."
  },
  {
    "app": "xflow",
    "name": "CONTROL_PLANE_SERVICE_TOKEN",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Control-plane service auth.",
    "sourceOfTruth": "secret manager",
    "usedBy": [
      "control-plane auth",
      "events"
    ],
    "notes": "Must not replace UCL connection tokens."
  },
  {
    "app": "xflow",
    "name": "XFLOW_UCL_EVENTS_URL",
    "required": false,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "UCL event endpoint.",
    "sourceOfTruth": "XFlow deployment",
    "usedBy": [
      "UCL/event clients"
    ],
    "notes": "Consumer-facing endpoint."
  },
  {
    "app": "xflow",
    "name": "VERIXET_USAGE_INGEST_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Verixet usage ingest endpoint.",
    "sourceOfTruth": "Verixet deployment",
    "usedBy": [
      "Verixet integration"
    ],
    "notes": "Must pair with app-scoped token."
  },
  {
    "app": "xflow",
    "name": "VERIXET_USAGE_INGEST_TOKEN",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Verixet usage ingest auth.",
    "sourceOfTruth": "Verixet secret manager",
    "usedBy": [
      "Verixet integration"
    ],
    "notes": "Server only."
  },
  {
    "app": "xflow",
    "name": "UPSTASH_REDIS_REST_URL",
    "required": false,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Redis endpoint.",
    "sourceOfTruth": "Upstash/Railway",
    "usedBy": [
      "cache",
      "rate-limit"
    ],
    "notes": "Required only if Redis-backed features are enabled."
  },
  {
    "app": "xflow",
    "name": "UPSTASH_REDIS_REST_TOKEN",
    "required": false,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Redis auth token.",
    "sourceOfTruth": "Upstash/Railway",
    "usedBy": [
      "cache",
      "rate-limit"
    ],
    "notes": "Server only."
  },
  {
    "app": "xflow",
    "name": "SENTRY_DSN",
    "required": false,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Error telemetry DSN.",
    "sourceOfTruth": "Sentry",
    "usedBy": [
      "Sentry setup"
    ],
    "notes": "Keep environment naming consistent."
  },
  {
    "app": "verixet",
    "name": "NEXT_PUBLIC_APP_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Public Verixet URL.",
    "sourceOfTruth": "Railway/public domain",
    "usedBy": [
      "runtime env validation"
    ],
    "notes": "Must match deployment origin."
  },
  {
    "app": "verixet",
    "name": "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Browser Turnstile site key for Next.js.",
    "sourceOfTruth": "Cloudflare Turnstile",
    "usedBy": [
      "auth forms",
      "Turnstile client helper"
    ],
    "notes": "Never use server secret in browser."
  },
  {
    "app": "verixet",
    "name": "VITE_TURNSTILE_SITE_KEY",
    "required": false,
    "environment": "local",
    "secret": false,
    "safePlaceholderAllowed": true,
    "purpose": "Compatibility public site key detection in non-Next contexts.",
    "sourceOfTruth": "Cloudflare Turnstile test or real site key",
    "usedBy": [
      "Turnstile client helper"
    ],
    "notes": "Compatibility only for Verixet."
  },
  {
    "app": "verixet",
    "name": "TURNSTILE_SECRET_KEY",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Server Cloudflare Siteverify secret.",
    "sourceOfTruth": "Cloudflare Turnstile",
    "usedBy": [
      "Turnstile server validation"
    ],
    "notes": "Fail closed in production."
  },
  {
    "app": "verixet",
    "name": "VERIXET_TURNSTILE_REQUIRED",
    "required": false,
    "environment": "all",
    "secret": false,
    "safePlaceholderAllowed": true,
    "purpose": "Turnstile policy override outside production.",
    "sourceOfTruth": "app config",
    "usedBy": [
      "Turnstile policy"
    ],
    "notes": "Must not disable production fail-closed behavior."
  },
  {
    "app": "verixet",
    "name": "VERIXET_TURNSTILE_MOCK_VALIDATION",
    "required": false,
    "environment": "local",
    "secret": false,
    "safePlaceholderAllowed": true,
    "purpose": "Mock Turnstile validation in dev/test.",
    "sourceOfTruth": "test config",
    "usedBy": [
      "Turnstile tests"
    ],
    "notes": "Never enable in production."
  },
  {
    "app": "verixet",
    "name": "STRIPE_SECRET_KEY",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Stripe API key for billing authority.",
    "sourceOfTruth": "Stripe dashboard",
    "usedBy": [
      "Stripe client",
      "billing"
    ],
    "notes": "Verixet owns this for ecosystem billing."
  },
  {
    "app": "verixet",
    "name": "STRIPE_WEBHOOK_SECRET",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Stripe webhook signature secret.",
    "sourceOfTruth": "Stripe dashboard",
    "usedBy": [
      "Stripe webhook"
    ],
    "notes": "Server only."
  },
  {
    "app": "verixet",
    "name": "CONTROL_PLANE_SERVICE_TOKEN",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "XFlow control-plane service auth.",
    "sourceOfTruth": "secret manager",
    "usedBy": [
      "control-plane/XFlow modules"
    ],
    "notes": "Must not replace per-connection UCL tokens."
  },
  {
    "app": "verixet",
    "name": "XFLOW_BASE_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "XFlow authority URL.",
    "sourceOfTruth": "XFlow deployment",
    "usedBy": [
      "XFlow OAuth",
      "control-plane helpers"
    ],
    "notes": "Alias drift exists; prefer canonical name after migration."
  },
  {
    "app": "verixet",
    "name": "SUPABASE_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Supabase project URL.",
    "sourceOfTruth": "Supabase",
    "usedBy": [
      "Supabase auth/server"
    ],
    "notes": "Coordinate with NEXT_PUBLIC_SUPABASE_URL where needed."
  },
  {
    "app": "verixet",
    "name": "SUPABASE_SERVICE_ROLE_KEY",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Privileged Supabase server access.",
    "sourceOfTruth": "Supabase",
    "usedBy": [
      "Supabase privileged calls"
    ],
    "notes": "Server only."
  },
  {
    "app": "verixet",
    "name": "SENDGRID_API_KEY",
    "required": false,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Transactional email.",
    "sourceOfTruth": "SendGrid",
    "usedBy": [
      "email/auth flows"
    ],
    "notes": "Needs from-address alignment."
  },
  {
    "app": "audaix",
    "name": "AUDAIX_APP_BASE_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Public AudAiX URL.",
    "sourceOfTruth": "Railway/public domain",
    "usedBy": [
      "route/auth config"
    ],
    "notes": "Needs exact Railway value."
  },
  {
    "app": "audaix",
    "name": "VITE_TURNSTILE_SITE_KEY",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Browser Turnstile site key for Vite.",
    "sourceOfTruth": "Cloudflare Turnstile",
    "usedBy": [
      "dashboard/client contract"
    ],
    "notes": "Target canonical browser key."
  },
  {
    "app": "audaix",
    "name": "TURNSTILE_SITE_KEY",
    "required": false,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Legacy browser Turnstile key.",
    "sourceOfTruth": "Cloudflare Turnstile",
    "usedBy": [
      "legacy server config"
    ],
    "notes": "Deprecated; do not use as canonical value."
  },
  {
    "app": "audaix",
    "name": "TURNSTILE_SECRET_KEY",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Server Cloudflare Siteverify secret.",
    "sourceOfTruth": "Cloudflare Turnstile",
    "usedBy": [
      "auth/turnstile"
    ],
    "notes": "Server only."
  },
  {
    "app": "audaix",
    "name": "AUDAIX_TURNSTILE_REQUIRED",
    "required": false,
    "environment": "all",
    "secret": false,
    "safePlaceholderAllowed": true,
    "purpose": "Force Turnstile policy.",
    "sourceOfTruth": "app config",
    "usedBy": [
      "security env",
      "auth"
    ],
    "notes": "Must be true/effective in production."
  },
  {
    "app": "audaix",
    "name": "AUDAIX_VERIXET_SERVICE_TOKEN",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Service auth for Verixet calls.",
    "sourceOfTruth": "Verixet secret manager",
    "usedBy": [
      "billing/Verixet adapters"
    ],
    "notes": "Alias drift with global Verixet tokens."
  },
  {
    "app": "audaix",
    "name": "VERIXET_USAGE_INGEST_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Verixet usage endpoint.",
    "sourceOfTruth": "Verixet deployment",
    "usedBy": [
      "billing/verixet usage"
    ],
    "notes": "Pair with AudAiX usage token."
  },
  {
    "app": "audaix",
    "name": "VERIXET_AUDAIX_USAGE_INGEST_TOKEN",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "AudAiX app-scoped usage token.",
    "sourceOfTruth": "Verixet secret manager",
    "usedBy": [
      "usage helper"
    ],
    "notes": "Server only."
  },
  {
    "app": "audaix",
    "name": "XFLOW_BASE_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "XFlow authority URL.",
    "sourceOfTruth": "XFlow deployment",
    "usedBy": [
      "XFlow routes",
      "UCL client"
    ],
    "notes": "URL aliases exist."
  },
  {
    "app": "audaix",
    "name": "CONTROL_PLANE_SERVICE_TOKEN",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Control-plane service auth.",
    "sourceOfTruth": "secret manager",
    "usedBy": [
      "control-plane routes"
    ],
    "notes": "Must not replace UCL connection token."
  },
  {
    "app": "audaix",
    "name": "DATABASE_URL",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "AudAiX database connection.",
    "sourceOfTruth": "Railway/Supabase",
    "usedBy": [
      "repositories"
    ],
    "notes": "Verify repository consistency."
  },
  {
    "app": "audaix",
    "name": "SENDGRID_API_KEY",
    "required": false,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Transactional email.",
    "sourceOfTruth": "SendGrid",
    "usedBy": [
      "email/auth"
    ],
    "notes": "Needs from-address pair."
  },
  {
    "app": "rataify",
    "name": "APP_BASE_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Public RatAiFy URL.",
    "sourceOfTruth": "Railway/public domain",
    "usedBy": [
      "auth",
      "billing",
      "ecosystem routes"
    ],
    "notes": "Confirm no stale domain."
  },
  {
    "app": "rataify",
    "name": "VITE_TURNSTILE_SITE_KEY",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Browser Turnstile site key for Vite.",
    "sourceOfTruth": "Cloudflare Turnstile",
    "usedBy": [
      "vite config",
      "auth UI"
    ],
    "notes": "Canonical public key."
  },
  {
    "app": "rataify",
    "name": "TURNSTILE_SITE_KEY",
    "required": false,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Legacy browser Turnstile key.",
    "sourceOfTruth": "Cloudflare Turnstile",
    "usedBy": [
      "vite fallback",
      "setup verifier docs"
    ],
    "notes": "Deprecated compatibility only."
  },
  {
    "app": "rataify",
    "name": "TURNSTILE_SECRET_KEY",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Server Cloudflare Siteverify secret.",
    "sourceOfTruth": "Cloudflare Turnstile",
    "usedBy": [
      "server Turnstile service"
    ],
    "notes": "Error code normalization remains Phase 2."
  },
  {
    "app": "rataify",
    "name": "XFLOW_BOOTSTRAP_EXCHANGE_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "XFlow bootstrap exchange URL.",
    "sourceOfTruth": "XFlow deployment",
    "usedBy": [
      "bootstrap installer"
    ],
    "notes": "Must be documented before production."
  },
  {
    "app": "rataify",
    "name": "XFLOW_BOOTSTRAP_EXCHANGE_TOKEN",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "XFlow bootstrap exchange auth.",
    "sourceOfTruth": "XFlow secret manager",
    "usedBy": [
      "bootstrap installer"
    ],
    "notes": "Server only."
  },
  {
    "app": "rataify",
    "name": "XFLOW_UCL_EVENTS_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "XFlow UCL event endpoint.",
    "sourceOfTruth": "XFlow deployment",
    "usedBy": [
      "UCL event client"
    ],
    "notes": "Token must match connection."
  },
  {
    "app": "rataify",
    "name": "VERIXET_API_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Verixet API base URL.",
    "sourceOfTruth": "Verixet deployment",
    "usedBy": [
      "billing/entitlement adapters"
    ],
    "notes": "Alias drift with billing base URL."
  },
  {
    "app": "rataify",
    "name": "VERIXET_USAGE_INGEST_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Verixet usage endpoint.",
    "sourceOfTruth": "Verixet deployment",
    "usedBy": [
      "usage ingest service"
    ],
    "notes": "Needs app-scoped token."
  },
  {
    "app": "rataify",
    "name": "VERIXET_RATAIFY_USAGE_INGEST_TOKEN",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "RatAiFy app-scoped usage token.",
    "sourceOfTruth": "Verixet secret manager",
    "usedBy": [
      "usage ingest service"
    ],
    "notes": "Server only."
  },
  {
    "app": "rataify",
    "name": "STRIPE_SECRET_KEY",
    "required": false,
    "environment": "local",
    "secret": true,
    "safePlaceholderAllowed": true,
    "purpose": "Legacy/local Stripe key if local billing mode remains active.",
    "sourceOfTruth": "Stripe test dashboard",
    "usedBy": [
      "local billing/Stripe routes"
    ],
    "notes": "Conflicts with Verixet authority unless explicitly local."
  },
  {
    "app": "rataify",
    "name": "DATABASE_URL",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "RatAiFy database connection.",
    "sourceOfTruth": "Railway/Supabase",
    "usedBy": [
      "server DB"
    ],
    "notes": "Verify tenant scoping."
  },
  {
    "app": "wordgeni",
    "name": "NEXT_PUBLIC_APP_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Public WordGeni web URL.",
    "sourceOfTruth": "Railway/Vercel",
    "usedBy": [
      "web auth"
    ],
    "notes": "Needs exact deployed URL."
  },
  {
    "app": "wordgeni",
    "name": "NEXT_PUBLIC_CREVUX_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Public Crevux URL for web integration.",
    "sourceOfTruth": "Crevux deployment",
    "usedBy": [
      "web Crevux components"
    ],
    "notes": "Requires shared route contract."
  },
  {
    "app": "wordgeni",
    "name": "WORDGENI_CREVUX_API_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Crevux API base URL.",
    "sourceOfTruth": "Crevux deployment",
    "usedBy": [
      "Crevux client/routes"
    ],
    "notes": "Needs shared route contract."
  },
  {
    "app": "wordgeni",
    "name": "WORDGENI_CREVUX_SHARED_SECRET",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "WordGeni-to-Crevux integration secret.",
    "sourceOfTruth": "secret manager",
    "usedBy": [
      "Crevux integration client"
    ],
    "notes": "Server only."
  },
  {
    "app": "wordgeni",
    "name": "XFLOW_ENTITLEMENT_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "XFlow entitlement endpoint if enabled.",
    "sourceOfTruth": "XFlow deployment",
    "usedBy": [
      "entitlement config"
    ],
    "notes": "Authority should be Verixet unless XFlow mirrors."
  },
  {
    "app": "wordgeni",
    "name": "XFLOW_ENTITLEMENT_TOKEN",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Entitlement service auth.",
    "sourceOfTruth": "secret manager",
    "usedBy": [
      "entitlement config"
    ],
    "notes": "Token type needs review."
  },
  {
    "app": "wordgeni",
    "name": "VERIXET_API_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Verixet billing authority API.",
    "sourceOfTruth": "Verixet deployment",
    "usedBy": [
      "billing entitlement services"
    ],
    "notes": "Not sufficiently documented in app env example."
  },
  {
    "app": "wordgeni",
    "name": "STRIPE_SECRET_KEY",
    "required": false,
    "environment": "local",
    "secret": true,
    "safePlaceholderAllowed": true,
    "purpose": "Legacy/local Stripe key if local billing mode remains active.",
    "sourceOfTruth": "Stripe test dashboard",
    "usedBy": [
      "Stripe webhook/processor"
    ],
    "notes": "Split billing authority risk."
  },
  {
    "app": "wordgeni",
    "name": "DATABASE_URL",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "WordGeni API database.",
    "sourceOfTruth": "Railway/Supabase",
    "usedBy": [
      "API Drizzle"
    ],
    "notes": "Migration ordering must be verified."
  },
  {
    "app": "wordgeni",
    "name": "SENTRY_DSN",
    "required": false,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Error telemetry DSN.",
    "sourceOfTruth": "Sentry",
    "usedBy": [
      "observability"
    ],
    "notes": "Needs env naming consistency."
  },
  {
    "app": "crevux",
    "name": "API_BASE_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Crevux API origin.",
    "sourceOfTruth": "Railway/public domain",
    "usedBy": [
      "image-gen",
      "mobile",
      "API clients"
    ],
    "notes": "Multiple artifacts need same origin."
  },
  {
    "app": "crevux",
    "name": "DATABASE_URL",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Crevux API database.",
    "sourceOfTruth": "Railway/Supabase",
    "usedBy": [
      "API server",
      "DB libs"
    ],
    "notes": "Verify migrations/indexes."
  },
  {
    "app": "crevux",
    "name": "JWT_SECRET",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "JWT/session signing.",
    "sourceOfTruth": "secret manager",
    "usedBy": [
      "API auth JWT"
    ],
    "notes": "Server only."
  },
  {
    "app": "crevux",
    "name": "MEDIA_DOWNLOAD_SIGNING_SECRET",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Signed media download URLs.",
    "sourceOfTruth": "secret manager",
    "usedBy": [
      "media download signing"
    ],
    "notes": "Server only."
  },
  {
    "app": "crevux",
    "name": "STRIPE_SECRET_KEY",
    "required": false,
    "environment": "local",
    "secret": true,
    "safePlaceholderAllowed": true,
    "purpose": "Legacy/local Stripe key if local billing remains active.",
    "sourceOfTruth": "Stripe test dashboard",
    "usedBy": [
      "billing routes",
      "webhook"
    ],
    "notes": "Conflicts with Verixet authority unless local cache is intentional."
  },
  {
    "app": "crevux",
    "name": "STRIPE_WEBHOOK_SECRET",
    "required": false,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Local Stripe webhook secret if local billing remains active.",
    "sourceOfTruth": "Stripe dashboard",
    "usedBy": [
      "billing webhook"
    ],
    "notes": "Server only."
  },
  {
    "app": "crevux",
    "name": "VERIXET_API_URL",
    "required": true,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Verixet ecosystem authority API.",
    "sourceOfTruth": "Verixet deployment",
    "usedBy": [
      "entitlements adapter"
    ],
    "notes": "Needs mandatory admission path."
  },
  {
    "app": "crevux",
    "name": "VERIXET_CREVUX_USAGE_INGEST_TOKEN",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Crevux app-scoped usage token.",
    "sourceOfTruth": "Verixet secret manager",
    "usedBy": [
      "usage ingest"
    ],
    "notes": "Server only."
  },
  {
    "app": "crevux",
    "name": "WORDGENI_SHARED_SECRET",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "WordGeni integration auth.",
    "sourceOfTruth": "secret manager",
    "usedBy": [
      "WordGeni route/client"
    ],
    "notes": "Needs exact shared contract."
  },
  {
    "app": "crevux",
    "name": "OPENAI_API_KEY",
    "required": true,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "OpenAI provider key when enabled.",
    "sourceOfTruth": "OpenAI",
    "usedBy": [
      "generation providers"
    ],
    "notes": "Provider-specific fail-closed needed."
  },
  {
    "app": "crevux",
    "name": "REPLICATE_API_TOKEN",
    "required": false,
    "environment": "production",
    "secret": true,
    "safePlaceholderAllowed": false,
    "purpose": "Replicate provider key when enabled.",
    "sourceOfTruth": "Replicate",
    "usedBy": [
      "generation providers"
    ],
    "notes": "Provider matrix needs cleanup."
  },
  {
    "app": "crevux",
    "name": "SENTRY_DSN",
    "required": false,
    "environment": "production",
    "secret": false,
    "safePlaceholderAllowed": false,
    "purpose": "Error telemetry DSN.",
    "sourceOfTruth": "Sentry",
    "usedBy": [
      "observability"
    ],
    "notes": "Needs environment consistency."
  }
] as const satisfies readonly EcosystemEnvContract[];

export const ecosystemRoutes = [
  {
    "ownerApp": "xflow",
    "consumerApps": [
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "GET",
    "path": "/api/v1/control-plane/config",
    "purpose": "Hosted control-plane configuration bootstrap.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Environment"
    ],
    "requiredBodyFields": [],
    "authType": "service",
    "tokenType": "control_plane_service_token",
    "responseEnvelope": "json:{success:boolean,data?:object,error?:{code,message}}",
    "productionFailureMode": "401/403 for missing or invalid service token; never infer connected from URL presence.",
    "notes": "Base URL env names differ today; Phase 2 should standardize aliases."
  },
  {
    "ownerApp": "xflow",
    "consumerApps": [
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "GET",
    "path": "/api/v1/control-plane/health",
    "purpose": "Control-plane health/readiness check.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Environment"
    ],
    "requiredBodyFields": [],
    "authType": "service",
    "tokenType": "control_plane_service_token",
    "responseEnvelope": "json:{success:boolean,data?:{status,checks},error?:{code,message}}",
    "productionFailureMode": "401/403 for invalid token; 503 for authority unavailable.",
    "notes": "Status UI must not collapse configured/reachable/authenticated into one green state."
  },
  {
    "ownerApp": "xflow",
    "consumerApps": [
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "GET",
    "path": "/oauth/authorize",
    "purpose": "XFlow OAuth authorization start.",
    "requiredHeaders": [],
    "requiredBodyFields": [],
    "authType": "public",
    "tokenType": null,
    "responseEnvelope": "redirect",
    "productionFailureMode": "Reject invalid client_id, redirect_uri, state, nonce, PKCE, or returnTo.",
    "notes": "Public route by design; must validate state/returnTo and registered callbacks.",
    "public": true
  },
  {
    "ownerApp": "xflow",
    "consumerApps": [
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "POST",
    "path": "/api/oauth/token",
    "purpose": "OAuth code-to-token exchange.",
    "requiredHeaders": [
      "Content-Type"
    ],
    "requiredBodyFields": [
      "grant_type",
      "code",
      "redirect_uri",
      "client_id",
      "code_verifier"
    ],
    "authType": "oauth-client",
    "tokenType": "oauth_client_secret",
    "responseEnvelope": "json:{access_token,token_type,expires_in,refresh_token?}",
    "productionFailureMode": "400/401 for invalid grant/client/PKCE; no raw secret details.",
    "notes": "Client secret must remain server-side."
  },
  {
    "ownerApp": "xflow",
    "consumerApps": [
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "GET",
    "path": "/oauth/userinfo",
    "purpose": "OAuth user profile lookup.",
    "requiredHeaders": [
      "Authorization"
    ],
    "requiredBodyFields": [],
    "authType": "oauth-user",
    "tokenType": "oauth_access_token",
    "responseEnvelope": "json:{sub,email,name,workspaceId?,appLinks?}",
    "productionFailureMode": "401 for missing/expired OAuth token.",
    "notes": "Do not accept service tokens here."
  },
  {
    "ownerApp": "xflow",
    "consumerApps": [
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "POST",
    "path": "/api/ucl/link/start",
    "purpose": "Start UCL workspace/app linking.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Workspace-ID",
      "X-Environment"
    ],
    "requiredBodyFields": [
      "appSlug",
      "workspaceId",
      "environment",
      "correlationId"
    ],
    "authType": "ucl",
    "tokenType": "ucl_connection_token",
    "responseEnvelope": "json:{success:boolean,data?:{connectionId,challenge},error?:{code,message}}",
    "productionFailureMode": "401/403 for invalid connection token; 422 for missing workspace/app.",
    "notes": "UCL route; validator requires UCL-style headers."
  },
  {
    "ownerApp": "xflow",
    "consumerApps": [
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "POST",
    "path": "/api/ucl/link/confirm",
    "purpose": "Confirm UCL link with connection proof.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Workspace-ID",
      "X-UCL-Connection-ID",
      "X-Environment"
    ],
    "requiredBodyFields": [
      "connectionId",
      "workspaceId",
      "appSlug",
      "proof",
      "correlationId"
    ],
    "authType": "ucl",
    "tokenType": "ucl_connection_token",
    "responseEnvelope": "json:{success:boolean,data?:{linked,connectionId},error?:{code,message}}",
    "productionFailureMode": "401/403 for invalid proof/token; fail closed.",
    "notes": "Do not use global service tokens for per-connection proof."
  },
  {
    "ownerApp": "xflow",
    "consumerApps": [
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "POST",
    "path": "/api/ucl/events",
    "purpose": "Ingest UCL activation/deployment/lifecycle events.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Workspace-ID",
      "X-UCL-Connection-ID",
      "X-Correlation-ID",
      "X-Environment",
      "Idempotency-Key"
    ],
    "requiredBodyFields": [
      "eventName",
      "appSlug",
      "workspaceId",
      "connectionId",
      "environment",
      "correlationId"
    ],
    "authType": "ucl",
    "tokenType": "ucl_connection_token",
    "responseEnvelope": "json:{success:boolean,data?:{accepted,eventId},error?:{code,message}}",
    "productionFailureMode": "401/403 for invalid connection token; 409 for replay conflicts.",
    "notes": "Activation/deployment event fields need Phase 2 schema hardening."
  },
  {
    "ownerApp": "verixet",
    "consumerApps": [
      "xflow",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "GET",
    "path": "/api/platform/v1/plans",
    "purpose": "Read Verixet-owned plan catalog.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Environment"
    ],
    "requiredBodyFields": [],
    "authType": "service",
    "tokenType": "control_plane_service_token",
    "responseEnvelope": "json:{success:boolean,data?:{plans},error?:{code,message}}",
    "productionFailureMode": "401/403 when unauthorized; consumers must not fall back to fake plan catalogs in production.",
    "notes": "Phase 2 should replace local consumer plan catalogs with generated/mirrored Verixet data."
  },
  {
    "ownerApp": "verixet",
    "consumerApps": [
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "POST",
    "path": "/api/billing/checkout",
    "purpose": "Create Stripe checkout through Verixet authority.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Workspace-ID",
      "X-Correlation-ID",
      "Idempotency-Key"
    ],
    "requiredBodyFields": [
      "appSlug",
      "workspaceId",
      "billingInterval",
      "planSlug",
      "returnUrl"
    ],
    "authType": "service",
    "tokenType": "control_plane_service_token",
    "responseEnvelope": "json:{success:boolean,data?:{checkoutUrl,sessionId},error?:{code,message}}",
    "productionFailureMode": "401/403/422 for auth/schema failures; no local fallback checkout in production.",
    "notes": "Stripe secret stays in Verixet only."
  },
  {
    "ownerApp": "verixet",
    "consumerApps": [
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "GET",
    "path": "/api/billing/status",
    "purpose": "Read workspace billing state.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Workspace-ID",
      "X-Environment"
    ],
    "requiredBodyFields": [],
    "authType": "service",
    "tokenType": "control_plane_service_token",
    "responseEnvelope": "json:{success:boolean,data?:{workspaceId,planSlug,status},error?:{code,message}}",
    "productionFailureMode": "401/403/404; UI must show unknown/unavailable instead of connected.",
    "notes": "Consumers may cache display state only with clear freshness."
  },
  {
    "ownerApp": "verixet",
    "consumerApps": [
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "POST",
    "path": "/api/platform/v1/entitlements/evaluate",
    "purpose": "Evaluate workspace entitlement/admission before protected work.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Workspace-ID",
      "X-Correlation-ID"
    ],
    "requiredBodyFields": [
      "appSlug",
      "workspaceId",
      "featureKey",
      "environment",
      "correlationId"
    ],
    "authType": "service",
    "tokenType": "control_plane_service_token",
    "responseEnvelope": "json:{success:boolean,data?:{allowed,reason,limits},error?:{code,message}}",
    "productionFailureMode": "401/403/402/503; paid work must not execute before allowed response.",
    "notes": "Phase 2 should standardize 402 PLAN_LIMIT_EXCEEDED envelope."
  },
  {
    "ownerApp": "verixet",
    "consumerApps": [
      "xflow",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "POST",
    "path": "/api/ecosystem/usage/ingest",
    "purpose": "Ingest app-scoped usage events into Verixet.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Workspace-ID",
      "X-Correlation-ID",
      "Idempotency-Key"
    ],
    "requiredBodyFields": [
      "appSlug",
      "workspaceId",
      "featureKey",
      "quantity",
      "environment",
      "correlationId"
    ],
    "authType": "usage-ingest",
    "tokenType": "verixet_usage_ingest_token",
    "responseEnvelope": "json:{success:boolean,data?:{accepted,usageEventId},error?:{code,message}}",
    "productionFailureMode": "401/403/409/422; reject unscoped or mismatched app tokens.",
    "notes": "Validator requires usage ingest routes to use an app-scoped token type."
  },
  {
    "ownerApp": "verixet",
    "consumerApps": [
      "xflow",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "method": "POST",
    "path": "/api/ecosystem/signup/start",
    "purpose": "Start Verixet billing/signup handoff.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Correlation-ID"
    ],
    "requiredBodyFields": [
      "sourceApp",
      "selectedApp",
      "workspaceId",
      "returnTo",
      "correlationId"
    ],
    "authType": "service",
    "tokenType": "control_plane_service_token",
    "responseEnvelope": "json:{success:boolean,data?:{handoffUrl,state},error?:{code,message}}",
    "productionFailureMode": "401/403/422; reject unsafe returnTo and unsupported app slugs.",
    "notes": "App slugs must be canonical lowercase."
  },
  {
    "ownerApp": "wordgeni",
    "consumerApps": [
      "crevux"
    ],
    "method": "POST",
    "path": "/api/integrations/crevux",
    "purpose": "Create or inspect a Crevux visual companion request from WordGeni.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Workspace-ID",
      "X-Correlation-ID",
      "Idempotency-Key"
    ],
    "requiredBodyFields": [
      "workspaceId",
      "documentId",
      "requestType",
      "correlationId"
    ],
    "authType": "service",
    "tokenType": "control_plane_service_token",
    "responseEnvelope": "json:{success:boolean,data?:{requestId,status},error?:{code,message}}",
    "productionFailureMode": "401/403/402/422; must check entitlement before paid media work.",
    "notes": "No root shared schema existed before this registry."
  },
  {
    "ownerApp": "crevux",
    "consumerApps": [
      "wordgeni"
    ],
    "method": "POST",
    "path": "/api/integrations/wordgeni",
    "purpose": "Accept WordGeni integration requests into Crevux.",
    "requiredHeaders": [
      "Authorization",
      "X-App-Slug",
      "X-Workspace-ID",
      "X-Correlation-ID",
      "Idempotency-Key"
    ],
    "requiredBodyFields": [
      "workspaceId",
      "sourceDocumentId",
      "prompt",
      "correlationId"
    ],
    "authType": "service",
    "tokenType": "control_plane_service_token",
    "responseEnvelope": "json:{success:boolean,data?:{jobId,status},error?:{code,message}}",
    "productionFailureMode": "401/403/402/422; fail closed when Verixet admission is unavailable.",
    "notes": "Shared-secret env must stay server-side; Phase 2 should refine token type if not control-plane service."
  },
  {
    "ownerApp": "verixet",
    "consumerApps": [
      "stripe"
    ],
    "method": "POST",
    "path": "/api/billing/webhook",
    "purpose": "Receive Stripe billing webhooks.",
    "requiredHeaders": [
      "Stripe-Signature"
    ],
    "requiredBodyFields": [],
    "authType": "webhook",
    "tokenType": "stripe_webhook_secret",
    "responseEnvelope": "json:{received:boolean}",
    "productionFailureMode": "400 for invalid signature; idempotent replay handling required.",
    "notes": "Verixet should be ecosystem billing webhook authority."
  },
  {
    "ownerApp": "verixet",
    "consumerApps": [
      "browser"
    ],
    "method": "POST",
    "path": "/api/auth/sign-up",
    "purpose": "Verixet signup with Turnstile validation.",
    "requiredHeaders": [
      "Content-Type"
    ],
    "requiredBodyFields": [
      "email",
      "password",
      "turnstileToken"
    ],
    "authType": "public",
    "tokenType": null,
    "responseEnvelope": "json:{success:boolean,data?:object,error?:{code,message}}",
    "productionFailureMode": "TURNSTILE_SITE_KEY_MISSING, TURNSTILE_TOKEN_MISSING, TURNSTILE_SECRET_MISSING, or TURNSTILE_VALIDATION_FAILED.",
    "notes": "Public route by design but must fail closed in production for Turnstile.",
    "public": true
  }
] as const satisfies readonly EcosystemRouteContract[];

export const ecosystemTokenTypes = [
  {
    "id": "control_plane_service_token",
    "owner": "xflow",
    "allowedConsumers": [
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "allowedUse": "Server-to-server control-plane bootstrap, configuration, and administrative service calls.",
    "forbiddenUse": "Browser exposure, user session auth, UCL per-connection events, usage ingestion.",
    "exampleHeaderName": "Authorization",
    "shouldBeAppScoped": true,
    "shouldBeWorkspaceScoped": false,
    "rotationNotes": "Rotate per consuming app and update Railway/server secret managers together."
  },
  {
    "id": "ucl_connection_token",
    "owner": "xflow",
    "allowedConsumers": [
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "allowedUse": "Per-workspace or per-connection UCL link, status, and event calls.",
    "forbiddenUse": "Global bootstrap, browser exposure, Verixet usage ingestion, Stripe operations.",
    "exampleHeaderName": "Authorization",
    "shouldBeAppScoped": true,
    "shouldBeWorkspaceScoped": true,
    "rotationNotes": "Rotate when a workspace app connection is revoked or repaired."
  },
  {
    "id": "verixet_usage_ingest_token",
    "owner": "verixet",
    "allowedConsumers": [
      "xflow",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "allowedUse": "App-scoped server usage event ingestion into Verixet.",
    "forbiddenUse": "Browser exposure, entitlement evaluation as a user, Stripe operations, XFlow UCL events.",
    "exampleHeaderName": "Authorization",
    "shouldBeAppScoped": true,
    "shouldBeWorkspaceScoped": false,
    "rotationNotes": "Rotate per app and preserve idempotency/replay logs during cutover."
  },
  {
    "id": "oauth_access_token",
    "owner": "xflow",
    "allowedConsumers": [
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "allowedUse": "OAuth user/session authorization and userinfo access.",
    "forbiddenUse": "Service bootstrap, billing webhooks, Stripe API access, DB access.",
    "exampleHeaderName": "Authorization",
    "shouldBeAppScoped": true,
    "shouldBeWorkspaceScoped": false,
    "rotationNotes": "Use normal OAuth expiry/refresh handling; do not store as service secret."
  },
  {
    "id": "oauth_client_secret",
    "owner": "xflow",
    "allowedConsumers": [
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "allowedUse": "Server-side OAuth client authentication.",
    "forbiddenUse": "Browser exposure, API bearer auth, unrelated service calls.",
    "exampleHeaderName": "none",
    "shouldBeAppScoped": true,
    "shouldBeWorkspaceScoped": false,
    "rotationNotes": "Rotate through OAuth client dashboard and Railway vars."
  },
  {
    "id": "stripe_secret_key",
    "owner": "verixet",
    "allowedConsumers": [
      "verixet"
    ],
    "allowedUse": "Stripe API calls owned by Verixet billing authority.",
    "forbiddenUse": "Browser exposure or consumer-app billing authority unless a documented legacy/local mode is active.",
    "exampleHeaderName": "none",
    "shouldBeAppScoped": false,
    "shouldBeWorkspaceScoped": false,
    "rotationNotes": "Rotate in Stripe and Verixet Railway together; verify webhooks after rotation."
  },
  {
    "id": "stripe_webhook_secret",
    "owner": "verixet",
    "allowedConsumers": [
      "verixet"
    ],
    "allowedUse": "Verify Stripe webhook signatures.",
    "forbiddenUse": "Browser exposure, outbound Stripe API auth, non-webhook routes.",
    "exampleHeaderName": "Stripe-Signature",
    "shouldBeAppScoped": false,
    "shouldBeWorkspaceScoped": false,
    "rotationNotes": "Rotate webhook endpoints one environment at a time."
  },
  {
    "id": "turnstile_secret_key",
    "owner": "cloudflare",
    "allowedConsumers": [
      "verixet",
      "audaix",
      "rataify"
    ],
    "allowedUse": "Server-side Cloudflare Turnstile Siteverify validation.",
    "forbiddenUse": "Browser exposure, public site key configuration.",
    "exampleHeaderName": "none",
    "shouldBeAppScoped": true,
    "shouldBeWorkspaceScoped": false,
    "rotationNotes": "Rotate in Cloudflare and app Railway environments; test keys/mock validation only outside production."
  },
  {
    "id": "sendgrid_api_key",
    "owner": "sendgrid",
    "allowedConsumers": [
      "xflow",
      "verixet",
      "audaix",
      "rataify"
    ],
    "allowedUse": "Server-side transactional email.",
    "forbiddenUse": "Browser exposure or unrelated API bearer auth.",
    "exampleHeaderName": "Authorization",
    "shouldBeAppScoped": true,
    "shouldBeWorkspaceScoped": false,
    "rotationNotes": "Rotate with from-address/domain verification checks."
  },
  {
    "id": "db_connection_string",
    "owner": "database-provider",
    "allowedConsumers": [
      "xflow",
      "verixet",
      "audaix",
      "rataify",
      "wordgeni",
      "crevux"
    ],
    "allowedUse": "Server-side database access for the owning app database.",
    "forbiddenUse": "Browser exposure, cross-app authority writes outside documented mirror/cache rules.",
    "exampleHeaderName": "none",
    "shouldBeAppScoped": true,
    "shouldBeWorkspaceScoped": false,
    "rotationNotes": "Rotate through provider; verify migrations and connection pools."
  },
  {
    "id": "sentry_dsn",
    "owner": "sentry",
    "allowedConsumers": [
      "xflow",
      "verixet",
      "wordgeni",
      "crevux"
    ],
    "allowedUse": "Telemetry DSN where configured.",
    "forbiddenUse": "Secret auth, DB/API access, raw secret logging.",
    "exampleHeaderName": "none",
    "shouldBeAppScoped": true,
    "shouldBeWorkspaceScoped": false,
    "rotationNotes": "Treat browser DSNs as public identifiers; keep auth tokens out of app env."
  },
  {
    "id": "media_download_signing_secret",
    "owner": "crevux",
    "allowedConsumers": [
      "crevux"
    ],
    "allowedUse": "Server-side signed media download URL generation/verification.",
    "forbiddenUse": "Browser exposure, user auth, billing auth.",
    "exampleHeaderName": "none",
    "shouldBeAppScoped": true,
    "shouldBeWorkspaceScoped": false,
    "rotationNotes": "Rotate with short overlap for existing signed URLs if needed."
  },
  {
    "id": "jwt_secret",
    "owner": "crevux",
    "allowedConsumers": [
      "crevux"
    ],
    "allowedUse": "Server-side JWT/session signing where local app auth remains active.",
    "forbiddenUse": "Browser exposure, cross-app service tokens, Stripe/OAuth secrets.",
    "exampleHeaderName": "none",
    "shouldBeAppScoped": true,
    "shouldBeWorkspaceScoped": false,
    "rotationNotes": "Rotate with session invalidation plan."
  }
] as const satisfies readonly EcosystemTokenTypeContract[];

export function isCanonicalAppSlug(value: string): value is CanonicalAppSlug {
  return (canonicalAppSlugs as readonly string[]).includes(value);
}

export function getEcosystemApp(slug: CanonicalAppSlug): EcosystemAppContract {
  const app = ecosystemApps.find((entry) => entry.slug === slug);
  if (!app) {
    throw new Error(`Unknown ecosystem app slug: ${slug}`);
  }
  return app;
}

export function getRoutesForOwner(ownerApp: CanonicalAppSlug): readonly EcosystemRouteContract[] {
  return ecosystemRoutes.filter((route) => route.ownerApp === ownerApp);
}

export function getEnvForApp(app: CanonicalAppSlug): readonly EcosystemEnvContract[] {
  return ecosystemEnv.filter((entry) => entry.app === app);
}
