import { Settings, PlaySquare, Lock, Shield, RefreshCw, CloudLightning, Network, Activity, Wrench, Smartphone, Server, Database, MonitorPlay } from 'lucide-react';

export const deploymentSteps = [
  {
    phase: "Phase 1: OS Prerequisite Checklist",
    Icon: Settings,
    text: "Follow this checklist to establish your mesh network identity and bypass Android's aggressive battery management.",
    isInteractive: true,
    instructions: [
      { prefix: "SERVER TAILSCALE APP", text: "Install the official Tailscale app on this server device. Log in using your primary identity method (preferably Gmail) to add it to your network. IMPORTANT: Disconnect the VPN in the app until our custom Termux setup is complete." },
      { prefix: "CRITICAL WARNING", text: "Android will aggressively kill Termux if these specific overrides are not completed before installation." },
      { prefix: "CLIENT TAILSCALE APP", text: "On your client device (laptop/phone), install Tailscale and log in using the exact same identity provider. Disconnect from the VPN here as well until the server setup is fully complete." },
      { prefix: "PLAY PROTECT", text: "Open Google Play Store -> Profile Icon -> Play Protect -> Settings Cog -> Turn OFF 'Scan apps with Play Protect'." },
      { prefix: "UNKNOWN SOURCES", text: "Go to Android Settings -> Apps -> Special app access -> 'Install unknown apps'. Enable for your Browser and F-Droid." },
      { prefix: "F-DROID ONLY", text: "Download F-Droid via browser. Use it to install 'Termux' and 'Termux:Boot'. NEVER use Google Play versions." },
      { prefix: "INITIALIZE BOOT", text: "Open the 'Termux:Boot' app once and close it to register its listener with the OS." },
      { prefix: "BATTERY UNRESTRICTED", text: "Go to Android Settings -> Apps -> Termux -> Battery, and select 'Unrestricted'. Repeat for 'Termux:Boot'." },
      { prefix: "NOTIFICATIONS", text: "Go to Android Settings -> Apps -> Termux -> Notifications. Ensure they are fully allowed (needed for Wake-Locks)." },
      { prefix: "PHANTOM PROCESS KILLER", text: "(Android 12+) Go to Settings > System > Developer Options -> Toggle ON 'Disable child process restrictions'." },
    ]
  },
  {
    phase: "Phase 2: Automated Deployment",
    Icon: PlaySquare,
    text: "Executing the unified installation script to build the architecture.",
    instructions: [
      { prefix: "SELECT BACKUP MODE", text: "Go to the 'Deployment Script' tab above. Select your preferred Backup Mode (Static Rollover vs Daily Archives)." },
      { prefix: "COPY SCRIPT", text: "Copy the entire code block provided." },
      { prefix: "CREATE FILE", text: "Open the Termux app on your phone. Run the command below and press Enter.", cmd: "nano install.sh" },
      { prefix: "PASTE", text: "Tap and hold anywhere on the black screen, then select Paste." },
      { prefix: "SAVE", text: "Save the file by tapping 'CTRL' (above the keyboard), then 'O' (the letter O), then press 'Enter'." },
      { prefix: "EXIT", text: "Exit the text editor by tapping 'CTRL', then 'X'." },
      { prefix: "EXECUTE", text: "Run the setup script and follow the interactive blue menus to complete the setup.", cmd: "bash install.sh" }
    ]
  },
  {
    phase: "Phase 3: Secure HTTPS Activation",
    Icon: Lock,
    text: "Deploying a custom-patched Tailscale build to bypass Android 11+ networking restrictions and achieve 'Green Padlock' TLS.",
    instructions: [
      { prefix: "ENABLE HTTPS & MAGICDNS", text: "Access the Tailscale Web Console (via laptop browser, or open the Tailscale mobile app -> Profile icon -> 'Admin console'). NOTE: You must sign in using the exact same identity provider. Go to Settings and enable 'HTTPS' and 'MagicDNS'." },
      { prefix: "PREPARE DIRECTORY", text: "Prevent installer 'No such file' errors by creating the state folder first.", cmd: "mkdir -p ~/.tailscale" },
      { prefix: "FETCH CUSTOM BUILD", text: "Download the Termux-optimized binaries (bypasses Android netlink permission errors).", cmd: "curl -fsSL https://raw.githubusercontent.com/bropines/tailscale-termux-cli/main/remote-install.sh | bash" },
      { prefix: "CONFIGURE PROXY", text: "Securely set the SOCKS5 port (do NOT add your hostname here or the daemon will crash).", cmd: "echo 'TS_SOCKS5_PORT=1055' > ~/.tailscale/.env" },
      { prefix: "START DAEMON", text: "Launch the background process using the generated wrapper script.", cmd: "tailscaled-start" },
      { prefix: "AUTHENTICATE", text: "Bind the device to your Tailnet and explicitly set the machine name. This command will output a URL. Copy and paste this URL into a browser to authenticate using the same identity provider. Once authenticated, a machine named 'pocket-lab' will be added to your Tailscale network, which you can verify by opening the Tailscale app and toggling the VPN ON.", cmd: "tailscale-cli up --hostname=pocket-lab" },
      { prefix: "ACTIVATE SERVE", text: "Tell Tailscale to run in the background and route port 443 traffic to PhotoPrism.", cmd: "tailscale-cli serve --bg http://127.0.0.1:2342" },
      { prefix: "VERIFY ARCHITECTURE", text: "Run the health check. NOTE: It is perfectly normal to see '[-] SOCKS5 Resolution (Hostname): FAILED' in the output. This is a known Android restriction for outbound DNS and has zero impact on your inbound PhotoPrism server.", cmd: "tailscale-test" },
      { prefix: "ACCESS & INSTALL PWA", text: "Turn ON the VPN in the Tailscale app (on the server or client). Tap the 'pocket-lab' machine in the app list to reveal the addresses. Copy its full MagicDNS address and open it in a browser on a device logged into the same Tailnet. Once the PhotoPrism login page loads, tap the browser's 3-dot menu and select 'Add to Home screen' -> 'Install' to deploy it as a native PWA!" }
    ]
  },
  {
    phase: "Phase 4: Backups & Active Telemetry",
    Icon: Shield,
    text: "The deployment script injects autonomous background defenses into the OS:",
    instructions: [
      { prefix: "THE POCKET WARDEN", text: "We replaced the basic watchdog with an Active Mitigation Engine. Every 5 minutes, it checks your phone's vitals. If the CPU is overheating (>48C), it safely shuts down the server to let it cool." },
      { prefix: "THE STORAGE KILL-SWITCH", text: "If your phone's storage drops below 500MB, the Warden will instantly freeze the system and trigger Maintenance Mode to prevent SQLite corruption." },
      { prefix: "THE BACKUP ROUTINE", text: "At exactly 3:00 AM every night, Termux pauses the database and safely extracts your tags and albums using sqlite3." },
      { prefix: "WHERE IS THE BACKUP?", text: "The script pushes these files directly to your phone's native Downloads folder." }
    ]
  },
  {
    phase: "Phase 5: Lifecycle Management & Security",
    Icon: RefreshCw,
    text: "How to maintain your Pocket Lab months after the initial setup.",
    instructions: [
      { prefix: "UPDATING PHOTOPRISM", text: "The open-source community frequently releases new features. To update your server to the absolute latest version, simply open Termux and run:", cmd: "lab-update" },
      { prefix: "HOW UPDATES WORK", text: "The lab-update script safely locks the database, downloads the latest ARM64 release, replaces the internal binaries, and restarts your lab automatically." },
      { prefix: "CREDENTIAL ROTATION", text: "If you need to change your PhotoPrism admin password, open Termux and execute the editor:", cmd: "nano ~/start_server.sh" },
      { prefix: "EDITING THE PASSWORD", text: "Use the on-screen arrows to find the line that says: export PHOTOPRISM_ADMIN_PASSWORD='YourPassword'. Delete the old password inside the quotes and type a new secure one." },
      { prefix: "APPLYING THE PASSWORD", text: "Save the file (CTRL + O, Enter), then exit (CTRL + X). To apply the change immediately, run the following commands to safely reboot the engine:", cmd: "touch ~/MAINTENANCE && tmux kill-session -t server\nrm ~/MAINTENANCE" }
    ]
  },
  {
    phase: "Phase 6: Disaster Recovery",
    Icon: CloudLightning,
    text: "How to resurrect your entire Pocket Lab on a brand new device using the 'lab-export' Gold Image.",
    instructions: [
      { prefix: "FILE TRANSFER", text: "Locate your 'PocketLab_Snapshot_YYYY-MM-DD.tar.gz' file in the 'Downloads' folder of your OLD Android phone. Transfer this file directly into the 'Downloads' folder of your NEW Android phone." },
      { prefix: "ENVIRONMENT PREP", text: "Complete 'Phase 1' of this guide exactly as written on the new phone." },
      { prefix: "INITIAL SETUP", text: "Open Termux on the new phone. Run storage setup (click Allow), then install dependencies:", cmd: "termux-setup-storage\npkg update -y && pkg install proot-distro tar -y" },
      { prefix: "UNPACK THE GOLD IMAGE", text: "Extract the master snapshot into your home directory:", cmd: "tar -xf ~/storage/downloads/PocketLab_Snapshot_*.tar.gz -C ~/" },
      { prefix: "RESTORE ARCHITECTURE", text: "This instantly restores the Warden, your dashboards, and cron schedules:", cmd: "tar -xzf ~/termux_configs.tar.gz -C /data/data/com.termux/files/" },
      { prefix: "RESTORE SUBSYSTEM", text: "Wait 3-5 minutes while this completely reconstructs your entire SQLite database and file system:", cmd: "proot-distro restore ~/ubuntu_rootfs.tar.gz" },
      { prefix: "CLEANUP & IGNITION", text: "Clean up the archive files and jumpstart the server! Your lab is now fully restored:", cmd: "rm ~/ubuntu_rootfs.tar.gz ~/termux_configs.tar.gz\nbash ~/.termux/boot/99-photoprism.sh" }
    ]
  },
  {
    phase: "Phase 7: PWA Dashboard Ignition",
    Icon: MonitorPlay,
    text: "Deploying the user interface and bridging the live Termux console.",
    instructions: [
      { prefix: "BUILD PWA", text: "On your computer, run 'npm run build' to compile the React code into static files." },
      { prefix: "TRANSFER", text: "Zip the 'dist' folder and transfer 'dist.zip' to your phone's native Downloads folder." },
      { prefix: "UNPACK PWA", text: "In Termux, unpack the interface files:", cmd: "cp ~/storage/downloads/dist.zip ~/\nunzip -o ~/dist.zip -d ~/pwa_dist\nrm ~/dist.zip" },
      { prefix: "MASTER IGNITION", text: "Go to the 'Deployment Script' tab above and switch to the 'Dashboard Ignition' view. Copy the script." },
      { prefix: "CREATE SCRIPT", text: "In Termux, create the ignition script:", cmd: "nano ~/start_dashboard.sh" },
      { prefix: "EXECUTE", text: "Paste the script, save (CTRL+O, Enter, CTRL+X), and execute it:", cmd: "bash ~/start_dashboard.sh" }
    ]
  }
];

