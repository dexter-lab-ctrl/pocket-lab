#!/data/data/com.termux/files/usr/bin/bash
# POCKET LAB ZERO-TOUCH INSTALLER

# --- CRITICAL: CHANGE THIS TO YOUR GITHUB REPOSITORY ---
REPO="dexter-lab-ctrl/pocket-lab" 
# -------------------------------------------------------

echo "=> 🚀 Initializing Pocket Lab Zero-Touch Deployment..."

# 1. Install Dependencies
echo "  -> Installing system dependencies..."
pkg update -y > /dev/null 2>&1
pkg install python ttyd wget unzip jq -y > /dev/null 2>&1

# 2. Setup Directories
mkdir -p ~/api ~/pocket_lab_logs ~/pwa_dist

# 3. Fetch Latest React PWA Release from GitHub
echo "  -> Fetching latest dashboard UI from GitHub..."
LATEST_RELEASE=$(curl -s "https://api.github.com/repos/$REPO/releases/latest")
ZIP_URL=$(echo "$LATEST_RELEASE" | jq -r '.assets[] | select(.name=="dist.zip") | .browser_download_url')

if [ -z "$ZIP_URL" ] || [ "$ZIP_URL" == "null" ]; then
    echo "❌ Failed to find dist.zip in latest GitHub release. Did you attach it to a release?"
    exit 1
fi

wget -q -O ~/dist.zip "$ZIP_URL"
unzip -o ~/dist.zip -d ~/pwa_dist > /dev/null 2>&1
rm ~/dist.zip

# Fix pathing if the zip extracted as a nested folder
if [ -d ~/pwa_dist/dist ]; then 
    mv ~/pwa_dist/dist/* ~/pwa_dist/ 
    rm -rf ~/pwa_dist/dist
fi

# 4. Fetch the Backend Scripts from the main branch
echo "  -> Fetching backend core scripts..."
RAW_BASE="https://raw.githubusercontent.com/$REPO/main"
wget -q -O ~/api_server.py "$RAW_BASE/api_server.py"
wget -q -O ~/update_pocketlab.sh "$RAW_BASE/update_pocketlab.sh"
wget -q -O ~/start_dashboard.sh "$RAW_BASE/start_dashboard.sh"

chmod +x ~/update_pocketlab.sh ~/start_dashboard.sh

# 5. Ignite the System
echo "  -> Igniting Pocket Lab Core..."
bash ~/start_dashboard.sh

echo "----------------------------------------------------"
echo "✅ DEPLOYMENT COMPLETE!"
echo "If Tailscale is connected, your Edge Node is now active."
echo "Access via: https://pocket-lab.[your-tailnet].ts.net:8443"