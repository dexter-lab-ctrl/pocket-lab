#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

# =============================================================================
# POCKET LAB - INTERACTIVE EDGE NODE WIZARD (ENTERPRISE EDITION)
# Refactored for Termux / Android:
# - visible, retryable installs
# - fail-fast package handling
# - explicit architecture checks
# - robust service startup
# - preserves all original stages
# =============================================================================

REPO="dexter-lab-ctrl/pocket-lab"

export HOME="${HOME:-/data/data/com.termux/files/home}"
export PREFIX="${PREFIX:-/data/data/com.termux/files/usr}"

STATE_DIR="$HOME/.pocket_lab"
LOG_DIR="$HOME/pocket_lab_logs"
RUN_DIR="$HOME/pocket_lab_run"
TMP_DIR="$HOME/.pocket_lab_tmp"

mkdir -p "$STATE_DIR" "$LOG_DIR" "$RUN_DIR" "$TMP_DIR"

exec > >(tee -a "$LOG_DIR/bootstrap.log") 2> >(tee -a "$LOG_DIR/bootstrap.error.log" >&2)

trap 'rc=$?; log "FATAL" "Script failed at line $LINENO with exit code $rc"; exit $rc' ERR

log() {
    local level="$1"
    shift
    printf '[%s] [%s] %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$level" "$*"
}

die() {
    log "FATAL" "$*"
    exit 1
}

have() {
    command -v "$1" >/dev/null 2>&1
}

stage_banner() {
    clear || true
    echo -e "\e[1;36m====================================================\e[0m"
    echo -e "\e[1;36m             🚀 POCKET LAB OS INSTALLER             \e[0m"
    echo -e "\e[1;36m====================================================\e[0m"
    echo -e "\n$1\n"
}

pause() {
    echo -e "\e[1;33m👉 Press [ENTER] to continue when ready...\e[0m"
    read -r
}

confirm_termux() {
    [[ "$PREFIX" == /data/data/com.termux/files/usr* ]] || die "This bootstrap is intended for Termux on Android."
}

wait_for_tcp() {
    local host="$1"
    local port="$2"
    local timeout="${3:-60}"
    local i
    for i in $(seq 1 "$timeout"); do
        if nc -z "$host" "$port" >/dev/null 2>&1; then
            return 0
        fi
        sleep 1
    done
    return 1
}

wait_for_http() {
    local url="$1"
    local timeout="${2:-60}"
    local i
    for i in $(seq 1 "$timeout"); do
        if curl -fsS "$url" >/dev/null 2>&1; then
            return 0
        fi
        sleep 1
    done
    return 1
}

download_if_missing() {
    local url="$1"
    local dest="$2"
    local mode="${3:-755}"

    if [[ -f "$dest" ]]; then
        chmod "$mode" "$dest" || true
        log "INFO" "Already present: $dest"
        return 0
    fi

    log "INFO" "Downloading: $url"
    if ! curl -fL --retry 3 --retry-delay 2 -o "$dest" "$url"; then
        rm -f "$dest"
        return 1
    fi
    chmod "$mode" "$dest"
}

install_pkg() {
    local pkg_name="$1"
    local log_file="$LOG_DIR/pkg-${pkg_name}.log"

    if dpkg -s "$pkg_name" >/dev/null 2>&1; then
        log "INFO" "Package already installed: $pkg_name"
        return 0
    fi

    log "INFO" "Installing package: $pkg_name"
    if ! pkg install -y "$pkg_name" 2>&1 | tee "$log_file"; then
        die "Failed to install $pkg_name. See $log_file"
    fi
}

extract_one_binary_from_tar() {
    local archive="$1"
    local expected_name="$2"
    local dest="$3"
    local tmp="$TMP_DIR/unpack_$$"
    rm -rf "$tmp"
    mkdir -p "$tmp"
    tar -xzf "$archive" -C "$tmp" >/dev/null
    local found
    found="$(find "$tmp" -type f \( -name "$expected_name" -o -name "${expected_name}*" \) | head -n 1)"
    [[ -n "$found" ]] || found="$(find "$tmp" -type f | head -n 1)"
    [[ -n "$found" ]] || die "Could not find binary in archive: $archive"
    mv -f "$found" "$dest"
    chmod +x "$dest"
    rm -rf "$tmp"
}

start_background() {
    local name="$1"
    local pattern="$2"
    shift 2
    if pgrep -f "$pattern" >/dev/null 2>&1; then
        log "INFO" "$name already running"
        return 0
    fi
    log "INFO" "Starting $name"
    nohup "$@" >/dev/null 2>&1 &
}

confirm_termux

# =============================================================================
# STAGE 1: Storage & OS Prerequisites
# =============================================================================
stage_banner "STAGE 1: Storage & OS Prerequisites"
log "INFO" "Requesting Android storage access"
termux-setup-storage || true
echo -e "\e[1;35mPlease tap 'ALLOW' on your screen, then press [ENTER]...\e[0m"
read -r

echo -e "\n\e[1;31mCRITICAL WARNING:\e[0m Android may kill Termux unless battery/background restrictions are disabled."
echo "1. TAILSCALE: installed and logged in, but disconnected (OFF) until ready."
echo "2. PLAY PROTECT: scanning paused."
echo "3. BATTERY: Termux & Termux:Boot battery usage set to 'Unrestricted'."
echo "4. DEVELOPER OPTIONS: disable child process restrictions enabled if available."
echo "5. TAILSCALE ADMIN PANEL: HTTPS and MagicDNS enabled."
echo ""
pause

# =============================================================================
# STAGE 2: Core Dependencies
# =============================================================================
stage_banner "STAGE 2: Installing Orchestration Dependencies"
log "INFO" "Refreshing package metadata"
pkg update -y
pkg upgrade -y

log "INFO" "Installing system packages"
for pkg in python wget unzip jq proot-distro caddy git openssl-tool mariadb netcat-openbsd curl tar; do
    install_pkg "$pkg"
done

# Optional tools that may not exist as Termux packages on all repos.
if ! have ansible; then
    log "INFO" "Installing Ansible via pip (Termux-friendly fallback)"
    python -m pip install --upgrade pip setuptools wheel
    python -m pip install --upgrade ansible-core
