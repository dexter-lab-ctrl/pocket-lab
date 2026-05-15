#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

TAILSCALE_DIR="${TAILSCALE_DIR:-$HOME/.tailscale}"
TAILSCALE_INSTALLER="${TAILSCALE_INSTALLER:-$TAILSCALE_DIR/tailscale_installer.sh}"
TAILSCALE_HOSTNAME="${TAILSCALE_HOSTNAME:-pocket-lab}"

main() {
  ensure_root_dirs
  mkdir -p "$TAILSCALE_DIR"

  if [[ ! -x "$TAILSCALE_INSTALLER" ]]; then
    log INFO "Fetching Tailscale Termux installer"
    curl -fsSL https://raw.githubusercontent.com/bropines/tailscale-termux-cli/main/remote-install.sh -o "$TAILSCALE_INSTALLER"
    chmod +x "$TAILSCALE_INSTALLER"
  fi

  log INFO "Installing / updating Tailscale in Termux"
  bash "$TAILSCALE_INSTALLER"

  echo 'TS_SOCKS5_PORT=1055' > "$TAILSCALE_DIR/.env"

  if have tailscaled-start; then
    log INFO "Starting tailscaled"
    tailscaled-start || true
  fi

  sleep 3

  if have tailscale-cli; then
    log INFO "Awaiting interactive auth for node enrollment"
    tailscale-cli up --hostname="$TAILSCALE_HOSTNAME" || true
  else
    log WARN "tailscale-cli not available after install; manual enrollment may be required"
  fi
}

main "$@"
