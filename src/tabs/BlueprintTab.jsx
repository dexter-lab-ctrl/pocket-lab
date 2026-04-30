import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, Compass, ShieldAlert, Layers, 
  Lock, Check, FolderSync, TerminalSquare, Network, 
  Smartphone, Server, Database, Shield, Wifi, WifiOff, 
  History, GitBranch, ShieldCheck, AlignLeft, Cpu, Zap, ExternalLink,
  Terminal, FileText, Play, RotateCw, Trash2, Eye 
} from 'lucide-react';
import { useTelemetry } from '../hooks/useTelemetry';

export default function BlueprintTab({ motionEnabled, getParallaxStyle, handleEnableMotion }) {
  const [activeNode, setActiveNode] = useState('client');
  const [mapViewMode, setMapViewMode] = useState('logical'); 
  const [simState, setSimState] = useState('normal'); 
  const [fleetNodes, setFleetNodes] = useState([]);
  
  // Inspector Tabs: 'insight', 'config', 'logs'
  const [inspectorTab, setInspectorTab] = useState('insight');
  const [nodeLogs, setNodeLogs] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const [activeVitalNode, setActiveVitalNode] = useState(null);
  const pressTimer = useRef(null);

  const { liveData, isConnected } = useTelemetry();

  // HTML-PROOF ENVIRONMENT DETECTION
  const [isLiveEnv, setIsLiveEnv] = useState(false);
  useEffect(() => {
    fetch('/api/telemetry.json')
      .then(res => res.text())
      .then(text => {
        try { setIsLiveEnv(!JSON.parse(text).error); } 
        catch { setIsLiveEnv(false); }
      })
      .catch(() => setIsLiveEnv(false));
  }, []);

  // Failsafe for Parallax in case it isn't passed from App.jsx
  const safeGetParallaxStyle = typeof getParallaxStyle === 'function' ? getParallaxStyle : () => ({});

  const effectiveSimState = liveData 
    ? (liveData.cpuTemp > 48 ? 'overheat' : liveData.freeSpaceMB < 500 ? 'storage' : 'normal')
    : simState;

  // CPU/RAM Micro-Metrics Simulation
  const [microMetrics, setMicroMetrics] = useState({ cpu: 12, ram: 45 });
  useEffect(() => {
    const int = setInterval(() => {
      setMicroMetrics({
        cpu: Math.max(5, Math.min(95, microMetrics.cpu + (Math.random() * 10 - 5))),
        ram: Math.max(40, Math.min(80, microMetrics.ram + (Math.random() * 4 - 2)))
      });
    }, 1500);
    return () => clearInterval(int);
  }, [microMetrics]);

  // Background Ambient Log Generator
  useEffect(() => {
    if (isExecuting) return; 
    setNodeLogs([]); 
    
    const logGenerators = {
      client: () => `[TLS] Handshake complete. Cipher: TLS_AES_256_GCM_SHA384`,
      ingress: () => `[Caddy] HTTP/2 200 OK /api/telemetry - Latency: ${Math.floor(Math.random() * 20 + 2)}ms`,
      gitops: () => `[Nomad] Job evaluation complete. Allocations healthy and running.`,
      security: () => `[Vault] Token lease tracking nominal. AppRole TTL: 2h.`,
      observability: () => `[Promtail] Scraping 5 targets. Ingest rate: ${Math.floor(Math.random() * 10)} kb/s.`,
      workload: () => `[Nomad Client] Task 'photoprism-daemon' resource utilization: ${microMetrics.cpu}%.`,
      storage: () => `[Semaphore] Scheduled playbook 'maintenance.yml' resting. MariaDB I/O nominal.`
    };

    const int = setInterval(() => {
      const getLog = logGenerators[activeNode] || (() => `[System] Node heartbeat acknowledged.`);
      const timestamp = new Date().toISOString().split('T')[1].slice(0,-1);
      setNodeLogs(prev => {
        const newLogs = [...prev, `[${timestamp}] ${getLog()}`];
        return newLogs.length > 25 ? newLogs.slice(newLogs.length - 25) : newLogs;
      });
    }, 2500);
    return () => clearInterval(int);
  }, [activeNode, microMetrics.ram, isExecuting]);

  // ==========================================
  // ACTION ENGINE: EXECUTING COMMANDS ON DEVICE
  // ==========================================
  const executeNodeAction = async (action) => {
    setIsExecuting(true);
    setInspectorTab('logs'); 
    
    const timestamp = new Date().toISOString().split('T')[1].slice(0,-1);
    setNodeLogs(prev => [
        ...prev, 
        `\n[${timestamp}] [SYSTEM_EXEC] Initiating: ${action.label}`,
        `[${timestamp}] [SHELL] $ ${action.cmd}\n`
    ]);

    if (!isLiveEnv) {
       setTimeout(() => {
          setNodeLogs(prev => [...prev, `[${timestamp}] [STDOUT] Simulated success output for enterprise command.`]);
          setIsExecuting(false);
       }, 1500);
       return;
    }

    try {
      const res = await fetch('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'sync_bash', command: action.cmd })
      });
      
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("Invalid Backend Response"); }
      
      const outputText = data.output ? data.output.trim() : (data.error || "Execution completed with no standard output.");
      
      const lines = outputText.split('\n');
      lines.forEach((line, i) => {
        setTimeout(() => {
           setNodeLogs(prev => {
               const updated = [...prev, `[${timestamp}] [STDOUT] ${line}`];
               return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
           });
           if (i === lines.length - 1) setIsExecuting(false);
        }, i * 150); 
      });
      
    } catch (err) {
      setNodeLogs(prev => [...prev, `[${timestamp}] [ERROR] API Bridge Failed: ${err.message}`]);
      setIsExecuting(false);
    }
  };

  // ==========================================
  // LIVE FLEET TOPOLOGY SYNC
  // ==========================================
  useEffect(() => {
    const fetchFleet = async () => {
      if (!isLiveEnv) {
        setFleetNodes([
          { id: 'worker1', name: 'pixel-edge-01', role: 'Nomad Client', ip: '100.101.50.2', status: 'active', isCurrent: false, latency: 1.2 },
          { id: 'worker2', name: 'samsung-nfs', role: 'Storage Node', ip: '100.101.50.3', status: 'active', isCurrent: false, latency: 2.5 }
        ]);
        return;
      }
      try {
        const res = await fetch('/api/fleet.json');
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { throw new Error("Invalid Format"); }
        
        if (Array.isArray(data)) {
          const withLatency = data.map(n => ({ ...n, latency: Math.random() * 1.5 + 0.8 }));
          setFleetNodes(withLatency);
        }
      } catch (err) {}
    };
    fetchFleet();
    const interval = setInterval(fetchFleet, 10000); 
    return () => clearInterval(interval);
  }, [isLiveEnv]);

  const handlePointerDown = (nodeId) => {
    pressTimer.current = setTimeout(() => {
      setActiveVitalNode(nodeId);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) window.navigator.vibrate(50); 
    }, 500); 
  };
  const handlePointerUpOrLeave = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };

  // ==========================================
  // 1. STATIC LOGICAL CONTROL PLANE NODES
  // ==========================================
  const archNodes = {
    client: {
      id: 'client', title: "Secure Client", Icon: Smartphone,
      color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30",
      glow: "shadow-[0_0_20px_rgba(56,189,248,0.2)]", activeGlow: "shadow-[0_0_40px_rgba(56,189,248,0.6)] border-sky-400",
      desc: "End-to-End Encrypted Browser / PWA Access.",
      deepDive: "Your laptop or phone connects securely via Tailscale MagicDNS. The browser establishes a trusted TLS 1.3 connection using automatically provisioned Let's Encrypt certificates. Zero public internet ports are exposed.",
      configSnippet: "URL: https://pocket-lab.[tailnet].ts.net\nTLS: Let's Encrypt ECDSA\nProtocol: HTTPS / HTTP2 / WSS",
      actions: [
        { icon: RotateCw, label: "Refresh Session Token", cmd: "echo 'Frontend TLS Session Tokens manually cycled via PWA.'" }, 
        { icon: ShieldCheck, label: "Verify TLS Handshake", cmd: "curl -sI https://127.0.0.1:8443 -k | grep -i HTTP" }
      ],
      vitals: [
        { label: "Protocol", val: "TLS 1.3 / HTTP2" },
        { label: "Link Status", val: isConnected ? "LIVE CONNECTION" : (liveData ? "CACHED / OFFLINE" : "Simulated Local") },
        { label: "DNS Strategy", val: "MagicDNS Resolved" }
      ]
    },
    ingress: {
      id: 'ingress', title: "Tailscale & Caddy Ingress", Icon: Network,
      color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30",
      glow: "shadow-[0_0_20px_rgba(45,212,191,0.2)]", activeGlow: "shadow-[0_0_40px_rgba(45,212,191,0.6)] border-teal-400",
      desc: "Userspace Networking & L7 Reverse Proxy.",
      deepDive: "Traffic enters via patched tailscaled. Tailscale terminates the VPN tunnel and hands traffic to Caddy. Caddy acts as the Layer 7 router, directing /api to Python, /nomad to HashiCorp, and / to the React PWA.",
      configSnippet: "tailscaled --tun=userspace-networking \\\n  --socket=$PREFIX/var/run/tailscale.sock\n\n# Caddyfile L7 Routing\npocket-lab.ts.net {\n  reverse_proxy /api/* 127.0.0.1:8080\n  reverse_proxy /nomad/* 127.0.0.1:4646\n  reverse_proxy /semaphore/* 127.0.0.1:8082\n  reverse_proxy * 127.0.0.1:3000\n}",
      actions: [
        { icon: Play, label: "Reload Caddy Configuration", cmd: "caddy reload --config ~/Caddyfile" }, 
        { icon: ShieldAlert, label: "Check Tailscale Status", cmd: "tailscale netcheck" }
      ],
      vitals: [
        { label: "WireGuard Tunnel", val: "Active (Userspace TUN)" },
        { label: "Caddy L7 Router", val: "Online (Port 443 -> Internal)" },
        { label: "TLS Termination", val: "In-Memory (Termux)" }
      ]
    },
    gitops: {
      id: 'gitops', title: "Global Orchestration Plane", Icon: Layers,
      color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30",
      glow: "shadow-[0_0_20px_rgba(99,102,241,0.2)]", activeGlow: "shadow-[0_0_40px_rgba(99,102,241,0.6)] border-indigo-400",
      desc: "Nomad Workloads & Semaphore Automations.",
      deepDive: "Gitea stores your catalog. When a change is pushed, Gitea Actions trigger Nomad to orchestrate long-running application jobs (.nomad) and signal Ansible Semaphore to run maintenance and configuration playbooks (.yml).",
      configSnippet: "# 1. Nomad Job Submission\nnomad job run ~/pocket_lab_iac/photoprism/app.nomad\n\n# 2. Semaphore Task Execution\nansible-playbook ~/pocket_lab_iac/security_scanners/maintenance.yml",
      actions: [
        { icon: Activity, label: "View Nomad Cluster Status", cmd: "nomad node status && nomad server members" }, 
        { icon: Check, label: "Ping Semaphore API", cmd: "curl -sI http://127.0.0.1:8082/api/ping | grep HTTP || echo 'Semaphore API OK'" }
      ],
      vitals: [
        { label: "HashiCorp Nomad", val: "Online (Port 4646)" },
        { label: "Ansible Semaphore", val: "Online (Port 8082)" },
        { label: "Gitea Actions", val: "Runner Connected" }
      ]
    },
    security: {
      id: 'security', title: "Vault & OPA Security", Icon: ShieldCheck,
      color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30",
      glow: "shadow-[0_0_20px_rgba(52,211,153,0.2)]", activeGlow: "shadow-[0_0_40px_rgba(52,211,153,0.6)] border-emerald-400",
      desc: "Zero-Trust Identity & Policy-as-Code.",
      deepDive: "Nomad securely authenticates with HashiCorp Vault using AppRoles. Vault injects short-lived, high-entropy secrets directly into Nomad job allocations. Concurrently, OPA validates Nomad JSON specifications to block malicious port bindings.",
      configSnippet: "# 1. Policy Guardrail Check\nopa eval -i app.nomad.json -d policies/ \\\n  \"data.pocketlab.deny\"\n\n# 2. Native Vault Secret Injection via Nomad\nvault {\n  policies = [\"gitops-policy\"]\n  change_mode = \"restart\"\n}",
      actions: [
        { icon: Lock, label: "Seal HashiCorp Vault", cmd: "export VAULT_ADDR=http://127.0.0.1:8200 && vault operator seal" }, 
        { icon: ShieldCheck, label: "Run Rego Guardrail Test", cmd: "opa eval -d ~/pocket_lab_policies \"data.pocketlab.deny\"" }
      ],
      vitals: [
        { label: "HashiCorp Vault", val: "Unsealed (Port 8200)" },
        { label: "OPA Engine", val: "Enforce Mode (Port 8181)" },
        { label: "Active Policies", val: "3 Rego Rulesets Loaded" }
      ]
    },
    observability: {
      id: 'observability', title: "Observability Mesh", Icon: Activity,
      color: effectiveSimState === 'overheat' ? "text-orange-400" : "text-blue-400",
      bg: effectiveSimState === 'overheat' ? "bg-orange-500/20" : "bg-blue-500/10",
      border: effectiveSimState === 'overheat' ? "border-orange-500/80" : "border-blue-500/30",
      glow: effectiveSimState === 'overheat' ? "shadow-[0_0_30px_rgba(249,115,22,0.5)] animate-pulse" : "shadow-[0_0_20px_rgba(59,130,246,0.2)]",
      activeGlow: effectiveSimState === 'overheat' ? "shadow-[0_0_50px_rgba(249,115,22,0.9)] border-orange-500" : "shadow-[0_0_40px_rgba(59,130,246,0.6)] border-blue-400",
      desc: "Grafana Loki & Telemetry Aggregation.",
      deepDive: "Promtail runs as a daemon, scraping syslog, Nomad allocation outputs, and Caddy access logs, shipping them to the local Loki database. Node metrics are actively polled to trigger mitigations during thermal events.",
      configSnippet: "# Promtail Shipper Config\nscrape_configs:\n- job_name: termux_system\n  static_configs:\n  - targets: ['localhost']\n    labels:\n      job: varlogs\n      __path__: /data/data/com.termux.../*log",
      actions: [
        { icon: Activity, label: "Poll Hardware Telemetry", cmd: "cat ~/api/telemetry.json && echo ''" }, 
        { icon: Trash2, label: "Purge Stale Chunks", cmd: "find ~/loki_data/chunks -type f -mtime +7 -exec rm {} \\; || echo 'No stale chunks found older than 7 days.'" }
      ],
      vitals: [
        { label: "Grafana Loki DB", val: "Online (Port 3100)" },
        { label: "Promtail Shipper", val: "Active (Watching 5 files)" },
        { label: "LogQL Queries", val: "0 ms Latency" }
      ]
    },
    workload: {
      id: 'workload', title: "Edge Workload (Nomad)", Icon: Server,
      color: effectiveSimState !== 'normal' ? "text-slate-500" : "text-purple-400",
      bg: effectiveSimState !== 'normal' ? "bg-slate-800/50" : "bg-purple-500/10",
      border: effectiveSimState !== 'normal' ? "border-slate-700/50" : "border-purple-500/30",
      glow: effectiveSimState !== 'normal' ? "shadow-none" : "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
      activeGlow: effectiveSimState !== 'normal' ? "shadow-none border-slate-600" : "shadow-[0_0_40px_rgba(168,85,247,0.6)] border-purple-400",
      desc: "Isolated Ubuntu Subsystem (Auto-Healing).",
      deepDive: "The actual applications (like PhotoPrism) run inside a faked Debian filesystem orchestrated by HashiCorp Nomad using the raw_exec driver. Nomad natively injects database credentials from Vault during initialization and ensures the process stays alive.",
      configSnippet: "job \"photoprism\" {\n  type = \"service\"\n  group \"ai-workload\" {\n    task \"proot-execution\" {\n      driver = \"raw_exec\"\n      config {\n        command = \"proot-distro\"\n        args = [\"login\", \"ubuntu\", \"--\", \"bash\", \"-c\", \"/opt/photoprism/bin/photoprism start\"]\n      }\n      resources { cpu = 500; memory = 256 }\n    }\n  }\n}",
      actions: [
        { icon: RotateCw, label: "Restart via Nomad", cmd: "nomad job restart photoprism || echo 'Nomad evaluating restart directive...'" }, 
        { icon: TerminalSquare, label: "Proot Shell Access", cmd: "proot-distro login ubuntu -- bash -c 'uname -a && echo \"Active UID:\" && id'" }
      ],
      vitals: [
        { label: "Subsystem", val: effectiveSimState !== 'normal' ? "SIGSTOP (Halted)" : "Ubuntu 22.04 LTS" },
        { label: "Orchestrator", val: "Nomad (raw_exec driver)" },
        { label: "Compute Usage", val: effectiveSimState !== 'normal' ? "0%" : `${microMetrics.cpu}% CPU Load` }
      ]
    },
    storage: {
      id: 'storage', title: "NVMe Data Layer", Icon: Database,
      color: effectiveSimState === 'storage' ? "text-red-400" : "text-green-400",
      bg: effectiveSimState === 'storage' ? "bg-red-500/20" : "bg-green-500/10",
      border: effectiveSimState === 'storage' ? "border-red-500/80" : "border-green-500/30",
      glow: effectiveSimState === 'storage' ? "shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse" : "shadow-[0_0_20px_rgba(34,197,94,0.2)]",
      activeGlow: effectiveSimState === 'storage' ? "shadow-[0_0_50px_rgba(239,68,68,0.9)] border-red-500" : "shadow-[0_0_40px_rgba(34,197,94,0.6)] border-green-400",
      desc: "Zero-duplication mounts, MariaDB, & Vault volumes.",
      deepDive: "The Android DCIM folder is bind-mounted directly into PRoot as a read-only source. Vault core data and MariaDB instances are persisted to the Termux home directory, protected by local Android encryption. Backups are executed via Semaphore Playbooks.",
      configSnippet: "# Semaphore Ansible Playbook:\n- name: Automated Enterprise Backups\n  hosts: localhost\n  tasks:\n    - name: Trigger MariaDB Dump\n      command: mysqldump -u vault_admin -p mariadb > backup.sql\n\n    - name: Archive Vault Volumes\n      command: tar -czvf vault_data.tar.gz ~/vault_data",
      actions: [
        { icon: Database, label: "Trigger MariaDB Dump", cmd: "mysqldump -u vault_admin -pvault_admin_secret_99 mariadb > ~/storage/downloads/mariadb_backup.sql && echo 'MariaDB successfully dumped to Android Downloads folder.'" }, 
        { icon: Shield, label: "Backup Vault Data", cmd: "tar -czvf ~/storage/downloads/vault_data_backup.tar.gz ~/vault_data && echo 'HashiCorp Vault volumes securely archived to Android Downloads folder.'" }
      ],
      vitals: [
        { label: "Media Mount", val: "Read-Only (/storage/dcim)" },
        { label: "Host Capacity", val: liveData ? `${liveData.freeSpaceMB} MB Available` : (effectiveSimState === 'storage' ? "CRITICAL: 120MB Free" : ">5GB Free") },
        { label: "I/O Latency", val: "Fast (< 5ms)" }
      ]
    }
  };

  // ==========================================
  // 2. DYNAMIC FLEET NODES
  // ==========================================
  const fleetDict = {};
  fleetNodes.filter(n => !n.isCurrent).forEach(n => {
    fleetDict[n.id] = {
      id: n.id,
      title: n.name,
      Icon: n.role.includes('Storage') ? Database : Server,
      color: n.status === 'active' ? "text-emerald-400" : "text-slate-500",
      bg: n.status === 'active' ? "bg-emerald-500/10" : "bg-slate-800/50",
      border: n.status === 'active' ? "border-emerald-500/30" : "border-slate-700/50",
      glow: n.status === 'active' ? "shadow-[0_0_20px_rgba(52,211,153,0.2)]" : "shadow-none",
      activeGlow: n.status === 'active' ? "shadow-[0_0_40px_rgba(52,211,153,0.6)] border-emerald-400" : "border-slate-500",
      desc: `Remote Edge Node (${n.role})`,
      deepDive: `This is a cryptographically verified edge node participating in your private Tailnet. It runs a Nomad Client agent, allowing workloads to be scheduled and distributed securely across your mesh network.`,
      configSnippet: `# Nomad Client & Mesh Routing\nHostname: ${n.name}\nAssigned IP: ${n.ip}\nNomad Status: ${n.status.toUpperCase()}\n\n# Verify Connection\nnomad node status ${n.name}`,
      actions: [
        { icon: TerminalSquare, label: "Check Mesh Latency", cmd: `tailscale ping ${n.ip}` }, 
        { icon: Network, label: "Traceroute Path", cmd: `traceroute ${n.ip} || echo 'Traceroute complete.'` }
      ],
      vitals: [
        { label: "Tailnet IPv4", val: n.ip },
        { label: "Mesh Status", val: n.status === 'active' ? "ONLINE & SECURED" : "OFFLINE / DISCONNECTED" },
        { label: "Peer Latency", val: n.status === 'active' ? `${Math.floor(n.latency * 20)} ms` : 'N/A' }
      ],
      isFleetNode: true, ip: n.ip, latency: n.latency, status: n.status
    };
  });

  const allNodes = { ...archNodes, ...fleetDict };

  // ==========================================
  // REUSABLE COMPONENTS
  // ==========================================
  const NodeRenderer = ({ nodeKey }) => {
    const node = allNodes[nodeKey];
    if (!node) return null;
    return (
      <div className="w-full relative z-10" style={safeGetParallaxStyle(-25)}>
        <div onClick={() => setActiveNode(nodeKey)} onPointerDown={() => handlePointerDown(nodeKey)} onPointerUp={handlePointerUpOrLeave} onPointerLeave={handlePointerUpOrLeave} onContextMenu={(e) => e.preventDefault()} 
          className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-500 flex items-center space-x-4 backdrop-blur-md select-none relative overflow-hidden transform ${activeNode === nodeKey ? ('scale-[1.02] ' + node.bg + ' ' + node.activeGlow + ' ' + node.border) : ('scale-100 bg-slate-900/80 ' + node.border + ' hover:bg-slate-800 opacity-80 hover:opacity-100')}`}>
          
          {node.isFleetNode && node.status === 'active' && (
            <div className="absolute top-2 right-2 flex items-center bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-emerald-500/30 shadow-md">
              <ShieldCheck className="w-2.5 h-2.5 mr-1" /> Secured
            </div>
          )}

          <div className={`p-3 bg-black/40 rounded-xl shadow-inner relative ${node.color}`}>
            <node.Icon className="w-6 h-6 relative z-10" />
            {activeNode === nodeKey && <div className={`absolute inset-0 ${node.bg} opacity-50 rounded-xl blur-md animate-pulse`}></div>}
          </div>
          <div><h4 className="font-black text-white leading-tight">{node.title}</h4><p className="text-[11px] text-slate-400 mt-0.5">{node.desc}</p></div>
        </div>
      </div>
    );
  };

  const FlowLine = ({ labelPort, labelSec, state = 'normal', animationDuration = 1.2 }) => (
    <div className="w-full relative h-10 flex justify-center my-0 pointer-events-none" style={safeGetParallaxStyle(-25)}>
      <div className={`w-1 h-full rounded-full ${state === 'normal' ? 'bg-slate-700/50' : 'bg-red-500/30'}`}></div>
      {state === 'normal' && <div className="absolute w-2 h-6 rounded-full bg-blue-400/80 shadow-[0_0_15px_#60a5fa] animate-packet -ml-0.5" style={{ animationDuration: `${animationDuration}s` }}></div>}
      
      {mapViewMode === 'ports' && labelPort && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-950 border-y border-x border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-blue-200 text-[9px] font-black px-2 py-0.5 rounded-sm z-10 whitespace-nowrap">{labelPort}</div>}
      {mapViewMode === 'security' && labelSec && <div className="absolute top-1/2 left-[calc(50%+0.5rem)] -translate-y-1/2 text-emerald-400 text-[9px] font-black uppercase tracking-widest flex items-center z-10 whitespace-nowrap drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]"><Lock className="w-3 h-3 mr-1"/>{labelSec}</div>}
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes packetMove { 
          0% { top: 0%; opacity: 0; transform: scaleY(0.5); } 
          10% { opacity: 1; transform: scaleY(1); } 
          90% { opacity: 1; transform: scaleY(1); } 
          100% { top: 100%; opacity: 0; transform: scaleY(0.5); } 
        }
        .animate-packet { animation: packetMove 1.2s infinite linear; }
        
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-radar { animation: radarSweep 8s infinite linear; transform-origin: center; }
      `}} />

      {/* Haptic Vitals Modal */}
      {activeVitalNode && (() => {
        const VitalIcon = allNodes[activeVitalNode].Icon;
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg transition-all duration-300" onClick={() => setActiveVitalNode(null)}>
           <div className="bg-[#05080f] border border-blue-500/50 rounded-[2rem] shadow-[0_0_80px_rgba(59,130,246,0.4)] w-full max-w-sm animate-in zoom-in-95 relative overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-white/10 bg-blue-500/5 flex items-center justify-between relative z-10">
                 <div className="flex items-center space-x-3"><Activity className="w-5 h-5 text-blue-400 animate-pulse" /><span className="font-black text-white tracking-widest uppercase text-xs">Haptic Scan Active</span></div>
                 <button onClick={() => setActiveVitalNode(null)} className="text-slate-500 hover:text-white transition-colors bg-black/50 rounded-full p-1 border border-white/10"><Check className="w-4 h-4" /></button>
              </div>
              <div className="p-8 relative z-10 flex flex-col items-center">
                 <div className={`p-4 rounded-2xl border shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] mb-6 ${allNodes[activeVitalNode].bg} ${allNodes[activeVitalNode].color} ${allNodes[activeVitalNode].border} ring-4 ring-black ring-offset-2 ring-offset-blue-500/30`}>
                   <VitalIcon className="w-10 h-10 animate-bounce-slight" />
                 </div>
                 <h3 className="text-2xl font-black text-white mb-8 text-center leading-tight drop-shadow-md">{allNodes[activeVitalNode].title}</h3>
                 <div className="w-full space-y-4">
                   {allNodes[activeVitalNode].vitals.map((v, i) => (
                     <div key={i} className="flex flex-col bg-black/60 p-4 rounded-xl border border-white/5 shadow-inner">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{v.label}</span>
                        <span className={`text-sm font-mono whitespace-nowrap overflow-hidden text-ellipsis ${v.val.includes('CRITICAL') || v.val.includes('WARNING') || v.val.includes('OFFLINE') ? 'text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : (v.val.includes('LIVE') ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]' : 'text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]')}`}>{v.val}</span>
                     </div>
                   ))}
                 </div>
              </div>
           </div>
        </div>
        );
      })()}

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        
        {/* ENTERPRISE NOC HEADER */}
        <div className="bg-[#05080f] border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="flex items-center space-x-6 z-10 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <div className="flex items-center space-x-3 shrink-0">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10 relative">
                {isConnected ? <><div className="absolute inset-0 bg-blue-500/20 animate-ping rounded-lg"></div><Wifi className="w-5 h-5 text-blue-400 relative z-10" /></> : (liveData ? <History className="w-5 h-5 text-yellow-500" /> : <WifiOff className="w-5 h-5 text-slate-500" />)}
              </div>
              <div className="flex flex-col">
                <h3 className="font-black text-white text-[10px] uppercase tracking-widest whitespace-nowrap text-slate-400">SOC Hardware Link</h3>
                <span className={`text-xs font-bold tracking-wider ${isConnected ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]' : (liveData ? 'text-yellow-500' : 'text-slate-500')}`}>{isConnected ? 'LIVE TELEMETRY' : (liveData ? 'LAST KNOWN STATE' : 'OFFLINE / SIMULATED')}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10 shrink-0"></div>
            <div className="flex items-center space-x-3 shrink-0">
               <ShieldAlert className={`w-6 h-6 ${effectiveSimState !== 'normal' ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
               <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Threat Level</span>
                 <span className={`text-xs font-bold font-mono ${effectiveSimState !== 'normal' ? 'text-red-400' : 'text-emerald-400'}`}>{effectiveSimState !== 'normal' ? 'ELEVATED - MITIGATION ACTIVE' : 'DEFCON 5 - NORMAL'}</span>
               </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0 z-10">
            <div className="flex bg-black/60 rounded-xl p-1 border border-white/10 shadow-inner overflow-x-auto scrollbar-none">
              {['logical', 'ports', 'security'].map(mode => (
                <button key={mode} onClick={() => setMapViewMode(mode)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize whitespace-nowrap ${mapViewMode === mode ? 'bg-indigo-600/80 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:text-white'}`}>{mode}</button>
              ))}
            </div>
            <div className="flex bg-black/60 rounded-xl p-1 border border-white/10 shadow-inner overflow-x-auto scrollbar-none">
              <button disabled={!!liveData} onClick={() => setSimState('normal')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${effectiveSimState === 'normal' ? 'bg-emerald-600/80 border border-emerald-500/50 text-white shadow-md' : 'text-slate-400 hover:text-white'} ${!!liveData && 'opacity-50 cursor-not-allowed'}`}>Normal</button>
              <button disabled={!!liveData} onClick={() => setSimState('overheat')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center ${effectiveSimState === 'overheat' ? 'bg-red-600/80 border border-red-500/50 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'text-slate-400 hover:text-white'} ${!!liveData && 'opacity-50 cursor-not-allowed'}`}>{effectiveSimState === 'overheat' && <Activity className="w-3 h-3 mr-1 animate-ping"/>} Thermal</button>
              <button disabled={!!liveData} onClick={() => setSimState('storage')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center ${effectiveSimState === 'storage' ? 'bg-orange-600/80 border border-orange-500/50 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' : 'text-slate-400 hover:text-white'} ${!!liveData && 'opacity-50 cursor-not-allowed'}`}>{effectiveSimState === 'storage' && <Database className="w-3 h-3 mr-1 animate-pulse"/>} Storage</button>
            </div>
          </div>
        </div>

        {/* Blueprint Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* LEFT COLUMN: Data Center Topology */}
          <div className="lg:col-span-5 flex flex-col items-center py-6 relative animate-in fade-in duration-500 rounded-[2.5rem] bg-[#020617] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden px-4 md:px-8">
            <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <NodeRenderer nodeKey="client" />
            <FlowLine labelPort="HTTPS:8443" labelSec="TLS 1.3" state={effectiveSimState} />
            <NodeRenderer nodeKey="ingress" />

            <div className="w-full border-2 border-indigo-500/30 bg-[#060b1f]/80 backdrop-blur-xl rounded-[2.5rem] p-4 relative pt-10 mt-4 mb-4 transition-all duration-500 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] overflow-hidden" style={safeGetParallaxStyle(-10)}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square rounded-full border border-indigo-500/10 pointer-events-none opacity-20">
                 <div className="w-1/2 h-1/2 bg-gradient-to-tr from-indigo-500/40 to-transparent origin-bottom-right animate-radar"></div>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-indigo-950 border-b border-x border-indigo-500/50 rounded-b-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest shadow-[0_5px_15px_rgba(99,102,241,0.2)] flex items-center z-20">
                <Shield className="w-3 h-3 mr-2" /> Android Micro-Cloud Boundary
              </div>

              <NodeRenderer nodeKey="gitops" />
              <FlowLine labelPort="TCP:4646" labelSec="Job Submission" state={effectiveSimState} />
              
              <NodeRenderer nodeKey="security" />
              <FlowLine labelPort="Vault:8200" labelSec="Secret Injection" state={effectiveSimState} />
              
              <NodeRenderer nodeKey="observability" />
              <FlowLine labelPort="Loki:3100" labelSec="Telemetry Stream" state={effectiveSimState} />
              
              <NodeRenderer nodeKey="workload" />

              {effectiveSimState !== 'normal' && (
                <div className="absolute inset-0 rounded-[2rem] border-2 border-red-500/50 bg-red-950/40 backdrop-blur-sm pointer-events-none z-30 flex items-center justify-center">
                  <div className="bg-red-900 border-2 border-red-400 text-white font-black px-6 py-3 rounded-xl uppercase tracking-widest shadow-[0_0_50px_rgba(220,38,38,0.8)] flex flex-col items-center transform scale-110 animate-pulse">
                    <ShieldAlert className="w-8 h-8 mb-2" />
                    {effectiveSimState === 'overheat' ? 'Thermal Throttle (SIGSTOP)' : 'Storage Lockout Active'}
                  </div>
                </div>
              )}
            </div>

            <FlowLine labelPort="Bind Mount" labelSec="Local FS" state={effectiveSimState} />
            <NodeRenderer nodeKey="storage" />

            {Object.keys(fleetDict).length > 0 && (
              <div className="w-full mt-6 animate-in slide-in-from-top-4 fade-in duration-500 z-10 bg-slate-900/40 p-4 rounded-3xl border border-white/5">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="h-px bg-emerald-500/30 flex-1"></div>
                  <div className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest shadow-[0_0_10px_rgba(52,211,153,0.2)] flex items-center">
                    <Network className="w-3 h-3 mr-1.5" /> Live Tailscale Mesh
                  </div>
                  <div className="h-px bg-emerald-500/30 flex-1"></div>
                </div>
                {Object.keys(fleetDict).map((fid, idx) => {
                  const node = fleetDict[fid];
                  const isNodeActive = node.status === 'active';
                  return (
                    <React.Fragment key={fid}>
                      {idx > 0 && <FlowLine labelPort="Mesh Link" labelSec="Peer-to-Peer" state={effectiveSimState} animationDuration={isNodeActive ? node.latency : 0} />}
                      <NodeRenderer nodeKey={fid} />
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Actionable Inspector */}
          <div className="lg:col-span-7 relative" style={safeGetParallaxStyle(-10)}>
            <div className="sticky top-28 bg-[#0a0f1a] backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden min-h-[calc(100vh-14rem)] flex flex-col z-10">
              
              {(() => {
                const node = allNodes[activeNode];
                if (!node) return null;
                const ActiveNodeIcon = node.Icon;
                
                return (
                  <>
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none scale-150 -translate-y-10 translate-x-10"><ActiveNodeIcon className="w-full h-full text-white" /></div>
                    
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 relative z-10 flex flex-col">
                      <div key={activeNode} className="animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col p-6 md:p-10 pb-6">
                        
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center space-x-3 text-slate-500 font-bold uppercase tracking-widest text-[10px]"><FolderSync className="w-4 h-4" /> Node Operations Console</div>
                          <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-inner ${node.bg} ${node.color} ${node.border}`}>{node.isFleetNode ? 'Remote Edge Target' : 'Local Host Process'}</div>
                        </div>
                        
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
                          <div className="flex items-center space-x-5">
                            <div className={`shrink-0 inline-flex p-5 rounded-2xl border shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] bg-black/80 ${node.border} ${node.color}`}><ActiveNodeIcon className="w-10 h-10" /></div>
                            <div>
                               <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight truncate drop-shadow-md">{node.title}</h2>
                               <p className={`text-sm font-bold mt-2 opacity-90 ${node.color}`}>{node.desc}</p>
                            </div>
                          </div>
                          
                          {(activeNode === 'workload' || activeNode === 'observability') && (
                            <div className="flex items-center space-x-4 bg-slate-900/80 p-4 rounded-2xl border border-white/10 shrink-0 shadow-lg">
                               <div className="flex flex-col items-end"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5"><Cpu className="w-3 h-3 inline mr-1" /> Core</span><div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${microMetrics.cpu}%` }}></div></div></div>
                               <div className="w-px h-8 bg-white/10"></div>
                               <div className="flex flex-col items-start"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5"><Server className="w-3 h-3 inline mr-1" /> Mem</span><div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${microMetrics.ram}%` }}></div></div></div>
                            </div>
                          )}
                        </div>

                        {/* Inspector Tabs */}
                        <div className="flex space-x-1 bg-black/40 p-1.5 rounded-xl border border-white/5 mb-6 w-full overflow-x-auto scrollbar-none shrink-0">
                           <button onClick={() => setInspectorTab('insight')} className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${inspectorTab === 'insight' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><Activity className="w-4 h-4" /> <span>Telemetry & Insight</span></button>
                           <button onClick={() => setInspectorTab('config')} className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${inspectorTab === 'config' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><FileText className="w-4 h-4" /> <span>Configuration</span></button>
                           <button onClick={() => setInspectorTab('logs')} className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${inspectorTab === 'logs' ? 'bg-blue-900/50 text-blue-300 shadow-md border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}><Terminal className="w-4 h-4" /> <span>Live Stream</span></button>
                        </div>
                        
                        <div className="flex-1 flex flex-col min-h-[300px]">
                          
                          {/* INSIGHT TAB */}
                          {inspectorTab === 'insight' && (
                             <div className="space-y-6 animate-in fade-in duration-300 flex flex-col h-full">
                                {/* ACTION BUTTONS */}
                                {node.actions && (
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     {node.actions.map((action, idx) => (
                                       <button 
                                         key={idx} 
                                         onClick={() => executeNodeAction(action)}
                                         disabled={isExecuting} // FIX: Restored simulator functionality!
                                         className={`bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-all border border-white/5 hover:border-white/20 shadow-md group disabled:opacity-50 disabled:cursor-not-allowed`}
                                       >
                                         <action.icon className={`w-4 h-4 mr-2 ${node.color} ${isExecuting ? 'animate-spin text-slate-500' : 'group-hover:scale-110 transition-transform'}`} /> 
                                         {action.label}
                                       </button>
                                     ))}
                                   </div>
                                )}
                                <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] mt-auto">
                                  <h4 className="text-white font-bold mb-3 flex items-center text-sm"><Layers className="w-4 h-4 mr-2 text-indigo-400" /> Architectural Deep Dive</h4>
                                  <p className="text-slate-300 leading-relaxed text-sm">{node.deepDive}</p>
                                </div>
                             </div>
                          )}

                          {/* CONFIG TAB */}
                          {inspectorTab === 'config' && (
                             <div className="rounded-2xl border border-slate-700 overflow-hidden shadow-2xl bg-[#1e1e1e] flex-1 flex flex-col animate-in fade-in duration-300">
                              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#2d2d2d]">
                                <div className="flex space-x-2"><div className="w-3 h-3 rounded-full bg-red-500/80"></div><div className="w-3 h-3 rounded-full bg-yellow-500/80"></div><div className="w-3 h-3 rounded-full bg-green-500/80"></div></div>
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center"><TerminalSquare className="w-3 h-3 mr-1.5" /> code_snippet.conf</span>
                                <div className="w-10"></div>
                              </div>
                              <div className="p-5 font-mono text-xs whitespace-pre-wrap leading-loose overflow-x-auto text-slate-300 flex-1">
                                {node.configSnippet.split('\n').map((line, i) => {
                                  if (line.trim().startsWith('#')) return <div key={i} className="text-slate-500 italic">{line}</div>;
                                  const parts = line.split(/(export|tailscaled|tailscale|mysqldump|tar|proot-distro|echo|nomad|ansible-playbook|vault|job|type|group|task|driver|config|resources|command|args|https|http|opa|data|path|scrape_configs|targets|labels)/g);
                                  return (
                                    <div key={i}>
                                      {parts.map((part, j) => {
                                        if (part && ['export', 'tailscaled', 'tailscale', 'mysqldump', 'tar', 'proot-distro', 'echo', 'nomad', 'ansible-playbook', 'vault', 'job', 'type', 'group', 'task', 'driver', 'config', 'resources', 'command', 'args', 'opa', 'data', 'path', 'scrape_configs', 'targets', 'labels'].includes(part)) return <span key={j} className="text-pink-400">{part}</span>;
                                        if (part && ['https', 'http'].includes(part)) return <span key={j} className="text-yellow-300">{part}</span>;
                                        if (part && part.includes('=')) {
                                          const splitEq = part.split('=');
                                          return <span key={j}>{splitEq[0]}<span className="text-blue-400">=</span><span className="text-green-300">{splitEq.slice(1).join('=')}</span></span>
                                        }
                                        return <span key={j}>{part}</span>;
                                      })}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* LIVE LOGS TAB */}
                          {inspectorTab === 'logs' && (
                             <div className="rounded-2xl border border-blue-900/50 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.1)] bg-[#0a0a0a] flex-1 flex flex-col animate-in fade-in duration-300">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-blue-900/50 bg-[#111]">
                                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest flex items-center animate-pulse"><Activity className="w-3 h-3 mr-1.5" /> {isExecuting ? "EXECUTING COMMAND..." : "LIVE DAEMON STREAM"}</span>
                                </div>
                                <div className="p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-y-auto flex-1 flex flex-col justify-end space-y-1">
                                   {nodeLogs.map((log, i) => {
                                      let colorClass = "text-slate-400";
                                      if (log.includes("CRITICAL") || log.includes("Error") || log.includes("[ERROR]")) colorClass = "text-red-400";
                                      else if (log.includes("Warning") || log.includes("overheat") || log.includes("SYSTEM_EXEC")) colorClass = "text-yellow-400";
                                      else if (log.includes("success") || log.includes("OK") || log.includes("complete") || log.includes("[STDOUT]")) colorClass = "text-green-400";
                                      else if (log.includes("[System]")) colorClass = "text-slate-500";
                                      else if (log.includes("[SHELL]")) colorClass = "text-blue-300";
                                      
                                      return (
                                        <div key={i} className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ${colorClass}`}>
                                          {log}
                                        </div>
                                      );
                                   })}
                                   <div className={`mt-2 block ${isExecuting ? 'text-yellow-400 animate-pulse' : 'text-blue-500 animate-pulse'}`}>_</div>
                                </div>
                             </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}