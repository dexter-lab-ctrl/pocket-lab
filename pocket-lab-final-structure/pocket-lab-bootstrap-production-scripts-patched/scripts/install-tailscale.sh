#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/common.sh"
TAILSCALE_DIR="${TAILSCALE_DIR:-$POCKET_LAB_BASE_DIR/tailscale}"
TAILSCALE_INSTALLER="${TAILSCALE_INSTALLER:-$TAILSCALE_DIR/tailscale_installer.sh}"
TAILSCALE_HOSTNAME="${TAILSCALE_HOSTNAME:-pocket-lab}"
TAILSCALE_AUTHKEY="${TAILSCALE_AUTHKEY:-}"
main() {
  SCRIPT_NAME="install-tailscale.sh"; acquire_lock "$SCRIPT_NAME"; ensure_root_dirs; require_termux; require_cmd curl
  ensure_dir_perm "$TAILSCALE_DIR" 700
  if [[ ! -x "$TAILSCALE_INSTALLER" ]]; then
    log INFO "Fetching Tailscale Termux installer"
    download_file https://raw.githubusercontent.com/bropines/tailscale-termux-cli/main/remote-install.sh "$TAILSCALE_INSTALLER"
    chmod +x "$TAILSCALE_INSTALLER"
  else log INFO "Tailscale installer already present"; fi
  log INFO "Running Tailscale installer/update"
  bash "$TAILSCALE_INSTALLER"
  cat <<EOF | atomic_write "$TAILSCALE_DIR/.env" 0600
TS_SOCKS5_PORT=1055
TAILSCALE_HOSTNAME=${TAILSCALE_HOSTNAME}
EOF
  if have tailscaled-start; then tailscaled-start || log WARN "tailscaled-start returned non-zero"; fi
  sleep 2
  if have tailscale-cli; then
    if tailscale-cli status >/dev/null 2>&1; then log INFO "Tailscale already authenticated"; else
      log INFO "Starting Tailscale enrollment"
      if [[ -n "$TAILSCALE_AUTHKEY" ]]; then tailscale-cli up --hostname="$TAILSCALE_HOSTNAME" --authkey="$TAILSCALE_AUTHKEY" || true; else tailscale-cli up --hostname="$TAILSCALE_HOSTNAME" || true; fi
    fi
  else log WARN "tailscale-cli not available after install; manual enrollment may be required"; fi
  mark_done tailscale_installed
  log INFO "Tailscale script completed safely"
}
main "$@"
