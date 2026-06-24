# Architecture Map

The ecosystem architecture is a governed hub-and-spoke model. XFlow coordinates app identity and workflow state, Verixet validates execution and release authority, and each core app owns its product domain.

```mermaid
flowchart TB
  User["User / operator / reviewer"]
  X["XFlow<br/>identity, workspace, app catalog, orchestration"]
  V["Verixet<br/>release gate, validation, entitlement, metering"]
  R["Rataify<br/>trust and risk workflows"]
  A["AudAiX<br/>audit evidence workflows"]
  C["Crevux<br/>creative asset workflows"]
  W["WordGeni<br/>writing and research workflows"]
  Docs["Central ecosystem docs<br/>governance and release model"]

  User --> X
  User --> V
  User --> R
  User --> A
  User --> C
  User --> W
  X <--> V
  X <--> R
  X <--> A
  X <--> C
  X <--> W
  V --> R
  V --> A
  V --> C
  V --> W
  Docs --> X
  Docs --> V
  Docs --> R
  Docs --> A
  Docs --> C
  Docs --> W
```

## Boundary Model

| Boundary | Owner | Status |
| --- | --- | --- |
| Identity and workspace coordination | XFlow | implemented |
| App catalog and connection posture | XFlow | implemented |
| Release validation and execution gate | Verixet | implemented |
| Billing, entitlement, and usage authority | Verixet | implemented |
| Trust/risk domain data | Rataify | implemented |
| Audit/evidence domain data | AudAiX | implemented |
| Creative asset domain data | Crevux | implemented |
| Writing/research domain data | WordGeni | implemented |
| Production deployment proof for the six core apps | Cross-app | needs verification |

## Data And Control Flow

```mermaid
sequenceDiagram
  participant Reviewer
  participant App as Product app
  participant XFlow
  participant Verixet

  Reviewer->>App: Review app README, run local checks
  App->>XFlow: Report or consume ecosystem identity and connection state
  App->>Verixet: Request entitlement, usage, or release validation
  Verixet-->>App: Allow, deny, or record gated action
  XFlow-->>Reviewer: Show ecosystem posture where configured
```

## Architecture Principles

- Keep authority boundaries explicit.
- Prefer local-safe verification before live checks.
- Do not duplicate billing, identity, or release authority inside satellite apps.
- Document unverified production claims as needs verification.
- Treat each core app as a standalone product with a clear ecosystem role.