export const cliCommands = [
  {
    category: "Network & Security", Icon: Network, iconColor: "text-blue-400",
    commands: [
      { cmd: "tailscale-cli status", tag: "Network", desc: "Checks mesh network status and connected devices." },
      { cmd: "tailscale-cli serve status", tag: "Security", desc: "Confirms HTTPS certificate and port 443 proxy status." }
    ]
  },
  {
    category: "System Health & Telemetry", Icon: Activity, iconColor: "text-green-400",
    commands: [
      { cmd: "lab-status", tag: "Dashboard", desc: "Displays color-coded telemetry showing server status, Temp, RAM, Storage, and Warden." },
      { cmd: "tmux ls", tag: "Process", desc: "Lists all active Termux background sessions." }
    ]
  },
  {
    category: "Lifecycle Management", Icon: RefreshCw, iconColor: "text-purple-400",
    commands: [
      { cmd: "lab-update", tag: "System", desc: "Automated Maintenance: Checks for updates, installs new binaries, and restarts." },
      { cmd: "nano ~/start_server.sh", tag: "Editor", desc: "Credential Rotation: Master configuration script for PHOTOPRISM_ADMIN_PASSWORD." }
    ]
  },
  {
    category: "Disaster Recovery", Icon: CloudLightning, iconColor: "text-yellow-400",
    commands: [
      { cmd: "lab-export", tag: "Snapshot", desc: "CRITICAL: Generates a 'Gold Image' Snapshot of your entire Ubuntu subsystem." },
      { cmd: "bash ~/backup_db.sh", tag: "Cron Job", desc: "Manually forces a lightweight daily database backup." }
    ]
  },
  {
    category: "Maintenance Operations", Icon: Wrench, iconColor: "text-red-400",
    commands: [
      { cmd: "touch ~/MAINTENANCE && tmux kill-session -t server", tag: "Lock", desc: "Safe Stop: Pauses the Warden, safely kills server." },
      { cmd: "rm ~/MAINTENANCE", tag: "Unlock", desc: "Safe Start: Removes lock file, resumes Warden and server." }
    ]
  }
];

