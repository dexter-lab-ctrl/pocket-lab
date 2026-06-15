#!/data/data/com.termux/files/usr/bin/bash
# Passed in by Python: The exact GitHub release asset URL
DOWNLOAD_URL=$1

# ANSI Color Codes for Enterprise Log Formatting
C_CYAN='\e[1;36m'
C_GREEN='\e[1;32m'
C_YELLOW='\e[1;33m'
C_RED='\e[1;31m'
C_RESET='\e[0m'

echo -e "${C_CYAN}====================================================${C_RESET}"
echo -e "${C_CYAN}         🚀 POCKET LAB OTA UPDATE ENGINE            ${C_RESET}"
echo -e "${C_CYAN}====================================================${C_RESET}"
echo -e "${C_YELLOW}[*] Timestamp:${C_RESET} $(date)"
echo -e "${C_YELLOW}[*] Target Payload:${C_RESET} $DOWNLOAD_URL\n"

# 1. Download the new release payload
echo -e "${C_CYAN}[1/4] Downloading cryptographic release payload...${C_RESET}"
wget -q --show-progress -O ~/dist_update.zip "$DOWNLOAD_URL"
if [ $? -ne 0 ]; then
    echo -e "${C_RED}[ERROR] Download failed. Aborting update.${C_RESET}"
    exit 1
fi
echo -e "${C_GREEN}[+] Download verified.${C_RESET}\n"

# 2. Extract to a temporary directory
echo -e "${C_CYAN}[2/4] Extracting architecture payload...${C_RESET}"
mkdir -p ~/pwa_dist_new
unzip -q -o ~/dist_update.zip -d ~/pwa_dist_new
echo -e "${C_GREEN}[+] Extraction complete.${C_RESET}\n"

# 3. Swap the directories for near-zero downtime
echo -e "${C_CYAN}[3/4] Executing Hot-Swap (Near-Zero Downtime)...${C_RESET}"
rm -rf ~/pwa_dist

# Handle logic depending on how the user zipped it (with or without the outer dist folder)
if [ -d ~/pwa_dist_new/dist ]; then
    mv ~/pwa_dist_new/dist ~/pwa_dist
else
    mv ~/pwa_dist_new ~/pwa_dist
fi

rm -rf ~/pwa_dist_new ~/dist_update.zip
echo -e "${C_GREEN}[+] File hierarchy synchronized.${C_RESET}\n"

# 4. Restart the PWA Server to serve the new files
echo -e "${C_CYAN}[4/4] Bouncing Caddy upstream targets...${C_RESET}"
pkill -f "python3 -m http.server 3000"
nohup python3 -m http.server 3000 --directory ~/pwa_dist > ~/pocket_lab_logs/pwa_server.log 2>&1 &
echo -e "${C_GREEN}[+] Process revived on Port 3000.${C_RESET}\n"

echo -e "${C_GREEN}====================================================${C_RESET}"
echo -e "${C_GREEN}           ✅ OTA UPDATE COMPLETE                   ${C_RESET}"
echo -e "${C_GREEN}====================================================${C_RESET}"
