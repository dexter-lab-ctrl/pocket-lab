#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

main() {
  ensure_root_dirs
  require_cmd pkg dpkg curl jq git sed awk

  export DEBIAN_FRONTEND=noninteractive

  log INFO "Updating Termux package metadata..."
  yes "" | pkg update -y
  yes "" | pkg upgrade -y

  log INFO "Installing core Termux + system packages..."

  local packages=(
    python
    nodejs
    wget
    unzip
    jq
    curl
    proot-distro
    caddy
    git
    mariadb
    openssl
    ncurses-utils
    util-linux
    ncurses
    coreutils
    moreutils
    termux-api
    ca-certificates
    gnupg
    tar
    gzip
    xz-utils
    shadow
    procps
    gitea
  )

  for pkg in "${packages[@]}"; do
    ensure_pkg_installed "$pkg"
  done

  # Optional networking tool
  if ! have nc; then
    ensure_pkg_installed netcat-openbsd || true
  fi

  log INFO "Ensuring PM2 is installed (global Node.js orchestrator)..."

  if ! command -v pm2 >/dev/null 2>&1; then
    if ! command -v npm >/dev/null 2>&1; then
      log ERROR "npm not found; Node.js installation may be broken."
      exit 1
    fi

    npm install -g pm2
    log INFO "PM2 installed successfully."
  else
    log INFO "PM2 already installed."
  fi

  log INFO "All Termux packages and tooling installed and verified."
}

main "$@"