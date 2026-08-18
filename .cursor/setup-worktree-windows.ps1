$ErrorActionPreference = 'Stop'

Write-Host "XFlow ecosystem worktree setup"
Write-Host "Root worktree source: $env:ROOT_WORKTREE_PATH"
Write-Host "This checkout tracks orchestration (docs, scripts, shared packages, supabase, CI)."
Write-Host "Nested apps under apps/ are independent git repos and are not part of this worktree."

function Copy-EnvTemplate {
  param(
    [Parameter(Mandatory = $true)][string]$RelativePath
  )

  if (-not $env:ROOT_WORKTREE_PATH) {
    return
  }

  $source = Join-Path $env:ROOT_WORKTREE_PATH $RelativePath
  $destination = Join-Path (Get-Location) $RelativePath
  if ((Test-Path -LiteralPath $source) -and -not (Test-Path -LiteralPath $destination)) {
    $parent = Split-Path -Parent $destination
    if ($parent -and -not (Test-Path -LiteralPath $parent)) {
      New-Item -ItemType Directory -Path $parent | Out-Null
    }
    Copy-Item -LiteralPath $source -Destination $destination
    Write-Host "Copied template $RelativePath (placeholders only)."
  }
}

Copy-EnvTemplate '.env.example'
Copy-EnvTemplate '.env.local.example'
Copy-EnvTemplate 'docs/production-proof/PHASE2F_ENVIRONMENT_VARIABLES.example'

if (Test-Path -LiteralPath '.env') {
  Write-Host "Existing .env detected; leaving it untouched."
}

if (Test-Path -LiteralPath 'package-lock.json') {
  Write-Host "Installing root npm dependencies (orchestration only)."
  npm install
} else {
  Write-Host "No root package-lock.json; skipping npm install."
}

Write-Host "Skipping database migrations on purpose. Apply them only as an explicit task step."
Write-Host "Never copy secret .env files from the main checkout into git."
Write-Host "Worktree setup complete."
