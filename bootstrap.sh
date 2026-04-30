#!/data/data/com.termux/files/usr/bin/bash
# POCKET LAB - INTERACTIVE EDGE NODE WIZARD (ENTERPRISE EDITION)

REPO="dexter-lab-ctrl/pocket-lab" # Change to your repo

print_header() {
    clear
    echo -e "\e[1;36m====================================================\e[0m"
    echo -e "\e[1;36m             🚀 POCKET LAB OS INSTALLER             \e[0m"
    echo -e "\e[1;36m====================================================\e[0m"
    echo -e "\n$1\n"
}

pause() {
    echo -e "\e[1;33m👉 Press [ENTER] to continue when ready...\e[0m"
    read -r
}

# --- STAGE 1: Storage & OS Prerequisites ---
print_header "STAGE 1: Storage & OS Prerequisites"
echo "[+] Requesting Android storage access..."
termux-setup-storage
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

# --- STAGE 2: Core Dependencies ---
print_header "STAGE 2: Installing Orchestration Dependencies"
pkg update -y > /dev/null 2>&1

echo "-> Installing System Packages..."
pkg install python wget unzip jq proot-distro caddy git openssl-tool mariadb ansible -y > /dev/null 2>&1
echo -e "\e[1;32m✅ Standard dependencies & Ansible installed.\e[0m"

echo "-> Downloading HashiCorp Nomad (Workload Orchestrator)..."
wget -qO nomad.zip "https://releases.hashicorp.com/nomad/1.7.6/nomad_1.7.6_linux_arm64.zip"
unzip -o nomad.zip && mv nomad $PREFIX/bin/ && chmod +x $PREFIX/bin/nomad && rm nomad.zip

echo "-> Downloading Ansible Semaphore (Task Automator)..."
wget -qO semaphore.tar.gz "https://github.com/semaphoreui/semaphore/releases/download/v2.17.39/semaphore_2.17.39_linux_arm64.tar.gz"
tar -xzf semaphore.tar.gz semaphore && mv semaphore $PREFIX/bin/ && chmod +x $PREFIX/bin/semaphore && rm semaphore.tar.gz
echo -e "\e[1;32m✅ Enterprise Orchestrators installed successfully.\e[0m"

# --- STAGE 3: Security & Telemetry Binaries ---
print_header "STAGE 3: Injecting Security & Telemetry Binaries"

echo "-> Fetching Trivy (Vulnerability Scanner)..."
wget -qO trivy.tar.gz "https://github.com/aquasecurity/trivy/releases/download/v0.70.0/trivy_0.70.0_Linux-ARM64.tar.gz"
tar -xzf trivy.tar.gz trivy && mv trivy $PREFIX/bin/ && chmod +x $PREFIX/bin/trivy && rm trivy.tar.gz

echo "-> Fetching Prometheus (AIOps TSDB)..."
wget -qO prom.tar.gz "https://github.com/prometheus/prometheus/releases/download/v2.51.0/prometheus-2.51.0.linux-arm64.tar.gz"
tar -xzf prom.tar.gz --strip-components=1 prometheus-2.51.0.linux-arm64/prometheus
mv prometheus $PREFIX/bin/ && chmod +x $PREFIX/bin/prometheus && rm prom.tar.gz

echo "-> Cloning Lynis (Security Auditing & DFIR)..."
git clone https://github.com/CISOfy/lynis ~/lynis_tool > /dev/null 2>&1
ln -sf ~/lynis_tool/lynis $PREFIX/bin/lynis

echo "-> Staging Netdata (Real-Time Telemetry)..."
wget -qO ~/netdata-kickstart.sh "https://get.netdata.cloud/kickstart.sh"
chmod +x ~/netdata-kickstart.sh

echo -e "\e[1;32m✅ Enterprise binaries successfully injected into Edge Node.\e[0m"
sleep 2

# --- STAGE 4: HashiCorp Vault ---
print_header "STAGE 4: Injecting HashiCorp Vault"

echo "-> Fetching HashiCorp Vault (ARM64)..."
wget -qO vault.zip "https://releases.hashicorp.com/vault/1.15.4/vault_1.15.4_linux_arm64.zip"
unzip -o vault.zip && mv vault $PREFIX/bin/ && chmod +x $PREFIX/bin/vault && rm vault.zip

