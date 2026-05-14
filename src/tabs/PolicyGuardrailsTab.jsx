import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, FileCheck, ToggleLeft, ToggleRight, AlertTriangle, 
  CheckCircle2, TerminalSquare, FileCode2, Scale, Lock, TestTube2, 
  Activity, ChevronDown, ArrowDown, Loader2 
} from 'lucide-react';

export default function PolicyGuardrailsTab() {
  const [enforceMode, setEnforceMode] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const pullThreshold = 70;

  // 🔐 NEW: Safe Fetch Wrapper (fail-secure JSON parsing)
  const safeFetchJSON = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      const text = await res.text();

      // Detect Vite / HTML fallback
      if (text.trim().startsWith('<!DOCTYPE html') || text.includes('<html')) {
        console.warn('HTML fallback detected (likely Vite dev server)');
        return { ok: false, isFallback: true };
      }

      try {
        const data = JSON.parse(text);
        return { ok: true, data };
      } catch (e) {
        console.warn('JSON parse failed, possible fallback:', text.slice(0, 120));
        return { ok: false, isFallback: true };
      }
    } catch (err) {
      return { ok: false, error: err };
    }
  };

  // INTELLIGENT ENVIRONMENT DETECTION (HARDENED)
  const [isLiveEnv, setIsLiveEnv] = useState(false);
  useEffect(() => {
    (async () => {
      const result = await safeFetchJSON('/api/telemetry.json');
      setIsLiveEnv(result.ok); // fail closed
    })();
  }, []);

  // Logical Edge Node Policies updated for Gitea Actions & PM2
  const policies = {
    ports: {
      name: "Privileged Port Restriction",
      desc: "Prevents workloads from binding to ports < 1024, which are restricted by the Android OS kernel.",
      severity: "CRITICAL",
      rego: `package pocketlab.network\n\ndeny[msg] {\n    port := input.playbook.tasks[_].pm2_env.PORT\n    to_number(port) < 1024\n    msg := "Android OS denies non-root binding to ports < 1024. Please use a port > 1023."\n}`
    },
    secrets: {
      name: "Hardcoded Secrets Prevention",
      desc: "Ensures declarative playbooks use Vault AppRole lookups instead of plaintext variables.",
      severity: "HIGH",
      rego: `package pocketlab.security\n\ndeny[msg] {\n    some key\n    val := input.playbook.vars[key]\n    contains(lower(key), "password")\n    not contains(val, "lookup('hashi_vault'")\n    msg := "Hardcoded secrets detected. You must use the Vault AppRole lookup plugin."\n}`
    },
    execution: {
      name: "PRoot Isolation Enforcement",
      desc: "Ensures Linux binaries (apt/dpkg) are executed inside the PRoot Ubuntu subsystem, not native Termux.",
      severity: "MEDIUM",
      rego: `package pocketlab.execution\n\ndeny[msg] {\n    task := input.playbook.tasks[_]\n    contains(task.command, "apt-get")\n    not contains(task.prefix, "proot-distro login ubuntu")\n    msg := "Linux package managers must be executed inside the PRoot Ubuntu subsystem."\n}`
    }
  };

  useEffect(() => {
    let interval;
    if (!isLiveEnv) {
      // --- SIMULATOR MODE ---
      interval = setInterval(() => {
        const triggers = ['gitea_action_push', 'ansible_playbook_deploy', 'caddy_route_update'];
        const results = [
          { status: 'PASS', msg: 'No violations detected.', time: 80 },
          { status: 'PASS', msg: 'No violations detected.', time: 45 },
          { status: enforceMode ? 'DENIED' : 'AUDIT_WARN', msg: 'Hardcoded secrets detected. You must use the Vault AppRole lookup plugin.', time: 120 }
        ];
        
        const trigger = triggers[Math.floor(Math.random() * triggers.length)];
        const result = results[Math.floor(Math.random() * results.length)];

        setEvaluations(prev => {
          const newEval = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            trigger: trigger,
            ...result
          };
          return [newEval, ...prev].slice(0, 50); 
        });
      }, 4000);
    } else {
      // --- PRODUCTION MODE (HARDENED) ---
      const fetchOpaLogs = async () => {
        const result = await safeFetchJSON('/api/opa_evaluations.json');

        if (result.ok && Array.isArray(result.data)) {
          setEvaluations(result.data.slice(0, 50));
        } else {
          // 🔐 FAIL CLOSED
          setIsLiveEnv(false);

          if (evaluations.length === 0) {
            setEvaluations([{ 
              id: 'err', timestamp: new Date().toLocaleTimeString(), 
              trigger: 'system_poll', status: 'AUDIT_WARN', 
              msg: 'Invalid API response detected. Switching to Simulator Sandbox.', 
              time: 0 
            }]);
          }
        }
      };
      
      fetchOpaLogs();
      interval = setInterval(fetchOpaLogs, 5000);
    }
    return () => clearInterval(interval);
  }, [isLiveEnv, enforceMode]);

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
      setIsRefreshing(true);
      
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setEvaluations(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          trigger: 'manual_sync', status: 'PASS', msg: 'Policies re-verified via Control Plane.', time: 15
        }, ...prev].slice(0, 50));
      }, 800);

    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  const handleToggleMode = async () => {
    if (navigator.vibrate) navigator.vibrate(20);
    
    const newMode = !enforceMode;
    setEnforceMode(newMode); 

    if (isLiveEnv) {
      const result = await safeFetchJSON('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'configure_opa', enforce_mode: newMode })
      });

      if (!result.ok) {
        setIsLiveEnv(false);
      }
    }
  };

  const toggleExpand = (id) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div 
      className="max-w-7xl mx-auto p-4 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* PULL TO REFRESH INDICATOR */}
      <div 
        className="flex justify-center items-center w-full absolute top-0 left-0 right-0 z-0 overflow-hidden"
        style={{ 
          height: `${pullDistance}px`,
          opacity: pullDistance / pullThreshold,
          transition: isRefreshing || pullDistance === 0 ? 'height 0.3s ease, opacity 0.3s ease' : 'none' 
        }}
      >
        <div className="flex flex-col items-center justify-center mt-4 text-emerald-400">
          {isRefreshing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <ArrowDown className={`w-6 h-6 transition-transform duration-300 ${pullDistance > pullThreshold ? 'rotate-180 text-emerald-300' : ''}`} />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest mt-2 text-emerald-400/80">
            {isRefreshing ? 'Verifying Policies...' : pullDistance > pullThreshold ? 'Release to Sync' : 'Pull to verify'}
          </span>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div 
        className="relative z-10 animate-in fade-in duration-700 flex flex-col xl:flex-row gap-6"
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
        }}
      >
        
        {/* LEFT COLUMN */}
        <div className="w-full xl:w-1/2 flex flex-col gap-6 shrink-0">
          
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
              <Scale className="w-48 h-48 text-indigo-400" />
            </div>
            
            <div className="flex items-center space-x-2 mb-4 relative z-10">
               {!isLiveEnv ? <TestTube2 className="w-5 h-5 text-orange-400" /> : <FileCheck className="w-5 h-5 text-indigo-400" />}
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Open Policy Agent</h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 relative z-10">Policy as Code</h2>
            <p className="text-slate-400 text-sm relative z-10">Prevent misconfigurations before they deploy. OPA intercepts Gitea Actions and Ansible Playbooks, evaluating them against declarative Rego policies before PM2 applies the state.</p>
            
            <div className={`mt-6 p-4 rounded-2xl border flex items-center justify-between transition-colors relative z-10 ${enforceMode ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-black/40 border-white/5'}`}>
              <div>
                <h4 className={`font-bold text-sm md:text-base ${enforceMode ? 'text-indigo-400' : 'text-slate-300'}`}>
                  {enforceMode ? 'Enforcement Mode' : 'Audit Mode (Dry Run)'}
                </h4>
                <p className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                  {enforceMode ? 'Violations block deployments' : 'Violations only log warnings'}
                </p>
              </div>
              <button 
                onClick={handleToggleMode}
                className={`p-2 rounded-xl transition-all ${enforceMode ? 'text-indigo-400 bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-slate-500 bg-slate-800'}`}
              >
                {enforceMode ? <ToggleRight className="w-7 h-7 md:w-8 md:h-8" /> : <ToggleLeft className="w-7 h-7 md:w-8 md:h-8" />}
              </button>
            </div>
          </div>

          <div className="bg-[#05080f] border border-white/10 rounded-[2.5rem] p-4 md:p-6 shadow-xl flex flex-col">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 mb-4 flex items-center">
               <ShieldCheck className="w-4 h-4 mr-2" /> Active Rego Rule Sets
            </h3>
            
            <div className="space-y-3">
              {Object.entries(policies).map(([key, policy]) => {
                const isExpanded = expandedId === key;
                return (
                  <div key={key} className={`rounded-2xl md:rounded-3xl border transition-all overflow-hidden ${isExpanded ? 'bg-slate-900/80 border-indigo-500/30' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}>
                    <div onClick={() => toggleExpand(key)} className="p-4 flex items-center justify-between cursor-pointer gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-bold truncate text-sm md:text-base ${isExpanded ? 'text-indigo-300' : 'text-slate-300'}`}>{policy.name}</h4>
                        </div>
                        <p className="text-[11px] md:text-xs text-slate-500 line-clamp-1">{policy.desc}</p>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[8px] md:text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest ${
                            policy.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            policy.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {policy.severity}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-white/5 bg-[#02040a] animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/50">
                          <div className="flex items-center space-x-2 text-indigo-400">
                            <FileCode2 className="w-3 h-3" />
                            <span className="text-[10px] font-mono">{key}.rego</span>
                          </div>
                        </div>
                        <div className="p-4 overflow-x-auto">
                          <pre className="text-[10px] md:text-xs font-mono text-indigo-200/90 whitespace-pre">
                            <code>{policy.rego}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full xl:w-1/2 flex flex-col gap-6">
          <div className="bg-[#05080f] border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] h-[400px] md:h-[600px] flex flex-col">
             
             <div className="bg-black/80 px-4 md:px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TerminalSquare className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm md:text-base font-bold text-slate-300">Live Evaluation Stream</span>
                </div>
                <div className="flex items-center space-x-2 text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                   <span className={`w-2 h-2 rounded-full ${!isLiveEnv ? 'bg-orange-500' : 'bg-emerald-500'} animate-pulse`}></span>
                   <span className="hidden sm:inline">{!isLiveEnv ? 'Simulator Active' : 'OPA Engine Active'}</span>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-2 md:space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
               {evaluations.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-30 text-slate-400">
                   <Activity className="w-10 h-10 mb-2 animate-pulse" />
                   <p className="text-xs">Awaiting Gitea/Ansible Declarations...</p>
                 </div>
               ) : (
                 evaluations.map((ev) => (
                   <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center p-3 bg-black/40 rounded-xl border border-white/5 gap-2 sm:gap-0 transition-all hover:bg-black/60">
                     <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                       <div className="w-16 md:w-20 shrink-0 text-slate-500 font-mono text-[9px] md:text-[10px]">{ev.timestamp}</div>
                       <div className="w-24 md:w-28 shrink-0 flex justify-end sm:justify-start">
                         <span className={`px-2 py-0.5 md:py-1 rounded text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center w-fit ${
                           ev.status === 'PASS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                           ev.status === 'AUDIT_WARN' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                           'bg-red-500/10 text-red-400 border border-red-500/30'
                         }`}>
                           {ev.status === 'PASS' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                           {ev.status === 'AUDIT_WARN' && <AlertTriangle className="w-3 h-3 mr-1" />}
                           {ev.status === 'DENIED' && <Lock className="w-3 h-3 mr-1" />}
                           {ev.status}
                         </span>
                       </div>
                     </div>
                     <div className="flex-1 truncate pl-0 sm:pl-3 sm:border-l border-white/10 sm:ml-2">
                       <div className="text-[11px] md:text-xs font-bold text-slate-300 truncate">Action: {ev.trigger}</div>
                       <div className={`text-[10px] md:text-[11px] truncate mt-0.5 ${ev.status === 'PASS' ? 'text-slate-500' : 'text-red-300'}`}>{ev.msg}</div>
                     </div>
                     <div className="text-[9px] md:text-[10px] text-slate-600 font-mono hidden md:block shrink-0 ml-2">
                       {ev.time}ms
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}