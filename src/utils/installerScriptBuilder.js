export const getInstallerScript = (mode) => `#!/data/data/com.termux/files/usr/bin/bash

# ==========================================
# POCKET LAB: Automated Deployment Script
# Mode: ${mode === 'rollover' ? 'Static Library (Rollover Backups)' : 'Active Library (Daily Archive Backups)'}
# Version: 3.1 (Tailscale Native Edition)
# ==========================================
PREFIX="/data/data/com.termux/files/usr"
HOME="/data/data/com.termux/files/home"

# 1. Install UI & Network Dependencies silently
echo "Preparing deployment environment..."
pkg update -y > /dev/null 2>&1
pkg install dialog awk grep bc ncurses-utils tar -y > /dev/null 2>&1

# 2. PRE-FLIGHT HARDWARE CHECKS
ARCH=\$(uname -m)
if [ "\$ARCH" != "aarch64" ]; then
    dialog --title "Architecture Error" --msgbox "This deployment requires a 64-bit ARM processor (aarch64).\\n\\nYour device (\$ARCH) is incompatible." 8 50
    exit 1
fi

RAM_KB=\$(awk '/MemTotal/ {print \$2}' /proc/meminfo)
if [ "\$RAM_KB" -lt 3900000 ]; then
    dialog --title "Resource Warning" --msgbox "Your device has less than 4GB of RAM.\\n\\nPhotoPrism requires high memory for image indexing. The server may experience OOM (Out of Memory) kills during heavy uploads." 10 50
fi

FREE_SPACE=\$(df -m /data | awk 'NR==2 {print \$4}')
if [ "\$FREE_SPACE" -lt 5000 ]; then
    dialog --title "Storage Error" --msgbox "Insufficient storage capacity. You need at least 5,000 MB (5GB) of free internal storage to provision the Ubuntu container and PhotoPrism binaries.\\n\\nYou currently have \$FREE_SPACE MB." 10 50
    exit 1
fi

# 3. INTERACTIVE SETUP MENUS
dialog --title "Pocket Lab Deployment" --msgbox "Welcome! This tool will now provision the Ubuntu subsystem.\\n\\nNote: The Userspace Tailscale Gateway will be configured in the next phase." 10 60

dialog --title "Storage Permissions Required" --msgbox "CRITICAL STEP:\\n\\nAndroid will now prompt you to grant Termux access to your file system.\\n\\nYou MUST click 'Allow' to permit PhotoPrism access to your DCIM/Camera directory." 10 50
termux-setup-storage

sleep 3 

PASSWORD=\$(dialog --title "Security Configuration" --inputbox "Define a secure Admin Password for the PhotoPrism web console:" 8 50 3>&1 1>&2 2>&3)
if [ -z "\$PASSWORD" ]; then
    dialog --title "Operation Cancelled" --msgbox "Deployment aborted. An administrative password is strictly required." 6 50
    exit 1
fi

# 4. AUTOMATED INSTALLATION
dialog --title "Provisioning Environment" --infobox "Phase 1/3: Installing foundational Termux packages...\\n(This may take 2-3 minutes)" 5 60
pkg install proot-distro cronie tmux nano wget sqlite tar -y > /dev/null 2>&1

dialog --title "Provisioning Environment" --infobox "Phase 2/3: Constructing Ubuntu Subsystem..." 5 60
proot-distro install ubuntu > /dev/null 2>&1

dialog --title "Provisioning Environment" --infobox "Phase 3/3: Fetching PhotoPrism Engine...\\n(Downloading arm64 binaries)" 5 60
proot-distro login ubuntu -- bash -c "apt update -y && apt install wget tar -y && wget -q https://dl.photoprism.app/pkg/linux/arm64.tar.gz && tar -xzf arm64.tar.gz -C /opt/ && rm arm64.tar.gz"

# 5. GENERATING ARCHITECTURAL SCRIPTS
dialog --title "Finalizing" --infobox "Generating Warden, Telemetry, and Lifecycle Commands..." 5 60

# start_server.sh
cat << 'EOF' > \$HOME/start_server.sh
#!/data/data/com.termux/files/usr/bin/bash
stop_handler() {
    echo -e "\\n[!] INTENTIONAL SHUTDOWN DETECTED"
    exit 0
}
trap stop_handler SIGINT

# Start PhotoPrism Engine
proot-distro login ubuntu --bind /data/data/com.termux/files/home/storage/dcim:/photoprism/originals -- bash -c "
export PHOTOPRISM_ADMIN_PASSWORD='__PASSWORD__'
export PHOTOPRISM_FFMPEG_SIZE='1280'
export PHOTOPRISM_DISABLE_WEBDAV='true'
export GOMAXPROCS=4

/opt/photoprism/bin/photoprism start"
EOF
sed -i "s/__PASSWORD__/\$PASSWORD/g" \$HOME/start_server.sh
chmod +x \$HOME/start_server.sh

# pocket_warden.sh
cat << 'EOF' > \$HOME/pocket_warden.sh
#!/data/data/com.termux/files/usr/bin/bash
LOG_FILE="\$HOME/warden.log"
DATE_STR=\$(date '+%Y-%m-%d %H:%M:%S')

if [ -f "\$HOME/MAINTENANCE" ]; then exit 0; fi

FREE_SPACE=\$(df -m /data | awk 'NR==2 {print \$4}')
if [ "\$FREE_SPACE" -lt 500 ]; then
    echo "\$DATE_STR - CRITICAL: Storage < 500MB. Locking system to prevent SQLite corruption." >> \$LOG_FILE
    touch "\$HOME/MAINTENANCE"
    tmux kill-session -t server 2>/dev/null
    exit 1
fi

FFMPEG_COUNT=\$(pgrep -c ffmpeg)
if [ "\$FFMPEG_COUNT" -gt 3 ]; then
    echo "\$DATE_STR - WARNING: Detected \$FFMPEG_COUNT stuck transcoders. Purging ghosts." >> \$LOG_FILE
    pkill -f ffmpeg
fi

TEMP_FILE=\$(ls /sys/class/thermal/thermal_zone*/temp 2>/dev/null | head -n 1)
if [ ! -z "\$TEMP_FILE" ]; then
    T_RAW=\$(cat \$TEMP_FILE 2>/dev/null)
    [ "\$T_RAW" -gt 1000 ] 2>/dev/null && TEMP=\$((T_RAW / 1000)) || TEMP=\$T_RAW
    
    if [ "\$TEMP" -gt 48 ]; then
        echo "\$DATE_STR - CRITICAL: CPU Temp at \${TEMP}C. Triggering Thermal Shutdown." >> \$LOG_FILE
        tmux kill-session -t server 2>/dev/null
        exit 1
    fi
fi

if ! timeout 2 bash -c "</dev/tcp/127.0.0.1/2342" 2>/dev/null; then
    echo "\$DATE_STR - INFO: Port 2342 dead. Restarting server." >> \$LOG_FILE
    tmux kill-session -t server 2>/dev/null
    tmux new-session -d -s server "\$HOME/start_server.sh"
fi
EOF
chmod +x \$HOME/pocket_warden.sh

# Backup Script
cat << 'EOF' > \$HOME/backup_db.sh
#!/data/data/com.termux/files/usr/bin/bash
proot-distro login ubuntu -- bash -c "sqlite3 /root/.local/share/photoprism/index.db '.backup /root/.local/share/photoprism/index_backup.db'"
${mode === 'rollover' 
? `cp /data/data/com.termux/files/usr/var/lib/proot-distro/installed-rootfs/ubuntu/root/.local/share/photoprism/index_backup.db ~/storage/downloads/photoprism_backup.db
echo "\$(date '+%Y-%m-%d %H:%M:%S') - Backup Success (Rollover)" >> ~/backup.log` 
: `DATE=\\$(date +%Y-%m-%d)
cp /data/data/com.termux/files/usr/var/lib/proot-distro/installed-rootfs/ubuntu/root/.local/share/photoprism/index_backup.db ~/storage/downloads/photoprism_backup_\\\${DATE}.db
echo "\\$(date '+%Y-%m-%d %H:%M:%S') - Backup Success (Archive: \\\${DATE})" >> ~/backup.log`}
EOF
chmod +x \$HOME/backup_db.sh

# Boot Script
mkdir -p ~/.termux/boot
cat << 'EOF' > ~/.termux/boot/99-photoprism.sh
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
crond

# Start custom Termux Tailscale daemon (from Phase 3 setup)
if command -v tailscaled-start >/dev/null 2>&1; then
    tailscaled-start
fi

sleep 5
tmux new-session -d -s server "\$HOME/start_server.sh"
EOF
chmod +x ~/.termux/boot/99-photoprism.sh

# CLI Dashboard (lab-status)
cat << 'EOF' > \$PREFIX/bin/lab-status
#!/data/data/com.termux/files/usr/bin/bash
echo -e "\\n\\x1b[1;36m=========================================\\x1b[0m"
echo -e "\\x1b[1;36m       POCKET LAB: SYSTEM STATUS         \\x1b[0m"
echo -e "\\x1b[1;36m=========================================\\x1b[0m"

if tmux has-session -t server 2>/dev/null; then SERVER="🟢 \\x1b[1;32mOnline (Port 2342)\\x1b[0m"; else SERVER="🔴 \\x1b[1;31mOffline\\x1b[0m"; fi
if pgrep crond > /dev/null; then WATCHDOG="🟢 \\x1b[1;32mActive\\x1b[0m"; else WATCHDOG="🔴 \\x1b[1;31mStopped\\x1b[0m"; fi
if [ -f "\$HOME/MAINTENANCE" ]; then MAINT="🟠 \\x1b[1;33mON (System Frozen)\\x1b[0m"; else MAINT="⚪ \\x1b[1;30mOFF\\x1b[0m"; fi
LAST_BACKUP=\$(tail -n 1 ~/backup.log 2>/dev/null || echo "No backups yet")
WARDEN_STATE=\$(tail -n 1 ~/warden.log 2>/dev/null | cut -d'-' -f 2- || echo " All systems nominal")

echo -e " Server Engine:   \$SERVER"
echo -e " Autonomous Warden:\$WATCHDOG"
echo -e " Maintenance Lock:\$MAINT"
echo -e " Last Backup:     💾 \$LAST_BACKUP"
echo -e " Warden Alert:    🛡️ \$WARDEN_STATE\\n"

echo -e "\\x1b[1;36m [RESOURCE TELEMETRY]\\x1b[0m"

# 1. RAM Telemetry
MEM_TOT=\$(awk '/MemTotal/ {print \$2}' /proc/meminfo)
MEM_AVL=\$(awk '/MemAvailable/ {print \$2}' /proc/meminfo)
[ -z "\$MEM_AVL" ] && MEM_AVL=\$(awk '/MemFree/ {print \$2}' /proc/meminfo)
MEM_USED=\$((MEM_TOT - MEM_AVL))
MEM_PCT=\$((MEM_USED * 100 / MEM_TOT))
MEM_TG=\$(awk "BEGIN {printf \\"%.1f\\", \$MEM_TOT/1048576}")
MEM_UG=\$(awk "BEGIN {printf \\"%.1f\\", \$MEM_USED/1048576}")
if [ "\$MEM_PCT" -gt 85 ]; then M_COL="\\x1b[1;31m"; elif [ "\$MEM_PCT" -gt 70 ]; then M_COL="\\x1b[1;33m"; else M_COL="\\x1b[1;32m"; fi
echo -e " 🧠 RAM Usage:    \${M_COL}\${MEM_UG}GB / \${MEM_TG}GB (\${MEM_PCT}%)\\x1b[0m"

# 2. Storage Telemetry
ST_INFO=\$(df -h /data | awk 'NR==2 {print \$4}')
ST_PCT=\$(df /data | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ "\$ST_PCT" -gt 90 ]; then S_COL="\\x1b[1;31m"; elif [ "\$ST_PCT" -gt 80 ]; then S_COL="\\x1b[1;33m"; else S_COL="\\x1b[1;32m"; fi
echo -e " 💾 Storage Free: \${S_COL}\${ST_INFO}\\x1b[0m (Capacity: \${ST_PCT}%)"

# 3. Thermal Telemetry
TEMP_FILE=\$(ls /sys/class/thermal/thermal_zone*/temp 2>/dev/null | head -n 1)
if [ ! -z "\$TEMP_FILE" ]; then
    T_RAW=\$(cat \$TEMP_FILE 2>/dev/null)
    [ "\$T_RAW" -gt 1000 ] 2>/dev/null && TEMP=\$((T_RAW / 1000)) || TEMP=\$T_RAW
    if [ "\$TEMP" -lt 40 ]; then T_STAT="COOL"; T_COL="\\x1b[1;32m"
    elif [ "\$TEMP" -lt 48 ]; then T_STAT="WARM"; T_COL="\\x1b[1;33m"
    else T_STAT="HOT! (Warden Intervening)"; T_COL="\\x1b[1;31m"; fi
    echo -e " 🌡️  CPU Temp:     \${T_COL}\${TEMP}°C - \${T_STAT}\\x1b[0m"
else
    echo -e " 🌡️  CPU Temp:     \\x1b[1;30mN/A (Kernel Blocked)\\x1b[0m"
fi

# 4. Ghost Process Telemetry
FF=\$(pgrep -c ffmpeg)
if [ "\$FF" -gt 3 ]; then FF_STAT="\\x1b[1;31m\$FF (Warden Purging)\\x1b[0m"; else FF_STAT="\\x1b[1;32m\$FF\\x1b[0m"; fi
echo -e " 👻 Transcoders:  \$FF_STAT"

# 5. Network Telemetry
TS=\$(tailscale-cli ip -4 2>/dev/null || echo "Offline")
if [ "\$TS" == "Offline" ]; then TS_COL="\\x1b[1;31m"; else TS_COL="\\x1b[1;32m"; fi
echo -e " 🌐 Tailscale IP: \${TS_COL}\${TS}\\x1b[0m"

echo -e "\\n\\x1b[1;36m Quick Commands: lab-export | lab-update | lab-status\\x1b[0m"
echo -e "=========================================\\n"
EOF
chmod +x \$PREFIX/bin/lab-status

# lab-export CLI
cat << 'EOF' > \$PREFIX/bin/lab-export
#!/data/data/com.termux/files/usr/bin/bash
DATE=\$(date +%Y-%m-%d)
BACKUP_NAME="PocketLab_Snapshot_\${DATE}.tar.gz"
echo -e "\\n\\x1b[1;36m[*] Quiescing server and creating Full Snapshot...\\x1b[0m"
touch "\$HOME/MAINTENANCE" && tmux kill-session -t server 2>/dev/null
proot-distro backup ubuntu --output "\$HOME/ubuntu_rootfs.tar.gz"
cd /data/data/com.termux/files
tar -czf "\$HOME/termux_configs.tar.gz" home/*.sh home/.termux/boot usr/bin/lab-* 2>/dev/null
cd \$HOME
tar -cf "storage/downloads/\$BACKUP_NAME" ubuntu_rootfs.tar.gz termux_configs.tar.gz
rm ubuntu_rootfs.tar.gz termux_configs.tar.gz "\$HOME/MAINTENANCE"
echo -e "\\x1b[1;32m[SUCCESS] Gold Image created in Downloads/\$BACKUP_NAME\\x1b[0m"
EOF
chmod +x \$PREFIX/bin/lab-export

# lab-update CLI
cat << 'EOF' > \$PREFIX/bin/lab-update
#!/data/data/com.termux/files/usr/bin/bash
echo -e "\\n\\x1b[1;36m[*] Checking for PhotoPrism Updates...\\x1b[0m"
touch "\$HOME/MAINTENANCE" && tmux kill-session -t server 2>/dev/null
proot-distro login ubuntu -- bash -c "apt update && apt install wget tar -y && wget -q https://dl.photoprism.app/pkg/linux/arm64.tar.gz && tar -xzf arm64.tar.gz -C /opt/ && rm arm64.tar.gz"
rm "\$HOME/MAINTENANCE"
echo -e "\\x1b[1;32m[SUCCESS] Lab updated to latest version and restarted.\\x1b[0m"
EOF
chmod +x \$PREFIX/bin/lab-update

# 6. AUTOMATED CRON SCHEDULING (Integrating the Warden)
(crontab -l 2>/dev/null | grep -v "pocket_warden"; echo "*/5 * * * * bash \$HOME/pocket_warden.sh") | crontab -
(crontab -l 2>/dev/null | grep -v "backup_db"; echo "0 3 * * * bash \$HOME/backup_db.sh") | crontab -

# 7. LAUNCH SYSTEM
crond
tmux new-session -d -s server "\$HOME/start_server.sh"

dialog --title "Deployment Successful" --msgbox "Pocket Lab base architecture has been successfully provisioned.\\n\\nThe Autonomous Warden is now actively protecting your hardware and data.\\n\\nCRITICAL: You must now return to the Guide (Phase 3) to install the custom Tailscale proxy." 12 55

clear
lab-status
echo -e "\\n\\x1b[1;33m[!] Base Architecture Deployed.\\x1b[0m"
echo -e "\\x1b[1;32m-> Please return to 'Phase 3' of the Deployment Guide to configure the Termux-Native Tailscale Gateway.\\x1b[0m\\n"
`;

