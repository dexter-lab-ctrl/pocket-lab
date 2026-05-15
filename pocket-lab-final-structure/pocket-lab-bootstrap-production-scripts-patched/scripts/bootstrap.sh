#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

# Day-0 bootstrap is strictly ordered to avoid dependency inversion.
# Each stage may invoke one or more subordinate scripts, but bootstrap.sh
# itself stays orchestration-only.
STAGE_GROUPS=(
  "$SCRIPT_DIR/install-termux-packages.sh"
  "$SCRIPT_DIR/install-proot-ubuntu.sh"
  "$SCRIPT_DIR/install-binaries.sh"
  "$SCRIPT_DIR/init-vault.sh|$SCRIPT_DIR/init-mariadb.sh|$SCRIPT_DIR/start-gitea.sh"
  "$SCRIPT_DIR/seed-gitops-repo.sh"
  "$SCRIPT_DIR/install-tailscale.sh"
  "$SCRIPT_DIR/start-dashboard.sh"
  "$SCRIPT_DIR/smoke-test.sh"
)

usage() {
  cat <<EOF2
Usage: $(basename "$0") [--stage N]

Runs the Day-0 bootstrap sequence for the Pocket Lab edge node.

--stage N   Run only stage N (1..8)
EOF2
}

run_stage() {
  local n="$1"
  local group="${STAGE_GROUPS[$((n-1))]}"
  local script
  IFS='|' read -r -a scripts <<< "$group"
  log INFO "Running stage $n: ${scripts[*]##*/}"
  
  for script in "${scripts[@]}"; do
    if [[ -f "$script" ]]; then
      log INFO "Executing: $script"
      bash "$script"
    else
      log WARN "Script not found: $script. Skipping."
    fi
  done
}

main() {
  local target_stage=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --stage)
        target_stage="$2"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        die "Unknown argument: $1"
        ;;
    esac
  done

  ensure_root_dirs

  if [[ $target_stage -gt 0 ]]; then
    run_stage "$target_stage"
  else
    log INFO "Starting full Day-0 Bootstrap sequence..."
    for i in "${!STAGE_GROUPS[@]}"; do
      run_stage "$((i+1))"
    done
    log INFO "Pocket Lab Day-0 Bootstrap fully complete."
    log INFO "Verify PM2 services with: pm2 status"
  fi
}

main "$@"