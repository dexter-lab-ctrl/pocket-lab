import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Key, ShieldCheck, Fingerprint, RefreshCw, Eye, EyeOff, ShieldAlert, Database, Cpu, TestTube2, Timer, Zap, Plus, Server, Calendar, Bot, TerminalSquare, Network, LockKeyhole } from 'lucide-react';

export default function IdentityVaultTab() {
  const [isSealed, setIsSealed] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showDynamic, setShowDynamic] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [generatingDynamic, setGeneratingDynamic] = useState(false);
  
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

  // Vault KV Identity State (STATIC)
  const [photoPrismIdentity, setPhotoPrismIdentity] = useState({
    username: 'admin',
    password: '••••••••••••••••',
    lastRotated: new Date().toLocaleString()
  });

  // Dynamic Secrets State (EPHEMERAL)
  const [dynamicLease, setDynamicLease] = useState(null);

  // ENTERPRISE LEAST PRIVILEGE: Machine Identity / AppRole State
  const [machineIdentities, setMachineIdentities] = useState([
    {
      id: 'gitops-service',
      name: 'Global Orchestrator',
      icon: TerminalSquare,
      status: 'active',
      ttl: '58m 42s',
      policies: ['gitops-policy'],
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30'
    },
    {
      id: 'dashboard-api',
      name: 'Control Plane API',
      icon: Bot,
      status: 'active',
      ttl: '1h 45m',
      policies: ['dashboard-ui-policy'],
      color: 'text-sky-400',
      bg: 'bg-sky-500/20',
      border: 'border-sky-500/30'
    },
    {
      id: 'fleet-service',
      name: 'Tailscale Fleet Manager',
      icon: Network,
      status: 'idle',
      ttl: 'Expired',
      policies: ['fleet-policy'],
      color: 'text-slate-400',
      bg: 'bg-slate-800',
      border: 'border-white/10'
    }
  ]);

  // Simulate TTL countdown for Machine Identities
  useEffect(() => {
    if (isSealed) return;
    const interval = setInterval(() => {
      setMachineIdentities(prev => prev.map(machine => {
        if (machine.status === 'active' && machine.ttl !== 'Expired') {
          let timeParts = machine.ttl.split(' ');
          let mins = 0, secs = 0, hours = 0;
          
          if (timeParts.length === 2 && timeParts[0].includes('h')) {
             hours = parseInt(timeParts[0].replace('h', ''));
             mins = parseInt(timeParts[1].replace('m', ''));
             secs = 0; 
          } else {
             mins = parseInt(timeParts[0].replace('m', ''));
             secs = parseInt(timeParts[1].replace('s', ''));
          }

          if (secs === 0 && mins > 0) { mins -= 1; secs = 59; } 
          else if (secs > 0) { secs -= 1; }
          
          let newTtl = hours > 0 ? `${hours}h ${mins}m` : `${mins}m ${secs}s`;
          return { ...machine, ttl: (mins <= 0 && hours <= 0 && secs <= 0) ? 'Expired' : newTtl, status: (mins <= 0 && hours <= 0 && secs <= 0) ? 'idle' : 'active' };
        }
        return machine;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSealed]);

  const handleRotate = async () => {
    setRotating(true);
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
    
    if (!isLiveEnv) {
      setTimeout(() => {
        setPhotoPrismIdentity({ 
            username: 'admin', 
            password: `Sm0k3-And-Mirr0rs-${Math.floor(Math.random() * 1000)}!`, 
            lastRotated: new Date().toLocaleString() 
        });
        setRotating(false);
      }, 2000);
    } else {
      try {
        const res = await fetch('/api/action/update', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ intent: 'rotate_vault_secret', target: 'photoprism' }) 
        });
        
        // HTML-PROOF PARSING
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { throw new Error("Invalid Format"); }

        if (res.ok && data.status === 'success') {
           setPhotoPrismIdentity({ 
             username: data.identity.username, 
             password: data.identity.password, 
             lastRotated: data.identity.lastRotated || new Date().toLocaleString() 
           });
        }
      } catch (err) {}
      setRotating(false);
    }
  };

  const handleGenerateDynamic = async () => {
    setGeneratingDynamic(true);
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);

    if (!isLiveEnv) {
      setTimeout(() => {
        setDynamicLease({
          leaseId: `database/creds/mariadb-role/${Math.random().toString(36).substr(2, 9)}`,
          username: `v-root-db-${Math.random().toString(36).substr(2, 6)}`,
          password: `dyn-${Math.random().toString(36).substr(2, 12)}!`,
          issuedAt: new Date().toLocaleTimeString(),
          ttl: '1h 0m'
        });
        setGeneratingDynamic(false);
      }, 1500);
    } else {
      try {
        const res = await fetch('/api/action/update', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ intent: 'generate_dynamic_secret', target: 'mariadb' }) 
        });
        
        // HTML-PROOF PARSING
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { throw new Error("Invalid Format"); }

        if (res.ok && data.status === 'success') {
           setDynamicLease(data.lease);
        }
      } catch (err) {}
      setGeneratingDynamic(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 animate-in fade-in duration-700 space-y-6">
      
      {/* VAULT STATUS HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`col-span-2 p-8 rounded-[2.5rem] border flex items-center justify-between shadow-2xl relative overflow-hidden transition-colors duration-500 ${isSealed ? 'bg-red-950/20 border-red-500/30' : 'bg-emerald-950/20 border-emerald-500/30'}`}>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2">
               {!isLiveEnv ? <TestTube2 className="w-4 h-4 text-orange-400" /> : <ShieldCheck className={`w-4 h-4 ${isSealed ? 'text-red-400' : 'text-emerald-400'}`} />}
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">KMS Status</h3>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">Vault is {isSealed ? 'Sealed' : 'Active'}</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-md">The Identity engine is {isSealed ? 'locked. No applications can retrieve secrets.' : 'authenticated. HashiCorp Nomad can now natively inject secrets into edge workloads.'}</p>
          </div>
          
          <button onClick={() => setIsSealed(!isSealed)} className={`p-6 rounded-3xl border transition-all transform active:scale-95 z-10 ${isSealed ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-slate-800 border-white/10 text-emerald-400 hover:border-emerald-500/50'}`}>
            {isSealed ? <Lock className="w-10 h-10" /> : <Unlock className="w-10 h-10" />}
          </button>
        </div>

        <div className="bg-[#05080f] border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-xl">
           <Fingerprint className="w-12 h-12 text-blue-400 mb-4" />
           <h4 className="text-white font-bold">Zero Trust Auth</h4>
        </div>
      </div>

      {/* SECRET ENGINES SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ENGINE 1: KEY-VALUE STORE (STATIC) */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Application Identity Store</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Persistent KMS Vault</p>
              </div>
            </div>
            <button onClick={handleRotate} disabled={rotating || isSealed} className={`p-3 rounded-full transition-all duration-300 disabled:opacity-20 flex items-center shadow-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5`}>
              <RefreshCw className={`w-5 h-5 ${rotating ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <div className="bg-black/60 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Admin Username</label>
                <span className="text-white font-mono">{photoPrismIdentity.username}</span>
              </div>
              <Key className="w-4 h-4 text-slate-700" />
            </div>

            <div className="bg-black/60 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Static Password</label>
                <span className="text-white font-mono break-all pr-4">{isSealed ? '****************' : (showSecret ? photoPrismIdentity.password : '••••••••••••••••••••')}</span>
              </div>
              <button onClick={() => setShowSecret(!showSecret)} disabled={isSealed} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors disabled:opacity-20">
                {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className={`border rounded-2xl p-4 flex items-center justify-between transition-colors duration-500 ${isSealed ? 'bg-black/60 border-white/5 opacity-50' : 'bg-slate-800/50 border-white/10'}`}>
              <div className="flex items-center space-x-4">
                 <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><ShieldCheck className="w-5 h-5" /></div>
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Lease Status</label>
                    <span className="font-mono text-sm font-bold text-purple-300">Persistent (Manual)</span>
                 </div>
              </div>
              <div className="text-right">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 flex items-center justify-end"><Calendar className="w-3 h-3 mr-1" /> Last Rotated</label>
                 <span className="text-xs text-slate-400 font-mono">{photoPrismIdentity.lastRotated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ENGINE 2: DYNAMIC DATABASE CREDENTIALS (MARIADB) */}
        <div className="bg-[#05080f] border border-sky-500/20 rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(14,165,233,0.05)] relative flex flex-col overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none transform translate-x-4 -translate-y-4"><Zap className="w-48 h-48 text-sky-500" /></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-sky-500/20 rounded-2xl border border-sky-500/30"><Server className="w-6 h-6 text-sky-400" /></div>
              <div>
                <h3 className="text-xl font-black text-white">Database Access Broker</h3>
                <p className="text-sky-400 text-[10px] font-bold uppercase tracking-widest mt-1 drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]">JIT Ephemeral Identity Engine</p>
              </div>
            </div>
          </div>

          <div className="flex-1 relative z-10 flex flex-col justify-center">
            {dynamicLease ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="bg-sky-950/20 border border-sky-500/30 rounded-2xl p-4 mb-2 flex items-center justify-between">
                   <div>
                     <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest block mb-1">Active Lease ID</span>
                     <span className="text-white font-mono text-xs opacity-80">{dynamicLease.leaseId}</span>
                   </div>
                   <div className="bg-sky-500/20 px-2 py-1 rounded text-sky-300 font-black text-[9px] uppercase tracking-widest flex items-center"><Timer className="w-3 h-3 mr-1"/> {dynamicLease.ttl} TTL</div>
                </div>
                <div className="bg-black/60 border border-white/5 rounded-2xl p-4 flex flex-col">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Ephemeral Username</label>
                  <span className="text-sky-300 font-mono bg-sky-900/30 px-3 py-2 rounded-lg border border-sky-500/20">{isSealed ? '****************' : dynamicLease.username}</span>
                </div>
                <div className="bg-black/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Ephemeral Password</label>
                    <span className="text-white font-mono bg-white/5 px-3 py-2 rounded-lg border border-white/10 block mr-4 truncate">{isSealed ? '****************' : (showDynamic ? dynamicLease.password : '••••••••••••••••••••')}</span>
                  </div>
                  <button onClick={() => setShowDynamic(!showDynamic)} disabled={isSealed} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 mt-5 transition-colors disabled:opacity-20">
                    {showDynamic ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-60">
                 <ShieldAlert className="w-12 h-12 text-slate-600 mb-4" />
                 <p className="text-slate-400 text-sm text-center max-w-xs">No active lease requested. The database has zero valid user accounts currently.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
            <button onClick={handleGenerateDynamic} disabled={generatingDynamic || isSealed} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50">
              {generatingDynamic ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />} 
              {dynamicLease ? 'Generate Replacement Lease' : 'Request Ephemeral Lease'}
            </button>
          </div>
        </div>
      </div>

      {/* NEW: MACHINE IDENTITY MAP (APPROLES) */}
      <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <Bot className="w-6 h-6 text-indigo-400" />
          <h3 className="text-xl font-black text-white tracking-tight">Service Identity Map <span className="text-indigo-400/50 text-sm ml-2 font-normal"></span></h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {machineIdentities.map((machine) => (
            <div key={machine.id} className={`p-5 rounded-2xl border backdrop-blur-sm transition-all duration-500 ${isSealed ? 'opacity-50 grayscale border-white/5 bg-black/50' : `${machine.bg} ${machine.border}`}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl bg-black/30 border border-white/10`}>
                    <machine.icon className={`w-5 h-5 ${machine.color}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{machine.name}</h4>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{machine.id}</span>
                  </div>
                </div>
                {/* Active Pulse Indicator */}
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${machine.status === 'active' ? machine.color : 'text-slate-500'}`}>
                    {isSealed ? 'REVOKED' : (machine.status === 'active' ? machine.ttl : 'IDLE')}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${isSealed ? 'bg-red-500' : (machine.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600')}`}></div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center"><LockKeyhole className="w-3 h-3 mr-1" /> Granted Policies</p>
                <div className="flex flex-wrap gap-2">
                  {machine.policies.map(policy => (
                    <span key={policy} className="px-2 py-1 rounded bg-black/40 border border-white/5 text-slate-300 font-mono text-xs shadow-inner">
                      {policy}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GLOBAL KEY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: "Active Leases", val: dynamicLease ? "15" : "14", icon: Cpu },
           { label: "Transit Keys", val: "3", icon: Key },
           { label: "Auth Methods", val: "2", icon: ShieldCheck },
           { label: "Violations", val: "0", icon: ShieldAlert, color: 'text-emerald-400' }
         ].map((item, i) => (
           <div key={i} className="bg-[#05080f] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
              <item.icon className={`w-5 h-5 mb-3 ${item.color || 'text-indigo-400'}`} />
              <span className="text-3xl font-black text-white">{item.val}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{item.label}</span>
           </div>
         ))}
      </div>

    </div>
  );
}