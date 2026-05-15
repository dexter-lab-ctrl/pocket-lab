#!/usr/bin/env bash
# ==============================================================================
# Script: install-pwa-ui.sh
# Purpose: Fetches the latest compiled React PWA release from GitHub
# ==============================================================================

set -e

REPO="dexter-lab-ctrl/pocket-lab"
PWA_DIR="$HOME/pwa_dist"
TMP_ZIP="/data/data/com.termux/files/usr/tmp/dist.zip"
TMP_DIR="/data/data/com.termux/files/usr/tmp/pwa_extract"

echo "======================================================"
echo "🌐 Installing Pocket Lab UI from GitHub Releases..."
echo "======================================================"

# Ensure directories exist
mkdir -p "$PWA_DIR"
mkdir -p "$TMP_DIR"

# 1. Fetch the download URL of the latest dist.zip
echo "[1/3] Querying GitHub API for latest release..."
DOWNLOAD_URL=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" | grep "browser_download_url.*dist.zip" | cut -d '"' -f 4)

if [ -z "$DOWNLOAD_URL" ]; then
    echo "❌ ERROR: Could not find 'dist.zip' in the latest release for $REPO."
    echo "Please ensure you have created a GitHub Release and attached 'dist.zip'."
    exit 1
fi

# 2. Download the artifact
echo "[2/3] Downloading artifact: $DOWNLOAD_URL"
curl -L -o "$TMP_ZIP" "$DOWNLOAD_URL"

# 3. Extract and move to PWA_DIR
echo "[3/3] Extracting assets to $PWA_DIR..."
unzip -q -o "$TMP_ZIP" -d "$TMP_DIR"

# Handle potential nested 'dist/' folder from the zip process
if [ -d "$TMP_DIR/dist" ]; then
    cp -r "$TMP_DIR/dist/"* "$PWA_DIR/"
else
    cp -r "$TMP_DIR/"* "$PWA_DIR/"
fi

# Clean up
rm -rf "$TMP_ZIP" "$TMP_DIR"

echo "✅ UI Installation Complete! Assets are ready in $PWA_DIR."