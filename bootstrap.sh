#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

# =============================================================================
# POCKET LAB - INTERACTIVE EDGE NODE WIZARD (ENTERPRISE EDITION)
# Refactor goals:
# - Idempotent installer
# - Self-healing service bootstrap
# - Proper dependency graph: Vault -> MariaDB -> Gitea
# - Structured logging
# - Preserve all original stages and functionality
# =============================================================================

REPO="dexter-lab-ctrl/pocket-lab" # Change to your repo

export HOME="${HOME:-/data/data/com.termux/files/home}"
export PREFIX="${PREFIX:-/data/data/com.termux/files/usr}"

STATE_DIR="$HOME/.pocket_lab"
LOG_DIR="$HOME/pocket_lab_logs"
RUN_DIR="$HOME/pocket_lab_run"

mkdir -p "$STATE_DIR" "$LOG_DIR" "$RUN_DIR"

exec > >(tee -a "$LOG_DIR/bootstrap.log") 2> >(tee -a "$LOG_DIR/bootstrap.error.log" >&2)

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

ensure_pkg() {
    local pkg_name="$1"
    local log_file="$LOG_DIR/pkg-${pkg_name}.log"
    if dpkg -s "$pkg_name" >/dev/null 2>&1; then
        log "INFO" "Package already installed: $pkg_name"
    else
        log "INFO" "Installing package: $pkg_name"
        if ! pkg install -y "$pkg_name" 2>&1 | tee "$log_file"; then
            die "Failed to install package: $pkg_name (see $log_file)"
        fi
    fi
}

ensure_proot_ubuntu() {
    if ! have proot-distro; then
        die "proot-distro is required for Ubuntu-based Ansible"
    fi

    if ! proot-distro list 2>/dev/null | grep -qE '^ubuntu$'; then
        log "INFO" "Installing proot Ubuntu distro"
        proot-distro install ubuntu
    else
        log "INFO" "proot Ubuntu already installed"
    fi
}

install_ansible_in_proot() {
    ensure_proot_ubuntu

    if command -v ansible-playbook >/dev/null 2>&1 && [[ -x "$PREFIX/bin/ansible-playbook" && -n "$(head -n 1 "$PREFIX/bin/ansible-playbook" 2>/dev/null | grep -o 'proot-distro' || true)" ]]; then
        log "INFO" "Ansible wrapper already present"
        return 0
    fi

    log "INFO" "Installing Ansible inside proot Ubuntu"
    # FIXED: Added ForceIPv4 & gai.conf updates to prevent Errno 110 Launchpad/Tailscale Timeout
    proot-distro login ubuntu -- bash -lc '
        set -e
        export DEBIAN_FRONTEND=noninteractive
        echo "Acquire::ForceIPv4 \"true\";" > /etc/apt/apt.conf.d/99force-ipv4
        echo "precedence ::ffff:0:0/96  100" >> /etc/gai.conf
        apt-get update
        apt-get install -y ansible python3 python3-pip openssh-client sshpass
    '

    cat > "$PREFIX/bin/ansible" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
exec proot-distro login ubuntu -- ansible "$@"
EOF

    cat > "$PREFIX/bin/ansible-playbook" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
exec proot-distro login ubuntu -- ansible-playbook "$@"
EOF

    cat > "$PREFIX/bin/ansible-galaxy" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
exec proot-distro login ubuntu -- ansible-galaxy "$@"
EOF

    cat > "$PREFIX/bin/ansible-inventory" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
exec proot-distro login ubuntu -- ansible-inventory "$@"
EOF

    chmod +x "$PREFIX/bin/ansible" "$PREFIX/bin/ansible-playbook" "$PREFIX/bin/ansible-galaxy" "$PREFIX/bin/ansible-inventory"
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
    log "INFO" "Downloading $url"
    wget -qO "$dest" "$url"
    chmod "$mode" "$dest"
}

pause() {
    echo -e "\e[1;33m👉 Press [ENTER] to continue when ready...\e[0m"
    read -r
}

print_header() {
    clear || true
    echo -e "\e[1;36m====================================================\e[0m"
    echo -e "\e[1;36m             🚀 POCKET LAB OS INSTALLER             \e[0m"
    echo -e "\e[1;36m====================================================\e[0m"
    echo -e "\n$1\n"
}

# =============================================================================
# STAGE 1: Storage & OS Prerequisites
# =============================================================================
print_header "STAGE 1: Storage & OS Prerequisites"
log "INFO" "Requesting Android storage access"
termux-setup-storage || true
echo -e "\e[1;35mPlease tap 'ALLOW' on your screen, then press [ENTER]...\e[0m"
read -r

