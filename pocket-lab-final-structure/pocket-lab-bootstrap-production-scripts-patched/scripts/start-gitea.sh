#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/common.sh"
GITEA_HOME="${GITEA_HOME:-$POCKET_LAB_GITEA_DIR}"; GITEA_CONF_DIR="$GITEA_HOME/conf"; GITEA_RUNTIME_CONF="$GITEA_CONF_DIR/app.runtime.ini"; GITEA_BASE_CONF="$GITEA_CONF_DIR/app.ini"
GITEA_HTTP_PORT="${GITEA_HTTP_PORT:-3030}"; GITEA_ADMIN_USER="${GITEA_ADMIN_USER:-pocket_admin}"; VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
SERVICE_SECRETS_FILE="${SERVICE_SECRETS_FILE:-$STATE_DIR/service-secrets.env}"; ACT_RUNNER_HOME="${ACT_RUNNER_HOME:-$POCKET_LAB_GITEA_RUNNERS_DIR}"; ACT_RUNNER_CONFIG="$ACT_RUNNER_HOME/config.yaml"

ensure_config() {
  mkdir -p "$GITEA_CONF_DIR" "$GITEA_HOME/data" "$GITEA_HOME/log"
  if [[ ! -f "$GITEA_BASE_CONF" ]]; then
    log INFO "Creating base Gitea config"
    local secret; secret="$(tr -dc A-Za-z0-9 </dev/urandom | head -c 64)"
    cat <<EOF | atomic_write "$GITEA_BASE_CONF" 0600
APP_NAME = Pocket Lab GitOps Repository
RUN_MODE = prod
[security]
INSTALL_LOCK = true
SECRET_KEY = ${secret}
[server]
HTTP_PORT = ${GITEA_HTTP_PORT}
DISABLE_SSH = true
OFFLINE_MODE = true
ROOT_URL = http://127.0.0.1:${GITEA_HTTP_PORT}/
[database]
DB_TYPE = mysql
HOST = 127.0.0.1:3306
NAME = gitea
USER = gitea
PASSWD =
SSL_MODE = disable
EOF
  else log INFO "Base Gitea config already exists"; fi
}
get_secret() {
  local field="$1" env_name="$2" val=""
  if have vault && vault status >/dev/null 2>&1; then export VAULT_ADDR; val="$(vault kv get -field="$field" secret/gitea 2>/dev/null || true)"; fi
  if [[ -z "$val" && -f "$SERVICE_SECRETS_FILE" ]]; then # shellcheck disable=SC1090
  source "$SERVICE_SECRETS_FILE"; val="${!env_name:-}"; fi
  printf '%s' "$val"
}
build_runtime_config() {
  local pass="$1"; cp -f "$GITEA_BASE_CONF" "$GITEA_RUNTIME_CONF"
  python3 - "$GITEA_RUNTIME_CONF" "$pass" <<'PYCFG'
import configparser, sys
path, password = sys.argv[1], sys.argv[2]
cfg = configparser.RawConfigParser(); cfg.optionxform=str; cfg.read(path)
if 'database' not in cfg: cfg['database']={}
cfg['database']['PASSWD'] = password
with open(path, 'w') as f: cfg.write(f)
PYCFG
  chmod 600 "$GITEA_RUNTIME_CONF"
}
start_gitea_pm2() { pm2_start_or_restart gitea gitea -- web -c "$GITEA_RUNTIME_CONF"; }
bootstrap_admin_user() { local ui_pass="$1"; log INFO "Ensuring Gitea admin user"; gitea admin user create --username "$GITEA_ADMIN_USER" --password "$ui_pass" --email admin@pocketlab.local --admin -c "$GITEA_RUNTIME_CONF" >/dev/null 2>&1 || true; }
bootstrap_repos() {
  local ui_pass="$1"
  local base="http://127.0.0.1:${GITEA_HTTP_PORT}"
  local auth="${GITEA_ADMIN_USER}:${ui_pass}"
  local repo status
  for repo in iac-catalog pocket_lab_iac; do
    status="$(curl -s -o /dev/null -w '%{http_code}' -u "$auth" -H 'Content-Type: application/json' -d "{\"name\":\"$repo\",\"private\":true}" "$base/api/v1/user/repos" || true)"
    if [[ "$status" == "201" || "$status" == "409" ]]; then
      log INFO "Repository ready: $repo"
    else
      log WARN "Could not ensure repo $repo; HTTP $status"
    fi
  done
}
configure_act_runner() {
  mkdir -p "$ACT_RUNNER_HOME"; cd "$ACT_RUNNER_HOME"
  if [[ ! -s "$ACT_RUNNER_CONFIG" ]]; then act_runner generate-config > "$ACT_RUNNER_CONFIG"; sed -i 's/network: ""/network: "host"/g' "$ACT_RUNNER_CONFIG" || true; else log INFO "act_runner config already exists"; fi
}
start_act_runner_pm2() { pm2_start_or_restart gitea-runner act_runner -- daemon -c "$ACT_RUNNER_CONFIG"; }
main() {
  SCRIPT_NAME="start-gitea.sh"; acquire_lock "$SCRIPT_NAME"; ensure_root_dirs; require_termux; require_cmd gitea curl jq pm2 python3 act_runner
  ensure_config
  local service_pass ui_pass; service_pass="$(get_secret service_pass GITEA_SERVICE_PASS)"; ui_pass="$(get_secret password GITEA_UI_PASS)"
  [[ -n "$service_pass" ]] || die "Unable to determine Gitea DB service password"; [[ -n "$ui_pass" ]] || die "Unable to determine Gitea UI password"
  build_runtime_config "$service_pass"; start_gitea_pm2
  wait_for_http "http://127.0.0.1:${GITEA_HTTP_PORT}" 90 || die "Gitea failed to start"
  bootstrap_admin_user "$ui_pass"; bootstrap_repos "$ui_pass"; configure_act_runner; start_act_runner_pm2; pm2 save >/dev/null || true
  mark_done gitea_ready
  log INFO "Gitea and act_runner are ready and safe to rerun"
}
main "$@"
