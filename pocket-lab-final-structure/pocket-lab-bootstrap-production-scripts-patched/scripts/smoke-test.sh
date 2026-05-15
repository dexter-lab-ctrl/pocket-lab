#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
GITEA_URL="${GITEA_URL:-http://127.0.0.1:3030}"
DASHBOARD_URL="${DASHBOARD_URL:-http://127.0.0.1:8443}"

main() {
  ensure_root_dirs
  require_cmd curl jq
  local failures=0

  check() {
    local name="$1"; shift
    if "$@"; then
      log INFO "PASS: $name"
    else
      log ERROR "FAIL: $name"
      failures=$((failures+1))
    fi
  }

  check "Vault health" curl -fsS "${VAULT_ADDR}/v1/sys/health?standbyok=true"
  check "Vault status JSON" bash -lc "vault status -format=json | jq -e '.initialized == true'"
  check "Gitea HTTP" curl -fsS "$GITEA_URL"
  check "Dashboard HTTP" curl -fsS "$DASHBOARD_URL"
  check "MariaDB socket" bash -lc "mariadb --protocol=socket -uroot -S '$PREFIX/var/run/mysqld/mysqld.sock' -e 'SELECT 1;' >/dev/null"
  check "Gitea API auth" bash -lc '
    if [[ -f "$HOME/.pocket_lab/service-secrets.env" ]]; then
      source "$HOME/.pocket_lab/service-secrets.env"
      curl -fsS -u "pocket_admin:${GITEA_UI_PASS}" "'"$GITEA_URL"'/api/v1/version" >/dev/null
    else
      exit 1
    fi
  '

  if command -v tailscale-cli >/dev/null 2>&1; then
    check "Tailscale status" tailscale-cli status >/dev/null 2>&1
  fi

  if (( failures > 0 )); then
    die "$failures smoke test(s) failed"
  fi
  log INFO "All smoke tests passed"
}

main "$@"