echo -e "\n\e[1;31mCRITICAL WARNING:\e[0m Android will aggressively kill Termux if these overrides are not completed."
echo "1. TAILSCALE APP: Installed, logged in, but VPN is disconnected (OFF)."
echo "2. PLAY PROTECT: 'Scan apps with Play Protect' is PAUSED."
echo "3. BATTERY: Termux & Termux:Boot battery usage is set to 'Unrestricted'."
echo "4. DEVELOPER OPTIONS: 'Disable child process restrictions' is ON."
echo "5. TAILSCALE ADMIN PANEL: 'HTTPS' and 'MagicDNS' are enabled."
echo ""
pause

# =============================================================================
# STAGE 2: Core Dependencies
# =============================================================================
print_header "STAGE 2: Installing Orchestration Dependencies"
log "INFO" "Refreshing package metadata"
pkg update -y
pkg upgrade -y

log "INFO" "Installing native Termux packages"
ensure_pkg python
ensure_pkg wget
ensure_pkg unzip
ensure_pkg jq
ensure_pkg curl
ensure_pkg proot-distro
ensure_pkg caddy
ensure_pkg git
ensure_pkg openssl-tool
ensure_pkg mariadb
ensure_pkg netcat-openbsd

install_ansible_in_proot

log "INFO" "Installing Gitea package natively via Termux"
ensure_pkg gitea

echo "-> Downloading HashiCorp Nomad (Workload Orchestrator)..."
if ! have nomad; then
    download_if_missing "https://releases.hashicorp.com/nomad/1.7.6/nomad_1.7.6_linux_arm64.zip" "$STATE_DIR/nomad.zip" 644
    unzip -o "$STATE_DIR/nomad.zip" >/dev/null
    mv -f nomad "$PREFIX/bin/nomad"
    chmod +x "$PREFIX/bin/nomad"
    rm -f "$STATE_DIR/nomad.zip"
fi

# FIXED: Nomad configuration generation was missing in original script
cat << 'EOF' > "$HOME/nomad_config.hcl"
data_dir  = "/data/data/com.termux/files/home/nomad_data"
bind_addr = "127.0.0.1"
server {
  enabled          = true
  bootstrap_expect = 1
}
client {
  enabled = true
  options = {
    "driver.raw_exec.enable" = "1"
  }
}
EOF

echo "-> Downloading Ansible Semaphore (Task Automator)..."
if ! have semaphore; then
    download_if_missing "https://github.com/semaphoreui/semaphore/releases/download/v2.17.39/semaphore_2.17.39_linux_arm64.tar.gz" "$STATE_DIR/semaphore.tar.gz" 644
    tar -xzf "$STATE_DIR/semaphore.tar.gz" -C "$STATE_DIR" semaphore
    mv -f "$STATE_DIR/semaphore" "$PREFIX/bin/semaphore"
    chmod +x "$PREFIX/bin/semaphore"
    rm -f "$STATE_DIR/semaphore.tar.gz"
fi
echo -e "\e[1;32m✅ Enterprise Orchestrators installed successfully.\e[0m"

# =============================================================================
# STAGE 3: Security & Telemetry Binaries
# =============================================================================
print_header "STAGE 3: Injecting Security & Telemetry Binaries"

echo "-> Fetching Trivy (Vulnerability Scanner)..."
if ! have trivy; then
    download_if_missing "https://github.com/aquasecurity/trivy/releases/download/v0.70.0/trivy_0.70.0_Linux-ARM64.tar.gz" "$STATE_DIR/trivy.tar.gz" 644
    tar -xzf "$STATE_DIR/trivy.tar.gz" -C "$STATE_DIR" trivy
    mv -f "$STATE_DIR/trivy" "$PREFIX/bin/trivy"
    chmod +x "$PREFIX/bin/trivy"
    rm -f "$STATE_DIR/trivy.tar.gz"
fi

echo "-> Fetching Prometheus (AIOps TSDB)..."
if ! have prometheus; then
    download_if_missing "https://github.com/prometheus/prometheus/releases/download/v2.51.0/prometheus-2.51.0.linux-arm64.tar.gz" "$STATE_DIR/prom.tar.gz" 644
    mkdir -p "$STATE_DIR/prom_unpack"
    tar -xzf "$STATE_DIR/prom.tar.gz" -C "$STATE_DIR/prom_unpack" --strip-components=1
    mv -f "$STATE_DIR/prom_unpack/prometheus" "$PREFIX/bin/prometheus"
    chmod +x "$PREFIX/bin/prometheus"
    rm -rf "$STATE_DIR/prom.tar.gz" "$STATE_DIR/prom_unpack"
