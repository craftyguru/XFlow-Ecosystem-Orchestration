# Ecosystem Connection Map

Date: 2026-05-04

Machine-readable source: `ecosystem-contracts/routes.json` is now the canonical root route contract registry for Phase 1 validation. This document remains the human-readable map and should stay aligned with the JSON registry.

Before changing connection logic, follow the [Six-App Connection Discipline](six-app-connection-discipline.md).

## App Responsibilities

| App | Responsibility | Must not own |
| --- | --- | --- |
| XFlow | Identity, OAuth, control plane, app hub, UCL routing, app linking, event routing | Stripe billing authority, plan pricing authority |
| Verixet | Billing, governance, Stripe, entitlements, usage ingest, workspace billing authority | Identity authority, app-specific product execution |
| AudAiX | Audit, monitoring, improvement workflows | Billing authority, identity authority |
| Rataify | Trust, reviews, risk, privacy, reputation workflows | Billing authority, identity authority |
| WordGeni | Writing intelligence workflows and Crevux companion requests | Billing authority, identity authority |
| Crevux | AI media studio, credits/usage execution, media generation workflows | Ecosystem billing authority unless explicitly acting as local cache |

## Authority Boundaries

```mermaid
flowchart LR
  User["User"]
  XFlow["XFlow\nIdentity + Control Plane + UCL"]
  Verixet["Verixet\nBilling + Entitlements + Usage Authority"]
  AudAix["AudAiX"]
  Rataify["Rataify"]
  WordGeni["WordGeni"]
  Crevux["Crevux"]
  Stripe["Stripe"]
  CF["Cloudflare Turnstile"]

  User --> XFlow
  User --> AudAix
  User --> Rataify
  User --> WordGeni
  User --> Crevux

  AudAix -->|"OAuth / app link"| XFlow
  Rataify -->|"OAuth / app link"| XFlow
  WordGeni -->|"OAuth / app link"| XFlow
  Crevux -->|"OAuth / app link"| XFlow
  Verixet -->|"OAuth / billing mirror"| XFlow

  AudAix -->|"entitlement + usage"| Verixet
  Rataify -->|"entitlement + usage"| Verixet
  WordGeni -->|"entitlement + usage"| Verixet
  Crevux -->|"entitlement + usage"| Verixet
  Verixet -->|"webhooks + checkout"| Stripe

  AudAix --> CF
  Rataify --> CF
  Verixet --> CF
```

## Signup And Auth Flow

```mermaid
sequenceDiagram
  participant U as User
  participant A as Consuming App
  participant X as XFlow
  participant V as Verixet
  participant T as Turnstile

  U->>A: Start signup/login
  A->>T: Render site key in browser
  U->>T: Complete challenge
  T-->>A: Turnstile token
  A->>A: Block in production if public site key missing
  A->>A: Reject if token missing when required
  A->>T: Server validates token with secret
  T-->>A: success/failure
  A->>X: OAuth authorize / handoff with state + returnTo
  X-->>A: callback/code or userinfo
  A->>V: Start/resolve billing or trial handoff
  V-->>A: entitlement/session/billing result
```

Required Turnstile env contract:

- Vite browser apps: `VITE_TURNSTILE_SITE_KEY`
- Next browser apps: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- Server only: `TURNSTILE_SECRET_KEY`
- Development/test mocking only: app-specific mock flags are allowed only outside production.

## Billing And Checkout Flow

```mermaid
sequenceDiagram
  participant A as App
  participant V as Verixet
  participant S as Stripe
  participant X as XFlow

  A->>V: Request plans / billing state
  V-->>A: plan catalog + workspace billing state
  A->>V: Checkout request with appSlug, workspaceId, billingInterval, planSlug
  V->>S: Create checkout session
  S-->>V: checkout session
  V-->>A: checkout URL/session
  S->>V: Signed webhook
  V->>V: Idempotent subscription/entitlement sync
  V->>X: Billing mirror/control-plane event
```

## Entitlement And Usage Flow