mkdir -p ~/vault_data
cat << 'EOF' > ~/vault_config.hcl
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

# --- STAGE 5: Grafana Loki & Promtail ---
print_header "STAGE 5: Injecting Grafana Loki & Promtail"

echo "-> Fetching Grafana Loki (Log Aggregation DB)..."
wget -qO loki.zip "https://github.com/grafana/loki/releases/download/v2.9.4/loki-linux-arm64.zip"
unzip -o loki.zip && mv loki-linux-arm64 $PREFIX/bin/loki && chmod +x $PREFIX/bin/loki && rm loki.zip

echo "-> Fetching Promtail (Log Shipper)..."
wget -qO promtail.zip "https://github.com/grafana/loki/releases/download/v2.9.4/promtail-linux-arm64.zip"
unzip -o promtail.zip && mv promtail-linux-arm64 $PREFIX/bin/promtail && chmod +x $PREFIX/bin/promtail && rm promtail.zip

mkdir -p ~/loki_data
cat << 'EOF' > ~/loki-config.yaml
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

cat << 'EOF' > ~/promtail-config.yaml
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

# --- STAGE 6: Open Policy Agent (OPA) ---
print_header "STAGE 6: Injecting Open Policy Agent (OPA)"

echo "-> Fetching Open Policy Agent (ARM64)..."
wget -qO opa "https://openpolicyagent.org/downloads/v0.61.0/opa_linux_arm64_static"
chmod +x opa && mv opa $PREFIX/bin/opa

echo "-> Seeding Rego Policies for Nomad..."
mkdir -p ~/pocket_lab_policies

cat << 'EOF' > ~/pocket_lab_policies/ports.rego
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

cat << 'EOF' > ~/pocket_lab_policies/storage.rego
package pocketlab.storage
deny[msg] {
    driver := input.Job.TaskGroups[_].Tasks[_].Driver
    driver != "raw_exec"
    msg := "Only raw_exec is permitted to run PRoot isolation on this Android Kernel."
}
EOF

cat << 'EOF' > ~/pocket_lab_policies/nomad.rego
package pocketlab.engine
deny[msg] {
    job := input.Job
    not job.Datacenters
    msg := "Enterprise violation: Nomad job must specify Datacenters."
}
EOF
echo -e "\e[1;32m✅ Policy Engine & Rego Guardrails Provisioned.\e[0m"
sleep 2

# --- STAGE 7: Boot Data & Identity Engines ---
print_header "STAGE 7: Booting Vault, MariaDB, & Gitea"

echo "-> Igniting HashiCorp Vault Engine..."
export VAULT_ADDR='http://127.0.0.1:8200'
nohup vault server -config=$HOME/vault_config.hcl > ~/vault_boot.log 2>&1 &
VAULT_PID=$!

echo "-> Waiting for Vault API..."
while ! curl -s http://127.0.0.1:8200/v1/sys/health > /dev/null; do sleep 1; done

echo "-> Initializing Vault (1 Key Share)..."
vault operator init -key-shares=1 -key-threshold=1 -format=json > ~/vault_keys.json
chmod 600 ~/vault_keys.json
UNSEAL_KEY=$(jq -r '.unseal_keys_b64[0]' ~/vault_keys.json)
ROOT_TOKEN=$(jq -r '.root_token' ~/vault_keys.json)

echo "-> Unsealing Vault & Authenticating..."
vault operator unseal "$UNSEAL_KEY" > /dev/null
vault login "$ROOT_TOKEN" > /dev/null
vault secrets enable -path=secret kv-v2 > /dev/null 2>&1

echo "-> Igniting MariaDB Database Engine..."
mkdir -p $PREFIX/var/lib/mysql
mkdir -p $PREFIX/var/run/mysqld # Termux specific PID/Socket directory

if [ ! -d "$PREFIX/var/lib/mysql/mysql" ]; then
    mysql_install_db --datadir=$PREFIX/var/lib/mysql > /dev/null 2>&1
fi

