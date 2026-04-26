import React, { useState, useRef, useMemo } from 'react';
import { 
  Activity, Eye, Compass, ShieldAlert, Layers, 
  Lock, Check, FolderSync, TerminalSquare, Network, 
  Smartphone, Server, Database, Shield, Wifi, WifiOff, History, Cpu, Box, BrainCircuit, TrendingDown, Zap
} from 'lucide-react';
import { useTelemetry } from '../hooks/useTelemetry';

export default function BlueprintTab({ motionEnabled, getParallaxStyle, handleEnableMotion }) {
  const [activeNode, setActiveNode] = useState('client');
  const [mapViewMode, setMapViewMode] = useState('logical'); 
  const [simState, setSimState] = useState('normal'); 
  
  const [activeVitalNode, setActiveVitalNode] = useState(null);
  const pressTimer = useRef(null);

  // Telemetry Hook Integration
  const { liveData, isConnected } = useTelemetry();

  // Logic Gate
  const effectiveSimState = liveData 
    ? (liveData.cpuTemp > 48 ? 'overheat' : liveData.freeSpaceMB < 500 ? 'storage' : 'normal')
    : simState;

  // --- AIOps PREDICTIVE ENGINE ---
  // 1. Calculate Storage Trajectory
  const currentFreeSpace = liveData?.freeSpaceMB || (effectiveSimState === 'storage' ? 320 : 5400);
  const dailyBurnRateMB = 150; // In a real app, this is calculated from historical SQLite data
  const daysUntilFull = (currentFreeSpace / dailyBurnRateMB).toFixed(1);
  const isStorageCritical = daysUntilFull < 7;

  // 2. Calculate Live Bandwidth Flow Animation
  // If simulated 'normal', idle at 5Mbps. If overheat/storage, simulate heavy 85Mbps load.
  const currentBandwidthMbps = liveData?.bandwidthMbps || (effectiveSimState === 'normal' ? 5 : 85);
  // Map Mbps to animation speed (100Mbps = 0.2s ultra fast, 0Mbps = 3s super slow)
  const flowSpeed = Math.max(0.2, 3 - (currentBandwidthMbps / 100) * 2.8) + "s";

  // --- INTELLIGENT DISCOVERY ---
  const detectedApps = liveData?.workloads || ['photoprism'];
  const detectedPorts = liveData?.activePorts || ['8443', '8080', '2342'];
  const detectedSubsystems = liveData?.subsystems || ['ubuntu'];
  const apiNodes = liveData?.apiNodes || ['Primary Bridge (8080)'];

  // Haptic Handlers
  const handlePointerDown = (nodeId) => {
    pressTimer.current = setTimeout(() => {
      setActiveVitalNode(nodeId);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) window.navigator.vibrate(50); 
    }, 500); 
  };
  const handlePointerUpOrLeave = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };

  // Architecture Store
  const archNodes = useMemo(() => ({
    client: {
      id: 'client',
      title: "Secure Client",
      Icon: Smartphone,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/30",
      glow: "shadow-[0_0_20px_rgba(56,189,248,0.2)]",
      activeGlow: "shadow-[0_0_30px_rgba(56,189,248,0.5)] border-sky-400",
      desc: "End-to-End Encrypted Browser Access.",
      deepDive: "Your laptop or phone connects via HTTPS. Because we use 'Tailscale Serve', the browser sees a valid Let's Encrypt certificate, enabling PWAs and high-speed Service Workers.",
      configSnippet: "URL: https://pocket-lab.[tailnet].ts.net:8443\nTLS: Let's Encrypt ECDSA\nProtocol: HTTPS / HTTP2",
      vitals: [
        { label: "Protocol", val: "TLS 1.3 / HTTP2" },
        { label: "Link Status", val: isConnected ? "LIVE CONNECTION" : "Simulated Local" }
      ]
    },
    tailscale: {
      id: 'tailscale',
      title: "Userspace Gateway",
      Icon: Network,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/30",
      glow: "shadow-[0_0_20px_rgba(45,212,191,0.2)]",
      activeGlow: "shadow-[0_0_30px_rgba(45,212,191,0.5)] border-teal-400",
      desc: "In-Process TLS Termination & Routing.",
      deepDive: "Bypasses Android's AF_NETLINK socket restrictions. Tailscale handles the SSL handshake entirely in Termux RAM and routes traffic to the proper internal ports.",
      configSnippet: `tailscaled --tun=userspace-networking \\\n  --statedir=$PREFIX/var/lib/tailscale\n\n# Dynamic Bandwidth Load:\nCurrent Throughput: ${currentBandwidthMbps} Mbps`,
      vitals: [
        { label: "Active TCP Streams", val: `${detectedPorts.length} Active Ports` },
        { label: "Live Throughput", val: `${currentBandwidthMbps} Mbps` }
      ]
    },
    api: {
      id: 'api',
      title: "Control Plane API",
      Icon: Cpu,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]",
      activeGlow: "shadow-[0_0_30px_rgba(59,130,246,0.5)] border-blue-400",
      desc: "Universal Command Execution Engine.",
      deepDive: `Managing ${apiNodes.length} bridge(s). The React UI sends JSON intents to these background Python servers, which securely execute Bash scripts in Termux.`,
      configSnippet: "def do_POST(self):\n  if payload.get('intent') == 'run_bash':\n    subprocess.Popen(command, shell=True)",
      vitals: [
        { label: "Execution Queue", val: "Idle / Awaiting Intents" },
        { label: "Auth Scope", val: "Localhost Bound" }
      ]
    },
    warden: {
      id: 'warden',
      title: "Pocket Warden",
      Icon: Shield,
      color: effectiveSimState === 'overheat' || effectiveSimState === 'storage' ? "text-red-400" : "text-orange-400",
      bg: effectiveSimState === 'overheat' || effectiveSimState === 'storage' ? "bg-red-500/20" : "bg-orange-500/10",
      border: effectiveSimState === 'overheat' || effectiveSimState === 'storage' ? "border-red-500/80" : "border-orange-500/30",
      glow: effectiveSimState === 'overheat' || effectiveSimState === 'storage' ? "shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse" : "shadow-[0_0_20px_rgba(249,115,22,0.2)]",
      activeGlow: effectiveSimState === 'overheat' || effectiveSimState === 'storage' ? "shadow-[0_0_40px_rgba(239,68,68,0.8)] border-red-500" : "shadow-[0_0_30px_rgba(249,115,22,0.5)] border-orange-400",
      desc: "AIOps Health Monitor & Mitigation.",
      deepDive: "Continuously polls /proc/meminfo and kernel thermal zones. The integrated AIOps engine predicts failures before they happen and safely halts containers to prevent data corruption.",
      configSnippet: `# AIOps Trajectory Model:\nFree Space: ${currentFreeSpace} MB\nBurn Rate: ${dailyBurnRateMB} MB/Day\nPredicted Failure: ${daysUntilFull} Days`,
      vitals: [
        { label: "CPU Temp", val: liveData ? `${liveData.cpuTemp}°C` : (effectiveSimState === 'overheat' ? "WARNING: 52°C" : "Nominal: 34°C") },
        { label: "RAM Usage", val: liveData ? `${liveData.ramPct}% Load` : "Nominal: 65%" }
      ]
    },
    ubuntu: {
      id: 'ubuntu',
      title: "Container Workloads",
      Icon: Server,
      color: effectiveSimState !== 'normal' ? "text-slate-500" : "text-purple-400",
      bg: effectiveSimState !== 'normal' ? "bg-slate-800/50" : "bg-purple-500/10",
      border: effectiveSimState !== 'normal' ? "border-slate-700/50" : "border-purple-500/30",
      glow: effectiveSimState !== 'normal' ? "shadow-none" : "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
      activeGlow: effectiveSimState !== 'normal' ? "shadow-none border-slate-600" : "shadow-[0_0_30px_rgba(168,85,247,0.5)] border-purple-400",
      desc: `Hosting ${detectedSubsystems.length} Subsystem(s) & ${detectedApps.length} App(s).`,
      deepDive: `Dynamic Discovery Engine detected ${detectedApps.join(', ')}. Inside these isolated filesystems, enterprise workloads run simultaneously utilizing the Android Kernel.`,
      configSnippet: `proot-distro login ubuntu \\\n  -- bash -c "\n    # Auto-detected processes running:\n${detectedApps.map(app => `    # -> ${app}`).join('\n')}\n  "`,
      vitals: [
        { label: "Discovered Apps", val: effectiveSimState !== 'normal' ? "NULL (Terminated)" : detectedApps.join(', ') },
        { label: "Process Count", val: `${detectedApps.length} Foreground Tasks` }
      ]
    },
    storage: {
      id: 'storage',
      title: "Data Layer",
      Icon: Database,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      glow: "shadow-[0_0_20px_rgba(34,197,94,0.2)]",
      activeGlow: "shadow-[0_0_30px_rgba(34,197,94,0.5)] border-green-400",
      desc: "Zero-duplication media and SQLite archives.",
      deepDive: "Android DCIM folder is bind-mounted natively into containers. AIOps actively monitors the degradation and fill-rate of this physical partition.",
      configSnippet: `proot-distro backup ubuntu \\\n  --output ~/backups/ubuntu.tar.gz\nsync`,
      vitals: [
        { label: "Free Capacity", val: `${currentFreeSpace} MB Available` },
        { label: "AIOps Prediction", val: isStorageCritical ? "CRITICAL (HALT IMMINENT)" : `Safe (${daysUntilFull} Days left)` }
      ]
    }
  }), [liveData, isConnected, effectiveSimState, detectedApps, detectedPorts, detectedSubsystems, apiNodes, currentFreeSpace, daysUntilFull, isStorageCritical, currentBandwidthMbps]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flow { to { stroke-dashoffset: -20; } }
        .animate-flow { animation: flow var(--flow-speed, 1s) linear infinite; }
        @keyframes scan { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100%); opacity: 0; } }
        .animate-scan { animation: scan 2.5s ease-in-out infinite; }
      `}} />

      {/* Haptic Vitals Modal */}
      {activeVitalNode && (() => {
        const VitalIcon = archNodes[activeVitalNode].Icon;
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-300" onClick={() => setActiveVitalNode(null)}>
           <div className="bg-[#05080f] border border-blue-500/50 rounded-[2rem] shadow-[0_0_50px_rgba(59,130,246,0.3)] w-full max-w-sm animate-in zoom-in-95 relative overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-scan pointer-events-none"></div>
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between relative z-10">
                 <div className="flex items-center space-x-3"><Activity className="w-5 h-5 text-blue-400 animate-pulse" /><span className="font-black text-white tracking-widest uppercase text-xs">Haptic Scan Active</span></div>
                 <button onClick={() => setActiveVitalNode(null)} className="text-slate-500 hover:text-white transition-colors bg-black/50 rounded-full p-1 border border-white/10"><Check className="w-4 h-4" /></button>
              </div>
              <div className="p-8 relative z-10 flex flex-col items-center">
                 <div className={`p-4 rounded-2xl border shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] mb-6 ${archNodes[activeVitalNode].bg} ${archNodes[activeVitalNode].color} ${archNodes[activeVitalNode].border}`}><VitalIcon className="w-10 h-10" /></div>
                 <h3 className="text-2xl font-black text-white mb-8 text-center">{archNodes[activeVitalNode].title}</h3>
                 <div className="w-full space-y-4">
                   {archNodes[activeVitalNode].vitals.map((v, i) => (
                     <div key={i} className="flex flex-col bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{v.label}</span>
                        <span className={`text-sm font-mono whitespace-nowrap overflow-hidden text-ellipsis ${v.val.includes('CRITICAL') || v.val.includes('WARNING') ? 'text-red-400 font-bold drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : (v.val.includes('LIVE') ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]' : 'text-green-400')}`}>{v.val}</span>
                     </div>
                   ))}
                 </div>
              </div>
           </div>
        </div>
        );
      })()}

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        
        {/* --- AIOps PREDICTIVE BANNER --- */}
        {isStorageCritical && (
          <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/50 p-4 rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-red-500/20 rounded-xl border border-red-500/30"><BrainCircuit className="w-6 h-6 text-red-400" /></div>
              <div>
                <h3 className="text-red-400 font-black text-sm uppercase tracking-widest flex items-center">AIOps Predictive Alert</h3>
                <p className="text-red-200 text-sm mt-0.5">Storage trajectory critical. System will reach capacity in <strong className="text-white">{daysUntilFull} days</strong> at current data burn rate.</p>
              </div>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500/50 hidden md:block" />
          </div>
        )}

        {/* Top Header: NOC Controls */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xl relative overflow-hidden z-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-orange-500/5 pointer-events-none"></div>
          
          {/* Real-time Bandwidth Monitor Badge */}
          <div className="flex items-center space-x-3 relative z-10">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <Zap className={`w-5 h-5 ${currentBandwidthMbps > 50 ? 'text-yellow-400 animate-pulse' : 'text-blue-400'}`} />
            </div>
            <div className="flex flex-col">
              <h3 className="font-black text-white text-sm uppercase tracking-widest whitespace-nowrap">Global Traffic</h3>
              <span className={`text-[10px] font-bold tracking-wider ${currentBandwidthMbps > 50 ? 'text-yellow-400' : 'text-blue-400'}`}>
                {currentBandwidthMbps} Mbps
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 hidden xl:block relative z-10"></div>

          <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 shadow-inner relative z-10">
            <button onClick={() => setMapViewMode('logical')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mapViewMode === 'logical' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Logical</button>
            <button onClick={() => setMapViewMode('ports')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mapViewMode === 'ports' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Ports</button>
            <button onClick={() => setMapViewMode('security')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mapViewMode === 'security' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Security</button>
          </div>

          <div className="h-8 w-px bg-white/10 hidden xl:block relative z-10"></div>

          {/* SIMULATOR AUTO-HIDE LOGIC */}
          {liveData || isConnected ? (
            <div className="flex items-center space-x-3 bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-500/30 relative z-10 w-full xl:w-auto justify-center">
               <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
               <h3 className="font-black text-emerald-400 text-sm uppercase tracking-widest whitespace-nowrap">Live Environment</h3>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3 relative z-10">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10"><ShieldAlert className="w-5 h-5 text-orange-400" /></div>
                <h3 className="font-black text-white text-sm uppercase tracking-widest mr-2 whitespace-nowrap">Simulator</h3>
              </div>
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 shadow-inner overflow-x-auto scrollbar-none w-full xl:w-auto relative z-10">
                <button onClick={() => setSimState('normal')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${effectiveSimState === 'normal' ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Normal</button>
                <button onClick={() => setSimState('overheat')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${effectiveSimState === 'overheat' ? 'bg-red-600 text-white shadow-md animate-pulse' : 'text-slate-400 hover:text-white'}`}>Thermal Spike</button>
                <button onClick={() => setSimState('storage')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${effectiveSimState === 'storage' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Storage Critical</button>
              </div>
            </>
          )}
        </div>

        {/* Blueprint Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* LEFT COLUMN: 2D Logical Map */}
          <div className="lg:col-span-5 flex flex-col items-center py-6 relative animate-in fade-in duration-500">
            
            {/* --- CLIENT NODE --- */}
            <div className="w-full relative z-10" style={getParallaxStyle(-25)}>
              {(() => {
                const node = archNodes.client; const NodeIcon = node.Icon;
                return (
                <div onClick={() => setActiveNode('client')} onPointerDown={() => handlePointerDown('client')} onPointerUp={handlePointerUpOrLeave} onPointerLeave={handlePointerUpOrLeave} onContextMenu={(e) => e.preventDefault()} className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center space-x-4 backdrop-blur-md select-none ${activeNode === 'client' ? (node.bg + ' ' + node.activeGlow + ' ' + node.border) : ('bg-slate-900/60 ' + node.border + ' hover:bg-slate-800/80 opacity-60')}`}>
                  <div className={`p-3 bg-black/40 rounded-xl shadow-inner pointer-events-none ${node.color}`}><NodeIcon className="w-6 h-6" /></div>
                  <div className="pointer-events-none"><h4 className="font-black text-white">{node.title}</h4><p className="text-xs text-slate-400 mt-1">{node.desc}</p></div>
                </div>
              )})()}
            </div>

            {/* FLOW 1 */}
            <div className="w-full" style={getParallaxStyle(-25)}>
              <div className="h-10 w-full flex justify-center -my-2 relative pointer-events-none" style={{ '--flow-speed': flowSpeed }}>
                 <svg className="h-full w-2" preserveAspectRatio="none"><line x1="50%" y1="0" x2="50%" y2="100%" stroke={mapViewMode === 'security' ? "rgba(34,197,94,0.6)" : "rgba(255,255,255,0.2)"} strokeWidth={mapViewMode === 'security' ? "4" : "2"} strokeDasharray={mapViewMode === 'security' ? "0" : "4 4"} className={effectiveSimState === 'normal' ? "animate-flow" : ""} /></svg>
                 {mapViewMode === 'ports' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-900 text-blue-200 text-[9px] font-black px-2 py-0.5 rounded border border-blue-500 shadow-md">HTTPS : 8443</div>}
                 {mapViewMode === 'security' && <div className="absolute top-1/2 left-[calc(50%+1rem)] -translate-y-1/2 text-green-400 text-[9px] font-black uppercase tracking-widest flex items-center"><Lock className="w-3 h-3 mr-1"/> TLS Encrypted</div>}
              </div>
            </div>

            {/* --- TAILSCALE NODE --- */}
            <div className="w-full relative z-10" style={getParallaxStyle(-25)}>
              {(() => {
                const node = archNodes.tailscale; const NodeIcon = node.Icon;
                return (
                <div onClick={() => setActiveNode('tailscale')} onPointerDown={() => handlePointerDown('tailscale')} onPointerUp={handlePointerUpOrLeave} onPointerLeave={handlePointerUpOrLeave} onContextMenu={(e) => e.preventDefault()} className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center space-x-4 backdrop-blur-md select-none ${activeNode === 'tailscale' ? (node.bg + ' ' + node.activeGlow + ' ' + node.border) : ('bg-slate-900/60 ' + node.border + ' hover:bg-slate-800/80 opacity-60')}`}>
                  <div className={`p-3 bg-black/40 rounded-xl shadow-inner pointer-events-none ${node.color}`}><NodeIcon className="w-6 h-6" /></div>
                  <div className="pointer-events-none"><h4 className="font-black text-white">{node.title}</h4><p className="text-xs text-slate-400 mt-1">{node.desc}</p></div>
                </div>
              )})()}
            </div>

            {/* FLOW 2 */}
            <div className="w-full" style={getParallaxStyle(-25)}>
              <div className="h-10 w-full flex justify-center -my-2 relative z-0 pointer-events-none" style={{ '--flow-speed': flowSpeed }}>
                 <svg className="h-full w-2" preserveAspectRatio="none"><line x1="50%" y1="0" x2="50%" y2="100%" stroke={effectiveSimState === 'normal' ? "rgba(255,255,255,0.2)" : "rgba(239,68,68,0.3)"} strokeWidth="2" strokeDasharray="4 4" className={effectiveSimState === 'normal' ? "animate-flow" : ""} /></svg>
                 {mapViewMode === 'ports' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-900 text-purple-200 text-[9px] font-black px-2 py-0.5 rounded border border-purple-500 shadow-md whitespace-nowrap">Proxy : {detectedPorts[1] || '8080'}</div>}
              </div>
            </div>

            {/* --- TERMUX BOUNDARY BOX --- */}
            <div className="w-full border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm rounded-[2rem] p-5 relative shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] pt-8" style={getParallaxStyle(-10)}>
              
              <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-md flex items-center pointer-events-none" style={getParallaxStyle(-5)}>
                <Layers className="w-3 h-3 mr-1.5 opacity-50" /> Android Host (Termux)
              </div>

              <div className="w-full" style={getParallaxStyle(-15)}>
                
                {/* --- API BRIDGE NODE --- */}
                {(() => {
                  const node = archNodes.api; const NodeIcon = node.Icon;
                  return (
                  <div onClick={() => setActiveNode('api')} onPointerDown={() => handlePointerDown('api')} onPointerUp={handlePointerUpOrLeave} onPointerLeave={handlePointerUpOrLeave} onContextMenu={(e) => e.preventDefault()} className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center space-x-4 backdrop-blur-md relative z-10 select-none ${activeNode === 'api' ? (node.bg + ' ' + node.activeGlow + ' ' + node.border) : ('bg-slate-900/80 ' + node.border + ' hover:bg-slate-800/90 opacity-60')}`}>
                    <div className={`p-3 bg-black/40 rounded-xl shadow-inner pointer-events-none ${node.color}`}><NodeIcon className="w-6 h-6" /></div>
                    <div className="pointer-events-none"><h4 className="font-black text-white">{node.title}</h4><p className="text-xs text-slate-400 mt-1">{node.desc}</p></div>
                  </div>
                )})()}

                {/* INTERNAL FLOW */}
                <div className="h-8 w-full flex justify-center my-0 relative z-0 pointer-events-none" style={{ '--flow-speed': flowSpeed }}>
                   <svg className="h-full w-2" preserveAspectRatio="none"><line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" className={effectiveSimState === 'normal' ? "animate-flow" : ""} /></svg>
                </div>

                {/* --- WARDEN NODE --- */}
                {(() => {
                  const node = archNodes.warden; const NodeIcon = node.Icon;
                  return (
                  <div onClick={() => setActiveNode('warden')} onPointerDown={() => handlePointerDown('warden')} onPointerUp={handlePointerUpOrLeave} onPointerLeave={handlePointerUpOrLeave} onContextMenu={(e) => e.preventDefault()} className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center space-x-4 backdrop-blur-md relative z-10 select-none ${activeNode === 'warden' ? (node.bg + ' ' + node.activeGlow + ' ' + node.border) : ('bg-slate-900/80 ' + node.border + ' hover:bg-slate-800/90 opacity-60')}`}>
                    <div className={`p-3 bg-black/40 rounded-xl shadow-inner pointer-events-none ${node.color}`}><NodeIcon className="w-6 h-6" /></div>
                    <div className="pointer-events-none">
                      <h4 className="font-black text-white">{node.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {effectiveSimState === 'overheat' ? <span className="text-red-400 font-bold">Thermal Intervention Active!</span> : effectiveSimState === 'storage' ? <span className="text-orange-400 font-bold">Storage Lockout Active!</span> : node.desc}
                      </p>
                    </div>
                  </div>
                )})()}

                {/* INTERNAL WARDEN/UBUNTU FLOW LINE */}
                <div className="h-8 w-full flex justify-center my-0 relative z-0 pointer-events-none" style={{ '--flow-speed': flowSpeed }}>
                   <svg className="absolute h-full w-6 left-[3rem]" preserveAspectRatio="none">
                      <line x1="50%" y1="0" x2="50%" y2="100%" stroke={effectiveSimState === 'normal' ? "rgba(249,115,22,0.3)" : "rgba(239,68,68,0.6)"} strokeWidth="2" strokeDasharray={effectiveSimState === 'normal' ? "4 4" : "0"} className={effectiveSimState === 'normal' ? "animate-flow" : ""} />
                   </svg>
                   <svg className="absolute h-full w-6 right-[3rem]" preserveAspectRatio="none">
                      <line x1="50%" y1="100%" x2="50%" y2="0" stroke="rgba(168,85,247,0.3)" strokeWidth="2" strokeDasharray="4 4" className={effectiveSimState === 'normal' ? "animate-flow" : ""} />
                   </svg>
                   {effectiveSimState !== 'normal' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-900 text-red-100 text-[9px] font-black px-2 py-0.5 rounded border border-red-500 shadow-md whitespace-nowrap z-20">SIGKILL SENT</div>}
                </div>

                {/* --- UBUNTU NODE --- */}
                {(() => {
                  const node = archNodes.ubuntu; const NodeIcon = node.Icon;
                  return (
                  <div onClick={() => setActiveNode('ubuntu')} onPointerDown={() => handlePointerDown('ubuntu')} onPointerUp={handlePointerUpOrLeave} onPointerLeave={handlePointerUpOrLeave} onContextMenu={(e) => e.preventDefault()} className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-500 flex items-center space-x-4 backdrop-blur-md relative z-10 select-none ${activeNode === 'ubuntu' ? (node.bg + ' ' + node.activeGlow + ' ' + node.border) : ('bg-slate-900/80 ' + node.border + ' hover:bg-slate-800/90 opacity-60')}`}>
                    <div className={`p-3 bg-black/40 rounded-xl shadow-inner pointer-events-none ${node.color}`}><NodeIcon className="w-6 h-6" /></div>
                    <div className="w-full flex justify-between items-center pr-2 pointer-events-none">
                      <div><h4 className="font-black text-white">{node.title}</h4><p className="text-xs text-slate-400 mt-1">{node.desc}</p></div>
                      {effectiveSimState !== 'normal' ? (
                        <span className="text-[10px] font-black text-slate-500 bg-black/50 px-2 py-1 rounded border border-slate-700/50">OFFLINE</span>
                      ) : (
                        <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/30 flex items-center"><Box className="w-3 h-3 mr-1" /> {detectedApps.length}</span>
                      )}
                    </div>
                  </div>
                )})()}
              </div>
            </div>

            {/* FLOW 3 (Storage) */}
            <div className="w-full" style={getParallaxStyle(-25)}>
              <div className="h-10 w-full flex justify-center -my-2 relative z-0 pointer-events-none" style={{ '--flow-speed': flowSpeed }}>
                 <svg className="h-full w-2" preserveAspectRatio="none"><line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" className={effectiveSimState === 'normal' ? "animate-flow" : ""} /></svg>
              </div>
            </div>

            {/* --- STORAGE NODE --- */}
            <div className="w-full relative z-10" style={getParallaxStyle(-25)}>
              {(() => {
                const node = archNodes.storage; const NodeIcon = node.Icon;
                return (
                <div onClick={() => setActiveNode('storage')} onPointerDown={() => handlePointerDown('storage')} onPointerUp={handlePointerUpOrLeave} onPointerLeave={handlePointerUpOrLeave} onContextMenu={(e) => e.preventDefault()} className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center space-x-4 backdrop-blur-md select-none ${activeNode === 'storage' ? (node.bg + ' ' + node.activeGlow + ' ' + node.border) : ('bg-slate-900/60 ' + node.border + ' hover:bg-slate-800/80 opacity-60')}`}>
                  <div className={`p-3 bg-black/40 rounded-xl shadow-inner pointer-events-none ${node.color}`}><NodeIcon className="w-6 h-6" /></div>
                  <div className="pointer-events-none"><h4 className="font-black text-white">{node.title}</h4><p className="text-xs text-slate-400 mt-1">{node.desc}</p></div>
                </div>
              )})()}
            </div>

          </div>

          {/* RIGHT COLUMN: Deep Dive Component Inspector */}
          <div className="lg:col-span-7 relative" style={getParallaxStyle(-10)}>
            <div className="sticky top-8 bg-[#0a0f1a]/95 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 md:p-10 overflow-hidden min-h-[calc(100vh-14rem)] flex flex-col z-10">
              
              {(() => {
                const node = archNodes[activeNode]; const ActiveNodeIcon = node.Icon;
                return (
                  <>
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none scale-150 -translate-y-10 translate-x-10">
                      <ActiveNodeIcon className="w-full h-full text-white" />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 pb-10">
                      <div key={activeNode} className="animate-in fade-in slide-in-from-right-8 duration-500">
                        
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3 text-slate-500 font-bold uppercase tracking-widest text-[10px]"><FolderSync className="w-4 h-4" /> Component Inspector</div>
                          <div className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border shadow-inner ${node.bg} ${node.color} ${node.border}`}>{activeNode} node</div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-6">
                          <div className={`inline-flex p-4 rounded-2xl border shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] bg-black/60 ${node.border} ${node.color}`}><ActiveNodeIcon className="w-8 h-8" /></div>
                          <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">{node.title}</h2>
                            <p className={`text-sm font-bold mt-1 opacity-90 ${node.color}`}>{node.desc}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-6 mt-8">
                          <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                            <h4 className="text-white font-bold mb-3 flex items-center text-sm"><Activity className="w-4 h-4 mr-2 text-slate-400" /> Architect's Insight</h4>
                            <p className="text-slate-300 leading-relaxed text-sm">{node.deepDive}</p>
                          </div>

                          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-lg bg-[#05080f]">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center"><TerminalSquare className="w-3 h-3 mr-1.5" /> Runtime Configuration</span>
                              <div className="flex space-x-1.5"><div className="w-2 h-2 rounded-full bg-slate-600"></div><div className="w-2 h-2 rounded-full bg-slate-600"></div><div className="w-2 h-2 rounded-full bg-slate-600"></div></div>
                            </div>
                            <div className="p-5 font-mono text-xs text-green-400/90 whitespace-pre-wrap leading-[1.7] overflow-x-auto">{node.configSnippet}</div>
                          </div>
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