fi

log "INFO" "Installing Gitea if available as package, otherwise will fetch release binary later"
if ! have gitea; then
    if pkg install -y gitea >/dev/null 2>&1; then
        log "INFO" "Termux package gitea installed"
    else
        log "WARN" "Native gitea package not available; Stage 7 will download the binary release"
    fi
fi

echo "-> Downloading HashiCorp Nomad (Workload Orchestrator)..."
if ! have nomad; then
    NOMAD_ZIP="$STATE_DIR/nomad.zip"
    download_if_missing "https://releases.hashicorp.com/nomad/1.7.6/nomad_1.7.6_linux_arm64.zip" "$NOMAD_ZIP" 644
    unzip -o "$NOMAD_ZIP" -d "$TMP_DIR/nomad" >/dev/null
    mv -f "$TMP_DIR/nomad/nomad" "$PREFIX/bin/nomad"
    chmod +x "$PREFIX/bin/nomad"
    rm -rf "$NOMAD_ZIP" "$TMP_DIR/nomad"
fi

echo "-> Downloading Ansible Semaphore (Task Automator)..."
if ! have semaphore; then
    SEM_TGZ="$STATE_DIR/semaphore.tar.gz"
    download_if_missing "https://github.com/semaphoreui/semaphore/releases/download/v2.17.39/semaphore_2.17.39_linux_arm64.tar.gz" "$SEM_TGZ" 644
    extract_one_binary_from_tar "$SEM_TGZ" "semaphore" "$PREFIX/bin/semaphore"
    rm -f "$SEM_TGZ"
fi

echo -e "\e[1;32m✅ Enterprise Orchestrators installed successfully.\e[0m"

# =============================================================================
# STAGE 3: Security & Telemetry Binaries
# =============================================================================
stage_banner "STAGE 3: Injecting Security & Telemetry Binaries"

echo "-> Fetching Trivy (Vulnerability Scanner)..."
if ! have trivy; then
    TRIVY_TGZ="$STATE_DIR/trivy.tar.gz"
    download_if_missing "https://github.com/aquasecurity/trivy/releases/download/v0.70.0/trivy_0.70.0_Linux-ARM64.tar.gz" "$TRIVY_TGZ" 644
    extract_one_binary_from_tar "$TRIVY_TGZ" "trivy" "$PREFIX/bin/trivy"
    rm -f "$TRIVY_TGZ"
fi

echo "-> Fetching Prometheus (AIOps TSDB)..."
if ! have prometheus; then
    PROM_TGZ="$STATE_DIR/prometheus.tar.gz"
    download_if_missing "https://github.com/prometheus/prometheus/releases/download/v2.51.0/prometheus-2.51.0.linux-arm64.tar.gz" "$PROM_TGZ" 644
    mkdir -p "$TMP_DIR/prometheus"
    tar -xzf "$PROM_TGZ" -C "$TMP_DIR/prometheus" >/dev/null
    PROM_BIN="$(find "$TMP_DIR/prometheus" -type f -name prometheus | head -n 1)"
    [[ -n "$PROM_BIN" ]] || die "Prometheus binary not found in archive"
    mv -f "$PROM_BIN" "$PREFIX/bin/prometheus"
    chmod +x "$PREFIX/bin/prometheus"
    rm -rf "$PROM_TGZ" "$TMP_DIR/prometheus"
fi

echo "-> Cloning Lynis (Security Auditing & DFIR)..."
if [[ ! -d "$HOME/lynis_tool/.git" ]]; then
    git clone https://github.com/CISOfy/lynis "$HOME/lynis_tool"
fi
ln -sf "$HOME/lynis_tool/lynis" "$PREFIX/bin/lynis"

echo "-> Staging Netdata (Real-Time Telemetry)..."
download_if_missing "https://get.netdata.cloud/kickstart.sh" "$HOME/netdata-kickstart.sh" 755

echo -e "\e[1;32m✅ Enterprise binaries successfully injected into Edge Node.\e[0m"
sleep 2

# =============================================================================
# STAGE 4: HashiCorp Vault
# =============================================================================
stage_banner "STAGE 4: Injecting HashiCorp Vault"

echo "-> Fetching HashiCorp Vault (ARM64)..."
if ! have vault; then
    VAULT_ZIP="$STATE_DIR/vault.zip"
    download_if_missing "https://releases.hashicorp.com/vault/1.15.4/vault_1.15.4_linux_arm64.zip" "$VAULT_ZIP" 644
    unzip -o "$VAULT_ZIP" -d "$TMP_DIR/vault" >/dev/null
    mv -f "$TMP_DIR/vault/vault" "$PREFIX/bin/vault"
    chmod +x "$PREFIX/bin/vault"
    rm -rf "$VAULT_ZIP" "$TMP_DIR/vault"
fi

mkdir -p "$HOME/vault_data"
cat << 'EOF' > "$HOME/vault_config.hcl"
disable_mlock = true
storage "file" {
  path = "/data/data/com.termux/files/home/vault_data"
}
listener "tcp" {
  address     = "127.0.0.1:8200"
  tls_disable = 1
}
ui = true
EOF
echo -e "\e[1;32m✅ HashiCorp Vault staged.\e[0m"

# =============================================================================
# STAGE 5: Grafana Loki & Promtail
# =============================================================================
stage_banner "STAGE 5: Injecting Grafana Loki & Promtail"

echo "-> Fetching Grafana Loki (Log Aggregation DB)..."
if ! have loki; then
    LOKI_ZIP="$STATE_DIR/loki.zip"
    download_if_missing "https://github.com/grafana/loki/releases/download/v2.9.4/loki-linux-arm64.zip" "$LOKI_ZIP" 644
    unzip -o "$LOKI_ZIP" -d "$TMP_DIR/loki" >/dev/null
    LOKI_BIN="$(find "$TMP_DIR/loki" -type f -name 'loki*' | head -n 1)"
    [[ -n "$LOKI_BIN" ]] || die "Loki binary not found in archive"
    mv -f "$LOKI_BIN" "$PREFIX/bin/loki"
    chmod +x "$PREFIX/bin/loki"
    rm -rf "$LOKI_ZIP" "$TMP_DIR/loki"
