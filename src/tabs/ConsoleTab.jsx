import React, { useState } from 'react';
import { Terminal, Plus, X, TerminalSquare, ShieldAlert, Database, Network, PlayCircle, Loader2, CheckCircle2, History, AlertCircle } from 'lucide-react';

// Enterprise Runbooks (Standard Operating Procedures)
const NOC_RUNBOOKS = [
  { 
    id: 'rb1', category: 'Security', icon: ShieldAlert, name: 'Audit Active Sockets', 
    desc: 'Scans subsystem for unauthorized listening ports and anomalous bindings.', 
    cmd: 'netstat -tulnp | grep LISTEN || echo "No active listeners found."' 
  },
  { 
    id: 'rb2', category: 'Storage', icon: Database, name: 'Purge Zombie Artifacts', 
    desc: 'Safely clears package cache, apt lists, and orphaned /tmp artifacts to free space.', 
    cmd: 'apt-get clean && rm -rf /tmp/* && echo "✅ Artifacts Purged Successfully."' 
  },
  { 
    id: 'rb3', category: 'Network', icon: Network, name: 'Mesh Peer Trace', 
    desc: 'Verifies Tailscale routing integrity and latency to the central coordination server.', 
    cmd: 'tailscale status --peers=false && echo "\nRouting Integrity Verified."' 
  },
];

