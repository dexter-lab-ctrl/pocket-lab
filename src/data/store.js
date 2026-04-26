import { Settings, Network, RefreshCw, Activity, Server, ImageIcon, Database } from 'lucide-react';

export const appCatalog = [
  {
    id: "ubuntu", // Matches the telemetry subsystem ID
    name: "Ubuntu Core Subsystem",
    Icon: Server,
    description: "The foundational Linux layer required to run enterprise applications securely on Android.",
    status: "Core Requirement",
    port: null,
    installScript: `#!/bin/bash
echo "Installing Ubuntu Isolated Subsystem..."
proot-distro install ubuntu
echo "✅ Ubuntu Base provisioned successfully!"
`
  },
  {
    id: "photoprism", // Matches the telemetry workload ID
    name: "PhotoPrism Server",
    Icon: ImageIcon,
    description: "AI-powered, decentralized photo and video manager. Requires the Ubuntu Subsystem.",
    status: "Ready to Install",
    port: 2342,
    installScript: `#!/bin/bash
echo "Initiating PhotoPrism Enterprise Installation..."
# Enter the container and install dependencies, then download and start PhotoPrism in the background
proot-distro login ubuntu -- bash -c "
  apt update && apt install wget sqlite3 libsqlite3-dev exiftool ffmpeg libheif-examples udev darktable rawtherapee -y
  wget -qO- https://dl.photoprism.app/pkg/linux/arm64.tar.gz | tar -xz -C /opt
  nohup /opt/photoprism/bin/photoprism start > /var/log/photoprism.log 2>&1 &
"
echo "✅ PhotoPrism deployed and running on Port 2342!"
`,
    uninstallScript: `#!/bin/bash
echo "Terminating PhotoPrism..."
pkill -9 photoprism
echo "✅ Service Stopped."
`
  }
];

export const cliCommands = [
  { name: "Check Network", cmd: "tailscale-cli status", icon: Network },
  { name: "Restart Dashboard", cmd: "bash ~/start_dashboard.sh", icon: RefreshCw },
  { name: "View Telemetry", cmd: "cat ~/api/telemetry.json", icon: Activity },
  { name: "Exit Subsystem", cmd: "exit", icon: Settings },
];