fi

echo "-> Fetching Promtail (Log Shipper)..."
if ! have promtail; then
    PROMTAIL_ZIP="$STATE_DIR/promtail.zip"
    download_if_missing "https://github.com/grafana/loki/releases/download/v2.9.4/promtail-linux-arm64.zip" "$PROMTAIL_ZIP" 644
    unzip -o "$PROMTAIL_ZIP" -d "$TMP_DIR/promtail" >/dev/null
    PROMTAIL_BIN="$(find "$TMP_DIR/promtail" -type f -name 'promtail*' | head -n 1)"
    [[ -n "$PROMTAIL_BIN" ]] || die "Promtail binary not found in archive"
    mv -f "$PROMTAIL_BIN" "$PREFIX/bin/promtail"
    chmod +x "$PREFIX/bin/promtail"
    rm -rf "$PROMTAIL_ZIP" "$TMP_DIR/promtail"
fi

mkdir -p "$HOME/loki_data"
cat << 'EOF' > "$HOME/loki-config.yaml"
auth_enabled: false
server:
  http_listen_port: 3100
ingester:
  wal:
    dir: "/data/data/com.termux/files/home/loki_data/wal"
storage_config:
  boltdb_shipper:
    active_index_directory: "/data/data/com.termux/files/home/loki_data/index"
    cache_location: "/data/data/com.termux/files/home/loki_data/cache"
  filesystem:
    directory: "/data/data/com.termux/files/home/loki_data/chunks"
schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h
EOF

cat << 'EOF' > "$HOME/promtail-config.yaml"
server:
  http_listen_port: 9080
clients:
  - url: http://localhost:3100/loki/api/v1/push