export default function ConsoleTab() {
  // Multi-Session Terminal State
  const [sessions, setSessions] = useState([{ id: 1, name: 'Terminal 1' }]);
  const [activeSessionId, setActiveSessionId] = useState(1);
  const [nextSessionId, setNextSessionId] = useState(2);

  // Runbook & Audit State
  const [activeRunbook, setActiveRunbook] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, title: '', output: '' });

  // TTYD URL
  const terminalUrl = `${window.location.protocol}//${window.location.hostname}:7681`;

  // --- TAB HANDLERS ---
  const addSession = () => {
    if (sessions.length >= 4) return alert("Maximum of 4 terminal sessions allowed.");
    const newSession = { id: nextSessionId, name: `Terminal ${nextSessionId}` };
    setSessions([...sessions, newSession]);
    setActiveSessionId(nextSessionId);
    setNextSessionId(nextSessionId + 1);
  };

  const closeSession = (e, idToClose) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    const filtered = sessions.filter(s => s.id !== idToClose);
    setSessions(filtered);
    if (activeSessionId === idToClose) setActiveSessionId(filtered[0].id);
  };

  // --- RUNBOOK EXECUTION ---
  const executeRunbook = async (runbook) => {
    setActiveRunbook(runbook.id);
    const startTime = new Date();
    
    try {
      const res = await fetch('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'sync_bash', command: runbook.cmd })
      });
      const data = await res.json();
      
      // Add to compliance audit log
      setAuditLog(prev => [{
        id: Date.now(),
        name: runbook.name,
        time: startTime.toLocaleTimeString(),
        status: 'success',
        output: data.output
      }, ...prev]);

      setActiveRunbook(null);
    } catch (err) {
      setAuditLog(prev => [{
        id: Date.now(),
        name: runbook.name,
        time: startTime.toLocaleTimeString(),
        status: 'failed',
        output: "CRITICAL: API Unreachable. Network timeout."
      }, ...prev]);
      setActiveRunbook(null);
    }
  };

  const openAuditDetails = (log) => {
    setModal({ isOpen: true, title: `Audit: ${log.name} (${log.time})`, output: log.output });
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700 p-2 md:p-4 h-[85vh] flex flex-col relative z-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <TerminalSquare className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Live Workspace</h2>
            <p className="text-slate-400 text-xs">Direct TTY connection & Automated NOC Runbooks.</p>
          </div>
        </div>

        {/* Multi-Session Tab Bar */}
        <div className="flex items-center space-x-2 bg-black/40 p-1.5 rounded-xl border border-white/5 overflow-x-auto max-w-full">
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all whitespace-nowrap ${
                activeSessionId === session.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Terminal className={`w-4 h-4 mr-2 ${activeSessionId === session.id ? 'text-blue-200' : 'text-slate-500'}`} />
              {session.name}
              {sessions.length > 1 && (
                <button onClick={(e) => closeSession(e, session.id)} className="ml-3 hover:bg-red-500/20 rounded-full p-0.5 transition-colors">
                  <X className="w-3 h-3 hover:text-red-400" />
                </button>
              )}
            </div>
          ))}
          <button onClick={addSession} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="New Terminal Tab">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 overflow-hidden">
        
        {/* LEFT PANEL: NOC Operations & Audit Trail */}
        <div className="w-full lg:w-80 flex flex-col bg-[#05080f]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden shrink-0">
          
          {/* Environment Context */}
          <div className="p-4 bg-slate-900/60 border-b border-white/5">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Context</div>
            <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-white/5">
              <span className="text-xs text-slate-400 font-mono">user</span>
              <span className="text-xs text-green-400 font-mono font-bold">root@pocket-lab</span>
            </div>
            <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-white/5 mt-2">
              <span className="text-xs text-slate-400 font-mono">env</span>
              <span className="text-xs text-blue-400 font-mono font-bold">PRoot / Ubuntu OS</span>
            </div>
          </div>

          {/* Standard Operating Procedures (Runbooks) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
            <h3 className="font-bold text-white flex items-center text-xs uppercase tracking-widest mb-1">
              <Database className="w-3 h-3 mr-2 text-blue-400" /> Automated Runbooks
            </h3>
            
            {NOC_RUNBOOKS.map(runbook => {
              const isRunning = activeRunbook === runbook.id;
              return (
                <div key={runbook.id} className="bg-slate-900/50 border border-white/5 rounded-xl p-4 group relative hover:border-blue-500/30 transition-colors">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="p-2 bg-black/40 rounded-lg border border-white/5"><runbook.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" /></div>
                    <div>
                      <span className="text-white font-bold text-sm block">{runbook.name}</span>
                      <span className="text-slate-500 text-[10px] uppercase tracking-wider">{runbook.category} SOP</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs mb-4 leading-relaxed">{runbook.desc}</p>
                  
                  <button 
                    onClick={() => executeRunbook(runbook)}
                    disabled={activeRunbook !== null}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      isRunning ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white border border-slate-700 hover:border-blue-500'
                    } ${activeRunbook !== null && !isRunning && 'opacity-50 cursor-not-allowed'}`}
                  >
                    {isRunning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Executing via API...</> : <><PlayCircle className="w-4 h-4 mr-2" /> Execute Runbook</>}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Execution Audit Log */}
          <div className="h-48 bg-slate-900/80 border-t border-white/5 flex flex-col">
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center"><History className="w-3 h-3 mr-1.5" /> Audit Trail</h4>
              <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{auditLog.length} Records</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-700">
              {auditLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                  <span className="text-xs">No runbooks executed yet.</span>
                </div>
              ) : (
                auditLog.map(log => (
                  <div key={log.id} onClick={() => openAuditDetails(log)} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
                    <div className="flex items-center space-x-2 truncate pr-2">
                      {log.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                      <span className="text-xs text-slate-300 truncate group-hover:text-white transition-colors">{log.name}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0">{log.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Terminal Iframes */}
        <div className="flex-1 bg-black rounded-[2rem] border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
          {sessions.map(session => (
            <iframe
              key={session.id}
              src={terminalUrl}
              title={`Terminal Session ${session.id}`}
              className={`w-full h-full border-0 ${activeSessionId === session.id ? 'block' : 'hidden'}`}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          ))}
        </div>
      </div>

      {/* AUDIT DETAILS MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#020617] border border-slate-700 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95">
              <div className="bg-slate-900/80 p-4 border-b border-white/10 flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <History className="w-5 h-5 text-slate-400" />
                   <h3 className="font-bold text-white tracking-wide text-sm">{modal.title}</h3>
                 </div>
                 <button onClick={() => setModal({ isOpen: false, title: '', output: '' })} className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors">
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 bg-black overflow-y-auto flex-1 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed">
                 {modal.output}
              </div>
           </div>
        </div>
      )}

    </div>
  );
}