#!/data/data/com.termux/files/usr/bin/bash
echo -e "\n=> 🚀 Igniting Pocket Lab Edge Architecture..."

# Ensure our new active API server file exists
if [ ! -f ~/api_server.py ]; then
    echo "Error: api_server.py not found. Please download it via the bootstrap script first."
    exit 1
fi

# Fault Tolerance & Log Rotation
mkdir -p ~/api ~/pocket_lab_logs ~/pwa_dist
rm -f ~/pocket_lab_logs/*.log

echo "  -> Purging old lingering processes..."
pkill python || true
pkill python3 || true
pkill caddy || true
pkill vault || true
pkill gitea || true
pkill act_runner || true
pg_ctl -D $PREFIX/var/lib/postgresql stop > /dev/null 2>&1 || true
sleep 2

# ==========================================
# 1. CORE DATA & IDENTITY ENGINES
# ==========================================
echo "  -> Starting PostgreSQL Database Engine..."
pg_ctl -D $PREFIX/var/lib/postgresql start > ~/pocket_lab_logs/postgres_boot.log 2>&1

echo "  -> Starting HashiCorp Vault Server..."
export VAULT_ADDR='http://127.0.0.1:8200'
nohup vault server -config=$HOME/vault_config.hcl > ~/pocket_lab_logs/vault.log 2>&1 &

echo "  -> Starting Gitea GitOps Registry..."
nohup gitea web -c ~/gitea_data/conf/app.ini > ~/pocket_lab_logs/gitea.log 2>&1 &

echo "  -> Starting Gitea Actions Engine (act_runner)..."
nohup act_runner daemon > ~/pocket_lab_logs/act_runner.log 2>&1 &

# ==========================================
# 2. TELEMETRY & OBSERVABILITY
# ==========================================
# Create the Telemetry Daemon with Pocket Warden Logic
cat << 'EOF' > ~/telemetry_daemon.sh
#!/bin/bash
echo "Telemetry Daemon Started at $(date)"

# Pocket Warden Configuration
TEMP_LIMIT=48      
RAM_LIMIT=90       

while true; do
    # Read Sensors
    TEMP=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo "35000")
    TEMP_C=$((TEMP / 1000))
    MEM_FREE=$(cat /proc/meminfo | grep MemFree | awk '{print $2}')
    MEM_TOTAL=$(cat /proc/meminfo | grep MemTotal | awk '{print $2}')
    MEM_PCT=$(( 100 - (MEM_FREE * 100 / MEM_TOTAL) ))
    
    # Intervention Logic
    STATUS="nominal"
    if [ "$TEMP_C" -ge "$TEMP_LIMIT" ]; then
        STATUS="overheat_intervention"
    fi
    if [ "$MEM_PCT" -ge "$RAM_LIMIT" ]; then
        if [ "$STATUS" == "nominal" ]; then
            STATUS="memory_intervention"
        fi
    fi

    if [ "$STATUS" != "nominal" ]; then
        pkill -9 photoprism || true
        pkill -9 ffmpeg || true
    fi

    # Write Telemetry JSON
    JSON="{ \"cpuTemp\": $TEMP_C, \"ramPct\": $MEM_PCT, \"status\": \"$STATUS\", \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\" }"
    echo "$JSON" > ~/api/telemetry.json
    sleep 2
done
EOF
chmod +x ~/telemetry_daemon.sh

# Start Telemetry Daemon
echo "  -> Starting Hardware Telemetry Daemon..."
nohup bash ~/telemetry_daemon.sh > ~/pocket_lab_logs/telemetry.log 2>&1 &

# ==========================================
# 3. USER INTERFACES & API BRIDGES
# ==========================================
echo "  -> Starting PWA Web Server (Port 3000)..."
nohup python3 -m http.server 3000 --directory ~/pwa_dist > ~/pocket_lab_logs/pwa_server.log 2>&1 &

echo "  -> Starting Active API Command Bridge (Port 8080)..."
nohup python3 ~/api_server.py > ~/pocket_lab_logs/api_server.log 2>&1 &

# ==========================================
# 4. MESH NETWORKING & INGRESS
# ==========================================
echo "  -> Starting Caddy Reverse Proxy..."
nohup caddy run --config ~/Caddyfile > ~/pocket_lab_logs/caddy.log 2>&1 &
sleep 2

# Bind Tailscale directly to Caddy (Single Command)
echo "  -> Binding Tailscale to Caddy..."
tailscale-cli serve --bg --https 443 http://127.0.0.1:8443

echo -e "\n=> ✅ Pocket Lab Services are LIVE and secured by Caddy!"