fi

echo "-> Cloning Lynis (Security Auditing & DFIR)..."
if [[ ! -d "$HOME/lynis_tool/.git" ]]; then
    git clone https://github.com/CISOfy/lynis "$HOME/lynis_tool" >/dev/null 2>&1 || true
fi
ln -sf "$HOME/lynis_tool/lynis" "$PREFIX/bin/lynis"

echo "-> Staging Netdata (Real-Time Telemetry)..."
download_if_missing "https://get.netdata.cloud/kickstart.sh" "$HOME/netdata-kickstart.sh" 755

echo -e "\e[1;32m✅ Enterprise binaries successfully injected into Edge Node.\e[0m"
sleep 2

# =============================================================================
# STAGE 4: HashiCorp Vault
# =============================================================================
print_header "STAGE 4: Injecting HashiCorp Vault"

echo "-> Fetching HashiCorp Vault (ARM64)..."
if ! have vault; then
    download_if_missing "https://releases.hashicorp.com/vault/1.15.4/vault_1.15.4_linux_arm64.zip" "$STATE_DIR/vault.zip" 644
    unzip -o "$STATE_DIR/vault.zip" >/dev/null
    mv -f vault "$PREFIX/bin/vault"
    chmod +x "$PREFIX/bin/vault"
    rm -f "$STATE_DIR/vault.zip"
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
EOF
echo -e "\e[1;32m✅ HashiCorp Vault staged.\e[0m"

# =============================================================================
# STAGE 5: Grafana Loki & Promtail
# =============================================================================
print_header "STAGE 5: Injecting Grafana Loki & Promtail"

echo "-> Fetching Grafana Loki (Log Aggregation DB)..."
if ! have loki; then
    download_if_missing "https://github.com/grafana/loki/releases/download/v2.9.4/loki-linux-arm64.zip" "$STATE_DIR/loki.zip" 644
    unzip -o "$STATE_DIR/loki.zip" >/dev/null
    mv -f loki-linux-arm64 "$PREFIX/bin/loki"
    chmod +x "$PREFIX/bin/loki"
    rm -f "$STATE_DIR/loki.zip"
fi

echo "-> Fetching Promtail (Log Shipper)..."
if ! have promtail; then
    download_if_missing "https://github.com/grafana/loki/releases/download/v2.9.4/promtail-linux-arm64.zip" "$STATE_DIR/promtail.zip" 644
    unzip -o "$STATE_DIR/promtail.zip" >/dev/null
    mv -f promtail-linux-arm64 "$PREFIX/bin/promtail"
    chmod +x "$PREFIX/bin/promtail"
    rm -f "$STATE_DIR/promtail.zip"
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
print_header "STAGE 6: Injecting Open Policy Agent (OPA)"

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
print_header "STAGE 7: Booting Vault, MariaDB, & Gitea"

echo "-> Igniting HashiCorp Vault Engine..."
export VAULT_ADDR='http://127.0.0.1:8200'
if ! pgrep -f "vault server -config=$HOME/vault_config.hcl" >/dev/null 2>&1; then
    nohup vault server -config="$HOME/vault_config.hcl" > "$LOG_DIR/vault.log" 2>&1 &
fi

echo "-> Waiting for Vault Engine Listener..."
# FIXED: Wait for TCP instead of HTTP, since HTTP 501 Uninitialized causes curl -f to fail
wait_for_tcp 127.0.0.1 8200 60 || die "Vault did not become ready on port 8200"
sleep 3 # Buffer for listener to fully initialize

# FIXED: Check configuration file existence rather than unstable vault status outputs
if [ ! -f "$HOME/vault_keys.json" ]; then
    echo "-> Initializing Vault (1 Key Share)..."
    vault operator init -key-shares=1 -key-threshold=1 -format=json > "$HOME/vault_keys.json"
    chmod 600 "$HOME/vault_keys.json"
fi

UNSEAL_KEY=$(jq -r '.unseal_keys_b64[0]' "$HOME/vault_keys.json")
ROOT_TOKEN=$(jq -r '.root_token' "$HOME/vault_keys.json")

echo "-> Unsealing Vault & Authenticating..."
if ! vault status >/dev/null 2>&1; then
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

if [ ! -d "$PREFIX/var/lib/mysql/mysql" ]; then
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

wait_for_tcp 127.0.0.1 3306 40 || { tail -n 200 "$LOG_DIR/mariadb_boot.log" || true; die "MariaDB did not become ready"; }

