#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_CONFIG="${VAULT_CONFIG:-$HOME/vault_config.hcl}"
VAULT_DATA_DIR="${VAULT_DATA_DIR:-$HOME/vault_data}"
VAULT_STATE_DIR="${VAULT_STATE_DIR:-$STATE_DIR/vault}"

ROOT_ARTIFACTS="${ROOT_ARTIFACTS:-$VAULT_STATE_DIR/root.json}"
VAULT_TOKEN_FILE="${VAULT_TOKEN_FILE:-$VAULT_STATE_DIR/root.token}"
UNSEAL_KEY_FILE="${UNSEAL_KEY_FILE:-$VAULT_STATE_DIR/unseal.key}"

SERVICE_SECRETS_FILE="${SERVICE_SECRETS_FILE:-$STATE_DIR/service-secrets.env}"

write_vault_config() {
  cat > "$VAULT_CONFIG" <<EOF
disable_mlock = true
ui = true

api_addr = "${VAULT_ADDR}"

storage "file" {
  path = "${VAULT_DATA_DIR}"
}

listener "tcp" {
  address = "127.0.0.1:8200"
  tls_disable = 1

  # Allow Prometheus/VictoriaMetrics/Grafana Agent scraping
  # Safe because listener is localhost-only
  unauthenticated_metrics_access = true
}

telemetry {
  prometheus_retention_time = "24h"
  disable_hostname = true
}
EOF

  chmod 600 "$VAULT_CONFIG"
}

start_vault() {
  if pgrep -f "vault server -config=${VAULT_CONFIG}" >/dev/null 2>&1; then
    log INFO "Vault already running"
    return 0
  fi

  log INFO "Starting Vault server"

  nohup vault server -config="$VAULT_CONFIG" \
    >"$LOG_DIR/vault.log" 2>&1 &

  echo $! > "$RUN_DIR/vault.pid"
}

ensure_initialized() {
  if curl -fsS "$VAULT_ADDR/v1/sys/init" \
    | jq -e '.initialized == true' >/dev/null 2>&1; then
    log INFO "Vault already initialized"
    return 0
  fi

  log INFO "Initializing Vault"

  vault operator init \
    -key-shares=1 \
    -key-threshold=1 \
    -format=json \
    > "$ROOT_ARTIFACTS"

  chmod 600 "$ROOT_ARTIFACTS"

  jq -r '.unseal_keys_b64[0]' "$ROOT_ARTIFACTS" \
    > "$UNSEAL_KEY_FILE"

  jq -r '.root_token' "$ROOT_ARTIFACTS" \
    > "$VAULT_TOKEN_FILE"

  chmod 600 "$UNSEAL_KEY_FILE" "$VAULT_TOKEN_FILE"
}

ensure_unsealed() {
  local sealed

  sealed="$(vault status -format=json | jq -r '.sealed')"

  if [[ "$sealed" == "false" ]]; then
    log INFO "Vault already unsealed"
    return 0
  fi

  log INFO "Unsealing Vault"

  vault operator unseal \
    "$(cat "$UNSEAL_KEY_FILE")" >/dev/null
}

enable_engines() {
  log INFO "Ensuring secrets engines enabled"

  vault secrets enable -path=secret kv-v2 >/dev/null 2>&1 || true
  vault secrets enable database >/dev/null 2>&1 || true
}

bootstrap_service_secret() {
  mkdir -p "$(dirname "$SERVICE_SECRETS_FILE")"

  if [[ -f "$SERVICE_SECRETS_FILE" ]]; then
    log INFO "Service secrets file already exists"
    return 0
  fi

  local gitea_service_pass
  local gitea_ui_pass
  local vault_admin_pass

  gitea_service_pass="$(
    tr -dc 'a-f0-9' </dev/urandom | head -c 32
  )"

  gitea_ui_pass="$(
    tr -dc 'A-Za-z0-9!@#%_-+=' </dev/urandom | head -c 20
  )"

  vault_admin_pass="$(
    tr -dc 'a-f0-9' </dev/urandom | head -c 32
  )"

  write_secret_file "$SERVICE_SECRETS_FILE" \
    "GITEA_SERVICE_PASS=${gitea_service_pass}" \
    "GITEA_UI_PASS=${gitea_ui_pass}" \
    "VAULT_ADMIN_PASS=${vault_admin_pass}"
}

write_vault_service_secrets() {
  source "$SERVICE_SECRETS_FILE"

  log INFO "Writing bootstrap secrets into Vault"

  vault kv put secret/gitea \
    username="pocket_admin" \
    password="$GITEA_UI_PASS" \
    service_pass="$GITEA_SERVICE_PASS" \
    >/dev/null

  vault kv put secret/platform \
    vault_admin_pass="$VAULT_ADMIN_PASS" \
    >/dev/null
}

main() {
  ensure_root_dirs

  require_cmd vault jq curl pgrep

  ensure_dir_perm "$VAULT_STATE_DIR" 700
  ensure_dir_perm "$VAULT_DATA_DIR" 700

  write_vault_config

  start_vault

  wait_for_http \
    "$VAULT_ADDR/v1/sys/health?standbyok=true&sealedcode=200&uninitcode=200" \
    60 || die "Vault failed to start"

  export VAULT_ADDR

  ensure_initialized

  export VAULT_TOKEN="$(cat "$VAULT_TOKEN_FILE")"

  ensure_unsealed

  vault login "$VAULT_TOKEN" >/dev/null

  enable_engines

  bootstrap_service_secret

  write_vault_service_secrets

  log INFO "Vault initialized and service secrets stored"
  log INFO "Vault metrics available at:"
  log INFO "${VAULT_ADDR}/v1/sys/metrics?format=prometheus"
}

main "$@"