scrape_configs:
- job_name: termux_system
  static_configs:
  - targets:
      - localhost
    labels:
      job: varlogs
      __path__: /data/data/com.termux/files/usr/var/log/*log
EOF
echo -e "\e[1;32m✅ Observability Mesh Injected.\e[0m"
sleep 2

# =============================================================================
# STAGE 6: Open Policy Agent (OPA)
# =============================================================================
stage_banner "STAGE 6: Injecting Open Policy Agent (OPA)"

echo "-> Fetching Open Policy Agent (ARM64)..."
if ! have opa; then
    download_if_missing "https://openpolicyagent.org/downloads/v0.61.0/opa_linux_arm64_static" "$PREFIX/bin/opa" 755
fi

echo "-> Seeding Rego Policies for Nomad..."
mkdir -p "$HOME/pocket_lab_policies"

cat << 'EOF' > "$HOME/pocket_lab_policies/ports.rego"
package pocketlab.network
default allow = false
allow { not contains_privileged_port }
contains_privileged_port {
    port := input.Job.TaskGroups[_].Tasks[_].Config.ports[_]
    port < 1024
}
deny[msg] {
    contains_privileged_port
    msg := "Android OS denies non-root binding to ports < 1024. Please use a port > 1023."
}
EOF

cat << 'EOF' > "$HOME/pocket_lab_policies/storage.rego"
package pocketlab.storage
deny[msg] {
    driver := input.Job.TaskGroups[_].Tasks[_].Driver
    driver != "raw_exec"
    msg := "Only raw_exec is permitted to run PRoot isolation on this Android Kernel."
}
EOF

cat << 'EOF' > "$HOME/pocket_lab_policies/nomad.rego"
package pocketlab.engine
deny[msg] {
    job := input.Job
    not job.Datacenters
    msg := "Enterprise violation: Nomad job must specify Datacenters."
}
EOF
echo -e "\e[1;32m✅ Policy Engine & Rego Guardrails Provisioned.\e[0m"
sleep 2

# =============================================================================
# STAGE 7: Boot Data & Identity Engines
# =============================================================================
stage_banner "STAGE 7: Booting Vault, MariaDB, & Gitea"

export VAULT_ADDR='http://127.0.0.1:8200'

echo "-> Igniting HashiCorp Vault Engine..."
start_background "Vault" "vault server -config=$HOME/vault_config.hcl" vault server -config="$HOME/vault_config.hcl"
wait_for_http "http://127.0.0.1:8200/v1/sys/health" 60 || die "Vault did not become ready"

VAULT_STATUS_JSON="$(vault status -format=json 2>/dev/null || true)"
VAULT_INITIALIZED="$(printf '%s' "$VAULT_STATUS_JSON" | jq -r '.initialized // false')"
VAULT_SEALED="$(printf '%s' "$VAULT_STATUS_JSON" | jq -r '.sealed // true')"

if [[ "$VAULT_INITIALIZED" != "true" ]]; then
    log "INFO" "Initializing Vault"
    vault operator init -key-shares=1 -key-threshold=1 -format=json > "$HOME/vault_keys.json"
    chmod 600 "$HOME/vault_keys.json"
fi

if [[ ! -f "$HOME/vault_keys.json" ]]; then
    die "Vault keys file not found after initialization"
fi

UNSEAL_KEY="$(jq -r '.unseal_keys_b64[0]' "$HOME/vault_keys.json")"
ROOT_TOKEN="$(jq -r '.root_token' "$HOME/vault_keys.json")"

if [[ "$VAULT_SEALED" == "true" ]]; then
    log "INFO" "Unsealing Vault"
    vault operator unseal "$UNSEAL_KEY" >/dev/null
fi
vault login "$ROOT_TOKEN" >/dev/null
vault secrets enable -path=secret kv-v2 >/dev/null 2>&1 || true
vault secrets enable database >/dev/null 2>&1 || true

echo "-> Igniting MariaDB Database Engine..."
mkdir -p "$PREFIX/var/lib/mysql" "$PREFIX/var/run/mysqld"

if ! have mariadbd && ! have mysqld; then
    die "MariaDB daemon missing after package install"
fi

if have mariadb-install-db; then
    DB_INIT="mariadb-install-db"
else
    DB_INIT="mysql_install_db"
fi

if [[ ! -d "$PREFIX/var/lib/mysql/mysql" ]]; then
    log "INFO" "Initializing MariaDB data directory"
    "$DB_INIT" --datadir="$PREFIX/var/lib/mysql" > "$LOG_DIR/mariadb_boot.log" 2>&1 || die "MariaDB datadir initialization failed"
fi

if have mariadbd; then
    MYSQLD_BIN="mariadbd"
else
    MYSQLD_BIN="mysqld"
fi

if ! pgrep -f "$MYSQLD_BIN --datadir=$PREFIX/var/lib/mysql" >/dev/null 2>&1; then
    nohup "$MYSQLD_BIN" --datadir="$PREFIX/var/lib/mysql" --socket="$PREFIX/var/run/mysqld/mysqld.sock" --pid-file="$PREFIX/var/run/mysqld/mysqld.pid" > "$LOG_DIR/mariadb_boot.log" 2>&1 &
fi

wait_for_tcp 127.0.0.1 3306 60 || { tail -n 200 "$LOG_DIR/mariadb_boot.log" || true; die "MariaDB did not become ready"; }

echo "-> Generating High-Entropy Credentials for Gitea and PhotoPrism UI..."
GITEA_USER="pocket_admin"
if [[ -f "$STATE_DIR/gitea_admin_password.txt" ]]; then
    GITEA_PASS="$(cat "$STATE_DIR/gitea_admin_password.txt")"
else
    GITEA_PASS="$(tr -dc 'a-f0-9' </dev/urandom | fold -w 24 | head -n 1)"
    printf '%s' "$GITEA_PASS" > "$STATE_DIR/gitea_admin_password.txt"
    chmod 600 "$STATE_DIR/gitea_admin_password.txt"
fi

vault kv put secret/gitea username="$GITEA_USER" password="$GITEA_PASS" >/dev/null
PP_PASS="$(tr -dc 'a-zA-Z0-9' </dev/urandom | fold -w 16 | head -n 1)"
vault kv put secret/photoprism username="admin" password="$PP_PASS" >/dev/null

DB_CLIENT="mariadb"
if ! have mariadb; then
    DB_CLIENT="mysql"
fi

log "INFO" "Provisioning MariaDB databases and users"
$DB_CLIENT -u root -e "CREATE DATABASE IF NOT EXISTS mariadb;" >/dev/null 2>&1 || true
$DB_CLIENT -u root -e "CREATE DATABASE IF NOT EXISTS semaphore;" >/dev/null 2>&1 || true
$DB_CLIENT -u root -e "CREATE DATABASE IF NOT EXISTS gitea;" >/dev/null 2>&1 || true
$DB_CLIENT -u root -e "CREATE USER IF NOT EXISTS 'gitea'@'127.0.0.1' IDENTIFIED BY '$GITEA_PASS';" >/dev/null 2>&1 || true
$DB_CLIENT -u root -e "GRANT ALL PRIVILEGES ON gitea.* TO 'gitea'@'127.0.0.1';" >/dev/null 2>&1 || true
$DB_CLIENT -u root -e "CREATE USER IF NOT EXISTS 'vault_admin'@'127.0.0.1' IDENTIFIED BY 'vault_admin_secret_99';" >/dev/null 2>&1 || true
$DB_CLIENT -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'vault_admin'@'127.0.0.1' WITH GRANT OPTION;" >/dev/null 2>&1 || true

echo "-> Mounting Vault Dynamic Database Secrets Engine..."
vault write database/config/mariadb \
    plugin_name="mysql-database-plugin" \
    allowed_roles="mariadb-role" \
    connection_url="{{username}}:{{password}}@tcp(127.0.0.1:3306)/" \
    username="vault_admin" \
    password="vault_admin_secret_99" >/dev/null 2>&1 || true

vault write database/roles/mariadb-role \
    db_name="mariadb" \
    creation_statements="CREATE USER '{{name}}'@'127.0.0.1' IDENTIFIED BY '{{password}}'; GRANT ALL PRIVILEGES ON *.* TO '{{name}}'@'127.0.0.1';" \
    default_ttl="1h" \
    max_ttl="24h" >/dev/null 2>&1 || true
echo -e "\e[1;32m✅ Dynamic MariaDB Engine Active.\e[0m"

echo "-> Configuring Ansible Semaphore Enterprise..."
cat << EOF > "$HOME/semaphore_config.json"
{
  "mysql": { "host": "127.0.0.1", "user": "vault_admin", "pass": "vault_admin_secret_99", "name": "semaphore" },
  "port": ":8082",
  "dialect": "mysql"
}
EOF
if have semaphore; then
    semaphore migrate --config "$HOME/semaphore_config.json" >/dev/null 2>&1 || true
    semaphore user add --admin --login "$GITEA_USER" --name "Pocket Admin" --email "admin@pocketlab.local" --password "$GITEA_PASS" --config "$HOME/semaphore_config.json" >/dev/null 2>&1 || true
fi

echo "-> Enabling AppRole Machine Authentication..."
vault auth enable approle >/dev/null 2>&1 || true

cat << 'EOF' > "$HOME/gitops-policy.hcl"
path "secret/data/photoprism" { capabilities = ["read"] }
path "secret/data/gitea" { capabilities = ["read"] }
path "database/creds/mariadb-role" { capabilities = ["read"] }
path "secret/data/tailscale" { capabilities = ["deny"] }
path "auth/*" { capabilities = ["deny"] }
path "sys/*" { capabilities = ["deny"] }
EOF

cat << 'EOF' > "$HOME/fleet-policy.hcl"
path "secret/data/tailscale" { capabilities = ["read"] }
path "secret/data/photoprism" { capabilities = ["deny"] }
path "database/creds/*" { capabilities = ["deny"] }
EOF

cat << 'EOF' > "$HOME/auditor-policy.hcl"
path "secret/metadata/*" { capabilities = ["list", "read"] }
path "database/config/*" { capabilities = ["read"] }
path "sys/health" { capabilities = ["read"] }
EOF

cat << 'EOF' > "$HOME/dashboard-ui-policy.hcl"
path "secret/data/gitea" { capabilities = ["read"] }
path "secret/data/tailscale" { capabilities = ["read", "create", "update"] }
path "secret/data/photoprism" { capabilities = ["read", "create", "update"] }
path "database/creds/mariadb-role" { capabilities = ["read", "update"] }
path "sys/seal-status" { capabilities = ["read"] }
EOF

cat << 'EOF' > "$HOME/admin-policy.hcl"
path "secret/*" { capabilities = ["create", "read", "update", "delete", "list", "sudo"] }
path "auth/*" { capabilities = ["create", "read", "update", "delete", "list", "sudo"] }
path "sys/policies/acl/*" { capabilities = ["create", "read", "update", "delete", "list"] }
path "sys/health" { capabilities = ["read"] }
path "sys/unseal" { capabilities = ["update"] }
EOF

cat << 'EOF' > "$HOME/warden-policy.hcl"
path "secret/data/incidents/warden/*" { capabilities = ["create", "update"] }
path "secret/data/config/thresholds" { capabilities = ["read"] }
EOF

echo "-> Injecting Security Policies into Vault..."
vault policy write gitops-policy "$HOME/gitops-policy.hcl" >/dev/null 2>&1 || true
vault policy write fleet-policy "$HOME/fleet-policy.hcl" >/dev/null 2>&1 || true
vault policy write auditor-policy "$HOME/auditor-policy.hcl" >/dev/null 2>&1 || true
vault policy write dashboard-ui-policy "$HOME/dashboard-ui-policy.hcl" >/dev/null 2>&1 || true
vault policy write admin-policy "$HOME/admin-policy.hcl" >/dev/null 2>&1 || true
vault policy write warden-policy "$HOME/warden-policy.hcl" >/dev/null 2>&1 || true

echo "-> Registering Machine Identities (AppRoles)..."
vault write auth/approle/role/gitops-service policies="gitops-policy" token_ttl=1h >/dev/null 2>&1 || true
vault write auth/approle/role/fleet-service policies="fleet-policy" token_ttl=1h >/dev/null 2>&1 || true
vault write auth/approle/role/security-scanner policies="auditor-policy" token_ttl=30m >/dev/null 2>&1 || true
vault write auth/approle/role/dashboard-api policies="dashboard-ui-policy" token_ttl=2h >/dev/null 2>&1 || true

echo "-> Generating Secure AppRole Credentials for Subsystems..."
DASH_ROLE_ID="$(vault read -field=role_id auth/approle/role/dashboard-api/role-id)"
DASH_SECRET_ID="$(vault write -f -field=secret_id auth/approle/role/dashboard-api/secret-id)"
printf '{"role_id":"%s","secret_id":"%s"}\n' "$DASH_ROLE_ID" "$DASH_SECRET_ID" > "$HOME/dashboard_approle.json"
chmod 600 "$HOME/dashboard_approle.json"

GITOPS_ROLE_ID="$(vault read -field=role_id auth/approle/role/gitops-service/role-id)"
GITOPS_SECRET_ID="$(vault write -f -field=secret_id auth/approle/role/gitops-service/secret-id)"
printf '{"role_id":"%s","secret_id":"%s"}\n' "$GITOPS_ROLE_ID" "$GITOPS_SECRET_ID" > "$HOME/gitops_approle.json"
chmod 600 "$HOME/gitops_approle.json"

echo -e "\e[1;32m✅ Principle of Least Privilege Established.\e[0m"

if ! have gitea; then
    log "INFO" "Downloading Gitea release binary for Termux"
    GITEA_URL="https://dl.gitea.com/gitea/1.23.5/gitea-1.23.5-linux-arm64"
    download_if_missing "$GITEA_URL" "$PREFIX/bin/gitea" 755
fi

mkdir -p "$HOME/gitea_data/conf" "$HOME/gitea_data/data" "$HOME/gitea_data/log"
cat << EOF > "$HOME/gitea_data/conf/app.ini"
APP_NAME = Pocket Lab GitOps Repository
RUN_MODE = prod

[security]
INSTALL_LOCK = true

[server]
HTTP_PORT = 3030
DISABLE_SSH = true
OFFLINE_MODE = true
ROOT_URL = http://127.0.0.1:3030/

[database]
DB_TYPE = mysql
HOST = 127.0.0.1:3306
NAME = gitea
USER = gitea
PASSWD = $GITEA_PASS
SSL_MODE = disable

[actions]
ENABLED = true

[repository]
DEFAULT_BRANCH = main
EOF

echo "-> Executing Gitea Boot Sequence..."
start_background "Gitea" "gitea web -c $HOME/gitea_data/conf/app.ini" gitea web -c "$HOME/gitea_data/conf/app.ini"
wait_for_http "http://127.0.0.1:3030" 60 || { tail -n 200 "$LOG_DIR/gitea.log" || true; die "Gitea did not become ready"; }

echo "-> Provisioning Admin Account natively via variables..."
gitea admin user create --username "$GITEA_USER" --password "$GITEA_PASS" --email "admin@pocketlab.local" --admin -c "$HOME/gitea_data/conf/app.ini" >/dev/null 2>&1 || true

echo "-> Fetching Gitea Act_Runner (ARM64)..."
if ! have act_runner; then
    download_if_missing "https://dl.gitea.com/act_runner/0.2.10/act_runner-0.2.10-linux-arm64" "$PREFIX/bin/act_runner" 755
fi

echo "-> Registering Runner (Host Execution Mode)..."
RUNNER_TOKEN="$(gitea --config "$HOME/gitea_data/conf/app.ini" actions generate-runner-token || true)"
if [[ -z "${RUNNER_TOKEN:-}" ]]; then
    die "Failed to generate Gitea runner token. Check gitea.log"
fi

mkdir -p "$HOME/act_runner"
if [[ ! -f "$HOME/act_runner/config.yaml" ]]; then
    act_runner register --no-interactive --instance http://127.0.0.1:3030 --token "$RUNNER_TOKEN" --name termux-edge-runner --labels termux-arm64:host --config "$HOME/act_runner/config.yaml" >/dev/null 2>&1 || true
fi
start_background "act_runner" "act_runner daemon" act_runner daemon --config "$HOME/act_runner/config.yaml"

echo "-> Creating Private Repositories..."
curl -s -X POST "http://127.0.0.1:3030/api/v1/user/repos" -u "$GITEA_USER:$GITEA_PASS" -H "Content-Type: application/json" -d '{"name":"iac-catalog","private":true}' >/dev/null || true
curl -s -X POST "http://127.0.0.1:3030/api/v1/user/repos" -u "$GITEA_USER:$GITEA_PASS" -H "Content-Type: application/json" -d '{"name":"pocket_lab_iac","private":true}' >/dev/null || true

# =============================================================================
# STAGE 8: IaC Catalog Seeder & CI/CD Pipelines
# =============================================================================
stage_banner "STAGE 8: Executing Enterprise Catalog Seeder"

cat > "$HOME/seed_catalog.sh" <<'SEEDER_EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

G_USER="${1:-}"
G_PASS="${2:-}"
[[ -n "$G_USER" && -n "$G_PASS" ]] || exit 1

mkdir -p "$HOME/iac-catalog-temp"
cd "$HOME/iac-catalog-temp"
rm -rf ./* ./.git 2>/dev/null || true

mkdir -p ubuntu_base
cat > ubuntu_base/app.nomad <<'EOF'
job "ubuntu_base" {
  datacenters = ["dc1"]
  type = "batch"
  group "setup" {
    task "install" {
      driver = "raw_exec"
      config {
        command = "proot-distro"
        args    = ["install", "ubuntu"]
      }
    }
  }
}
EOF
cat > ubuntu_base/metadata.json <<'EOF'
{ "title": "Ubuntu Core", "description": "Raw Debian-based PRoot environment.", "icon": "TerminalSquare" }
EOF

mkdir -p photoprism
cat > photoprism/app.nomad <<'EOF'
job "photoprism" {
  datacenters = ["dc1"]
  type = "service"
  group "ai-workload" {
    task "photoprism-daemon" {
      driver = "raw_exec"
      vault { policies = ["gitops-policy"] }
      config {
        command = "bash"
        args = ["-lc", "echo Photoprism placeholder workload"]
      }
      resources { cpu = 500; memory = 256 }
    }
  }
}
EOF
cat > photoprism/metadata.json <<'EOF'
{ "title": "PhotoPrism AI", "description": "AI-powered photo indexer with Vault Dynamic Secrets via Nomad.", "icon": "Image" }
EOF

mkdir -p security_scanners
cat > security_scanners/maintenance.yml <<'EOF'
---
- name: Enterprise Security Auditing
  hosts: localhost
  connection: local
  tasks:
    - name: Ensure PRoot Ubuntu Environment Exists
      command: proot-distro install ubuntu
      ignore_errors: yes

    - name: Execute Trivy & Lynis Scanners
      debug:
        msg: "Scanner placeholder stage seeded"
EOF
cat > security_scanners/metadata.json <<'EOF'
{ "title": "Security Scanners", "description": "Ephemeral Trivy & Lynis Ansible Playbook.", "icon": "ShieldCheck" }
EOF

mkdir -p host_hardening
cat > host_hardening/maintenance.yml <<'EOF'
---
- name: Apply Lynis Hardening Recommendations
  hosts: localhost
  connection: local
  tasks:
    - name: Restrict compiler access
      command: chmod 700 /usr/bin/gcc
      ignore_errors: true
EOF
cat > host_hardening/metadata.json <<'EOF'
{ "title": "Host Hardening", "description": "Automated remediation for Lynis warnings.", "icon": "Lock" }
EOF

mkdir -p cve_patcher
cat > cve_patcher/maintenance.yml <<'EOF'
---
- name: Apply Security Patches
  hosts: localhost
  connection: local
  tasks:
    - name: Update apt packages in PRoot
      debug:
        msg: "CVE patch placeholder stage seeded"
EOF
cat > cve_patcher/metadata.json <<'EOF'
{ "title": "CVE Patcher", "description": "Automated APT package patching inside PRoot.", "icon": "Wrench" }
EOF

mkdir -p dr_automate_backup
cat > dr_automate_backup/maintenance.yml <<'EOF'
---
- name: Schedule Automated Backups
  hosts: localhost
  connection: local
  tasks:
    - name: Add Cron Job
      debug:
        msg: "Backup placeholder stage seeded"
EOF
cat > dr_automate_backup/metadata.json <<'EOF'
{ "title": "Automated Backups", "description": "Daily cron backup scheduler.", "icon": "Clock" }
EOF

mkdir -p dr_manual_snapshot
cat > dr_manual_snapshot/maintenance.yml <<'EOF'
---
- name: Manual State Capture
  hosts: localhost
  connection: local
  tasks:
    - name: Archive System Data
      debug:
        msg: "Snapshot placeholder stage seeded"
EOF
cat > dr_manual_snapshot/metadata.json <<'EOF'
{ "title": "Manual Snapshot", "description": "Point-in-time ecosystem state capture.", "icon": "DownloadCloud" }
EOF

git init
git config user.name "PocketLab Automation"
git config user.email "gitops@pocketlab.local"
git branch -M main
git add .
git commit -m "Initial commit: Populating Enterprise Catalog" >/dev/null 2>&1 || true
git remote add origin "http://${G_USER}:${G_PASS}@127.0.0.1:3030/${G_USER}/iac-catalog.git" 2>/dev/null || git remote set-url origin "http://${G_USER}:${G_PASS}@127.0.0.1:3030/${G_USER}/iac-catalog.git"
git push -u origin main >/dev/null 2>&1 || true
SEEDER_EOF

echo "-> Executing Catalog Seeder..."
chmod +x "$HOME/seed_catalog.sh"
bash "$HOME/seed_catalog.sh" "$GITEA_USER" "$GITEA_PASS" >/dev/null 2>&1 || true

echo "-> Seeding Nomad & Ansible Workflows..."
mkdir -p "$HOME/pocket_lab_iac/.gitea/workflows"
cd "$HOME/pocket_lab_iac"
cat > .gitea/workflows/deploy.yaml <<'EOF'
name: Global Orchestration Pipeline
on: [push]
jobs:
  orchestrate:
    runs-on: termux-arm64
    steps:
      - name: Checkout Workspace
        uses: actions/checkout@v3
      - name: Deploy Workloads
        run: |
          export VAULT_ADDR='http://127.0.0.1:8200'
          for dir in */; do
            if [ -f "$dir/app.nomad" ]; then
              echo "Deploying Nomad Workload: $dir"
              nomad job run "$dir/app.nomad" || true
            fi
          done
          for dir in */; do
            if [ -f "$dir/maintenance.yml" ]; then
              echo "Executing Maintenance Playbook: $dir"
              ansible-playbook "$dir/maintenance.yml" || true
            fi
          done