# ADAPTIVE BINARY DETECTION FOR TERMUX COMPATIBILITY
MYSQLD_BIN=$(command -v mariadbd || command -v mysqld)
nohup $MYSQLD_BIN --datadir=$PREFIX/var/lib/mysql > ~/mariadb_boot.log 2>&1 &
sleep 5

echo "-> Provisioning Vault Admin DB Role & App Databases..."
mysql -u $(whoami) -e "CREATE DATABASE IF NOT EXISTS mariadb;" > /dev/null 2>&1
mysql -u $(whoami) -e "CREATE DATABASE IF NOT EXISTS semaphore;" > /dev/null 2>&1
mysql -u $(whoami) -e "CREATE USER IF NOT EXISTS 'vault_admin'@'127.0.0.1' IDENTIFIED BY 'vault_admin_secret_99';" > /dev/null 2>&1
mysql -u $(whoami) -e "GRANT ALL PRIVILEGES ON *.* TO 'vault_admin'@'127.0.0.1' WITH GRANT OPTION;" > /dev/null 2>&1

echo "-> Mounting Vault Dynamic Database Secrets Engine..."
vault secrets enable database > /dev/null 2>&1
vault write database/config/mariadb \
    plugin_name="mysql-database-plugin" \
    allowed_roles="mariadb-role" \
    connection_url="{{username}}:{{password}}@tcp(127.0.0.1:3306)/" \
    username="vault_admin" \
    password="vault_admin_secret_99" > /dev/null 2>&1
    
vault write database/roles/mariadb-role \
    db_name="mariadb" \
    creation_statements="CREATE USER '{{name}}'@'127.0.0.1' IDENTIFIED BY '{{password}}'; GRANT ALL PRIVILEGES ON *.* TO '{{name}}'@'127.0.0.1';" \
    default_ttl="1h" \
    max_ttl="24h" > /dev/null 2>&1
echo -e "\e[1;32m✅ Dynamic MariaDB Engine Active.\e[0m"

echo "-> Generating High-Entropy Credentials for Gitea and PhotoPrism UI..."
GITEA_USER="pocket_admin"
GITEA_PASS=$(cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 24 | head -n 1)
vault kv put secret/gitea username="$GITEA_USER" password="$GITEA_PASS" > /dev/null
PP_PASS=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
vault kv put secret/photoprism username="admin" password="$PP_PASS" > /dev/null

echo "-> Configuring Ansible Semaphore Enterprise..."
cat << EOF > ~/semaphore_config.json
{
  "mysql": { "host": "127.0.0.1", "user": "vault_admin", "pass": "vault_admin_secret_99", "name": "semaphore" },
  "port": ":8082",
  "dialect": "mysql"
}
EOF
# Run migrations headlessly
semaphore migrate --config ~/semaphore_config.json > /dev/null 2>&1
# Create initial admin user automatically
semaphore user add --admin --login "$GITEA_USER" --name "Pocket Admin" --email "admin@pocketlab.local" --password "$GITEA_PASS" --config ~/semaphore_config.json > /dev/null 2>&1

# ==========================================
# ENTERPRISE LEAST PRIVILEGE ENFORCEMENT
# ==========================================
echo "-> Enabling AppRole Machine Authentication..."
vault auth enable approle > /dev/null 2>&1

cat << 'EOF' > ~/gitops-policy.hcl
path "secret/data/photoprism" { capabilities = ["read"] }
path "secret/data/gitea" { capabilities = ["read"] }
path "database/creds/mariadb-role" { capabilities = ["read"] }
path "secret/data/tailscale" { capabilities = ["deny"] }
path "auth/*" { capabilities = ["deny"] }
path "sys/*" { capabilities = ["deny"] }
EOF

cat << 'EOF' > ~/fleet-policy.hcl
path "secret/data/tailscale" { capabilities = ["read"] }
path "secret/data/photoprism" { capabilities = ["deny"] }
path "database/creds/*" { capabilities = ["deny"] }
EOF

cat << 'EOF' > ~/auditor-policy.hcl
path "secret/metadata/*" { capabilities = ["list", "read"] }
path "database/config/*" { capabilities = ["read"] }
path "sys/health" { capabilities = ["read"] }
EOF