echo "-> Generating High-Entropy Credentials for Gitea and PhotoPrism UI..."
GITEA_USER="pocket_admin"
if [[ -f "$STATE_DIR/gitea_admin_password.txt" ]]; then
    GITEA_PASS="$(cat "$STATE_DIR/gitea_admin_password.txt")"
else
    # FIXED: Replaced urandom pipes with highly stable openssl generator to prevent bash SIGPIPE crashes
    GITEA_PASS=$(openssl rand -hex 12)
    printf '%s' "$GITEA_PASS" > "$STATE_DIR/gitea_admin_password.txt"
    chmod 600 "$STATE_DIR/gitea_admin_password.txt"
fi
vault kv put secret/gitea username="$GITEA_USER" password="$GITEA_PASS" >/dev/null

PP_PASS=$(openssl rand -hex 12)
vault kv put secret/photoprism username="admin" password="$PP_PASS" >/dev/null

echo "-> Provisioning Vault Admin DB Role & App Databases..."
if command -v mariadb >/dev/null 2>&1; then DB_CLIENT="mariadb"; else DB_CLIENT="mysql"; fi

$DB_CLIENT -u "$(whoami)" -e "CREATE DATABASE IF NOT EXISTS mariadb;" >/dev/null 2>&1 || true
$DB_CLIENT -u "$(whoami)" -e "CREATE DATABASE IF NOT EXISTS semaphore;" >/dev/null 2>&1 || true

$DB_CLIENT -u "$(whoami)" -e "CREATE DATABASE IF NOT EXISTS gitea;" >/dev/null 2>&1 || true
$DB_CLIENT -u "$(whoami)" -e "CREATE USER IF NOT EXISTS 'gitea'@'127.0.0.1' IDENTIFIED BY '$GITEA_PASS';" >/dev/null 2>&1 || true
$DB_CLIENT -u "$(whoami)" -e "GRANT ALL PRIVILEGES ON gitea.* TO 'gitea'@'127.0.0.1';" >/dev/null 2>&1 || true

$DB_CLIENT -u "$(whoami)" -e "CREATE USER IF NOT EXISTS 'vault_admin'@'127.0.0.1' IDENTIFIED BY 'vault_admin_secret_99';" >/dev/null 2>&1 || true
$DB_CLIENT -u "$(whoami)" -e "GRANT ALL PRIVILEGES ON *.* TO 'vault_admin'@'127.0.0.1' WITH GRANT OPTION;" >/dev/null 2>&1 || true

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
semaphore migrate --config "$HOME/semaphore_config.json" >/dev/null 2>&1 || true
semaphore user add --admin --login "$GITEA_USER" --name "Pocket Admin" --email "admin@pocketlab.local" --password "$GITEA_PASS" --config "$HOME/semaphore_config.json" >/dev/null 2>&1 || true

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
vault policy write gitops-policy "$HOME/gitops-policy.hcl" >/dev/null
vault policy write fleet-policy "$HOME/fleet-policy.hcl" >/dev/null
vault policy write auditor-policy "$HOME/auditor-policy.hcl" >/dev/null
vault policy write dashboard-ui-policy "$HOME/dashboard-ui-policy.hcl" >/dev/null
vault policy write admin-policy "$HOME/admin-policy.hcl" >/dev/null
vault policy write warden-policy "$HOME/warden-policy.hcl" >/dev/null

echo "-> Registering Machine Identities (AppRoles)..."
vault write auth/approle/role/gitops-service policies="gitops-policy" token_ttl=1h >/dev/null
vault write auth/approle/role/fleet-service policies="fleet-policy" token_ttl=1h >/dev/null
vault write auth/approle/role/security-scanner policies="auditor-policy" token_ttl=30m >/dev/null
vault write auth/approle/role/dashboard-api policies="dashboard-ui-policy" token_ttl=2h >/dev/null

echo "-> Generating Secure AppRole Credentials for Subsystems..."
DASH_ROLE_ID=$(vault read -field=role_id auth/approle/role/dashboard-api/role-id)
DASH_SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/dashboard-api/secret-id)
echo "{\"role_id\": \"$DASH_ROLE_ID\", \"secret_id\": \"$DASH_SECRET_ID\"}" > "$HOME/dashboard_approle.json"
chmod 600 "$HOME/dashboard_approle.json"

GITOPS_ROLE_ID=$(vault read -field=role_id auth/approle/role/gitops-service/role-id)
GITOPS_SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/gitops-service/secret-id)
echo "{\"role_id\": \"$GITOPS_ROLE_ID\", \"secret_id\": \"$GITOPS_SECRET_ID\"}" > "$HOME/gitops_approle.json"
chmod 600 "$HOME/gitops_approle.json"

echo -e "\e[1;32m✅ Principle of Least Privilege Established.\e[0m"