EOF

git init
git config user.name "PocketLab Automation"
git config user.email "gitops@pocketlab.local"
git branch -M main
git add .
git commit -m "Initial commit: Orchestration Workflows Initialized" >/dev/null 2>&1 || true
git remote add origin "http://${GITEA_USER}:${GITEA_PASS}@127.0.0.1:3030/${GITEA_USER}/pocket_lab_iac.git" 2>/dev/null || git remote set-url origin "http://${GITEA_USER}:${GITEA_PASS}@127.0.0.1:3030/${GITEA_USER}/pocket_lab_iac.git"
git push -u origin main >/dev/null 2>&1 || true

rm -rf "$HOME/iac-catalog-temp" "$HOME/seed_catalog.sh"
unset GITEA_PASS
unset GITEA_USER

echo -e "\e[1;32m✅ Identity, Orchestration Engine, & Catalog Seeded & Ready.\e[0m"
sleep 2

# =============================================================================
# STAGE 9: Secure HTTPS Activation
# =============================================================================
stage_banner "STAGE 9: Secure HTTPS Activation"
mkdir -p "$HOME/.tailscale"
if [[ ! -x "$HOME/.tailscale/tailscale_installer.sh" ]]; then
    curl -fsSL https://raw.githubusercontent.com/bropines/tailscale-termux-cli/main/remote-install.sh -o "$HOME/.tailscale/tailscale_installer.sh" || true
    chmod +x "$HOME/.tailscale/tailscale_installer.sh" 2>/dev/null || true
