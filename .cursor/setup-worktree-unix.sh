#!/usr/bin/env bash
set -euo pipefail

echo "XFlow ecosystem worktree setup"
echo "Root worktree source: ${ROOT_WORKTREE_PATH:-unset}"
echo "This checkout tracks orchestration (docs, scripts, shared packages, supabase, CI)."
echo "Nested apps under apps/ are independent git repos and are not part of this worktree."

copy_env_template() {
  local relative_path="$1"
  if [[ -z "${ROOT_WORKTREE_PATH:-}" ]]; then
    return 0
  fi
  local source_path="${ROOT_WORKTREE_PATH}/${relative_path}"
  local destination_path="./${relative_path}"
  if [[ -f "${source_path}" && ! -e "${destination_path}" ]]; then
    mkdir -p "$(dirname "${destination_path}")"
    cp "${source_path}" "${destination_path}"
    echo "Copied template ${relative_path} (placeholders only)."
  fi
}

copy_env_template ".env.example"
copy_env_template ".env.local.example"
copy_env_template "docs/production-proof/PHASE2F_ENVIRONMENT_VARIABLES.example"

if [[ -f .env ]]; then
  echo "Existing .env detected; leaving it untouched."
fi

if [[ -f package-lock.json ]]; then
  echo "Installing root npm dependencies (orchestration only)."
  npm install
else
  echo "No root package-lock.json; skipping npm install."
fi

echo "Skipping database migrations on purpose. Apply them only as an explicit task step."
echo "Never copy secret .env files from the main checkout into git."
echo "Worktree setup complete."