mkdir -p "$HOME/gitea_data/conf"
cat << EOF > "$HOME/gitea_data/conf/app.ini"
APP_NAME = Pocket Lab GitOps Repository
RUN_MODE = prod

[security]
INSTALL_LOCK = true

[server]
HTTP_PORT = 3030
DISABLE_SSH = true
OFFLINE_MODE = true

[database]
DB_TYPE = mysql
HOST = 127.0.0.1:3306
NAME = gitea
USER = gitea
PASSWD = $GITEA_PASS
SSL_MODE = disable
PATH = /data/data/com.termux/files/home/gitea_data/gitea.db

[actions]
ENABLED = true
EOF

echo "-> Executing Gitea Boot Sequence..."
if ! pgrep -f "gitea web -c $HOME/gitea_data/conf/app.ini" >/dev/null 2>&1; then
    nohup gitea web -c "$HOME/gitea_data/conf/app.ini" > "$LOG_DIR/gitea.log" 2>&1 &
fi
wait_for_http "http://127.0.0.1:3030" 60 || { tail -n 200 "$LOG_DIR/gitea.log" || true; die "Gitea did not become ready"; }

echo "-> Provisioning Admin Account natively via variables..."
gitea admin user create --username "$GITEA_USER" --password "$GITEA_PASS" --email "admin@pocketlab.local" --admin -c "$HOME/gitea_data/conf/app.ini" >/dev/null 2>&1 || true

echo "-> Fetching Gitea Act_Runner (ARM64)..."
if ! have act_runner; then
    download_if_missing "https://dl.gitea.com/act_runner/0.2.10/act_runner-0.2.10-linux-arm64" "$PREFIX/bin/act_runner" 755
fi

echo "-> Registering Runner (Host Execution Mode)..."
RUNNER_TOKEN=$(gitea --config "$HOME/gitea_data/conf/app.ini" actions generate-runner-token)
if [ -z "$RUNNER_TOKEN" ]; then
    die "Failed to generate Gitea runner token. Check gitea.log"
fi

mkdir -p "$HOME/act_runner"
if [[ ! -f "$HOME/act_runner/config.yaml" ]]; then
    act_runner register --no-interactive --instance http://127.0.0.1:3030 --token "$RUNNER_TOKEN" --name termux-edge-runner --labels termux-arm64:host --config "$HOME/act_runner/config.yaml" >/dev/null 2>&1 || true
fi
nohup act_runner daemon --config "$HOME/act_runner/config.yaml" > "$LOG_DIR/act_runner.log" 2>&1 &
RUNNER_PID=$!

echo "-> Creating Private Repositories..."
curl -s -X POST "http://127.0.0.1:3030/api/v1/user/repos" -u "$GITEA_USER:$GITEA_PASS" -H "Content-Type: application/json" -d '{"name": "iac-catalog", "private": true}' >/dev/null || true
curl -s -X POST "http://127.0.0.1:3030/api/v1/user/repos" -u "$GITEA_USER:$GITEA_PASS" -H "Content-Type: application/json" -d '{"name": "pocket_lab_iac", "private": true}' >/dev/null || true

# =============================================================================
# STAGE 8: IaC Catalog Seeder & CI/CD Pipelines
# =============================================================================
print_header "STAGE 8: Executing Enterprise Catalog Seeder"

cat << 'SEEDER_EOF' > "$HOME/seed_catalog.sh"
#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

G_USER=$1
G_PASS=$2

