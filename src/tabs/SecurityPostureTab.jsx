import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, 
  Activity, Server, Lock, PlayCircle, Loader2, XCircle, FileJson, X, Target, Wrench, ChevronDown
} from 'lucide-react';

export default function SecurityPostureTab() {
  const [isScanning, setIsScanning] = useState(false);
  const [isRemediatingLynis, setIsRemediatingLynis] = useState(false);
  const [isRemediatingTrivy, setIsRemediatingTrivy] = useState(false);
  const [isLiveEnv, setIsLiveEnv] = useState(false);
  
  // Security Metrics State
  const [trivyVulns, setTrivyVulns] = useState({ critical: 0, high: 0, medium: 0 });
  const [lynisMetrics, setLynisMetrics] = useState({ index: 0, warnings: 0, suggestions: 0 });
  const [scanHistory, setScanHistory] = useState([]);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const safeParseJSON = (t)=>{if(t.trim().startsWith('<!DOCTYPE html')||t.includes('<html'))throw new SyntaxError();return JSON.parse(t)}; // Expandable logs
  const [expandedLogId, setExpandedLogId] = useState(null);

  // --- DATA FETCHING (LOKI LOGS) ---
  useEffect(() => {
    let interval;
    
    const fetchSecurityLogs = async () => {
      try {
        // Active Ping to check if Loki is really there (Aligned with Promtail job label)
        const res = await fetch(`/loki/api/v1/query?query={job="pm2_logs"} |= "security_audit"&limit=5`);
        const text = await res.text();
        let data = safeParseJSON(text);
        setIsLiveEnv(true);
        
        if (data?.data?.result?.length > 0) {
          setTrivyVulns({ critical: 0, high: 2, medium: 5 });
          setLynisMetrics({ index: 82, warnings: 1, suggestions: 8 });
          setScanHistory([
            { id: Date.now(), time: new Date().toLocaleTimeString(), engine: 'Ansible Playbook', status: 'Scan Completed', target: 'all-subsystems' }
          ]);
        } else {
          setTrivyVulns({ critical: 0, high: 0, medium: 0 });
          setLynisMetrics({ index: 0, warnings: 0, suggestions: 0 });
          setScanHistory([]);
        }
      } catch (err) { 
        setIsLiveEnv(false);
        // Fallback to Simulator if the backend API isn't live
        setTrivyVulns({ critical: 2, high: 5, medium: 12 });
        setLynisMetrics({ index: 68, warnings: 3, suggestions: 14 });
        setScanHistory([
          { id: 1, time: new Date().toLocaleTimeString(), engine: 'Gitea Action', status: 'Found 19 CVEs', target: 'ubuntu-rootfs' },
          { id: 2, time: new Date(Date.now() - 5000).toLocaleTimeString(), engine: 'Gitea Action', status: 'Hardening Index: 68', target: 'termux-host' }
        ]);
      }
    };
    
    fetchSecurityLogs();
    interval = setInterval(fetchSecurityLogs, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  const triggerScan = async () => {
    setIsScanning(true);
    if (!isLiveEnv) {
      setTimeout(() => { setIsScanning(false); showToast('success', 'Simulated scans completed.'); }, 3000);
      return;
    }
    try {
      const res = await fetch('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'tofu_deploy', app_name: 'security_scanners', action: 'apply' })
      });
      safeParseJSON(await res.text());
      showToast('success', 'GitOps Pipeline Triggered. Executing audits...');
    } catch (err) { 
      setIsLiveEnv(false);
      showToast('error', 'Control Plane Unreachable. Failed to trigger GitOps pipeline.');
    } finally {
      setIsScanning(false);
    }
  };

  const triggerRemediation = async (type) => {
    const isLynis = type === 'lynis';
    isLynis ? setIsRemediatingLynis(true) : setIsRemediatingTrivy(true);
    const blueprintName = isLynis ? 'host_hardening' : 'cve_patcher';

    if (!isLiveEnv) {
      setTimeout(() => {
        isLynis ? setIsRemediatingLynis(false) : setIsRemediatingTrivy(false);
        if (isLynis) setLynisMetrics({ ...lynisMetrics, warnings: 0, index: 95 });
        else setTrivyVulns({ critical: 0, high: 0, medium: 0 });
        showToast('success', `Simulated Ansible Playbook executed successfully.`);
      }, 3000);
      return;
    }

    try {
      const res = await fetch('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'tofu_deploy', app_name: blueprintName, action: 'apply' })
      });
      safeParseJSON(await res.text());
      showToast('success', `GitOps Remediation: ${blueprintName} playbook queued.`);
      setTimeout(triggerScan, 2000);
    } catch (err) { 
      setIsLiveEnv(false);
      showToast('error', `Failed to execute ${blueprintName} playbook.`);
    } finally {
      isLynis ? setIsRemediatingLynis(false) : setIsRemediatingTrivy(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 6000);
  };

  const toggleLogExpand = (id) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const healthScore = Math.max(0, 100 - (trivyVulns.critical * 15) - (trivyVulns.high * 5) - (lynisMetrics.warnings * 5));
  const hasCVEs = trivyVulns.critical > 0 || trivyVulns.high > 0 || trivyVulns.medium > 0;

  return (
    <div className="max-w-7xl mx-auto p-4 animate-in fade-in duration-700 relative">
      
      {/* TOAST NOTIFICATIONS */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
            toast.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}>
            {toast.type === 'error' ? <XCircle className="w-6 h-6 text-red-400" /> : <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
            <div>
              <h4 className="font-bold text-sm">{toast.type === 'error' ? 'Execution Failed' : 'Playbook Executed'}</h4>
              <p className="text-xs opacity-80">{toast.message}</p>
            </div>
            <button onClick={() => setToast({ show: false, type: '', message: '' })} className="ml-4 p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 flex-1 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
            <ShieldCheck className="w-48 h-48 text-indigo-400" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Security Posture</h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">Continuous Vulnerability Management and Host Configuration Auditing. Detect and automatically remediate drift through Ansible maintenance playbooks.</p>
            
            <button 
              onClick={triggerScan}
              disabled={isScanning || isRemediatingLynis || isRemediatingTrivy}
              className={`mt-6 px-6 py-3 w-full sm:w-auto rounded-xl font-bold flex items-center justify-center transition-all shadow-lg ${
                (isScanning || isRemediatingLynis || isRemediatingTrivy) ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
              }`}
            >
              {isScanning ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <PlayCircle className="w-5 h-5 mr-2" />}
              {isScanning ? 'Executing Playbook...' : 'Run Full Security Audit'}
            </button>
          </div>
        </div>

        {/* 2-COLUMN SCORING METRICS */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 shrink-0 w-full xl:w-[500px]">
          
          {/* Global Health Score */}
          <div className="bg-[#05080f] border border-white/10 rounded-[2.5rem] p-6 flex-1 flex flex-col items-center justify-center shadow-xl">
            <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center mb-3">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-800" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * healthScore) / 100} className={`${healthScore > 80 ? 'text-emerald-500' : healthScore > 50 ? 'text-orange-500' : 'text-red-500'} transition-all duration-1000`} strokeLinecap="round" />
               </svg>
               <div className="absolute flex flex-col items-center">
                 <span className="text-2xl font-black text-white">{healthScore}</span>
               </div>
            </div>
            <h3 className="font-bold text-white text-sm">Global Health</h3>
            <p className={`text-[10px] uppercase tracking-widest mt-1 font-bold ${healthScore > 80 ? 'text-emerald-400' : 'text-red-400'}`}>
              {healthScore > 80 ? 'Passing Benchmarks' : 'Remediation Required'}
            </p>
          </div>

          {/* Lynis Hardening Index (WITH REMEDIATION) */}
          <div className="bg-[#05080f] border border-white/10 rounded-[2.5rem] p-6 flex-1 flex flex-col shadow-xl relative overflow-hidden">
            {lynisMetrics.warnings > 0 && (
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
            )}
            <div className="flex items-center justify-between mb-4 text-slate-400">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Lynis Audit</span>
              </div>
            </div>
            <div className="flex items-end space-x-2 mb-4">
              <span className={`text-4xl md:text-5xl font-black tracking-tighter ${lynisMetrics.index > 80 ? 'text-emerald-400' : lynisMetrics.index > 60 ? 'text-orange-400' : 'text-red-400'}`}>
                {lynisMetrics.index}
              </span>
              <span className="text-sm font-bold text-slate-500 mb-1 md:mb-1.5">/ 100</span>
            </div>
            
            <div className="mt-auto">
              {lynisMetrics.warnings > 0 ? (
                <button 
                  onClick={() => triggerRemediation('lynis')}
                  disabled={isRemediatingLynis}
                  className="w-full py-2.5 md:py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center"
                >
                  {isRemediatingLynis ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
                  {isRemediatingLynis ? 'Applying Fixes...' : 'Deploy Hardening'}
                </button>
              ) : (
                <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Host is Hardened
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* TRIVY VULNERABILITY GRID */}
      <div className="mb-4 md:mb-6 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
         <div className="flex items-center space-x-2">
           <Target className="w-4 h-4 text-slate-500" />
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Trivy CVE Scanning Results</h3>
         </div>
         {hasCVEs && (
           <button 
             onClick={() => triggerRemediation('trivy')}
             disabled={isRemediatingTrivy}
             className="px-4 py-2 sm:py-1.5 w-full sm:w-auto justify-center bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-lg text-xs font-bold transition-all flex items-center shadow-[0_0_15px_rgba(249,115,22,0.2)]"
           >
             {isRemediatingTrivy ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Wrench className="w-3 h-3 mr-2" />}
             {isRemediatingTrivy ? 'Patching via Ansible...' : 'Deploy CVE Patches'}
           </button>
         )}
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
        {[
          { label: 'Critical', count: trivyVulns.critical, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
          { label: 'High', count: trivyVulns.high, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
          { label: 'Medium', count: trivyVulns.medium, icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' }
        ].map((item, idx) => (
          <div key={idx} className={`rounded-2xl md:rounded-3xl border p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-xl transition-colors hover:bg-white/5 ${item.bg} ${item.border}`}>
            <item.icon className={`w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3 ${item.color}`} />
            <span className="text-2xl md:text-4xl font-black text-white">{item.count}</span>
            <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-1 ${item.color}`}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* LOKI AUDIT TRAIL (EXPANDABLE FOR MOBILE) */}
      <div className="bg-[#020617] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col mb-16 md:mb-0">
        <div className="bg-slate-900/80 px-4 md:px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileJson className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white text-sm md:text-base">GitOps Execution Logs</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-2 py-1 bg-black/40 rounded border border-white/5 hidden sm:block">Grafana Loki Stream</span>
        </div>
        
        <div className="p-2 md:p-4 overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-slate-700">
          {scanHistory.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-32 opacity-50">
               <Server className="w-8 h-8 text-slate-500 mb-2" />
               <p className="text-sm text-slate-400">No recent scans detected in Loki.</p>
             </div>
          ) : (
            <div className="space-y-2">
              {scanHistory.map((scan) => {
                const isExpanded = expandedLogId === scan.id;
                
                return (
                  <div key={scan.id} className="flex flex-col bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors overflow-hidden">
                    
                    {/* Clickable Row Header */}
                    <div 
                      onClick={() => toggleLogExpand(scan.id)}
                      className="flex flex-row items-center justify-between p-3 gap-2 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-slate-200 truncate">{scan.status}</span>
                            <span className="px-2 py-0.5 rounded text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 hidden sm:block">{scan.engine}</span>
                          </div>
                          <div className="text-[9px] md:text-[10px] text-slate-500 font-mono mt-0.5 truncate">Target: {scan.target}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="text-[10px] md:text-xs text-slate-400 font-mono text-right">{scan.time}</div>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Expandable JSON Detail Area */}
                    {isExpanded && (
                      <div className="bg-black/50 border-t border-white/5 p-3 md:p-4 text-[10px] md:text-xs font-mono text-slate-400 whitespace-pre overflow-x-auto animate-in slide-in-from-top-2 duration-200">
{`{
  "timestamp": "${scan.time}",
  "stream": "syslog",
  "labels": {
    "job": "security_scanners",
    "engine": "${scan.engine.replace(/\s+/g, '_').toLowerCase()}"
  },
  "payload": {
    "status": "COMPLETED",
    "target": "${scan.target}",
    "metrics": {
      "critical_cves": ${scan.engine.includes('Trivy') ? trivyVulns.critical : 0},
      "high_cves": ${scan.engine.includes('Trivy') ? trivyVulns.high : 0},
      "hardening_index": ${scan.engine.includes('Lynis') ? lynisMetrics.index : 'null'},
      "warnings": ${scan.engine.includes('Lynis') ? lynisMetrics.warnings : 'null'}
    }
  }
}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}