cat << 'EOF' > ~/dashboard-ui-policy.hcl
path "secret/data/gitea" { capabilities = ["read"] }
path "secret/data/tailscale" { capabilities = ["read", "create", "update"] }
path "secret/data/photoprism" { capabilities = ["read", "create", "update"] }
path "database/creds/mariadb-role" { capabilities = ["read", "update"] }
path "sys/seal-status" { capabilities = ["read"] }
EOF

cat << 'EOF' > ~/admin-policy.hcl
path "secret/*" { capabilities = ["create", "read", "update", "delete", "list", "sudo"] }
path "auth/*" { capabilities = ["create", "read", "update", "delete", "list", "sudo"] }
path "sys/policies/acl/*" { capabilities = ["create", "read", "update", "delete", "list"] }
path "sys/health" { capabilities = ["read"] }
path "sys/unseal" { capabilities = ["update"] }
EOF

cat << 'EOF' > ~/warden-policy.hcl
path "secret/data/incidents/warden/*" { capabilities = ["create", "update"] }
path "secret/data/config/thresholds" { capabilities = ["read"] }
EOF

echo "-> Injecting Security Policies into Vault..."
vault policy write gitops-policy ~/gitops-policy.hcl > /dev/null
vault policy write fleet-policy ~/fleet-policy.hcl > /dev/null
vault policy write auditor-policy ~/auditor-policy.hcl > /dev/null
vault policy write dashboard-ui-policy ~/dashboard-ui-policy.hcl > /dev/null
vault policy write admin-policy ~/admin-policy.hcl > /dev/null
vault policy write warden-policy ~/warden-policy.hcl > /dev/null

echo "-> Registering Machine Identities (AppRoles)..."
vault write auth/approle/role/gitops-service policies="gitops-policy" token_ttl=1h > /dev/null
vault write auth/approle/role/fleet-service policies="fleet-policy" token_ttl=1h > /dev/null
vault write auth/approle/role/security-scanner policies="auditor-policy" token_ttl=30m > /dev/null
vault write auth/approle/role/dashboard-api policies="dashboard-ui-policy" token_ttl=2h > /dev/null

echo "-> Generating Secure AppRole Credentials for Subsystems..."
DASH_ROLE_ID=$(vault read -field=role_id auth/approle/role/dashboard-api/role-id)
DASH_SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/dashboard-api/secret-id)
echo "{\"role_id\": \"$DASH_ROLE_ID\", \"secret_id\": \"$DASH_SECRET_ID\"}" > ~/dashboard_approle.json
chmod 600 ~/dashboard_approle.json

GITOPS_ROLE_ID=$(vault read -field=role_id auth/approle/role/gitops-service/role-id)
GITOPS_SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/gitops-service/secret-id)
echo "{\"role_id\": \"$GITOPS_ROLE_ID\", \"secret_id\": \"$GITOPS_SECRET_ID\"}" > ~/gitops_approle.json
chmod 600 ~/gitops_approle.json

echo -e "\e[1;32m✅ Principle of Least Privilege Established.\e[0m"

echo "-> Fetching Gitea (ARM64)..."
# Using Termux-native Gitea to prevent Android seccomp (Signal 31 / SIGSYS) crashes
pkg install gitea -y > /dev/null 2>&1

mkdir -p ~/gitea_data/conf
cat << EOF > ~/gitea_data/conf/app.ini
APP_NAME = Pocket Lab GitOps Repository
RUN_MODE = prod
RUN_USER = $(whoami)

[security]
INSTALL_LOCK = true

[server]
HTTP_PORT = 3030
DISABLE_SSH = true
OFFLINE_MODE = true

[database]
DB_TYPE = sqlite3
PATH = /data/data/com.termux/files/home/gitea_data/gitea.db

[actions]
ENABLED = true
EOF

echo "-> Executing Gitea Boot Sequence..."
nohup gitea web -c ~/gitea_data/conf/app.ini > ~/gitea_boot.log 2>&1 &
GITEA_PID=$!
while ! curl -s http://127.0.0.1:3030 > /dev/null; do sleep 2; done