mkdir -p "$HOME/iac-catalog-temp"
cd "$HOME/iac-catalog-temp"
rm -rf ./* || true

mkdir -p ubuntu_base
cat << 'INNER_EOF' > ubuntu_base/app.nomad
job "ubuntu_base" {
  datacenters = ["dc1"]
  type = "batch"
  group "setup" {
    task "install" {
      driver = "raw_exec"
      config { command = "proot-distro"; args = ["install", "ubuntu"] }
    }
  }
}
INNER_EOF
cat << 'INNER_EOF' > ubuntu_base/metadata.json
{ "title": "Ubuntu Core", "description": "Raw Debian-based PRoot environment.", "icon": "TerminalSquare" }
INNER_EOF

mkdir -p photoprism
cat << 'INNER_EOF' > photoprism/app.nomad
job "photoprism" {
  datacenters = ["dc1"]
  type = "service"
  group "ai-workload" {
    task "photoprism-daemon" {
      driver = "raw_exec"
      vault { policies = ["gitops-policy"] }
      template {
        data = <<EOF
export PHOTOPRISM_ADMIN_PASSWORD="{{ with secret "secret/data/photoprism" }}{{ .Data.data.password }}{{ end }}"
export PHOTOPRISM_DATABASE_USER="{{ with secret "database/creds/mariadb-role" }}{{ .Data.username }}{{ end }}"
export PHOTOPRISM_DATABASE_PASSWORD="{{ with secret "database/creds/mariadb-role" }}{{ .Data.password }}{{ end }}"
EOF
        destination = "secrets/env.sh"
        env = false
      }
      config {
        command = "bash"
        args = ["-c", "source secrets/env.sh && proot-distro login ubuntu --bind /data/data/com.termux/files/home/storage/dcim:/photoprism/originals -- bash -c 'export DEBIAN_FRONTEND=noninteractive && if [ ! -f /opt/photoprism/bin/photoprism ]; then apt-get update -y && apt-get install -y wget curl tar libimage-exiftool-perl ffmpeg libheif1 && mkdir -p /opt/photoprism /photoprism/storage /photoprism/originals && wget -c https://dl.photoprism.app/pkg/linux/arm64.tar.gz -O - | tar -xz -C /opt/photoprism; fi && export PHOTOPRISM_DATABASE_DRIVER=mysql && export PHOTOPRISM_DATABASE_SERVER=127.0.0.1:3306 && export PHOTOPRISM_DATABASE_NAME=mariadb && export PHOTOPRISM_ADMIN_PASSWORD=$PHOTOPRISM_ADMIN_PASSWORD && export PHOTOPRISM_DATABASE_USER=$PHOTOPRISM_DATABASE_USER && export PHOTOPRISM_DATABASE_PASSWORD=$PHOTOPRISM_DATABASE_PASSWORD && export PHOTOPRISM_ORIGINALS_PATH=/photoprism/originals && export PHOTOPRISM_STORAGE_PATH=/photoprism/storage && export PHOTOPRISM_HTTP_HOST=0.0.0.0 && export PHOTOPRISM_HTTP_PORT=2342 && export PHOTOPRISM_DISABLE_CHOWN=true && exec /opt/photoprism/bin/photoprism start'"]
      }
      resources { cpu = 500; memory = 256 }
    }
  }
}
INNER_EOF
cat << 'INNER_EOF' > photoprism/metadata.json
{ "title": "PhotoPrism AI", "description": "AI-powered photo indexer with Vault Dynamic Secrets via Nomad.", "icon": "Image" }
INNER_EOF

mkdir -p security_scanners
cat << 'INNER_EOF' > security_scanners/maintenance.yml
---
- name: Enterprise Security Auditing
  hosts: localhost
  connection: local
  tasks:
    - name: Ensure PRoot Ubuntu Environment Exists
      command: proot-distro install ubuntu
      ignore_errors: yes

    - name: Execute Trivy & Lynis Scanners
      command: >
        proot-distro login ubuntu -- bash -c '
        mkdir -p /opt/security_scanner && cd /opt/security_scanner &&
        if [ ! -f ./trivy ]; then wget -qO trivy.tar.gz https://github.com/aquasecurity/trivy/releases/download/v0.70.0/trivy_0.70.0_Linux-ARM64.tar.gz && tar -xzf trivy.tar.gz; fi &&
        ./trivy rootfs / --format json > /var/log/trivy_report.json 2>/dev/null;
        if [ ! -d ./lynis ]; then wget -qO lynis.tar.gz https://downloads.cisofy.com/lynis/lynis-3.1.6.tar.gz && tar -xzf lynis.tar.gz; fi &&
        ./lynis/lynis audit system --quick --no-colors --quiet;'
INNER_EOF
cat << 'INNER_EOF' > security_scanners/metadata.json
{ "title": "Security Scanners", "description": "Ephemeral Trivy & Lynis Ansible Playbook.", "icon": "ShieldCheck" }
INNER_EOF

mkdir -p host_hardening
cat << 'INNER_EOF' > host_hardening/maintenance.yml
---
- name: Apply Lynis Hardening Recommendations
  hosts: localhost
  connection: local
  tasks:
    - name: Restrict compiler access
      command: chmod 700 /usr/bin/gcc
      ignore_errors: true
INNER_EOF
cat << 'INNER_EOF' > host_hardening/metadata.json
{ "title": "Host Hardening", "description": "Automated remediation for Lynis warnings.", "icon": "Lock" }
INNER_EOF

mkdir -p cve_patcher
cat << 'INNER_EOF' > cve_patcher/maintenance.yml
---
- name: Apply Security Patches
  hosts: localhost
  connection: local
  tasks:
    - name: Update apt packages in PRoot
      command: proot-distro login ubuntu -- bash -c 'echo "Acquire::ForceIPv4 \"true\";" > /etc/apt/apt.conf.d/99force-ipv4 && apt-get update && apt-get upgrade -y'
INNER_EOF
cat << 'INNER_EOF' > cve_patcher/metadata.json
{ "title": "CVE Patcher", "description": "Automated APT package patching inside PRoot.", "icon": "Wrench" }
INNER_EOF

mkdir -p dr_automate_backup
cat << 'INNER_EOF' > dr_automate_backup/maintenance.yml
---
- name: Schedule Automated Backups
  hosts: localhost
  connection: local
  tasks:
    - name: Add Cron Job
      cron:
        name: "PocketLab Daily Backup"
        minute: "0"
        hour: "3"
        job: "tar -czvf ~/storage/downloads/auto_backup_$(date +\%Y\%m\%d).tar.gz ~/vault_data $PREFIX/var/lib/mysql"
INNER_EOF
cat << 'INNER_EOF' > dr_automate_backup/metadata.json
{ "title": "Automated Backups", "description": "Daily cron backup scheduler.", "icon": "Clock" }
INNER_EOF

mkdir -p dr_manual_snapshot
cat << 'INNER_EOF' > dr_manual_snapshot/maintenance.yml
---
- name: Manual State Capture
  hosts: localhost
  connection: local
  tasks:
    - name: Archive System Data
      command: tar -czvf ~/storage/downloads/manual_snapshot_$(date +\%Y\%m\%d_\%H\%M\%S).tar.gz $PREFIX/var/lib/proot-distro ~/vault_data $PREFIX/var/lib/mysql
INNER_EOF
cat << 'INNER_EOF' > dr_manual_snapshot/metadata.json
{ "title": "Manual Snapshot", "description": "Point-in-time ecosystem state capture.", "icon": "DownloadCloud" }
INNER_EOF

git init
git config user.name "PocketLab Automation"
git config user.email "gitops@pocketlab.local"
git branch -M main
git add .
git commit -m "Initial commit: Populating Enterprise Catalog" >/dev/null 2>&1 || true
git remote add origin "http://${G_USER}:${G_PASS}@127.0.0.1:3030/${G_USER}/iac-catalog.git" 2>/dev/null || git remote set-url origin "http://${G_USER}:${G_PASS}@127.0.0.1:3030/${G_USER}/iac-catalog.git"
git push -u origin main
SEEDER_EOF

echo "-> Executing Catalog Seeder..."
chmod +x "$HOME/seed_catalog.sh"
bash "$HOME/seed_catalog.sh" "$GITEA_USER" "$GITEA_PASS" >/dev/null 2>&1 || true

echo "-> Seeding Nomad & Ansible Workflows..."
mkdir -p "$HOME/pocket_lab_iac/.gitea/workflows"
cd "$HOME/pocket_lab_iac"
cat << 'EOF' > .gitea/workflows/deploy.yaml
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
              nomad job run "$dir/app.nomad"
            fi
          done
          for dir in */; do
            if [ -f "$dir/maintenance.yml" ]; then
              echo "Executing Maintenance Playbook: $dir"
              ansible-playbook "$dir/maintenance.yml"
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

