#!/data/data/com.termux/files/usr/bin/bash
# Passed in by Python: The exact GitHub release asset URL
DOWNLOAD_URL=$1 

echo "Starting OTA Update from: $DOWNLOAD_URL"
echo "Timestamp: $(date)"

# 1. Download the new release payload
wget -q -O ~/dist_update.zip "$DOWNLOAD_URL"

# 2. Extract to a temporary directory
mkdir -p ~/pwa_dist_new
unzip -o ~/dist_update.zip -d ~/pwa_dist_new

# 3. Swap the directories for near-zero downtime
rm -rf ~/pwa_dist

# Handle logic depending on how the user zipped it (with or without the outer dist folder)
if [ -d ~/pwa_dist_new/dist ]; then
    mv ~/pwa_dist_new/dist ~/pwa_dist
else
    mv ~/pwa_dist_new ~/pwa_dist
fi

rm -rf ~/pwa_dist_new ~/dist_update.zip

# 4. Restart the PWA Server to serve the new files
pkill -f "python3 -m http.server 3000"
nohup python3 -m http.server 3000 --directory ~/pwa_dist > ~/pocket_lab_logs/pwa_server.log 2>&1 &

echo "OTA Update Complete!"