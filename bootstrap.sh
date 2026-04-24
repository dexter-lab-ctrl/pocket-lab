#!/data/data/com.termux/files/usr/bin/bash
# POCKET LAB - INTERACTIVE EDGE NODE WIZARD

REPO="dexter-lab-ctrl/pocket-lab" # Change to your repo

# --- UI Helper Functions ---
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

# --- STAGE 1: Prerequisites ---
print_header "STAGE 1: Critical OS Prerequisites"
echo -e "\e[1;31mCRITICAL WARNING:\e[0m Android will aggressively kill Termux if these overrides are not completed."
echo ""
echo "Before proceeding, please verify you have completed the following manual steps:"
echo "1. TAILSCALE APP: Installed, logged in, but VPN is currently disconnected (OFF)."
echo "2. PLAY PROTECT: 'Scan apps with Play Protect' is turned OFF in Google Play."
echo "3. BATTERY: Termux & Termux:Boot battery usage is set to 'Unrestricted'."
echo "4. DEVELOPER OPTIONS (Android 12+): 'Disable child process restrictions' is toggled ON."
echo "5. TAILSCALE ADMIN PANEL: 'HTTPS' and 'MagicDNS' are enabled in your Tailscale account."
echo ""
pause

# --- STAGE 2: System Dependencies ---
print_header "STAGE 2: Installing Core Dependencies"
echo "Updating package repositories and installing tools..."
pkg update -y > /dev/null 2>&1
# Note: We omit the default tailscale package here since we use the custom build
pkg install python ttyd wget unzip jq proot-distro -y > /dev/null 2>&1
echo -e "\e[1;32m✅ Dependencies installed.\e[0m"
sleep 1

# --- STAGE 3: Patched Tailscale Integration ---
print_header "STAGE 3: Secure HTTPS Activation"
echo "Deploying custom-patched Tailscale build to bypass Android restrictions..."

# 1. Prepare Directory
mkdir -p ~/.tailscale

# 2. Fetch Custom Build
echo "-> Fetching Termux-optimized binaries..."
curl -fsSL https://raw.githubusercontent.com/bropines/tailscale-termux-cli/main/remote-install.sh | bash

# 3. Configure Proxy
echo "-> Configuring SOCKS5 Proxy..."
echo 'TS_SOCKS5_PORT=1055' > ~/.tailscale/.env

# 4. Start Daemon
echo "-> Starting Tailscale background process..."
tailscaled-start
sleep 3

echo -e "\n\e[1;35m⚠️  ACTION REQUIRED: AUTHENTICATE NODE\e[0m"
echo "We need to bind this Termux environment to your Tailnet."
echo "Running 'tailscale-cli up' now. Please copy the URL it gives you,"
echo "open it in your browser, and authorize this device."
echo "--------------------------------------------------------"
tailscale-cli up --hostname=pocket-lab
echo "--------------------------------------------------------"
pause

# Check if actually connected
IP=$(tailscale-cli ip -4 2>/dev/null)
if [ -z "$IP" ]; then
    echo -e "\e[1;31m❌ Tailscale did not connect. Please rerun the script.\e[0m"
    exit 1
fi
echo -e "\e[1;32m✅ Node bound to Tailnet! IP: $IP\e[0m"

echo "-> Reserving Front-Door routing for future PhotoPrism installation..."
tailscale-cli serve --bg http://127.0.0.1:2342
sleep 2

# --- STAGE 4: Downloading UI and Backend ---
print_header "STAGE 4: Fetching Edge Dashboard"
mkdir -p ~/api ~/pocket_lab_logs ~/pwa_dist

echo "-> Fetching latest React UI from GitHub releases..."
LATEST_RELEASE=$(curl -s "https://api.github.com/repos/$REPO/releases/latest")
ZIP_URL=$(echo "$LATEST_RELEASE" | jq -r '.assets[] | select(.name=="dist.zip") | .browser_download_url')

if [ -z "$ZIP_URL" ] || [ "$ZIP_URL" == "null" ]; then
    echo -e "\e[1;31m❌ Failed to find dist.zip in latest GitHub release.\e[0m"
    exit 1
fi

wget -q -O ~/dist.zip "$ZIP_URL"
unzip -o ~/dist.zip -d ~/pwa_dist > /dev/null 2>&1
rm ~/dist.zip
if [ -d ~/pwa_dist/dist ]; then mv ~/pwa_dist/dist/* ~/pwa_dist/ && rm -rf ~/pwa_dist/dist; fi

echo "-> Fetching backend logic..."
RAW_BASE="https://raw.githubusercontent.com/$REPO/main"
wget -q -O ~/api_server.py "$RAW_BASE/api_server.py"
wget -q -O ~/update_pocketlab.sh "$RAW_BASE/update_pocketlab.sh"
wget -q -O ~/start_dashboard.sh "$RAW_BASE/start_dashboard.sh"

chmod +x ~/update_pocketlab.sh ~/start_dashboard.sh

# --- STAGE 5: Ignition ---
print_header "STAGE 5: System Ignition"
echo "Starting services and multiplexing ports..."
bash ~/start_dashboard.sh

# Get MagicDNS URL dynamically
DOMAIN=$(tailscale-cli status --json | jq -r '.Self.DNSName' | sed 's/\.$//')

clear
echo -e "\e[1;32m====================================================\e[0m"
echo -e "\e[1;32m                 ✅ SYSTEM ONLINE                   \e[0m"
echo -e "\e[1;32m====================================================\e[0m"
echo -e "\nYour Pocket Lab architecture is fully deployed."
echo -e "You can now safely leave Termux running in the background."
echo -e "\n\e[1;36mOpen this URL on any device in your Tailnet to manage apps:\e[0m"
echo -e "\e[1;37mhttps://${DOMAIN}:8443\e[0m\n"