import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, Server, Cpu, Database, Plus, RefreshCw, 
  TerminalSquare, Copy, CheckCircle2, Shield, TestTube2, 
  Workflow, ArrowDown, Loader2, KeyRound, Lock
} from 'lucide-react';

export default function FleetScalingTab() {
  const [selectedRole, setSelectedRole] = useState('compute');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ztpCommand, setZtpCommand] = useState('');
  const [logs, setLogs] = useState('');
  const [copied, setCopied] = useState(false);
  const logsEndRef = useRef(null);

  // --- DAY-0 SETUP STATE ---
  const [isConfigured, setIsConfigured] = useState(true); 
  const [apiInputValue, setApiInputValue] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  // --- TOPOLOGY & PULL-TO-REFRESH STATE ---
  const [nodes, setNodes] = useState([]);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const pullThreshold = 70;

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

  // --- CONFIG CHECK ON MOUNT ---
  useEffect(() => {
    const checkConfig = async () => {
      if (!isLiveEnv) { 
        setIsConfigured(false); 
        return; 
      }
      try {
        const res = await fetch('/api/config/tailscale.json');
        const text = await res.text();
        setIsConfigured(JSON.parse(text).configured);
      } catch (err) { 
        setIsConfigured(false); 
      }
    };
    checkConfig();
  }, [isLiveEnv]);

  // --- LIVE FLEET FETCHING ---
  const fetchTopology = async () => {
    setIsRefreshing(true);
    
    if (!isLiveEnv) {
      setTimeout(() => {
        setNodes([
          { id: 'master', name: 'pocket-lab-cp', role: 'Control Plane', ip: '100.101.50.1', status: 'active', isCurrent: true },
          { id: 'worker1', name: 'pixel-edge-01', role: 'Compute Node', ip: '100.101.50.2', status: 'active', isCurrent: false },
          { id: 'worker2', name: 'samsung-nfs', role: 'Storage Node', ip: '100.101.50.3', status: Math.random() > 0.8 ? 'offline' : 'active', isCurrent: false },
        ]);
        setIsRefreshing(false);
        setPullDistance(0);
      }, 800);
    } else {
      try {
        const res = await fetch('/api/fleet.json');
        const text = await res.text();
        const liveNodes = JSON.parse(text);
        if(Array.isArray(liveNodes)) {
          setNodes(liveNodes);
        }
      } catch (err) {
        console.error("Control plane unreachable", err);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    }
  };

  useEffect(() => {
    fetchTopology();
    const interval = setInterval(() => { if (!isRefreshing) fetchTopology(); }, 15000);
    return () => clearInterval(interval);
  }, [isRefreshing, isLiveEnv]);

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleTouchStart = (e) => {
    if (window.scrollY <= 0) touchStartY.current = e.touches[0].clientY;
    else touchStartY.current = 0;
  };
  const handleTouchMove = (e) => {
    if (touchStartY.current === 0 || isRefreshing) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) setPullDistance(Math.min(diff * 0.4, 120));
  };
  const handleTouchEnd = () => {
    if (pullDistance > pullThreshold && !isRefreshing) {
      if (navigator.vibrate) navigator.vibrate(30);
      fetchTopology();
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  const handleSaveApiKey = async () => {
    if (!apiInputValue.startsWith('tskey-api-')) {
      alert("Key must start with 'tskey-api-'");
      return;
    }
    
    if (navigator.vibrate) navigator.vibrate(20);
    setIsSavingKey(true);

    if (!isLiveEnv) {
      setTimeout(() => {
        setIsConfigured(true);
        setIsSavingKey(false);
      }, 1000);
    } else {
      try {
        const res = await fetch('/api/action/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intent: 'save_tailscale_key', api_key: apiInputValue })
        });
        
        if (res.ok) {
          setIsConfigured(true);
        } else {
          alert("Failed to save to Vault.");
        }
      } catch (err) {
        alert("API Unreachable.");
      }
      setIsSavingKey(false);
    }
  };

  const handleGenerateZTP = async () => {
    if (navigator.vibrate) navigator.vibrate(20);
    setIsGenerating(true);
    setZtpCommand('');
    
    setLogs(`[*] EDGE NODE: Initializing ZTP Token Generation...\n`);

    if (!isLiveEnv) {
      setTimeout(() => setLogs(prev => prev + `[vault] Fetching Tailscale REST API Key...\n`), 600);
      setTimeout(() => setLogs(prev => prev + `[tailscale] POST /api/v2/tailnet/-/keys (ephemeral=true, preauthorized=true)\n`), 1200);
      setTimeout(() => {
        setLogs(prev => prev + `[SUCCESS] Cryptographic Ephemeral Token generated via Simulation.`);
        setZtpCommand(`curl -sL "https://pocket-lab.tailnet.ts.net/api/join.sh?role=${selectedRole}&token=tk_ephem_${Math.random().toString(36).substr(2, 8)}" | bash`);
        setIsGenerating(false);
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      }, 2500);
    } else {
      try {
        setLogs(prev => prev + `[vault] Fetching Tailscale REST API Key...\n`);
        const res = await fetch('/api/action/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intent: 'generate_ztp', role: selectedRole })
        });
        
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { throw new Error("Invalid format"); }
        
        setLogs(prev => prev + `${data.log}\n`);
        
        let controlPlaneName = "pocket-lab";
        if (nodes.length > 0) {
           const cpNode = nodes.find(n => n.isCurrent);
           if (cpNode) controlPlaneName = cpNode.name;
        }

        setTimeout(() => {
           setLogs(prev => prev + `[SUCCESS] ZTP Payload published to Edge API.`);
           setZtpCommand(`curl -sL "https://${controlPlaneName}.tailnet.ts.net/api/join.sh?role=${selectedRole}&token=${data.token}" | bash`);
           setIsGenerating(false);
           if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
        }, 1000);

      } catch (err) {
        setLogs(prev => prev + `\n[CRITICAL ERROR] Failed to reach API Bridge.`);
        setIsGenerating(false);
      }
    }
  };

  const copyToClipboard = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    try {
      // Legacy execCommand is preferred here to bypass restrictive iframe/sandbox clipboard policies
      const textArea = document.createElement("textarea");
      textArea.value = ztpCommand;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy ZTP command text', err);
    }
  };

  return (
    <div 
      className="max-w-7xl mx-auto p-4 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="flex justify-center items-center w-full absolute top-0 left-0 right-0 z-0 overflow-hidden"
        style={{ height: `${pullDistance}px`, opacity: pullDistance / pullThreshold, transition: isRefreshing || pullDistance === 0 ? 'height 0.3s ease, opacity 0.3s ease' : 'none' }}
      >
        <div className="flex flex-col items-center justify-center mt-4 text-emerald-400">
          {isRefreshing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <ArrowDown className={`w-6 h-6 transition-transform duration-300 ${pullDistance > pullThreshold ? 'rotate-180 text-emerald-300' : ''}`} />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest mt-2 text-emerald-400/80">
            {isRefreshing ? 'Scanning Tailnet...' : pullDistance > pullThreshold ? 'Release to Sync' : 'Pull to sync network'}
          </span>
        </div>
      </div>

      <div 
        className="relative z-10 animate-in fade-in duration-700 flex flex-col xl:flex-row gap-6"
        style={{ transform: `translateY(${pullDistance}px)`, transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none' }}
      >
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 flex flex-col relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
               <Workflow className="w-48 h-48 text-indigo-400" />
            </div>
            <div className="flex items-center space-x-2 mb-4 relative z-10">
               {!isLiveEnv ? <TestTube2 className="w-5 h-5 text-orange-400" /> : <Network className="w-5 h-5 text-indigo-400" />}
               <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">{!isLiveEnv ? 'Simulator Sandbox' : 'Cluster Operations'}</h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 relative z-10">Zero-Touch Provisioning</h2>
            <p className="text-slate-400 text-sm max-w-xl relative z-10">Dynamically compile node-specific installation payloads using Tailscale API. Scale your Mesh Fleet securely without manual terminal configuration.</p>
          </div>

          {/* DYNAMIC RENDER: First Time Setup vs ZTP Generator */}
          {!isConfigured ? (
            
            // DAY-0 SETUP CARD
            <div className="bg-[#05080f] border border-orange-500/30 rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden shadow-[0_0_40px_rgba(249,115,22,0.1)] z-10 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center space-x-3 mb-4">
                 <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400">
                   <KeyRound className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-white">Vault Integration Required</h3>
                   <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">First-Time Setup</span>
                 </div>
               </div>
               
               <p className="text-sm text-slate-400 mb-6">
                 To enable automated Zero-Touch Provisioning, Pocket Lab needs authority to create single-use join tokens. 
                 Generate an API Access Token at <strong className="text-slate-300">login.tailscale.com/admin/settings/keys</strong> and paste it below. It will be securely sealed in HashiCorp Vault.
               </p>

               <div className="flex flex-col md:flex-row gap-4">
                 <div className="flex-1 relative">
                   <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                   <input 
                     type="password"
                     value={apiInputValue}
                     onChange={(e) => setApiInputValue(e.target.value)}
                     placeholder="tskey-api-..."
                     className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-mono text-sm"
                   />
                 </div>
                 <button 
                   onClick={handleSaveApiKey}
                   disabled={isSavingKey || !apiInputValue}
                   className="px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50 shrink-0 shadow-lg"
                 >
                   {isSavingKey ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Shield className="w-5 h-5 mr-2" />} 
                   Secure in Vault
                 </button>
               </div>
            </div>

          ) : (

            // ZTP GENERATOR CARD
            <div className="bg-[#05080f] border border-white/10 rounded-[2.5rem] p-4 md:p-6 relative overflow-hidden shadow-xl z-10 flex flex-col md:flex-row gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex-1 space-y-3 md:space-y-4">
                 <div className="flex items-center justify-between ml-2 md:ml-0">
                   <label className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">1. Select Target Node Role</label>
                   <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                     <CheckCircle2 className="w-3 h-3 mr-1" /> Vault Synced
                   </span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <button onClick={() => { if(navigator.vibrate) navigator.vibrate(10); setSelectedRole('compute'); }} className={`p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] border text-left transition-all flex items-center ${selectedRole === 'compute' ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200' : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'}`}>
                     <Cpu className="w-5 h-5 mr-3 shrink-0" />
                     <div><div className="font-bold text-sm text-white">Compute Node</div><div className="text-[9px] md:text-[10px] mt-0.5">Edge Workloads & PRoot</div></div>
                   </button>
                   <button onClick={() => { if(navigator.vibrate) navigator.vibrate(10); setSelectedRole('storage'); }} className={`p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] border text-left transition-all flex items-center ${selectedRole === 'storage' ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200' : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'}`}>
                     <Database className="w-5 h-5 mr-3 shrink-0" />
                     <div><div className="font-bold text-sm text-white">Storage Node</div><div className="text-[9px] md:text-[10px] mt-0.5">NFS & Database volumes</div></div>
                   </button>
                 </div>
               </div>

               <div className="flex flex-col justify-end">
                 <button 
                   onClick={handleGenerateZTP} disabled={isGenerating}
                   className="w-full md:w-auto px-6 md:px-8 py-4 rounded-2xl md:rounded-[1.5rem] font-bold flex items-center justify-center transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:opacity-50"
                 >
                   {isGenerating ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />} 
                   Generate Token
                 </button>
               </div>
            </div>
          )}

          <div className={`transition-all duration-500 ${ztpCommand && isConfigured ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden'}`}>
             <div className="bg-gradient-to-br from-indigo-900/40 to-[#05080f] border border-indigo-500/30 rounded-[2.5rem] p-5 md:p-6 relative overflow-hidden shadow-xl mt-2 md:mt-0">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-2">
                   <Shield className="w-5 h-5 text-indigo-400" />
                   <h3 className="text-base md:text-lg font-bold text-white">Execution String Ready</h3>
                 </div>
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/20 px-2 py-1 rounded">1-Hour Expiry</span>
               </div>
               <p className="text-slate-400 text-xs md:text-sm mb-4 leading-relaxed">Run this exact command in the Termux terminal of your <strong>new</strong> Android device. It securely pulls the installation logic directly from this Control Plane.</p>
               
               <div className="flex bg-black/60 border border-white/10 rounded-2xl p-2 items-center overflow-hidden">
                 <code className="flex-1 font-mono text-xs md:text-sm text-indigo-200 px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                   {ztpCommand}
                 </code>
                 <button onClick={copyToClipboard} className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors ml-2 shrink-0 flex items-center shadow-lg">
                   {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 </button>
               </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full xl:w-[450px] flex flex-col gap-6 shrink-0 z-10 mb-16 md:mb-0">
          <div className="bg-[#05080f] border border-white/10 rounded-[2.5rem] p-5 md:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
                 <Network className="w-4 h-4 mr-2" /> Mesh Fleet Topology
              </h3>
              <span className="text-[9px] bg-white/5 border border-white/10 text-slate-400 px-2 py-1 rounded-md uppercase tracking-widest font-bold">
                {nodes.length} Nodes
              </span>
            </div>

            <div className="space-y-3">
              {nodes.map(node => (
                <div key={node.id} className={`flex items-center p-3 rounded-2xl border transition-colors ${node.isCurrent ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-slate-900/50 border-white/5 hover:bg-slate-900/80'}`}>
                  <div className={`p-2.5 rounded-xl mr-3 shrink-0 ${node.isCurrent ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                    {node.isCurrent ? <Server className="w-4 h-4" /> : node.role.includes('Storage') ? <Database className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm truncate">{node.name}</span>
                      {node.isCurrent && <span className="text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-black uppercase tracking-widest shrink-0 hidden sm:block">Control Plane</span>}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{node.ip} • {node.role}</div>
                  </div>
                  <div className="flex flex-col items-center justify-center shrink-0 ml-2 w-12">
                    <span className="relative flex h-2.5 w-2.5 mb-1">
                      {node.status === 'active' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${node.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    </span>
                    <span className={`text-[7px] font-black uppercase tracking-widest ${node.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>{node.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#020617] border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] flex flex-col flex-1 h-[250px] md:min-h-[300px]">
             <div className="bg-black/80 px-4 py-3 md:py-4 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <TerminalSquare className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] md:text-sm font-bold text-slate-300">API Execution Log</span>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 md:p-5 font-mono text-[10px] md:text-[11px] whitespace-pre-wrap leading-relaxed text-indigo-100/80 scrollbar-thin scrollbar-thumb-slate-700">
               {logs ? (
                 <div className="animate-in fade-in">
                   {logs}
                   <div ref={logsEndRef} />
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <Workflow className="w-8 h-8 md:w-10 md:h-10 mb-3" />
                    <p className="text-xs">Awaiting Token request...</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}