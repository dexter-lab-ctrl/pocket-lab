import React, { useState, useEffect, useRef } from 'react';
import { Database, HardDrive, Clock, TerminalSquare, ShieldAlert, PlayCircle, RefreshCw, CheckCircle2, History, UploadCloud, DownloadCloud, AlertTriangle } from 'lucide-react';

export default function DisasterRecoveryTab() {
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [deployingEngine, setDeployingEngine] = useState(null); 
  const [deploymentLogs, setDeploymentLogs] = useState('');
  const [restoreFile, setRestoreFile] = useState('');
  const logsEndRef = useRef(null);

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

  // Auto-scroll terminal
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [deploymentLogs]);

  const handleOrchestration = async (blueprintId, action, engineType) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) window.navigator.vibrate(20);
    setDeployingEngine(engineType);
    
    if (!isLiveEnv) {
      // SIMULATOR MODE
      setDeploymentLogs(`[*] SIMULATOR: Initializing Ansible Semaphore Automator for '${blueprintId}'...\n`);
      setTimeout(() => setDeploymentLogs(prev => prev + `[semaphore] Compiling maintenance playbook...\n`), 800);
      setTimeout(() => setDeploymentLogs(prev => prev + `[semaphore] Executing playbook tasks (${action})...\n`), 1800);
      setTimeout(() => {
        setDeploymentLogs(prev => prev + `\n[SUCCESS] Execution complete! Disaster Recovery state synchronized.`);
        setDeployingEngine(null);
        if (blueprintId === 'dr_automate_backup') {
            setAutoBackupEnabled(action === 'apply');
        }
      }, 3500);

    } else {
      // PRODUCTION MODE
      setDeploymentLogs(`[*] EDGE NODE: Transmitting Task intent to Control Plane...\n`);
      try {
        const payload = blueprintId === 'dr_restore' 
          ? { intent: 'sync_bash', command: `proot-distro restore ~/pocket_lab_backups/${restoreFile}` }
          : { intent: 'tofu_deploy', app_name: blueprintId, action: action }; // Handled safely by API Proxy

        const res = await fetch('/api/action/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const text = await res.text();
        const data = JSON.parse(text);
        
        setDeploymentLogs(prev => prev + `\n--- EXECUTION STDOUT ---\n` + (data.output || data.message || "Executed") + `\n-----------------------\n[SUCCESS] Target state reached.`);
        
        if (blueprintId === 'dr_automate_backup') {
            setAutoBackupEnabled(action === 'apply');
        }
      } catch (err) {
        setDeploymentLogs(prev => prev + `\n[CRITICAL ERROR] Failed to reach API Bridge.`);
      }
      setDeployingEngine(null);
    }
  };

  const toggleAutoBackup = () => {
    if (autoBackupEnabled) {
        handleOrchestration('dr_automate_backup', 'destroy', 'auto');
    } else {
        handleOrchestration('dr_automate_backup', 'apply', 'auto');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 animate-in fade-in duration-700 space-y-6 flex flex-col xl:flex-row gap-6">
      
      {/* LEFT COLUMN: Controls */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
             <Database className="w-48 h-48 text-emerald-400" />
          </div>
          <div className="flex items-center space-x-2 mb-4 relative z-10">
             <ShieldAlert className="w-5 h-5 text-emerald-400" />
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Business Continuity</h3>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 relative z-10">Stateful Recovery</h2>
          <p className="text-slate-400 text-sm max-w-lg relative z-10">Manage immutable snapshots of your entire container ecosystem. All automated schedules are strictly enforced via Ansible Semaphore playbooks, ensuring auditable operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
          {/* Card 1: Automated Backups */}
          <div className="bg-[#05080f] border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden shadow-xl group hover:border-emerald-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
                <Clock className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-black text-white mb-2">Immutable Cron</h3>
            <p className="text-slate-400 text-sm mb-6 flex-1">Declaratively enforce a daily snapshot schedule (03:00 AM local). Ansible Semaphore manages the execution reliably.</p>
            
            {/* iOS Style Toggle */}
            <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                <span className="text-sm font-bold text-white flex items-center">
                    {autoBackupEnabled ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> : <Clock className="w-4 h-4 mr-2 text-slate-500" />}
                    {autoBackupEnabled ? 'Enforced' : 'Disabled'}
                </span>
                <button 
                    onClick={toggleAutoBackup}
                    disabled={deployingEngine !== null}
                    className={`w-14 h-8 rounded-full transition-colors relative flex items-center ${autoBackupEnabled ? 'bg-emerald-500' : 'bg-slate-700'} ${deployingEngine === 'auto' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${autoBackupEnabled ? 'translate-x-7' : 'translate-x-1'}`}>
                        {deployingEngine === 'auto' && <RefreshCw className="w-4 h-4 m-1 text-slate-400 animate-spin" />}
                    </div>
                </button>
            </div>
          </div>

          {/* Card 2: Manual Snapshot */}
          <div className="bg-[#05080f] border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden shadow-xl group hover:border-blue-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
                <DownloadCloud className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-black text-white mb-2">Point-in-Time Snapshot</h3>
            <p className="text-slate-400 text-sm mb-6 flex-1">Force an immediate, timestamped state capture of the entire Ubuntu PRoot subsystem.</p>
            
            <button 
                onClick={() => handleOrchestration('dr_manual_snapshot', 'apply', 'manual')}
                disabled={deployingEngine !== null}
                className={`w-full py-4 px-4 rounded-2xl font-bold flex items-center justify-center transition-all ${
                deployingEngine !== null
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                }`}
            >
                {deployingEngine === 'manual' ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <HardDrive className="w-5 h-5 mr-2" />} 
                {deployingEngine === 'manual' ? 'Capturing State...' : 'Trigger Manual Snapshot'}
            </button>
          </div>
        </div>

        {/* Restore Environment Box */}
        <div className="bg-gradient-to-br from-red-900/20 to-[#05080f] border border-red-500/30 rounded-3xl p-8 relative overflow-hidden shadow-xl mt-2">
            <div className="flex items-center space-x-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-2xl font-black text-white">System Restoration</h3>
            </div>
            <p className="text-red-200/70 text-sm mb-6 max-w-2xl">Warning: Restoring from a snapshot is a destructive action. The current live container environment will be wiped and replaced with the selected archive.</p>
            
            <div className="flex flex-col md:flex-row gap-4">
                <input 
                    type="text" 
                    value={restoreFile}
                    onChange={(e) => setRestoreFile(e.target.value)}
                    placeholder="e.g. manual_snapshot_2026.tar.gz" 
                    className="flex-1 bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-sm focus:outline-none focus:border-red-500 transition-colors shadow-inner" 
                />
                <button 
                    onClick={() => handleOrchestration('dr_restore', 'apply', 'restore')}
                    disabled={deployingEngine !== null || !restoreFile}
                    className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {deployingEngine === 'restore' ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <UploadCloud className="w-5 h-5 mr-2" />} 
                    Overwrite System
                </button>
            </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Execution Stream */}
      <div className={`w-full xl:w-[400px] flex flex-col shrink-0 h-[600px] xl:h-auto`}>
         <div className="bg-[#020617] border border-slate-700 rounded-3xl overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] flex flex-col h-full">
             <div className="bg-black/80 px-4 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TerminalSquare className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-slate-300">Execution Stream</span>
                </div>
                <div className="flex space-x-1.5"><div className="w-2 h-2 rounded-full bg-slate-600"></div><div className="w-2 h-2 rounded-full bg-slate-600"></div><div className="w-2 h-2 rounded-full bg-slate-600"></div></div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-5 font-mono text-xs whitespace-pre-wrap leading-relaxed text-emerald-100/90 scrollbar-thin scrollbar-thumb-slate-700">
               {deploymentLogs ? (
                 <div className="animate-in fade-in">
                   <div className="text-slate-500 mb-2 border-b border-slate-800 pb-2">Pocket Lab Semaphore Engine v2.17<br/>Module: Disaster Recovery</div>
                   {deploymentLogs}
                   <div ref={logsEndRef} />
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <History className="w-12 h-12 mb-3" />
                    <p>Awaiting declarative<br/>playbook execution...</p>
                 </div>
               )}
             </div>
             
             {/* Status Footer */}
             <div className="bg-black/80 px-4 py-2 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${deployingEngine ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                  <span>{deployingEngine ? 'Task Running' : 'Engine Idle'}</span>
                </div>
                <span>SEMAPHORE_TASK_LOCK=ON</span>
             </div>
          </div>
      </div>

    </div>
  );
}