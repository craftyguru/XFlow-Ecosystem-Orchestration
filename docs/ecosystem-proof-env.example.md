# Ecosystem Proof HTTP Environment Template

Configure these as GitHub Actions environment variables or secrets for the protected HTTP smoke job. Do not commit real values.

| Name | Type | Static Required | HTTP Required | Example Format | Safety Notes |
| --- | --- | --- | --- | --- | --- |
| `XFLOW_PROOF_BASE_URL` | GitHub variable | No | Yes | `https://staging-xflow.example.com` | Non-production public origin only. No localhost in CI. |
| `VERIXET_PROOF_BASE_URL` | GitHub variable | No | Yes | `https://staging-verixet.example.com` | Non-production public origin only. Used for non-mutating status checks. |
| `RATAIFY_PROOF_BASE_URL` | GitHub variable | No | Yes | `https://staging-rataify.example.com` | Non-production public origin only. |
| `AUDAIX_PROOF_BASE_URL` | GitHub variable | No | Yes | `https://staging-audaix.example.com` | Non-production public origin only. |
| `WORDGENI_PROOF_BASE_URL` | GitHub variable | No | Yes | `https://staging-wordgeni.example.com` | Non-production public origin only. |
| `CREVUX_PROOF_BASE_URL` | GitHub variable | No | Yes | `https://staging-crevux.example.com` | Non-production public origin only. |
| `VERIXET_PROOF_WORKSPACE_ID` | GitHub variable | No | Yes | UUID | Must identify a real non-production fixture workspace. Do not fake or reuse local numeric IDs. |
| `VERIXET_ECOSYSTEM_STATUS_SERVICE_TOKEN` | GitHub secret | No | Yes | secret value | Server-side service token only. Never print or expose to browser code. |
| `ECOSYSTEM_PROOF_ALLOW_PRODUCTION_HTTP` | GitHub variable | No | No | `false` | Leave unset or `false`. Production HTTP smoke is refused by workflow input policy. |

Local dry-run validation:

```bash
node scripts/phase17-ecosystem-proof.mjs --mode=http --validate-env-only
```

PowerShell shape for local staging smoke:

```powershell
$env:XFLOW_PROOF_BASE_URL="https://staging-xflow.example.com"
$env:VERIXET_PROOF_BASE_URL="https://staging-verixet.example.com"
$env:RATAIFY_PROOF_BASE_URL="https://staging-rataify.example.com"
$env:AUDAIX_PROOF_BASE_URL="https://staging-audaix.example.com"
$env:WORDGENI_PROOF_BASE_URL="https://staging-wordgeni.example.com"
$env:CREVUX_PROOF_BASE_URL="https://staging-crevux.example.com"
$env:VERIXET_ECOSYSTEM_STATUS_SERVICE_TOKEN="***"
$env:VERIXET_PROOF_WORKSPACE_ID="00000000-0000-0000-0000-000000000000"
npm run proof:ecosystem:http
```

Bash shape:

```bash
XFLOW_PROOF_BASE_URL=https://staging-xflow.example.com \
VERIXET_PROOF_BASE_URL=https://staging-verixet.example.com \
RATAIFY_PROOF_BASE_URL=https://staging-rataify.example.com \
AUDAIX_PROOF_BASE_URL=https://staging-audaix.example.com \
WORDGENI_PROOF_BASE_URL=https://staging-wordgeni.example.com \
CREVUX_PROOF_BASE_URL=https://staging-crevux.example.com \
VERIXET_ECOSYSTEM_STATUS_SERVICE_TOKEN=*** \
VERIXET_PROOF_WORKSPACE_ID=00000000-0000-0000-0000-000000000000 \
npm run proof:ecosystem:http
```