echo "-> Provisioning Admin Account natively via variables..."
gitea admin user create --username "$GITEA_USER" --password "$GITEA_PASS" --email "admin@pocketlab.local" --admin -c ~/gitea_data/conf/app.ini > /dev/null 2>&1

echo "-> Fetching Gitea Act_Runner (ARM64)..."
wget -qO act_runner "https://dl.gitea.com/act_runner/0.2.10/act_runner-0.2.10-linux-arm64"
chmod +x act_runner && mv act_runner $PREFIX/bin/act_runner

echo "-> Registering Runner (Host Execution Mode)..."
RUNNER_TOKEN=$(gitea --config ~/gitea_data/conf/app.ini actions generate-runner-token)
if [ -z "$RUNNER_TOKEN" ]; then
    echo -e "\e[1;31mError: Failed to generate Gitea runner token. Check gitea_boot.log\e[0m"
fi
act_runner register --no-interactive --instance http://127.0.0.1:3030 --token "$RUNNER_TOKEN" --name termux-edge-runner --labels termux-arm64:host > /dev/null 2>&1
nohup act_runner daemon > ~/act_runner.log 2>&1 &
RUNNER_PID=$!

echo "-> Creating Private Repositories..."
curl -s -X POST "http://127.0.0.1:3030/api/v1/user/repos" -u "$GITEA_USER:$GITEA_PASS" -H "Content-Type: application/json" -d '{"name": "iac-catalog", "private": true}' > /dev/null
curl -s -X POST "http://127.0.0.1:3030/api/v1/user/repos" -u "$GITEA_USER:$GITEA_PASS" -H "Content-Type: application/json" -d '{"name": "pocket_lab_iac", "private": true}' > /dev/null

# --- STAGE 8: IaC Catalog Seeder & CI/CD Pipelines ---
print_header "STAGE 8: Executing Enterprise Catalog Seeder"

cat << 'SEEDER_EOF' > ~/seed_catalog.sh
#!/bin/bash
G_USER=$1
G_PASS=$2
mkdir -p ~/iac-catalog-temp && cd ~/iac-catalog-temp

# 1. Ubuntu Base (Logical Foundation) -> Nomad Batch Job
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

# 2. PhotoPrism App -> Nomad Service Job with Vault Secrets Injection
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

# 3. Security Scanners -> Ansible Playbook via Semaphore
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

# 4. Host Hardening Remediation -> Ansible Playbook
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

# 5. CVE Patcher Remediation -> Ansible Playbook
mkdir -p cve_patcher
cat << 'INNER_EOF' > cve_patcher/maintenance.yml
---
- name: Apply Security Patches
  hosts: localhost
  connection: local
  tasks:
    - name: Update apt packages in PRoot
      command: proot-distro login ubuntu -- apt-get update && apt-get upgrade -y
INNER_EOF
cat << 'INNER_EOF' > cve_patcher/metadata.json
{ "title": "CVE Patcher", "description": "Automated APT package patching inside PRoot.", "icon": "Wrench" }
INNER_EOF

# 6. Disaster Recovery: Auto Backup -> Ansible Playbook
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

# 7. Disaster Recovery: Manual Snapshot -> Ansible Playbook
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

# Push to Local Registry
git init
git config user.name "PocketLab Automation"
git config user.email "gitops@pocketlab.local"
git branch -M main
git add .
git commit -m "Initial commit: Populating Enterprise Catalog"
git remote add origin "http://${G_USER}:${G_PASS}@127.0.0.1:3030/${G_USER}/iac-catalog.git"
git push -u origin main
SEEDER_EOF

echo "-> Executing Catalog Seeder..."
chmod +x ~/seed_catalog.sh
bash ~/seed_catalog.sh "$GITEA_USER" "$GITEA_PASS" > /dev/null 2>&1

echo "-> Seeding Nomad & Ansible Workflows..."
mkdir -p ~/pocket_lab_iac/.gitea/workflows
cd ~/pocket_lab_iac

