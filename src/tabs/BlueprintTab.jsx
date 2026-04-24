import React, { useState, useRef } from 'react';
import { 
  Activity, Eye, Compass, ShieldAlert, Layers, 
  Lock, Check, FolderSync, TerminalSquare, Network, 
  Smartphone, Server, Database, Shield, Wifi, WifiOff, History
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

  // Logic Gate: Use Live/Cached Data if available, otherwise use UI Simulator
  const effectiveSimState = liveData 
    ? (liveData.cpuTemp > 48 ? 'overheat' : liveData.freeSpaceMB < 500 ? 'storage' : 'normal')
    : simState;

  // Haptic Feedback Handlers
  const handlePointerDown = (nodeId) => {
    pressTimer.current = setTimeout(() => {
      setActiveVitalNode(nodeId);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50); 
      }
    }, 500); 
  };

  const handlePointerUpOrLeave = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  // Centralized Architecture Data Store
  const archNodes = {
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
      deepDive: "Your laptop or phone connects via HTTPS. Because we use 'Tailscale Serve', the browser sees a valid Let's Encrypt certificate, enabling PWAs and high-speed Service Workers. No internet ports are opened.",
      configSnippet: "URL: https://pocket-lab.[tailnet].ts.net:8443\nTLS: Let's Encrypt ECDSA\nProtocol: HTTPS / HTTP2",
      vitals: [
        { label: "Protocol", val: "TLS 1.3 / HTTP2" },
        { label: "Link Status", val: isConnected ? "LIVE CONNECTION" : (liveData ? "CACHED / OFFLINE" : "Simulated Local") },
        { label: "DNS Strategy", val: "MagicDNS Resolved" }
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
      desc: "In-Process TLS Termination.",
      deepDive: "By running the patched tailscaled daemon via our wrapper scripts, we completely bypass Android's AF_NETLINK socket restrictions. Tailscale handles the SSL handshake entirely in Termux RAM. We use Port Multiplexing on 8443 to keep the PWA separate from PhotoPrism.",
      configSnippet: "tailscaled --tun=userspace-networking \\\n  --statedir=$PREFIX/var/lib/tailscale \\\n  --socket=$PREFIX/var/lib/tailscale/tailscaled.sock\n\n# Secure API Path Routing (Port Multiplexing)\ntailscale-cli serve --bg --https=8443 /api http://127.0.0.1:8080",
      vitals: [
        { label: "Socket Bind", val: "/var/lib/.../tailscaled.sock" },
        { label: "Live Telemetry Proxy", val: isConnected ? "Port 8443 -> Port 8080 Active" : "Port 8443 -> Port 8080 (Offline)" },
        { label: "Active Serve", val: "Port 443 -> 2342" }
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
      desc: "Active Mitigation Engine & Health Monitor.",
      deepDive: "A lightweight cron job running every 5 minutes. It continuously polls /proc/meminfo and kernel thermal zones. If CPU temperatures exceed 48°C or storage drops below 500MB, the Warden autonomously suspends the PhotoPrism container to protect the hardware and database from corruption.",
      configSnippet: "# Dynamic JSON Payload Generation:\necho '{ \"cpuTemp\": '\"$TEMP\"', \"freeSpaceMB\": '\"$FREE_SPACE\"', \"ramPct\": '\"$MEM_PCT\"' }' > ~/api/telemetry.json",
      vitals: [
        { label: "Daemon Status", val: liveData ? (isConnected ? `Live: Updated ${new Date(liveData.timestamp).toLocaleTimeString()}` : `Stale: Last seen ${new Date(liveData.timestamp).toLocaleTimeString()}`) : "Polling Active (5m)" },
        { label: "CPU Temp", val: liveData ? `${liveData.cpuTemp}°C` : (effectiveSimState === 'overheat' ? "WARNING: 52°C" : "Nominal: 34°C") },
        { label: "RAM Usage", val: liveData ? `${liveData.ramPct}% Load` : "Nominal: 65%" }
      ]
    },
    ubuntu: {
      id: 'ubuntu',
      title: "Ubuntu Container",
      Icon: Server,
      color: effectiveSimState !== 'normal' ? "text-slate-500" : "text-purple-400",
      bg: effectiveSimState !== 'normal' ? "bg-slate-800/50" : "bg-purple-500/10",
      border: effectiveSimState !== 'normal' ? "border-slate-700/50" : "border-purple-500/30",
      glow: effectiveSimState !== 'normal' ? "shadow-none" : "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
      activeGlow: effectiveSimState !== 'normal' ? "shadow-none border-slate-600" : "shadow-[0_0_30px_rgba(168,85,247,0.5)] border-purple-400",
      desc: "The Proot Subsystem housing the PhotoPrism AI.",
      deepDive: "Since Android lacks a standard Linux filesystem, proot-distro fakes a root directory. Inside this isolated Debian environment, PhotoPrism utilizes Go and FFmpeg to perform facial recognition, object detection, and video transcoding. It receives clean HTTP traffic from the Tailscale proxy on localhost.",
      configSnippet: "proot-distro login ubuntu \\\n  --bind ~/storage/dcim:/photoprism/originals \\\n  -- bash -c \"\n    export PHOTOPRISM_FFMPEG_SIZE='1280'\n    export GOMAXPROCS=4\n    /opt/photoprism/bin/photoprism start\n  \"",
      vitals: [
        { label: "Process ID", val: effectiveSimState !== 'normal' ? "NULL (Terminated)" : "Active (PID 2041)" },
        { label: "Target Service", val: "PhotoPrism UI (Port 2342)" },
        { label: "Memory Bounds", val: "1.2GB Reserved / 4GB Max" }
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
      desc: "Zero-duplication media access and SQLite archives.",
      deepDive: "The Android DCIM (Camera) folder is bind-mounted directly into the Ubuntu container as a read-only source. This prevents PhotoPrism from duplicating your photos. Every night at 3 AM, a cron job dumps the PhotoPrism SQLite database out of the container and safely into your Android Downloads folder for disaster recovery.",
      configSnippet: "# Daily Cron Dump Sequence:\nsqlite3 /root/.../index.db \\\n  '.backup /root/.../index_backup.db'\n\ncp index_backup.db \\\n  ~/storage/downloads/photoprism_backup.db",
      vitals: [
        { label: "Media Mount", val: "Read-Only (/storage/dcim)" },
        { label: "Free Capacity", val: liveData ? `${liveData.freeSpaceMB} MB Available` : (effectiveSimState === 'storage' ? "CRITICAL: 120MB Free" : ">5GB Free") },
        { label: "I/O Latency", val: "Fast (< 5ms)" }
      ]
    }
  };

  return (
    <>
      {/* Dynamic Keyframes for Pipeline Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flow { 
          to { stroke-dashoffset: -20; } 
        }
        .animate-flow { 
          animation: flow 1s linear infinite; 
        }
        @keyframes scan { 
          0% { transform: translateY(-100%); opacity: 0; } 
          10% { opacity: 1; } 
          90% { opacity: 1; } 
          100% { transform: translateY(100%); opacity: 0; } 
        }
        .animate-scan { 
          animation: scan 2.5s ease-in-out infinite; 
        }
      `}} />

      {/* Haptic Vitals Modal */}
      {activeVitalNode && (() => {
        const VitalIcon = archNodes[activeVitalNode].Icon;
        return (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-300" 
          onClick={() => setActiveVitalNode(null)}
        >
           <div 
             className="bg-[#05080f] border border-blue-500/50 rounded-[2rem] shadow-[0_0_50px_rgba(59,130,246,0.3)] w-full max-w-sm animate-in zoom-in-95 relative overflow-hidden flex flex-col" 
             onClick={e => e.stopPropagation()}
           >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-scan pointer-events-none"></div>
              
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between relative z-10">
                 <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
                    <span className="font-black text-white tracking-widest uppercase text-xs">Haptic Scan Active</span>
                 </div>
                 <button 
                   onClick={() => setActiveVitalNode(null)} 
                   className="text-slate-500 hover:text-white transition-colors bg-black/50 rounded-full p-1 border border-white/10"
                 >
                   <Check className="w-4 h-4" />
                 </button>
              </div>
              
              <div className="p-8 relative z-10 flex flex-col items-center">
                 <div className={`p-4 rounded-2xl border shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] mb-6 ${archNodes[activeVitalNode].bg} ${archNodes[activeVitalNode].color} ${archNodes[activeVitalNode].border}`}>
                   <VitalIcon className="w-10 h-10" />
                 </div>
                 <h3 className="text-2xl font-black text-white mb-8">{archNodes[activeVitalNode].title}</h3>
                 
                 <div className="w-full space-y-4">
                   {archNodes[activeVitalNode].vitals.map((v, i) => (
                     <div key={i} className="flex flex-col bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{v.label}</span>
                        <span className={`text-sm font-mono whitespace-nowrap overflow-hidden text-ellipsis ${
                          v.val.includes('CRITICAL') || v.val.includes('WARNING') 
                            ? 'text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' 
                            : (v.val.includes('LIVE') 
                                ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]' 
                                : (v.val.includes('Stale') || v.val.includes('CACHED') 
                                    ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' 
                                    : 'text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]'))
                        }`}>
                          {v.val}
                        </span>
                     </div>
                   ))}
                 </div>
              </div>
           </div>
        </div>
        );
      })()}

      {/* Main Tab Content */}
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Top Header: NOC Controls */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xl relative overflow-hidden z-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-orange-500/5 pointer-events-none"></div>
          
          {/* Hardware Link Status */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              {isConnected ? <Wifi className="w-5 h-5 text-blue-400 animate-pulse" /> : (liveData ? <History className="w-5 h-5 text-yellow-500" /> : <WifiOff className="w-5 h-5 text-slate-500" />)}
            </div>
            <div className="flex flex-col">
              <h3 className="font-black text-white text-sm uppercase tracking-widest whitespace-nowrap">Hardware Link</h3>
              <span className={`text-[10px] font-bold tracking-wider ${isConnected ? 'text-blue-400' : (liveData ? 'text-yellow-500' : 'text-slate-500')}`}>
                {isConnected ? 'LIVE TELEMETRY' : (liveData ? 'LAST KNOWN STATE' : 'OFFLINE / SIMULATED')}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 hidden xl:block"></div>

          {/* Map View Mode Toggles */}
          <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 shadow-inner">
            <button 
              onClick={() => setMapViewMode('logical')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mapViewMode === 'logical' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Logical
            </button>
            <button 
              onClick={() => setMapViewMode('ports')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mapViewMode === 'ports' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Ports
            </button>
            <button 
              onClick={() => setMapViewMode('security')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mapViewMode === 'security' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Security
            </button>
          </div>

          <div className="h-8 w-px bg-white/10 hidden xl:block"></div>

          {/* Simulator Toggles */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <ShieldAlert className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-black text-white text-sm uppercase tracking-widest mr-2 whitespace-nowrap">Simulator</h3>
          </div>

          <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 shadow-inner overflow-x-auto scrollbar-none w-full xl:w-auto">
            <button 
              disabled={!!liveData} 
              onClick={() => setSimState('normal')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${effectiveSimState === 'normal' ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:text-white'} ${!!liveData && 'opacity-50 cursor-not-allowed'}`}
            >
              Normal
            </button>
            <button 
              disabled={!!liveData} 
              onClick={() => setSimState('overheat')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${effectiveSimState === 'overheat' ? 'bg-red-600 text-white shadow-md animate-pulse' : 'text-slate-400 hover:text-white'} ${!!liveData && 'opacity-50 cursor-not-allowed'}`}
            >
              Thermal Spike
            </button>
            <button 
              disabled={!!liveData} 
              onClick={() => setSimState('storage')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${effectiveSimState === 'storage' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'} ${!!liveData && 'opacity-50 cursor-not-allowed'}`}
            >
              Storage Critical
            </button>
          </div>
        </div>

        {/* Blueprint Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* LEFT COLUMN: 2D Logical Map */}
          <div className="lg:col-span-5 flex flex-col items-center py-6 relative animate-in fade-in duration-500">
            
            {/* --- CLIENT NODE --- */}
            <div className="w-full relative z-10" style={getParallaxStyle(-25)}>
              {(() => {
                const node = archNodes.client;
                const NodeIcon = node.Icon;
                return (
                <div 
                  onClick={() => setActiveNode('client')} 
                  onPointerDown={() => handlePointerDown('client')} 
                  onPointerUp={handlePointerUpOrLeave} 
                  onPointerLeave={handlePointerUpOrLeave} 
                  onContextMenu={(e) => e.preventDefault()} 
                  className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center space-x-4 backdrop-blur-md select-none ${activeNode === 'client' ? (node.bg + ' ' + node.activeGlow + ' ' + node.border) : ('bg-slate-900/60 ' + node.border + ' hover:bg-slate-800/80 opacity-60')}`}
                >
                  <div className={`p-3 bg-black/40 rounded-xl shadow-inner pointer-events-none ${node.color}`}>
                    <NodeIcon className="w-6 h-6" />
                  </div>
                  <div className="pointer-events-none">
                    <h4 className="font-black text-white">{node.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{node.desc}</p>
                  </div>
                </div>
              )})()}
            </div>

            {/* FLOW LINE 1 */}
            <div className="w-full" style={getParallaxStyle(-25)}>
              <div className="h-12 w-full flex justify-center -my-2 relative pointer-events-none">
                 <svg className="h-full w-2" preserveAspectRatio="none">
                   <line 
                     x1="50%" y1="0" x2="50%" y2="100%" 
                     stroke={mapViewMode === 'security' ? "rgba(34,197,94,0.6)" : "rgba(255,255,255,0.2)"} 
                     strokeWidth={mapViewMode === 'security' ? "4" : "2"} 
                     strokeDasharray={mapViewMode === 'security' ? "0" : "4 4"} 
                     className={effectiveSimState === 'normal' ? "animate-flow" : ""} 
                   />
                 </svg>
                 {mapViewMode === 'ports' && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-900 text-blue-200 text-[9px] font-black px-2 py-0.5 rounded border border-blue-500 shadow-md">
                     HTTPS : 8443
                   </div>
                 )}
                 {mapViewMode === 'security' && (
                   <div className="absolute top-1/2 left-[calc(50%+1rem)] -translate-y-1/2 text-green-400 text-[9px] font-black uppercase tracking-widest flex items-center">
                     <Lock className="w-3 h-3 mr-1"/> TLS Encrypted
                   </div>
                 )}
              </div>
            </div>

            {/* --- TAILSCALE NODE --- */}
            <div className="w-full relative z-10" style={getParallaxStyle(-25)}>
              {(() => {
                const node = archNodes.tailscale;
                const NodeIcon = node.Icon;
                return (
                <div 
                  onClick={() => setActiveNode('tailscale')} 
                  onPointerDown={() => handlePointerDown('tailscale')} 
                  onPointerUp={handlePointerUpOrLeave} 
                  onPointerLeave={handlePointerUpOrLeave} 
                  onContextMenu={(e) => e.preventDefault()} 
                  className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center space-x-4 backdrop-blur-md select-none ${activeNode === 'tailscale' ? (node.bg + ' ' + node.activeGlow + ' ' + node.border) : ('bg-slate-900/60 ' + node.border + ' hover:bg-slate-800/80 opacity-60')}`}
                >
                  <div className={`p-3 bg-black/40 rounded-xl shadow-inner pointer-events-none ${node.color}`}>
                    <NodeIcon className="w-6 h-6" />
                  </div>
                  <div className="pointer-events-none">
                    <h4 className="font-black text-white">{node.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{node.desc}</p>
                  </div>
                </div>
              )})()}
            </div>

            {/* FLOW LINE 2 */}
            <div className="w-full" style={getParallaxStyle(-25)}>
              <div className="h-12 w-full flex justify-center -my-2 relative z-0 pointer-events-none">
                 <svg className="h-full w-2" preserveAspectRatio="none">
                   <line 
                     x1="50%" y1="0" x2="50%" y2="100%" 
                     stroke={effectiveSimState === 'normal' ? "rgba(255,255,255,0.2)" : "rgba(239,68,68,0.3)"} 
                     strokeWidth="2" 
                     strokeDasharray="4 4" 
                     className={effectiveSimState === 'normal' ? "animate-flow" : ""} 
                   />
                 </svg>
                 {mapViewMode === 'ports' && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-900 text-purple-200 text-[9px] font-black px-2 py-0.5 rounded border border-purple-500 shadow-md">
                     Local : 8080
                   </div>
                 )}
                 {mapViewMode === 'security' && (
                   <div className="absolute top-1/2 left-[calc(50%+1rem)] -translate-y-1/2 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                     Trusted Localhost
                   </div>
                 )}
              </div>
            </div>

            {/* --- TERMUX BOUNDARY BOX --- */}
            <div className="w-full border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm rounded-[2rem] p-5 relative shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] pt-8" style={getParallaxStyle(-10)}>
              
              {/* Boundary Label */}
              <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-md flex items-center pointer-events-none" style={getParallaxStyle(-5)}>
                <Layers className="w-3 h-3 mr-1.5 opacity-50" /> Android Host (Termux)
              </div>

              <div className="w-full" style={getParallaxStyle(-15)}>
                
                {/* --- WARDEN NODE --- */}
                {(() => {
                  const node = archNodes.warden;
                  const NodeIcon = node.Icon;
                  return (
                  <div 
                    onClick={() => setActiveNode('warden')} 
                    onPointerDown={() => handlePointerDown('warden')} 
                    onPointerUp={handlePointerUpOrLeave} 
                    onPointerLeave={handlePointerUpOrLeave} 
                    onContextMenu={(e) => e.preventDefault()} 
                    className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center space-x-4 backdrop-blur-md relative z-10 select-none ${activeNode === 'warden' ? (node.bg + ' ' + node.activeGlow + ' ' + node.border) : ('bg-slate-900/80 ' + node.border + ' hover:bg-slate-800/90 opacity-60')}`}
                  >
                    <div className={`p-3 bg-black/40 rounded-xl shadow-inner pointer-events-none ${node.color}`}>
                      <NodeIcon className="w-6 h-6" />
                    </div>
                    <div className="pointer-events-none">
                      <h4 className="font-black text-white">{node.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {effectiveSimState === 'overheat' ? <span className="text-red-400 font-bold">Thermal Intervention Active!</span> : effectiveSimState === 'storage' ? <span className="text-orange-400 font-bold">Storage Lockout Active!</span> : node.desc}
                      </p>
                    </div>
                  </div>
                )})()}

                {/* INTERNAL WARDEN/UBUNTU FLOW LINE */}
                <div className="h-8 w-full flex justify-center my-0 relative z-0 pointer-events-none">
                   <svg className="absolute h-full w-6 left-[3rem]" preserveAspectRatio="none">
                      <line 
                        x1="50%" y1="0" x2="50%" y2="100%" 
                        stroke={effectiveSimState === 'normal' ? "rgba(249,115,22,0.3)" : "rgba(239,68,68,0.6)"} 
                        strokeWidth="2" 
                        strokeDasharray={effectiveSimState === 'normal' ? "4 4" : "0"} 
                        className={effectiveSimState === 'normal' ? "animate-flow" : ""} 
                      />
                   </svg>
                   <svg className="absolute h-full w-6 right-[3rem]" preserveAspectRatio="none">
                      <line 
                        x1="50%" y1="100%" x2="50%" y2="0" 
                        stroke="rgba(168,85,247,0.3)" 
                        strokeWidth="2" 
                        strokeDasharray="4 4" 
                        className={effectiveSimState === 'normal' ? "animate-flow" : ""} 
                      />
                   </svg>
                   {effectiveSimState !== 'normal' && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-900 text-red-100 text-[9px] font-black px-2 py-0.5 rounded border border-red-500 shadow-md whitespace-nowrap z-20">
                       SIGKILL SENT
                     </div>
                   )}
                </div>

                {/* --- UBUNTU NODE --- */}
                {(() => {
                  const node = archNodes.ubuntu;
                  const NodeIcon = node.Icon;
                  return (
                  <div 
                    onClick={() => setActiveNode('ubuntu')} 
                    onPointerDown={() => handlePointerDown('ubuntu')} 
                    onPointerUp={handlePointerUpOrLeave} 
                    onPointerLeave={handlePointerUpOrLeave} 
                    onContextMenu={(e) => e.preventDefault()} 
                    className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-500 flex items-center space-x-4 backdrop-blur-md relative z-10 select-none ${activeNode === 'ubuntu' ? (node.bg + ' ' + node.activeGlow + ' ' + node.border) : ('bg-slate-900/80 ' + node.border + ' hover:bg-slate-800/90 opacity-60')}`}
                  >
                    <div className={`p-3 bg-black/40 rounded-xl shadow-inner pointer-events-none ${node.color}`}>
                      <NodeIcon className="w-6 h-6" />
                    </div>
                    <div className="w-full flex justify-between items-center pr-2 pointer-events-none">
                      <div>
                        <h4 className="font-black text-white">{node.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{node.desc}</p>
                      </div>
                      {effectiveSimState !== 'normal' && (
                        <span className="text-[10px] font-black text-slate-500 bg-black/50 px-2 py-1 rounded border border-slate-700/50">
                          OFFLINE
                        </span>
                      )}
                    </div>
                  </div>
                )})()}
              </div>
            </div>

            {/* FLOW LINE 3 (Leaving Termux to Storage) */}
            <div className="w-full" style={getParallaxStyle(-25)}>
              <div className="h-12 w-full flex justify-center -my-2 relative z-0 pointer-events-none">
                 <svg className="h-full w-2" preserveAspectRatio="none">
                   <line 
                     x1="50%" y1="0" x2="50%" y2="100%" 
                     stroke="rgba(255,255,255,0.2)" 
                     strokeWidth="2" 
                     strokeDasharray="4 4" 
                     className={effectiveSimState === 'normal' ? "animate-flow" : ""} 
                   />
                 </svg>
                 {mapViewMode === 'ports' && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 text-slate-300 text-[9px] font-black px-2 py-0.5 rounded border border-white/10 shadow-md">
                     Bind Mount
                   </div>
                 )}
              </div>
            </div>

            {/* --- STORAGE NODE --- */}
            <div className="w-full relative z-10" style={getParallaxStyle(-25)}>
              {(() => {
                const node = archNodes.storage;
                const NodeIcon = node.Icon;
                return (
                <div 
                  onClick={() => setActiveNode('storage')} 
                  onPointerDown={() => handlePointerDown('storage')} 
                  onPointerUp={handlePointerUpOrLeave} 
                  onPointerLeave={handlePointerUpOrLeave} 
                  onContextMenu={(e) => e.preventDefault()} 
                  className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center space-x-4 backdrop-blur-md select-none ${activeNode === 'storage' ? (node.bg + ' ' + node.activeGlow + ' ' + node.border) : ('bg-slate-900/60 ' + node.border + ' hover:bg-slate-800/80 opacity-60')}`}
                >
                  <div className={`p-3 bg-black/40 rounded-xl shadow-inner pointer-events-none ${node.color}`}>
                    <NodeIcon className="w-6 h-6" />
                  </div>
                  <div className="pointer-events-none">
                    <h4 className="font-black text-white">{node.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{node.desc}</p>
                  </div>
                </div>
              )})()}
            </div>

          </div>

          {/* RIGHT COLUMN: Deep Dive Component Inspector */}
          <div className="lg:col-span-7 relative" style={getParallaxStyle(-10)}>
            <div className="sticky top-8 bg-[#0a0f1a] backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 md:p-10 overflow-hidden min-h-[calc(100vh-14rem)] flex flex-col z-10">
              
              {(() => {
                const node = archNodes[activeNode];
                const ActiveNodeIcon = node.Icon;
                return (
                  <>
                    {/* Background Faded Icon */}
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none scale-150 -translate-y-10 translate-x-10">
                      <ActiveNodeIcon className="w-full h-full text-white" />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 pb-10">
                      <div key={activeNode} className="animate-in fade-in slide-in-from-right-8 duration-500">
                        
                        {/* Header Area */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            <FolderSync className="w-4 h-4" /> Component Inspector
                          </div>
                          <div className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border shadow-inner ${node.bg} ${node.color} ${node.border}`}>
                            {activeNode} node
                          </div>
                        </div>
                        
                        {/* Title and Description */}
                        <div className="flex items-center space-x-4 mb-6">
                          <div className={`inline-flex p-4 rounded-2xl border shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] bg-black/60 ${node.border} ${node.color}`}>
                            <ActiveNodeIcon className="w-8 h-8" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">{node.title}</h2>
                            <p className={`text-sm font-bold mt-1 opacity-90 ${node.color}`}>{node.desc}</p>
                          </div>
                        </div>
                        
                        {/* Deep Dive Content Blocks */}
                        <div className="space-y-6 mt-8">
                          
                          {/* Architect's Insight */}
                          <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                            <h4 className="text-white font-bold mb-3 flex items-center text-sm">
                              <Activity className="w-4 h-4 mr-2 text-slate-400" /> Architect's Insight
                            </h4>
                            <p className="text-slate-300 leading-relaxed text-sm">
                              {node.deepDive}
                            </p>
                          </div>

                          {/* Tailscale ASCII Diagram (Only visible when Gateway is active) */}
                          {activeNode === 'tailscale' && (
                            <div className="p-6 bg-teal-900/10 border border-teal-500/20 rounded-2xl">
                               <h4 className="text-teal-400 font-bold mb-4 flex items-center text-sm">
                                <Network className="w-4 h-4 mr-2" /> AF_NETLINK Bypass Architecture
                              </h4>
                              <div className="bg-black/60 p-4 rounded-xl border border-teal-500/10 font-mono text-[10px] text-teal-200/70 whitespace-pre overflow-x-auto leading-relaxed shadow-inner">
{`[STANDARD DAEMON]                 [TERMUX PATCHED]
-------------------               -------------------
 tailscaled                       tailscaled
    |                                |
    v                                v
 netlink.Dial() <[BLOCKED BY OS]  exec.Command("ifconfig")
    |                                |
    v                                v
 Parse Interfaces                 Parse Stdout Text
    |                                |
    v                                v
 TLS Handshake                    TLS Handshake (Success)`}
                              </div>
                            </div>
                          )}

                          {/* Code Snippet Box */}
                          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-lg bg-[#05080f]">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <TerminalSquare className="w-3 h-3 mr-1.5" /> Runtime Configuration
                              </span>
                              <div className="flex space-x-1.5">
                                <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                              </div>
                            </div>
                            <div className="p-5 font-mono text-xs text-green-400/90 whitespace-pre-wrap leading-[1.7] overflow-x-auto">
                              {node.configSnippet}
                            </div>
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