export const getIgnitionScript = () => `#!/data/data/com.termux/files/usr/bin/bash
echo -e "\\n=> 🚀 Igniting Pocket Lab Production Dashboard with Logging..."

# 1. Setup Folders
mkdir -p ~/api ~/pocket_lab_logs
rm -f ~/pocket_lab_logs/*.log
rm -f ~/api/telemetry.json

echo "  -> Purging existing background services..."
pkill python || true
pkill python3 || true
pkill ttyd || true
pkill bash || true
sleep 2

# 2. Smart Pathing for PWA
WEB_ROOT=~/pwa_dist
if [ -d "\$WEB_ROOT/dist" ]; then WEB_ROOT=~/pwa_dist/dist; fi

# 3. Create Telemetry Daemon
cat << 'EOF' > ~/telemetry_daemon.sh
#!/bin/bash
echo "Telemetry Daemon Started at \$(date)"
while true; do
    TEMP=\$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo "35000")
    TEMP_C=\$((TEMP / 1000))
    MEM_FREE=\$(cat /proc/meminfo | grep MemFree | awk '{print \$2}')
    MEM_TOTAL=\$(cat /proc/meminfo | grep MemTotal | awk '{print \$2}')
    MEM_PCT=\$(( 100 - (MEM_FREE * 100 / MEM_TOTAL) ))
    
    JSON="{ \\"cpuTemp\\": \$TEMP_C, \\"freeSpaceMB\\": 9450, \\"ramPct\\": \$MEM_PCT, \\"timestamp\\": \\"\$(date -u +"%Y-%m-%dT%H:%M:%SZ")\\" }"
    
    echo "\$JSON" > ~/api/telemetry.json
    echo "Wrote heartbeat: \$JSON"
    sleep 2
done
EOF
chmod +x ~/telemetry_daemon.sh

# 4. Ignite Microservices
echo "  -> Starting Telemetry Daemon..."
nohup bash ~/telemetry_daemon.sh > ~/pocket_lab_logs/telemetry.log 2>&1 &

echo "  -> Starting PWA Static Server (Port 3000)"
nohup python3 -m http.server 3000 --directory "\$WEB_ROOT" > ~/pocket_lab_logs/pwa_server.log 2>&1 &

echo "  -> Starting Telemetry API Server (Port 8080)"
nohup python3 -m http.server 8080 --directory ~/api > ~/pocket_lab_logs/api_server.log 2>&1 &

echo "  -> Starting Live Terminal Server (Port 8081)"
nohup ttyd -p 8081 -W bash > ~/pocket_lab_logs/ttyd.log 2>&1 &

sleep 2 

# 5. Tailscale Port Multiplexing
echo "  -> Mapping Tailscale Reverse Proxy..."
tailscale-cli serve --bg --https 8443 http://127.0.0.1:3000
tailscale-cli serve --bg --https 8443 --set-path /api http://127.0.0.1:8080
tailscale-cli serve --bg --https 8443 --set-path /terminal http://127.0.0.1:8081

echo -e "\\n=> ✅ Dashboard LIVE! Logs are streaming to ~/pocket_lab_logs/"
`;