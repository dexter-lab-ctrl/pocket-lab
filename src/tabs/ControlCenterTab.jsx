import React, { useState } from 'react';
import { Activity, Network, Terminal, Power, FileText, CheckCircle, X, Loader2, Zap } from 'lucide-react';

const maintenanceCategories = [
  {
    title: "Network Diagnostics",
    icon: Network,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    commands: [
      { name: "Check Tailscale Status", cmd: "tailscale-cli status" },
      { name: "Test Internet Connection", cmd: "ping -c 4 1.1.1.1" },
      { name: "Show Active Ports", cmd: "netstat -tuln | head -n 15" }
    ]
  },
  {
    title: "System Logs & Telemetry",
    icon: FileText,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    commands: [
      { name: "View Live Telemetry Data", cmd: "cat ~/api/telemetry.json" },
      { name: "Check Backup Status Log", cmd: "tail -n 30 ~/pocket_lab_logs/auto_backup.log || echo 'No backup log found.'" },
      { name: "Check PWA Server Logs", cmd: "tail -n 30 ~/pocket_lab_logs/pwa_server.log" },
      { name: "Check API Bridge Logs", cmd: "tail -n 30 ~/pocket_lab_logs/api_server.log" }
    ]
  },
  {
    title: "Power & Services",
    icon: Power,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    commands: [
      { name: "View Scheduled Automations", cmd: "crontab -l || echo 'No active crontab jobs.'" },
      { name: "View Resource Usage (Live)", cmd: "top -b -n 1 | head -n 20" },
      { name: "List Running Containers", cmd: "proot-distro list" }
    ]
  }
];

export default function ControlCenterTab() {
  const [modal, setModal] = useState({ isOpen: false, title: '', output: '', isLoading: false });

  // 1-Click Sync Command Execution
  const executeCommand = async (title, cmd) => {
    setModal({ isOpen: true, title, output: '', isLoading: true });
    
    try {
      const res = await fetch('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'sync_bash', command: cmd })
      });
      const data = await res.json();
      setModal({ isOpen: true, title, output: data.output, isLoading: false });
    } catch (err) {
      setModal({ isOpen: true, title, output: '[CRITICAL ERROR] Failed to reach API. Tailscale may be down.', isLoading: false });
    }
  };

  // Background Actions (Fire & Forget)
  const fireBackgroundAction = async (taskName, script) => {
    try {
      await fetch('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'run_bash', task_name: taskName, script: script })
      });
      alert(`Action '${taskName}' triggered successfully in the background.`);
    } catch (err) {
      alert("API Error: Action failed.");
    }
  };

  // AI-Style Log Colorizer
  const parseLogLine = (line, idx) => {
    let color = "text-green-400"; // default terminal text
    const lower = line.toLowerCase();
    
    if (lower.includes("error") || lower.includes("failed") || lower.includes("❌") || lower.includes("critical")) color = "text-red-400 font-bold";
    else if (lower.includes("warning") || lower.includes("⚠️")) color = "text-yellow-400";
    else if (lower.includes("success") || lower.includes("✅") || lower.includes("done")) color = "text-emerald-400 font-bold";
    else if (lower.includes("info") || lower.includes("->")) color = "text-blue-300";
    
    return <div key={idx} className={`${color} break-words font-mono text-xs mb-1`}>{line}</div>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 p-4 relative">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white tracking-tight">Control Center</h2>
        <p className="text-slate-400 mt-2 text-lg">1-Click Telemetry, Diagnostics, and Global Log Streaming.</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {maintenanceCategories.map((category, idx) => (
          <div key={idx} className="bg-[#05080f]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col group transition-all hover:border-slate-500/30">
            
            <div className="p-6 border-b border-white/5 flex items-center space-x-4 bg-white/[0.02]">
              <div className={`p-3 rounded-2xl ${category.bg} shadow-inner`}>
                <category.icon className={`w-6 h-6 ${category.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white">{category.title}</h3>
            </div>

            <div className="p-6 flex-1 space-y-3">
              {category.commands.map((item, cmdIdx) => (
                <button 
                  key={cmdIdx}
                  onClick={() => executeCommand(item.name, item.cmd)}
                  className="w-full text-left bg-black/40 hover:bg-slate-800 rounded-xl p-4 border border-white/5 hover:border-slate-500 transition-all group/btn flex items-center justify-between shadow-inner"
                >
                  <span className="text-slate-300 text-sm font-bold group-hover/btn:text-white transition-colors">{item.name}</span>
                  <Activity className="w-4 h-4 text-slate-600 group-hover/btn:text-blue-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Action Danger Zone */}
      <div className="mt-8 bg-red-900/10 border border-red-500/20 rounded-[2rem] p-6 lg:p-8 shadow-inner">
        <h4 className="text-red-400 font-black text-lg mb-4 flex items-center uppercase tracking-widest"><Zap className="w-5 h-5 mr-2" /> Global Power Operations</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <button onClick={() => fireBackgroundAction('restart_dash', 'bash ~/start_dashboard.sh')} className="px-6 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-red-500 hover:bg-red-900/30 text-white font-bold transition-all shadow-md">
             Restart Full Dashboard Engine
           </button>
           <button onClick={() => fireBackgroundAction('kill_prism', 'pkill -9 photoprism')} className="px-6 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-red-500 hover:bg-red-900/30 text-white font-bold transition-all shadow-md">
             Force-Kill PhotoPrism Container
           </button>
        </div>
      </div>

      {/* THE LIVE TERMINAL MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-[#020617] border border-blue-500/40 rounded-[2rem] shadow-[0_0_50px_rgba(59,130,246,0.3)] w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95">
              
              {/* Modal Header */}
              <div className="bg-slate-900/80 p-4 border-b border-white/10 flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <Terminal className="w-5 h-5 text-blue-400" />
                   <h3 className="font-bold text-white tracking-wide">{modal.title}</h3>
                 </div>
                 <button onClick={() => setModal({ isOpen: false, title: '', output: '', isLoading: false })} className="p-2 bg-black/40 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors">
                   <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Terminal Screen */}
              <div className="p-6 bg-black overflow-y-auto flex-1 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] relative">
                 {modal.isLoading ? (
                   <div className="flex flex-col items-center justify-center h-40 space-y-4">
                     <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                     <span className="text-blue-400 font-mono text-xs uppercase tracking-widest animate-pulse">Executing over Secure API...</span>
                   </div>
                 ) : (
                   <div className="whitespace-pre-wrap">
                     {modal.output.split('\n').map((line, idx) => parseLogLine(line, idx))}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
}