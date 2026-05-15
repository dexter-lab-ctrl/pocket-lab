#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

MYSQL_DATADIR="${MYSQL_DATADIR:-$PREFIX/var/lib/mysql}"
MYSQL_SOCKET="${MYSQL_SOCKET:-$PREFIX/var/run/mysqld.sock}"
MYSQL_PIDFILE="${MYSQL_PIDFILE:-$RUN_DIR/mariadb.pid}"
MYSQLD_BIN="${MYSQLD_BIN:-$(command -v mariadbd || command -v mysqld || true)}"
SERVICE_SECRETS_FILE="${SERVICE_SECRETS_FILE:-$STATE_DIR/service-secrets.env}"

ensure_mysql_dirs() {
  ensure_dir_perm "$MYSQL_DATADIR" 700
  ensure_dir_perm "$PREFIX/var/run/mysqld" 755
}

start_mariadb() {
  if pgrep -f "$MYSQLD_BIN.*$MYSQL_SOCKET" >/dev/null 2>&1; then
    log INFO "MariaDB already running"
    return 0
  fi

  log INFO "Starting MariaDB..."

  nohup "$MYSQLD_BIN" \
    --datadir="$MYSQL_DATADIR" \
    --socket="$MYSQL_SOCKET" \
    --skip-networking=0 \
    --bind-address=127.0.0.1 \
    --port=3306 \
    >"$LOG_DIR/mariadb.log" 2>&1 &

  echo $! > "$MYSQL_PIDFILE"
}

db_exec() {
  mariadb --protocol=socket -uroot -S "$MYSQL_SOCKET" "$@"
}

ensure_datadir_initialized() {
  if [[ -d "$MYSQL_DATADIR/mysql" ]]; then
    log INFO "MariaDB datadir already initialized"
    return 0
  fi

  log INFO "Initializing MariaDB datadir..."

  if have mariadb-install-db; then
    mariadb-install-db --datadir="$MYSQL_DATADIR"
  elif have mysql_install_db; then
    mysql_install_db --datadir="$MYSQL_DATADIR"
  else
    die "No MariaDB initialization tool available"
  fi
}

ensure_service_secrets() {
  [[ -f "$SERVICE_SECRETS_FILE" ]] || \
    die "Missing service secrets file: $SERVICE_SECRETS_FILE. Run init-vault.sh first."

  # shellcheck disable=SC1090
  source "$SERVICE_SECRETS_FILE"

  [[ -n "${GITEA_SERVICE_PASS:-}" ]] || \
    die "GITEA_SERVICE_PASS missing"

  [[ -n "${VAULT_ADMIN_PASS:-}" ]] || \
    die "VAULT_ADMIN_PASS missing"
}

configure_schema_and_users() {
  log INFO "Configuring application databases and users"

  db_exec -e "
    CREATE DATABASE IF NOT EXISTS gitea
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
  "

  db_exec -e "
    CREATE USER IF NOT EXISTS 'gitea'@'127.0.0.1'
    IDENTIFIED BY '${GITEA_SERVICE_PASS}';
  "

  db_exec -e "
    GRANT ALL PRIVILEGES ON gitea.* TO 'gitea'@'127.0.0.1';
  "

  db_exec -e "
    CREATE USER IF NOT EXISTS 'vault_admin'@'127.0.0.1'
    IDENTIFIED BY '${VAULT_ADMIN_PASS}';
  "

  db_exec -e "
    GRANT ALL PRIVILEGES ON *.* TO 'vault_admin'@'127.0.0.1'
    WITH GRANT OPTION;
  "

  db_exec -e "FLUSH PRIVILEGES;"
}

register_vault_database_engine() {
  command -v vault >/dev/null 2>&1 || return 0
  [[ -n "${VAULT_TOKEN:-}" ]] || return 0

  export VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"

  if ! vault status >/dev/null 2>&1; then
    log WARN "Vault is unavailable; skipping DB engine registration"
    return 0
  fi

  log INFO "Registering MariaDB database engine in Vault"

  vault login "$VAULT_TOKEN" >/dev/null 2>&1 || true

  vault write database/config/mariadb \
    plugin_name="mysql-database-plugin" \
    allowed_roles="mariadb-role" \
    connection_url="{{username}}:{{password}}@tcp(127.0.0.1:3306)/" \
    username="vault_admin" \
    password="$VAULT_ADMIN_PASS" \
    >/dev/null 2>&1 || true

  vault write database/roles/mariadb-role \
    db_name="mariadb" \
    creation_statements="CREATE USER '{{name}}'@'127.0.0.1' IDENTIFIED BY '{{password}}'; GRANT ALL PRIVILEGES ON *.* TO '{{name}}'@'127.0.0.1';" \
    revocation_statements="DROP USER '{{name}}'@'127.0.0.1';" \
    default_ttl="1h" \
    max_ttl="24h" \
    >/dev/null 2>&1 || true
}

main() {
  ensure_root_dirs

  require_cmd mariadb curl jq

  [[ -n "$MYSQLD_BIN" ]] || \
    die "Unable to locate mariadbd/mysqld"

  ensure_mysql_dirs

  ensure_datadir_initialized

  start_mariadb

  wait_for_tcp 127.0.0.1 3306 60 || \
    die "MariaDB failed to start"

  ensure_service_secrets

  configure_schema_and_users

  register_vault_database_engine

  log INFO "MariaDB is ready with application databases and users"
}

main "$@"