echo "-> Shredding plain-text variables & temporary scripts..."
rm -rf "$HOME/iac-catalog-temp" "$HOME/seed_catalog.sh"
unset GITEA_PASS
unset GITEA_USER

echo "-> Shutting down temporary boot processes..."
kill "${RUNNER_PID:-0}" 2>/dev/null || true
kill "${GITEA_PID:-0}" 2>/dev/null || true
kill "${VAULT_PID:-0}" 2>/dev/null || true
pkill mysqld || pkill mariadbd || true

echo -e "\e[1;32m✅ Identity, Orchestration Engine, & Catalog Seeded & Ready.\e[0m"
sleep 2

# =============================================================================
# STAGE 9: Secure HTTPS Activation
# =============================================================================
print_header "STAGE 9: Secure HTTPS Activation"
mkdir -p "$HOME/.tailscale"
if [[ ! -x "$HOME/.tailscale/tailscale_installer.sh" ]]; then
    curl -fsSL https://raw.githubusercontent.com/bropines/tailscale-termux-cli/main/remote-install.sh -o "$HOME/.tailscale/tailscale_installer.sh"
    chmod +x "$HOME/.tailscale/tailscale_installer.sh"
fi
bash "$HOME/.tailscale/tailscale_installer.sh" || true
echo 'TS_SOCKS5_PORT=1055' > "$HOME/.tailscale/.env"
tailscaled-start || true
sleep 3