# ==========================================
# WORKFLOW: Nomad & Ansible Orchestration Pipeline
# ==========================================
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
          # 1. Orchestrate Nomad Jobs
          export VAULT_ADDR='http://127.0.0.1:8200'
          for dir in */; do
            if [ -f "$dir/app.nomad" ]; then
              echo "Deploying Nomad Workload: $dir"
              nomad job run "$dir/app.nomad"
            fi
          done
          
          # 2. Trigger Ansible Playbooks
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
git commit -m "Initial commit: Orchestration Workflows Initialized"
git remote add origin "http://${GITEA_USER}:${GITEA_PASS}@127.0.0.1:3030/${GITEA_USER}/pocket_lab_iac.git"
git push -u origin main > /dev/null 2>&1

echo "-> Shredding plain-text variables & temporary scripts..."
rm -rf ~/iac-catalog-temp ~/seed_catalog.sh
unset GITEA_PASS
unset GITEA_USER

echo "-> Shutting down temporary boot processes..."
kill $RUNNER_PID
kill $GITEA_PID
kill $VAULT_PID
pkill mysqld || pkill mariadbd || true

echo -e "\e[1;32m✅ Identity, Orchestration Engine, & Catalog Seeded & Ready.\e[0m"
sleep 2

# --- STAGE 9: Secure HTTPS Activation ---
print_header "STAGE 9: Secure HTTPS Activation"
mkdir -p ~/.tailscale
curl -fsSL https://raw.githubusercontent.com/bropines/tailscale-termux-cli/main/remote-install.sh | bash
echo 'TS_SOCKS5_PORT=1055' > ~/.tailscale/.env
tailscaled-start
sleep 3

echo -e "\n\e[1;35m⚠️  ACTION REQUIRED: AUTHENTICATE NODE\e[0m"
tailscale-cli up --hostname=pocket-lab
pause

# --- STAGE 10: Fetch Edge Dashboard & Init Script ---
print_header "STAGE 10: Fetching Edge Dashboard & Configurations"

LATEST_RELEASE=$(curl -s "https://api.github.com/repos/$REPO/releases/latest")
ZIP_URL=$(echo "$LATEST_RELEASE" | jq -r '.assets[] | select(.name=="dist.zip") | .browser_download_url')