export const archNodes = {
  client: {
    id: 'client', title: "Secure Client", Icon: Smartphone, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30", glow: "shadow-[0_0_20px_rgba(56,189,248,0.2)]", activeGlow: "shadow-[0_0_30px_rgba(56,189,248,0.5)] border-sky-400", desc: "End-to-End Encrypted Browser Access.",
    deepDive: "Your laptop or phone connects via HTTPS. Because we use 'Tailscale Serve', the browser sees a valid Let's Encrypt certificate, enabling PWAs and high-speed Service Workers. No internet ports are opened.",
    configSnippet: "URL: https://pocket-lab.[tailnet].ts.net\nTLS: Let's Encrypt ECDSA\nProtocol: HTTPS / HTTP2",
    vitals: [{ label: "Protocol", val: "TLS 1.3 / HTTP2" }, { label: "Latency", val: "~42ms (Tailnet)" }, { label: "DNS Strategy", val: "MagicDNS Resolved" }]
  },
  tailscale: {
    id: 'tailscale', title: "Userspace Gateway", Icon: Network, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30", glow: "shadow-[0_0_20px_rgba(45,212,191,0.2)]", activeGlow: "shadow-[0_0_30px_rgba(45,212,191,0.5)] border-teal-400", desc: "In-Process TLS Termination.",
    deepDive: "By running the patched tailscaled daemon via our wrapper scripts, we completely bypass Android's AF_NETLINK socket restrictions. Tailscale handles the SSL handshake entirely in Termux RAM.",
    configSnippet: "tailscaled --tun=userspace-networking \\\n  --statedir=$PREFIX/var/lib/tailscale \\\n  --socket=$PREFIX/var/lib/tailscale/tailscaled.sock\n\n# Serve Proxy Active:\n# https:443 -> http://127.0.0.1:2342",
    vitals: [{ label: "Socket Bind", val: "/var/lib/.../tailscaled.sock" }, { label: "TUN Mode", val: "userspace-networking" }, { label: "Active Serve", val: "Port 443 -> 2342" }]
  },
  warden: {
    id: 'warden', title: "Pocket Warden", Icon: Shield, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", glow: "shadow-[0_0_20px_rgba(249,115,22,0.2)]", activeGlow: "shadow-[0_0_30px_rgba(249,115,22,0.5)] border-orange-400", desc: "Active Mitigation Engine & Health Monitor.",
    deepDive: "A lightweight cron job running every 5 minutes. It continuously polls /proc/meminfo and kernel thermal zones. If CPU temperatures exceed 48°C or storage drops below 500MB, the Warden autonomously suspends the PhotoPrism container to protect the hardware and database from corruption.",
    configSnippet: "# Core Threshold Logic:\nif [ \"$TEMP\" -gt 48 ]; then\n  echo \"CRITICAL: Thermal Shutdown\"\n  tmux kill-session -t server\nfi\n\nif [ \"$FREE_SPACE\" -lt 500 ]; then\n  touch \"$HOME/MAINTENANCE\"\n  tmux kill-session -t server\nfi",
    vitals: [{ label: "Daemon Status", val: "Polling Active (5m)" }, { label: "Sim CPU Temp", val: "Nominal: 34°C" }, { label: "Sim Storage", val: "Nominal: >5GB Free" }]
  },
  ubuntu: {
    id: 'ubuntu', title: "Ubuntu Container", Icon: Server, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", glow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]", activeGlow: "shadow-[0_0_30px_rgba(168,85,247,0.5)] border-purple-400", desc: "The Proot Subsystem housing the PhotoPrism AI.",
    deepDive: "Inside this isolated Debian environment, PhotoPrism utilizes Go and FFmpeg to perform facial recognition, object detection, and video transcoding. It receives clean HTTP traffic from the Tailscale proxy on localhost.",
    configSnippet: "proot-distro login ubuntu \\\n  --bind ~/storage/dcim:/photoprism/originals \\\n  -- bash -c \"\n    export PHOTOPRISM_FFMPEG_SIZE='1280'\n    export GOMAXPROCS=4\n    /opt/photoprism/bin/photoprism start\n  \"",
    vitals: [{ label: "Process ID", val: "Active (PID 2041)" }, { label: "Target Service", val: "PhotoPrism UI (Port 2342)" }, { label: "Memory Bounds", val: "1.2GB Reserved / 4GB Max" }]
  },
  storage: {
    id: 'storage', title: "Data Layer", Icon: Database, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", glow: "shadow-[0_0_20px_rgba(34,197,94,0.2)]", activeGlow: "shadow-[0_0_30px_rgba(34,197,94,0.5)] border-green-400", desc: "Zero-duplication media access and SQLite archives.",
    deepDive: "The Android DCIM (Camera) folder is bind-mounted directly into the Ubuntu container as a read-only source. This prevents PhotoPrism from duplicating your photos.",
    configSnippet: "# Daily Cron Dump Sequence:\nsqlite3 /root/.../index.db \\\n  '.backup /root/.../index_backup.db'\n\ncp index_backup.db \\\n  ~/storage/downloads/photoprism_backup.db",
    vitals: [{ label: "Media Mount", val: "Read-Only (/storage/dcim)" }, { label: "Database Mount", val: "Read/Write Locked" }, { label: "I/O Latency", val: "Fast (< 5ms)" }]
  }
};