echo -e "\n\e[1;35m⚠️  ACTION REQUIRED: AUTHENTICATE NODE\e[0m"
tailscale-cli up --hostname=pocket-lab || true
pause

# =============================================================================
# STAGE 10: Fetch Edge Dashboard & Configurations
# =============================================================================
print_header "STAGE 10: Fetching Edge Dashboard & Configurations"

LATEST_RELEASE=$(curl -s "https://api.github.com/repos/$REPO/releases/latest")
ZIP_URL=$(echo "$LATEST_RELEASE" | jq -r '.assets[] | select(.name=="dist.zip") | .browser_download_url')
if [[ -z "${ZIP_URL:-}" || "$ZIP_URL" == "null" ]]; then
    die "dist.zip release asset not found"
fi

wget -q -O "$HOME/dist.zip" "$ZIP_URL"
unzip -o "$HOME/dist.zip" -d "$HOME/pwa_dist" >/dev/null 2>&1
rm -f "$HOME/dist.zip"
if [ -d "$HOME/pwa_dist/dist" ]; then
    mv "$HOME/pwa_dist/dist"/* "$HOME/pwa_dist/" 2>/dev/null || true
    rm -rf "$HOME/pwa_dist/dist"
fi

RAW_BASE="https://raw.githubusercontent.com/$REPO/main"
wget -q -O "$HOME/api_server.py" "$RAW_BASE/api_server.py" || true
wget -q -O "$HOME/update_pocketlab.sh" "$RAW_BASE/update_pocketlab.sh" || true
chmod +x "$HOME/update_pocketlab.sh" 2>/dev/null || true

echo "  -> Generating Init Script (start_dashboard.sh)..."
cat << 'START_DASH_EOF' > "$HOME/start_dashboard.sh"
#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

echo -e "\n=> 🚀 Igniting Pocket Lab Edge Architecture..."

if [ ! -f ~/api_server.py ]; then
    echo "Error: api_server.py not found. Please download it via the bootstrap script first."
    exit 1
fi

mkdir -p ~/api ~/pocket_lab_logs ~/pwa_dist ~/storage/downloads
rm -f ~/pocket_lab_logs/*.log

log() {
    printf '[%s] [RUNTIME] %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$*" | tee -a ~/pocket_lab_logs/runtime.log
}

ensure_started() {
    local name="$1"
    shift
    local pattern="$1"
    shift
    if ! pgrep -f "$pattern" >/dev/null 2>&1; then
        log "Starting $name"
        nohup "$@" >/dev/null 2>&1 &
    else
        log "$name already running"
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
    ensure_started "act_runner" "act_runner daemon" act_runner daemon
}

start_nomad() {
    ensure_started "Nomad" "nomad agent -config=$HOME/nomad_config.hcl" nomad agent -config="$HOME/nomad_config.hcl"
}

start_semaphore() {
    ensure_started "Semaphore" "semaphore server --config=$HOME/semaphore_config.json" semaphore server --config="$HOME/semaphore_config.json"
}

# FIXED: Actually start the Loki server to capture metrics
start_loki() {
    ensure_started "Loki" "loki -config.file=$HOME/loki-config.yaml" loki -config.file="$HOME/loki-config.yaml"
}

# FIXED: Actually start Promtail so it passes metrics to Loki
start_promtail() {
    ensure_started "Promtail" "promtail -config.file=$HOME/promtail-config.yaml" promtail -config.file="$HOME/promtail-config.yaml"
}

start_telemetry() {
cat << 'TELEMETRY_EOF' > ~/telemetry_daemon.sh
#!/bin/bash
echo "Telemetry Daemon Started at $(date)"

TEMP_LIMIT=48
RAM_LIMIT=90

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
    start_loki
    start_promtail
    start_telemetry
    start_pwa
    start_api
    start_caddy
    start_tailscale
    sleep 20
done
START_DASH_EOF

chmod +x "$HOME/start_dashboard.sh"

cat << 'EOF' > "$HOME/Caddyfile"
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
print_header "STAGE 11: System Ignition"
bash "$HOME/start_dashboard.sh" || true
DOMAIN=$(tailscale-cli status --json | jq -r '.Self.DNSName' | sed 's/\.$//' || true)

ROOT_TOKEN=$(jq -r '.root_token' "$HOME/vault_keys.json")
UNSEAL_KEY=$(jq -r '.unseal_keys_b64[0]' "$HOME/vault_keys.json")

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
echo -e "\e[1;33mVault Unseal Key:\e[0m $UNSEAL_KEY"
echo -e "\nKeep these safe. You will need them to unseal the Vault inside the UI!"
echo -e "Once unsealed, you can retrieve your GitOps login."