wget -q -O ~/dist.zip "$ZIP_URL"
unzip -o ~/dist.zip -d ~/pwa_dist > /dev/null 2>&1
rm ~/dist.zip
if [ -d ~/pwa_dist/dist ]; then mv ~/pwa_dist/dist/* ~/pwa_dist/ && rm -rf ~/pwa_dist/dist; fi

RAW_BASE="https://raw.githubusercontent.com/$REPO/main"
wget -q -O ~/api_server.py "$RAW_BASE/api_server.py"
wget -q -O ~/update_pocketlab.sh "$RAW_BASE/update_pocketlab.sh"
chmod +x ~/update_pocketlab.sh

echo "  -> Generating Init Script (start_dashboard.sh)..."
cat << 'START_DASH_EOF' > ~/start_dashboard.sh
#!/data/data/com.termux/files/usr/bin/bash
echo -e "\n=> 🚀 Igniting Pocket Lab Edge Architecture..."

if [ ! -f ~/api_server.py ]; then
    echo "Error: api_server.py not found. Please download it via the bootstrap script first."
    exit 1
fi

mkdir -p ~/api ~/pocket_lab_logs ~/pwa_dist ~/storage/downloads
rm -f ~/pocket_lab_logs/*.log

echo "  -> Purging old lingering processes..."
pkill python || true
pkill python3 || true
pkill caddy || true
pkill vault || true
pkill gitea || true
pkill act_runner || true
pkill mysqld || pkill mariadbd || true
pkill nomad || true
pkill semaphore || true
sleep 2

# ==========================================
# 1. CORE DATA & IDENTITY ENGINES
# ==========================================
echo "  -> Starting MariaDB Database Engine..."
mkdir -p $PREFIX/var/run/mysqld
MYSQLD_BIN=$(command -v mariadbd || command -v mysqld)
nohup $MYSQLD_BIN --datadir=$PREFIX/var/lib/mysql > ~/pocket_lab_logs/mariadb.log 2>&1 &

echo "  -> Starting HashiCorp Vault Server..."
export VAULT_ADDR='http://127.0.0.1:8200'
nohup vault server -config=$HOME/vault_config.hcl > ~/pocket_lab_logs/vault.log 2>&1 &

echo "  -> Starting Gitea GitOps Registry..."
nohup gitea web -c ~/gitea_data/conf/app.ini > ~/pocket_lab_logs/gitea.log 2>&1 &

echo "  -> Starting Gitea Actions Engine (act_runner)..."
nohup act_runner daemon > ~/pocket_lab_logs/act_runner.log 2>&1 &

# ==========================================
# 2. ENTERPRISE ORCHESTRATION ENGINES
# ==========================================
echo "  -> Starting HashiCorp Nomad Server..."
mkdir -p ~/nomad_data
cat << EOF > ~/nomad_config.hcl
data_dir  = "/data/data/com.termux/files/home/nomad_data"
bind_addr = "0.0.0.0"
server { enabled = true; bootstrap_expect = 1 }
client { enabled = true }
plugin "raw_exec" { config { enabled = true } }
vault {
  enabled = true
  address = "http://127.0.0.1:8200"
  token   = "${ROOT_TOKEN}"
}
EOF
nohup nomad agent -config=$HOME/nomad_config.hcl > ~/pocket_lab_logs/nomad.log 2>&1 &

echo "  -> Starting Ansible Semaphore Automator..."
nohup semaphore server --config=$HOME/semaphore_config.json > ~/pocket_lab_logs/semaphore.log 2>&1 &

# ==========================================
# 3. TELEMETRY & OBSERVABILITY
# ==========================================
cat << 'TELEMETRY_EOF' > ~/telemetry_daemon.sh
#!/bin/bash
echo "Telemetry Daemon Started at $(date)"

TEMP_LIMIT=48      
RAM_LIMIT=90       

while true; do
    TEMP=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo "35000")
    TEMP_C=$((TEMP / 1000))
    MEM_FREE=$(cat /proc/meminfo | grep MemFree | awk '{print $2}')
    MEM_TOTAL=$(cat /proc/meminfo | grep MemTotal | awk '{print $2}')
    MEM_PCT=$(( 100 - (MEM_FREE * 100 / MEM_TOTAL) ))
    
    STATUS="nominal"
    if [ "$TEMP_C" -ge "$TEMP_LIMIT" ]; then STATUS="overheat_intervention"; fi
    if [ "$MEM_PCT" -ge "$RAM_LIMIT" ]; then if [ "$STATUS" == "nominal" ]; then STATUS="memory_intervention"; fi; fi

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

echo "  -> Starting Hardware Telemetry Daemon..."
nohup bash ~/telemetry_daemon.sh > ~/pocket_lab_logs/telemetry.log 2>&1 &

# ==========================================
# 4. USER INTERFACES & API BRIDGES
# ==========================================
echo "  -> Starting PWA Web Server (Port 3000)..."
nohup python3 -m http.server 3000 --directory ~/pwa_dist > ~/pocket_lab_logs/pwa_server.log 2>&1 &

echo "  -> Starting Active API Command Bridge (Port 8080)..."
nohup python3 ~/api_server.py > ~/pocket_lab_logs/api_server.log 2>&1 &

# ==========================================
# 5. MESH NETWORKING & INGRESS
# ==========================================
echo "  -> Starting Caddy Reverse Proxy..."
nohup caddy run --config ~/Caddyfile > ~/pocket_lab_logs/caddy.log 2>&1 &
sleep 2

echo "  -> Binding Tailscale to Caddy..."
tailscale-cli serve --bg --https 443 http://127.0.0.1:8443

echo -e "\n=> ✅ Pocket Lab Services are LIVE and secured by Caddy!"
START_DASH_EOF

chmod +x ~/start_dashboard.sh

cat << 'EOF' > ~/Caddyfile
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

# --- STAGE 11: System Ignition ---
print_header "STAGE 11: System Ignition"
bash ~/start_dashboard.sh
DOMAIN=$(tailscale-cli status --json | jq -r '.Self.DNSName' | sed 's/\.$//')

# Retrieve the Root Token and Unseal Key to present to the user
ROOT_TOKEN=$(jq -r '.root_token' ~/vault_keys.json)
UNSEAL_KEY=$(jq -r '.unseal_keys_b64[0]' ~/vault_keys.json)

clear
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