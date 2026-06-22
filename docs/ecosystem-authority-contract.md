# Ecosystem Authority Contract

This contract defines the production ownership boundaries for the six-app ecosystem: XFlow, Verixet, RatAiFy, AudAix, WordGeni, and CreVux.

## Authority Rules

| Area | Authority | Rule |
| --- | --- | --- |
| Login, signup, OAuth | XFlow | Satellites must not own separate production OAuth unless intentionally documented as standalone. |
| Workspace membership | XFlow | Satellites consume workspace context; they do not invent workspace identity. |
| Billing | Verixet | Satellites must not create independent production Stripe checkout, subscription, or billing lifecycle logic. |
| Entitlements | Verixet | Satellites ask Verixet whether a user/workspace can access an app, feature, plan, credit, or limit. |
| Usage limits | Verixet | Satellites report usage and fail closed when Verixet blocks or cannot verify paid access. |
| Central settings | XFlow | Account, security, app access, and billing links route through XFlow and Verixet. |
| App-local settings | Satellite apps | Satellites own only product-specific preferences and local workflow settings. |
| Emails | XFlow aliases | Production sender identity should not sprawl across random product-domain senders. |
| Health/readiness | Each app plus root proof | Every app exposes predictable, sanitized proof signals; root proof validates ecosystem-wide contracts. |

## Non-Negotiable Constraints

- No satellite may solve production auth or billing locally unless the exception is documented with owner, reason, expiry, and compensating controls.
- Paid or limited work must check Verixet before execution and must return clean `401`, `403`, or `402` outcomes instead of raw provider failures.
- Public responses must not expose stack traces, service tokens, Stripe object internals, Supabase service details, env names, Railway identifiers, or database constraint names.
- Browser code must never import or receive service-role clients, service tokens, private signing keys, webhook secrets, or provider API keys.
- Missing required production env must block release proof. User-facing health must be sanitized; admin health may expose internal configuration status behind auth.

## Minimum Per-App Proof Surface

Every app should converge on these script names:

```json
{
  "typecheck": "...",
  "lint": "...",
  "test": "...",
  "build": "...",
  "smoke": "...",
  "verify:env": "...",
  "verify:security": "...",
  "verify:routes": "..."
}
```

Every app should converge on these HTTP surfaces:

- `/api/health`
- `/api/readiness`
- `/api/version`
- `/api/ecosystem/status`
- `/api/ecosystem/auth/handoff`
- `/api/ecosystem/entitlements/current`

Public health responses must be sanitized. Admin proof responses must require auth.

