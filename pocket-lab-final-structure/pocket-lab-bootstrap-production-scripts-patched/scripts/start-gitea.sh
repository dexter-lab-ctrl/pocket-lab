#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

GITEA_HOME="${GITEA_HOME:-$HOME/gitea_data}"
GITEA_CONF_DIR="$GITEA_HOME/conf"
GITEA_RUNTIME_CONF="$GITEA_CONF_DIR/app.runtime.ini"
GITEA_BASE_CONF="$GITEA_CONF_DIR/app.ini"

GITEA_HTTP_PORT="${GITEA_HTTP_PORT:-3030}"
GITEA_ADMIN_USER="${GITEA_ADMIN_USER:-pocket_admin}"

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
SERVICE_SECRETS_FILE="${SERVICE_SECRETS_FILE:-$STATE_DIR/service-secrets.env}"

ACT_RUNNER_HOME="${ACT_RUNNER_HOME:-$HOME/act_runner}"
ACT_RUNNER_CONFIG="$ACT_RUNNER_HOME/config.yaml"

ensure_config() {
  mkdir -p \
    "$GITEA_CONF_DIR" \
    "$GITEA_HOME/data" \
    "$GITEA_HOME/log"

  if [[ ! -f "$GITEA_BASE_CONF" ]]; then
    log INFO "Creating base Gitea configuration..."

    cat > "$GITEA_BASE_CONF" <<EOF
APP_NAME = Pocket Lab GitOps Repository
RUN_MODE = prod

[security]
INSTALL_LOCK = true
SECRET_KEY = $(tr -dc A-Za-z0-9 </dev/urandom | head -c 64)

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

    chmod 600 "$GITEA_BASE_CONF"
  fi
}

get_service_pass() {
  local pass=""

  if command -v vault >/dev/null 2>&1 && vault status >/dev/null 2>&1; then
    export VAULT_ADDR

    pass="$(vault kv get -field=service_pass secret/gitea 2>/dev/null || true)"

    if [[ -n "$pass" ]]; then
      printf '%s' "$pass"
      return 0
    fi
  fi

  if [[ -f "$SERVICE_SECRETS_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$SERVICE_SECRETS_FILE"

    if [[ -n "${GITEA_SERVICE_PASS:-}" ]]; then
      printf '%s' "$GITEA_SERVICE_PASS"
      return 0
    fi
  fi

  return 1
}

get_ui_pass() {
  local pass=""

  if command -v vault >/dev/null 2>&1 && vault status >/dev/null 2>&1; then
    export VAULT_ADDR

    pass="$(vault kv get -field=password secret/gitea 2>/dev/null || true)"

    if [[ -n "$pass" ]]; then
      printf '%s' "$pass"
      return 0
    fi
  fi

  if [[ -f "$SERVICE_SECRETS_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$SERVICE_SECRETS_FILE"

    if [[ -n "${GITEA_UI_PASS:-}" ]]; then
      printf '%s' "$GITEA_UI_PASS"
      return 0
    fi
  fi

  return 1
}

build_runtime_config() {
  local pass="$1"

  log INFO "Building runtime Gitea configuration..."

  cp -f "$GITEA_BASE_CONF" "$GITEA_RUNTIME_CONF"

  python3 - "$GITEA_RUNTIME_CONF" "$pass" <<'PY'
import configparser
import sys

cfg_path = sys.argv[1]
password = sys.argv[2]

config = configparser.RawConfigParser()
config.read(cfg_path)

if "database" not in config:
    config["database"] = {}

config["database"]["PASSWD"] = password

with open(cfg_path, "w") as f:
    config.write(f)
PY

  chmod 600 "$GITEA_RUNTIME_CONF"
}

start_gitea_pm2() {
  log INFO "Starting Gitea via PM2..."

  if pm2 describe gitea >/dev/null 2>&1; then
    log INFO "Restarting existing Gitea PM2 process..."
    pm2 restart gitea --update-env
  else
    pm2 start gitea \
      --name "gitea" \
      -- web -c "$GITEA_RUNTIME_CONF"
  fi
}

bootstrap_admin_user() {
  local ui_pass="$1"

  log INFO "Ensuring Gitea admin user exists..."

  gitea admin user create \
    --username "$GITEA_ADMIN_USER" \
    --password "$ui_pass" \
    --email "admin@pocketlab.local" \
    --admin \
    -c "$GITEA_RUNTIME_CONF" \
    >/dev/null 2>&1 || true
}

bootstrap_repos() {
  local ui_pass="$1"

  local base="http://127.0.0.1:${GITEA_HTTP_PORT}"
  local auth="${GITEA_ADMIN_USER}:${ui_pass}"

  log INFO "Bootstrapping GitOps repositories..."

  for repo in iac-catalog pocket_lab_iac; do
    curl -fsS \
      -u "$auth" \
      -H "Content-Type: application/json" \
      -d "{\"name\":\"$repo\",\"private\":true}" \
      "$base/api/v1/user/repos" \
      >/dev/null 2>&1 || true
  done
}

configure_act_runner() {
  log INFO "Configuring act_runner..."

  mkdir -p "$ACT_RUNNER_HOME"

  cd "$ACT_RUNNER_HOME"

  if [[ ! -f "$ACT_RUNNER_CONFIG" ]]; then
    log INFO "Generating default act_runner config..."

    act_runner generate-config > "$ACT_RUNNER_CONFIG"

    sed -i \
      's/network: ""/network: "host"/g' \
      "$ACT_RUNNER_CONFIG"
  fi
}

start_act_runner_pm2() {
  log INFO "Starting act_runner via PM2..."

  cd "$ACT_RUNNER_HOME"

  if pm2 describe gitea-runner >/dev/null 2>&1; then
    log INFO "Restarting existing act_runner PM2 process..."
    pm2 restart gitea-runner --update-env
  else
    pm2 start act_runner \
      --name "gitea-runner" \
      -- daemon -c "$ACT_RUNNER_CONFIG"
  fi
}

save_pm2_state() {
  log INFO "Saving PM2 process list..."
  pm2 save
}

main() {
  ensure_root_dirs

  require_cmd \
    gitea \
    curl \
    jq \
    pm2 \
    python3 \
    act_runner

  ensure_config

  local service_pass
  service_pass="$(get_service_pass)"

  [[ -n "$service_pass" ]] \
    || die "Unable to determine Gitea service password"

  build_runtime_config "$service_pass"

  start_gitea_pm2

  wait_for_http \
    "http://127.0.0.1:${GITEA_HTTP_PORT}" \
    90 \
    || die "Gitea failed to start"

  local ui_pass
  ui_pass="$(get_ui_pass)"

  [[ -n "$ui_pass" ]] \
    || die "Unable to determine Gitea UI password"

  bootstrap_admin_user "$ui_pass"

  bootstrap_repos "$ui_pass"

  configure_act_runner

  start_act_runner_pm2

  save_pm2_state

  log INFO "Gitea and act_runner are fully operational."
}

main "$@"