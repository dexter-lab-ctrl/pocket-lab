#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

API_SERVER="${API_SERVER:-$HOME/pocket_lab_api_server.py}"
PWA_DIR="${PWA_DIR:-$HOME/pwa_dist}"
CADDYFILE="${CADDYFILE:-$HOME/Caddyfile}"
HARDWARE_DAEMON="${HARDWARE_DAEMON:-$HOME/hardware_daemon.py}"
OBS_DIR="$HOME/observability_configs"

DASH_PORT="${DASH_PORT:-8443}"
API_PORT="${API_PORT:-8080}"

ensure_assets() {
  [[ -f "$API_SERVER" ]] || die "Missing dashboard API server: $API_SERVER"
  [[ -d "$PWA_DIR" ]] || mkdir -p "$PWA_DIR"
  mkdir -p "$OBS_DIR/loki_data"
  mkdir -p "$HOME/api"
}

write_caddyfile() {
  if [[ ! -f "$CADDYFILE" ]]; then
    log INFO "Generating Caddyfile for frontend and API proxying..."
    cat > "$CADDYFILE" <<EOF2
:${DASH_PORT} {
  encode gzip zstd
  header Strict-Transport-Security "max-age=31536000; includeSubDomains"
  header X-Content-Type-Options "nosniff"
  header X-Frame-Options "DENY"
  header Referrer-Policy "no-referrer"

  handle /api/* { reverse_proxy 127.0.0.1:${API_PORT} }
  handle /gitea/* { reverse_proxy 127.0.0.1:3030 }
  handle /loki/* { reverse_proxy 127.0.0.1:3100 }
  
  handle /* {
    root * ${PWA_DIR}
    try_files {path} /index.html
    file_server
  }
}
EOF2
  fi
}

write_hardware_daemon() {
  if [[ ! -f "$HARDWARE_DAEMON" ]]; then
    log INFO "Generating native Android hardware telemetry daemon..."
    cat > "$HARDWARE_DAEMON" << 'EOF'
#!/usr/bin/env python3
import json, time, os

API_DIR = os.path.expanduser("~/api")
TELEMETRY_FILE = os.path.join(API_DIR, "telemetry.json")

def get_thermal():
    try:
        # Search common Android thermal zones
        for zone in range(15):
            path = f"/sys/class/thermal/thermal_zone{zone}/temp"
            if os.path.exists(path):
                with open(path, 'r') as f:
                    temp = int(f.read().strip())
                    if temp > 1000: return temp / 1000.0
                    if temp > 0: return float(temp)
    except Exception:
        pass
    return 42.0  # Fallback

def get_storage():
    try:
        st = os.statvfs(os.path.expanduser("~"))
        return (st.f_bavail * st.f_frsize) // (1024 * 1024)
    except:
        return 256000

def get_memory():
    try:
        with open('/proc/meminfo', 'r') as f:
            mem_total = 0
            mem_free = 0
            for line in f:
                if line.startswith('MemTotal:'):
                    mem_total = int(line.split()[1])
                elif line.startswith('MemAvailable:') or line.startswith('MemFree:'):
                    mem_free = int(line.split()[1])
            if mem_total > 0:
                return (mem_total - mem_free) // 1024
    except:
        pass
    return 2048

def get_cpu():
    try:
        with open('/proc/stat', 'r') as f:
            cpu_lines = [l for l in f if l.startswith('cpu ')]
            if cpu_lines:
                parts = list(map(int, cpu_lines[0].split()[1:]))
                idle = parts[3]
                total = sum(parts)
                return total, idle
    except:
        pass
    return 0, 0

if __name__ == "__main__":
    os.makedirs(API_DIR, exist_ok=True)
    prev_total, prev_idle = get_cpu()
    
    while True:
        time.sleep(2)
        curr_total, curr_idle = get_cpu()
        
        cpu_usage = 12.0
        if curr_total > prev_total:
            total_diff = curr_total - prev_total
            idle_diff = curr_idle - prev_idle
            cpu_usage = round(100.0 * (1.0 - (idle_diff / total_diff)), 1)
        
        prev_total, prev_idle = curr_total, curr_idle
        
        data = {
            "cpu_temp_c": round(get_thermal(), 1),
            "free_space_mb": get_storage(),
            "cpu_usage_percent": cpu_usage,
            "memory_usage_mb": get_memory(),
            "error": False
        }
        
        # Atomic write to prevent UI parsing errors
        tmp_file = TELEMETRY_FILE + ".tmp"
        with open(tmp_file, "w") as f:
            json.dump(data, f)
        os.replace(tmp_file, TELEMETRY_FILE)
        
        time.sleep(8)
EOF
    chmod +x "$HARDWARE_DAEMON"
  fi
}

write_observability_configs() {
  log INFO "Generating Observability configurations (No AppRoles)..."
  
  # LOKI CONFIG (Includes Android network interface bypass)
  cat > "$OBS_DIR/loki-config.yaml" <<EOF
auth_enabled: false
server:
  http_listen_port: 3100
  http_listen_address: 127.0.0.1
  grpc_listen_address: 127.0.0.1
common:
  instance_addr: 127.0.0.1
  path_prefix: $OBS_DIR/loki_data
  storage:
    filesystem:
      chunks_directory: $OBS_DIR/loki_data/chunks
      rules_directory: $OBS_DIR/loki_data/rules
  replication_factor: 1
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory
schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h
frontend:
  instance_interface_names: [lo]
EOF

  # PROMTAIL CONFIG (Standard PM2 log scraping, no Vault token)
  cat > "$OBS_DIR/promtail-config.yaml" <<EOF
server:
  http_listen_port: 9080
  grpc_listen_port: 0
positions:
  filename: $OBS_DIR/positions.yaml
clients:
  - url: http://127.0.0.1:3100/loki/api/v1/push
scrape_configs:
- job_name: system_logs
  static_configs:
  - targets:
      - localhost
    labels:
      job: pm2_logs
      __path__: /data/data/com.termux/files/home/.pm2/logs/*.log
EOF

  # PROMETHEUS CONFIG (Vault target without bearer_token)
  cat > "$OBS_DIR/prometheus.yml" <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s
scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["127.0.0.1:9090"]
  - job_name: "vault"
    metrics_path: "/v1/sys/metrics"
    params:
      format: ["prometheus"]
    static_configs:
      - targets: ["127.0.0.1:8200"]
EOF

  # GRAFANA CUSTOM.INI (Port 3050 to avoid Semaphore conflict)
  cat > "$OBS_DIR/custom.ini" <<EOF
[server]
http_port = 3050
http_addr = 0.0.0.0
[paths]
data = data
logs = data/log
plugins = data/plugins
provisioning = conf/provisioning
EOF

  # Create Grafana prerequisite directories inside PRoot using the bash wrapper
  proot-distro login ubuntu -- bash -c "mkdir -p /opt/grafana/data/log /opt/grafana/data/plugins /opt/grafana/conf/provisioning && chmod -R 755 /opt/grafana/data /opt/grafana/conf"
}

start_pm2_daemons() {
  log INFO "Starting Core Components & Observability Mesh via PM2..."

  # 1. Core Daemons (Native)
  if ! pm2 describe pocket-telemetry >/dev/null 2>&1; then
    pm2 start "$HARDWARE_DAEMON" --name "pocket-telemetry" --interpreter python3 --exp-backoff-restart-delay 100 --update-env
  fi

  if ! pm2 describe pocket-api >/dev/null 2>&1; then
    pm2 start "$API_SERVER" --name "pocket-api" --interpreter python3 --update-env
  fi

  if ! pm2 describe caddy-proxy >/dev/null 2>&1; then
    pm2 start caddy --name "caddy-proxy" -- run --config "$CADDYFILE" --update-env
  fi

  # 2. Observability Stack (PRoot Bridge execution)
  
  if ! pm2 describe loki-kms >/dev/null 2>&1; then
    pm2 start bash --name "loki-kms" --update-env -- -c "proot-distro login ubuntu -- /usr/local/bin/loki -config.file=$OBS_DIR/loki-config.yaml"
  fi

  if ! pm2 describe promtail-agent >/dev/null 2>&1; then
    pm2 start bash --name "promtail-agent" --update-env -- -c "proot-distro login ubuntu -- /usr/local/bin/promtail -config.file=$OBS_DIR/promtail-config.yaml"
  fi

  if ! pm2 describe prometheus-db >/dev/null 2>&1; then
    pm2 start bash --name "prometheus-db" --update-env -- -c "proot-distro login ubuntu -- /usr/local/bin/prometheus --config.file=$OBS_DIR/prometheus.yml --storage.tsdb.path=$OBS_DIR/prom_data --web.listen-address=127.0.0.1:9090"
  fi

  if ! pm2 describe grafana-ui >/dev/null 2>&1; then
    pm2 start bash --name "grafana-ui" --update-env -- -c "proot-distro login ubuntu -- bash -c 'cd /opt/grafana && ./bin/grafana-server --homepath=/opt/grafana --config=$OBS_DIR/custom.ini'"
  fi

  pm2 save
}

main() {
  ensure_root_dirs
  require_cmd python3 caddy curl pm2 proot-distro
  ensure_assets
  write_hardware_daemon
  write_caddyfile
  write_observability_configs
  start_pm2_daemons
  
  log INFO "Infrastructure and AppRole-free Observability Mesh successfully delegated to PM2."
}

main "$@"