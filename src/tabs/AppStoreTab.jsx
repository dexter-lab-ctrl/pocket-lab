import React, { useState } from 'react';
import { appCatalog } from '../data/store';
import { Terminal, CheckCircle, PlayCircle, RefreshCw, ExternalLink, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useTelemetry } from '../hooks/useTelemetry';

export default function AppStoreTab() {
  const [installingId, setInstallingId] = useState(null);
  
  // Connect to our live telemetry!
  const { liveData, isConnected } = useTelemetry();
  
  // Intelligent State Discovery (Fallback to empty arrays if disconnected)
  const installedSubsystems = liveData?.subsystems || [];
  const activeWorkloads = liveData?.workloads || [];
  const tailnetName = liveData?.tailnet || 'pocket-lab';

  const executeAction = async (appId, actionType, script) => {
    setInstallingId(`${appId}_${actionType}`);
    
    try {
      await fetch('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          intent: 'run_bash', 
          task_name: `${actionType}_${appId}`, 
          script: script 
        })
      });
      
      // Simulate installation time for UX (In reality, the backend is running it via nohup)
      setTimeout(() => {
        setInstallingId(null);
        alert(`API Command Sent: The process is now running in the Termux background!`);
      }, 3000);
      
    } catch (err) {
      alert("API Error: Make sure your Tailscale routing is active.");
      setInstallingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 p-4 relative z-10">
      
      <div className="text-center mb-10 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
        <h2 className="text-4xl font-black text-white tracking-tight relative z-10">App Catalog</h2>
        <p className="text-slate-400 mt-2 text-lg relative z-10">Deploy enterprise-grade workloads with Zero-Touch orchestration.</p>
        
        {!isConnected && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-500 text-sm font-bold">
            <AlertTriangle className="w-4 h-4 mr-2" /> UI running in Simulator Mode (Not connected to hardware API)
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {appCatalog.map((app) => {
          // --- INTELLIGENT STATE LOGIC ---
          // Check if this specific app ID is found in our telemetry payload
          const isSubsystem = app.id === 'ubuntu';
          const isInstalled = isSubsystem ? installedSubsystems.includes(app.id) : activeWorkloads.includes(app.id);
          const isInstalling = installingId === `${app.id}_install`;
          const isUninstalling = installingId === `${app.id}_uninstall`;

          return (
            <div key={app.id} className="bg-[#05080f]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col group transition-all hover:border-blue-500/30 relative">
              
              {/* Glowing Background Overlay if Active */}
              {isInstalled && <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none"></div>}

              {/* App Card Header */}
              <div className="p-6 border-b border-white/5 flex items-start justify-between relative z-10 bg-white/5">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl transition-colors shadow-inner ${isInstalled ? 'bg-green-500/20 border border-green-500/30' : 'bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20'}`}>
                    <app.Icon className={`w-8 h-8 ${isInstalled ? 'text-green-400' : 'text-blue-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{app.name}</h3>
                    <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                      isInstalled ? 'bg-green-900/40 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {isInstalled ? <><ShieldCheck className="w-3 h-3 mr-1" /> Active</> : app.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* App Card Body (Description) */}
              <div className="p-6 flex-1 flex flex-col relative z-10">
                <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                  {app.description}
                </p>

                {/* --- DYNAMIC ACTION BUTTONS --- */}
                <div className="mt-auto space-y-3">
                  
                  {isInstalled ? (
                    // IF APP IS INSTALLED: Show Open UI & Stop Buttons
                    <div className="flex space-x-3">
                      {app.port && (
                        <a 
                          href={`https://${tailnetName}:${app.port}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                        >
                          <ExternalLink className="w-5 h-5 mr-2" /> Open Web UI
                        </a>
                      )}
                      
                      {app.uninstallScript && (
                        <button 
                          onClick={() => executeAction(app.id, 'uninstall', app.uninstallScript)}
                          disabled={isUninstalling}
                          className="bg-slate-800 hover:bg-red-900/80 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 font-bold py-4 px-6 rounded-xl flex items-center justify-center transition-all"
                        >
                          {isUninstalling ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  ) : (
                    // IF APP IS NOT INSTALLED: Show 1-Click Install Button
                    <button 
                      onClick={() => executeAction(app.id, 'install', app.installScript)}
                      disabled={installingId !== null}
                      className={`w-full font-black text-sm uppercase tracking-widest py-4 px-4 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                        isInstalling 
                          ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)]' 
                          : 'bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 hover:border-blue-500/50'
                      } ${installingId !== null && !isInstalling && 'opacity-50 cursor-not-allowed'}`}
                    >
                      {isInstalling ? (
                        <><RefreshCw className="w-5 h-5 mr-3 animate-spin" /> Provisioning Container...</>
                      ) : (
                        <><PlayCircle className="w-5 h-5 mr-3" /> 1-Click Deploy</>
                      )}
                    </button>
                  )}

                  {/* Terminal Log Hint */}
                  <div className="text-center mt-2">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center">
                       <Terminal className="w-3 h-3 mr-1" /> Logs streamed to Live Console
                     </p>
                  </div>

                </div>
              </div>

            </div>
          );
        })}
      </div>
      
    </div>
  );
}