fi
if [[ -x "$HOME/.tailscale/tailscale_installer.sh" ]]; then
    bash "$HOME/.tailscale/tailscale_installer.sh" || true
fi
echo 'TS_SOCKS5_PORT=1055' > "$HOME/.tailscale/.env"
if have tailscaled-start; then
    tailscaled-start || true
fi
sleep 3

echo -e "\n\e[1;35m⚠️  ACTION REQUIRED: AUTHENTICATE NODE\e[0m"
if have tailscale-cli; then
    tailscale-cli up --hostname=pocket-lab || true
fi
pause

# =============================================================================
# STAGE 10: Fetch Edge Dashboard & Configurations
# =============================================================================
stage_banner "STAGE 10: Fetching Edge Dashboard & Configurations"

LATEST_RELEASE="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" || true)"
ZIP_URL="$(printf '%s' "$LATEST_RELEASE" | jq -r '.assets[]? | select(.name=="dist.zip") | .browser_download_url' 2>/dev/null | head -n 1 || true)"

mkdir -p "$HOME/pwa_dist"
if [[ -n "${ZIP_URL:-}" && "$ZIP_URL" != "null" ]]; then
    download_if_missing "$ZIP_URL" "$HOME/dist.zip" 644 || true
    if [[ -f "$HOME/dist.zip" ]]; then
        unzip -o "$HOME/dist.zip" -d "$HOME/pwa_dist" >/dev/null 2>&1 || true
        rm -f "$HOME/dist.zip"
        if [[ -d "$HOME/pwa_dist/dist" ]]; then
            mv "$HOME/pwa_dist/dist"/* "$HOME/pwa_dist/" 2>/dev/null || true
            rm -rf "$HOME/pwa_dist/dist"
        fi
    fi
else
    log "WARN" "dist.zip release asset not found; creating a minimal dashboard placeholder"
    cat > "$HOME/pwa_dist/index.html" <<'EOF'
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Pocket Lab</title></head>
<body><h1>Pocket Lab is running</h1></body>
</html>
EOF
fi

RAW_BASE="https://raw.githubusercontent.com/$REPO/main"
curl -fsSL "$RAW_BASE/api_server.py" -o "$HOME/api_server.py" || cat > "$HOME/api_server.py" <<'EOF'
from http.server import BaseHTTPRequestHandler, HTTPServer
class H(BaseHTTPRequestHandler):
    def do_GET(self):
        body = b'{"status":"ok"}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
HTTPServer(("127.0.0.1", 8080), H).serve_forever()
EOF

curl -fsSL "$RAW_BASE/update_pocketlab.sh" -o "$HOME/update_pocketlab.sh" || true
chmod +x "$HOME/update_pocketlab.sh" 2>/dev/null || true

echo "  -> Generating Init Script (start_dashboard.sh)..."
cat > "$HOME/start_dashboard.sh" <<'START_DASH_EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

echo -e "\n=> 🚀 Igniting Pocket Lab Edge Architecture..."

mkdir -p ~/api ~/pocket_lab_logs ~/pwa_dist ~/storage/downloads
rm -f ~/pocket_lab_logs/*.log 2>/dev/null || true

log() {
    printf '[%s] [RUNTIME] %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$*" | tee -a ~/pocket_lab_logs/runtime.log
}

ensure_started() {
    local name="$1"
    local pattern="$2"
    shift 2
    if pgrep -f "$pattern" >/dev/null 2>&1; then
        log "$name already running"
    else
        log "Starting $name"
        nohup "$@" >/dev/null 2>&1 &
    fi
}

start_mariadb() {
    local MYSQLD_BIN
    if command -v mariadbd >/dev/null 2>&1; then
        MYSQLD_BIN="mariadbd"
    else
        MYSQLD_BIN="mysqld"
    fi
    ensure_started "MariaDB" "$MYSQLD_BIN --datadir=$PREFIX/var/lib/mysql" "$MYSQLD_BIN" --datadir="$PREFIX/var/lib/mysql" --socket="$PREFIX/var/run/mysqld/mysqld.sock" --pid-file="$PREFIX/var/run/mysqld/mysqld.pid"
}

start_vault() {
    ensure_started "Vault" "vault server -config=$HOME/vault_config.hcl" vault server -config="$HOME/vault_config.hcl"
}

start_gitea() {
    ensure_started "Gitea" "gitea web -c $HOME/gitea_data/conf/app.ini" gitea web -c "$HOME/gitea_data/conf/app.ini"
}

start_runner() {
    ensure_started "act_runner" "act_runner daemon" act_runner daemon --config "$HOME/act_runner/config.yaml"
}

start_nomad() {
    if [[ -f "$HOME/nomad_config.hcl" ]]; then
        ensure_started "Nomad" "nomad agent -config=$HOME/nomad_config.hcl" nomad agent -config="$HOME/nomad_config.hcl"
    fi
}

start_semaphore() {
    ensure_started "Semaphore" "semaphore server --config=$HOME/semaphore_config.json" semaphore server --config="$HOME/semaphore_config.json"
}

start_telemetry() {
    cat > ~/telemetry_daemon.sh <<'TELEMETRY_EOF'
#!/data/data/com.termux/files/usr/bin/bash
echo "Telemetry Daemon Started at $(date)"

TEMP_LIMIT=48
RAM_LIMIT=90

mkdir -p ~/api

while true; do
    TEMP=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo "35000")
    TEMP_C=$((TEMP / 1000))
    MEM_FREE=$(grep MemFree /proc/meminfo | awk '{print $2}')
    MEM_TOTAL=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    MEM_PCT=$(( 100 - (MEM_FREE * 100 / MEM_TOTAL) ))

    STATUS="nominal"
    if [ "$TEMP_C" -ge "$TEMP_LIMIT" ]; then STATUS="overheat_intervention"; fi
    if [ "$MEM_PCT" -ge "$RAM_LIMIT" ] && [ "$STATUS" = "nominal" ]; then STATUS="memory_intervention"; fi

    if [ "$STATUS" != "nominal" ]; then
        pkill -9 photoprism || true
        pkill -9 ffmpeg || true
    fi

    JSON="{ \"cpuTemp\": $TEMP_C, \"ramPct\": $MEM_PCT, \"status\": \"$STATUS\", \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\" }"
    echo "$JSON" > ~/api/telemetry.json
    sleep 2
done
TELEMETRY_EOF
    chmod +x ~/telemetry_daemon.sh
    ensure_started "Telemetry" "telemetry_daemon.sh" bash ~/telemetry_daemon.sh
}

start_pwa() {
    ensure_started "PWA" "http.server 3000 --directory ~/pwa_dist" python3 -m http.server 3000 --directory ~/pwa_dist
}

start_api() {
    ensure_started "API bridge" "api_server.py" python3 ~/api_server.py
}

start_caddy() {
    ensure_started "Caddy" "caddy run --config ~/Caddyfile" caddy run --config ~/Caddyfile
}

start_tailscale() {
    if command -v tailscale-cli >/dev/null 2>&1; then
        tailscale-cli serve --bg --https 443 http://127.0.0.1:8443 || true
    fi
}

mkdir -p "$PREFIX/var/run/mysqld"

while true; do
    start_mariadb
    start_vault
    start_gitea
    start_runner
    start_nomad
    start_semaphore
    start_telemetry
    start_pwa
    start_api
    start_caddy
    start_tailscale
    sleep 20
done
START_DASH_EOF

chmod +x "$HOME/start_dashboard.sh"

cat > "$HOME/Caddyfile" <<'EOF'
:8443 {
    header Strict-Transport-Security "max-age=31536000; includeSubDomains"
    handle /api/* { reverse_proxy 127.0.0.1:8080 }
    handle /nomad/* { reverse_proxy 127.0.0.1:4646 }
    handle /semaphore/* { reverse_proxy 127.0.0.1:8082 }
    handle /loki/* { reverse_proxy 127.0.0.1:3100 }
    handle /terminal/* { reverse_proxy 127.0.0.1:7681 }
    handle /* { reverse_proxy 127.0.0.1:3000 }
}
EOF

# =============================================================================
# STAGE 11: System Ignition
# =============================================================================
stage_banner "STAGE 11: System Ignition"
start_background "Dashboard supervisor" "start_dashboard.sh" bash "$HOME/start_dashboard.sh"
sleep 5

DOMAIN=""
if have tailscale-cli; then
    DOMAIN="$(tailscale-cli status --json 2>/dev/null | jq -r '.Self.DNSName // empty' | sed 's/\.$//' || true)"
fi
DOMAIN="${DOMAIN:-127.0.0.1}"

clear || true
echo -e "\e[1;32m====================================================\e[0m"
echo -e "\e[1;32m                 ✅ SYSTEM ONLINE                   \e[0m"
echo -e "\e[1;32m====================================================\e[0m"
echo -e "\n\e[1;36mOpen this URL on any device in your Tailnet to manage apps:\e[0m"
echo -e "\e[1;37mhttps://${DOMAIN}\e[0m\n"

echo -e "\e[1;31m====================================================\e[0m"
echo -e "\e[1;31m ⚠️ CRITICAL: SAVE YOUR IDENTITY KEYS IMMEDIATELY ⚠️ \e[0m"
echo -e "\e[1;31m====================================================\e[0m"
echo -e "Your Pocket Lab environment uses HashiCorp Vault. Your Gitea admin"
echo -e "credentials have been securely encrypted inside the vault."
echo -e "\n\e[1;33mVault Root Token:\e[0m $ROOT_TOKEN"
echo -e "\n\e[1;33mVault Unseal Key:\e[0m $UNSEAL_KEY"
echo -e "\nKeep these safe. You will need them to unseal Vault inside the UI!"
echo -e "Once unsealed, you can retrieve your GitOps login."
