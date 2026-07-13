$ErrorActionPreference = "Stop"

# Codex can remain open after a Windows user environment variable is added.
# Resolve the key at MCP server startup without putting its value in config,
# command-line arguments, output, or the repository.
$key = [Environment]::GetEnvironmentVariable("XFLOW_API_KEY", "Process")
if ([string]::IsNullOrWhiteSpace($key)) {
    $key = [Environment]::GetEnvironmentVariable("XFLOW_API_KEY", "User")
}

if (-not [string]::IsNullOrWhiteSpace($key)) {
    [Environment]::SetEnvironmentVariable("XFLOW_API_KEY", $key, "Process")
}

$serverPath = Join-Path $PSScriptRoot "..\src\server.mjs"
& node $serverPath
exit $LASTEXITCODE