```mermaid
sequenceDiagram
  participant A as Consuming App
  participant V as Verixet
  participant W as Work Unit

  A->>V: Evaluate entitlement/admission
  Note over A,V: appSlug, workspaceId, featureKey, planSlug, correlationId, idempotency key
  alt Allowed
    V-->>A: allowed + limit snapshot
    A->>W: Execute paid/credit-consuming work
    A->>V: Ingest usage event
    V-->>A: accepted
  else Denied
    V-->>A: 402 PLAN_LIMIT_EXCEEDED or typed denial
    A-->>A: Do not execute paid work
  end
```

## UCL Linking And Event Flow

```mermaid
sequenceDiagram
  participant A as App
  participant X as XFlow
  participant V as Verixet

  A->>X: Start UCL link
  X-->>A: challenge/connection token
  A->>X: Confirm link with connection proof
  X-->>A: linked status
  A->>X: Emit activation/deployment/usage event
  X->>V: Billing/entitlement mirror as needed
  V-->>X: snapshot/status
```

Token rule:

- Global service tokens are for installation/bootstrap or service-to-service administration only.
- Per-connection/UCL tokens are for workspace/app connection events.
- Usage ingest tokens are app-scoped Verixet tokens.
- Browser code must never receive service tokens, UCL secrets, Stripe secrets, Supabase service-role keys, or Turnstile secrets.

## WordGeni-To-Crevux Flow

```mermaid
sequenceDiagram
  participant W as WordGeni
  participant V as Verixet
  participant C as Crevux

  W->>V: Check visual companion entitlement
  alt Allowed
    W->>C: Create/inspect linked visual companion request
    C->>V: Check media generation entitlement/credits if paid work starts
    C-->>W: result/status
  else Denied
    V-->>W: denied
    W-->>W: Show upgrade/billing path
  end
```

Observed implementation points:

- WordGeni API: `apps/WordGeni/apps/api/src/routes/integrations/crevux.ts`
- WordGeni web: `apps/WordGeni/apps/web/src/components/visual-companion/*`
- Crevux API: `apps/CreVux/artifacts/api-server/src/routes/integrations/wordgeni.ts`

## Failure Mode Diagram

```mermaid
flowchart TD
  Req["Signup/login/contact/paid action"]
  PublicKey{"Browser site key present?"}
  Token{"Turnstile token present?"}
  Secret{"Server secret present?"}
  Verify{"Cloudflare Siteverify success?"}
  Authority{"XFlow/Verixet reachable and authorized?"}
  Work["Execute request"]
  BlockSite["TURNSTILE_SITE_KEY_MISSING"]
  BlockToken["TURNSTILE_TOKEN_MISSING"]
  BlockSecret["TURNSTILE_SECRET_MISSING"]
  BlockVerify["TURNSTILE_VALIDATION_FAILED"]
  BlockAuthority["Authority unavailable/unauthorized"]

  Req --> PublicKey
  PublicKey -- No in production --> BlockSite
  PublicKey -- Yes --> Token
  Token -- No when required --> BlockToken
  Token -- Yes --> Secret
  Secret -- No in production --> BlockSecret
  Secret -- Yes --> Verify
  Verify -- No --> BlockVerify
  Verify -- Yes --> Authority
  Authority -- No --> BlockAuthority
  Authority -- Yes --> Work
```

## Shared Headers And Fields To Standardize

| Field/header | Requirement |
| --- | --- |
| `appSlug` | Lowercase canonical slug from shared contract |
| `sourceApp` | Originating app slug for handoff/events |
| `selectedApp` | Target app slug for signup/app hub flows |
| `workspaceId` | Required for billing, entitlements, usage, UCL events |
| `connectionId` | Required for per-connection UCL events |
| `environment` | `development`, `staging`, or `production` |
| `billingInterval` | Shared enum, including any six-month/yearly claims only if Verixet supports them |
| `planSlug` | Verixet-owned slug |
| `correlationId` | Required in cross-app calls and logs |
| `Idempotency-Key` | Required for usage, checkout, credits, webhooks/replayable operations |
| `Authorization` | Bearer token type must match endpoint: service, UCL connection, usage ingest, or user session |
