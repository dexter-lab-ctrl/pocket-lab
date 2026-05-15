import React, { useState, useEffect } from 'react';
import { CloudDownload, RefreshCw, AlertTriangle, ChevronRight, Zap, CheckCircle2, Server, GitBranch } from 'lucide-react';

// This should track your actual GitOps Infrastructure repository
const GITHUB_REPO = 'dexter-lab-ctrl/pocket-lab'; 
const CURRENT_VERSION = 'v1.1.0';

export default function OTAUpdater() {
  const [latestRelease, setLatestRelease] = useState(null);
  const [status, setStatus] = useState('checking'); // checking, available, up-to-date, updating, error

  useEffect(() => {
    // In a pure air-gapped lab, you might point this to your local Gitea instance instead of GitHub
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
      .then(res => res.json())
      .then(data => {
        if (data.tag_name && data.tag_name !== CURRENT_VERSION) {
          setLatestRelease(data);
          setStatus('available');
        } else {
          setStatus('up-to-date');
        }
      })
      .catch(() => {
        // Fallback for simulated/air-gapped environments
        setLatestRelease({ tag_name: 'v1.2.0-edge', name: 'Edge Node Infrastructure Update' });
        setStatus('available'); 
      });
  }, []);

  const triggerUpdate = async () => {
    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
    setStatus('updating');
    
    try {
      // Execute the GitOps Reconciliation via the Control Plane
      const res = await fetch('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          intent: 'sync_bash', 
          command: 'cd ~/pocket_lab_iac && git pull origin main && ansible-playbook site.yml' 
        })
      });
      
      if (res.ok) {
        // Allow time for PM2 to restart the API and React server if updated
        setTimeout(() => window.location.reload(true), 15000);
      } else {
        throw new Error('Control plane rejected the update intent.');
      }
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('available'), 5000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 animate-in fade-in duration-700">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden shadow-2xl">
        
        {/* BACKGROUND DECORATION */}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
          <CloudDownload className="w-64 h-64 text-blue-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                <Server className="w-3 h-3 mr-2" /> Edge Node Lifecycle
              </h3>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
              Over-The-Air GitOps Sync
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Maintains edge node integrity by pulling the latest declarative state from your Git repository and applying it via Ansible. This ensures the node remains synchronized with the master control plane.
            </p>

            {/* VERSION STATUS CARDS */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <div className="bg-[#05080f] border border-white/5 rounded-2xl p-4 flex items-center space-x-4">
                <div className="p-3 bg-slate-800 rounded-xl">
                  <GitBranch className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current State</p>
                  <p className="text-lg font-mono text-white">{CURRENT_VERSION}</p>
                </div>
              </div>

              <div className="bg-[#05080f] border border-white/5 rounded-2xl p-4 flex items-center space-x-4">
                <div className={`p-3 rounded-xl transition-colors ${status === 'available' ? 'bg-blue-500/10' : 'bg-slate-800'}`}>
                  {status === 'up-to-date' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <CloudDownload className={`w-5 h-5 ${status === 'available' ? 'text-blue-400' : 'text-slate-400'}`} />}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Target State</p>
                  {status === 'checking' && <p className="text-sm font-bold text-slate-400 animate-pulse mt-1">Polling Control Plane...</p>}
                  {status === 'up-to-date' && <p className="text-lg font-mono text-emerald-400">Synchronized</p>}
                  {status === 'error' && <p className="text-sm font-bold text-red-400 mt-1">Sync Failed</p>}
                  {(status === 'available' || status === 'updating') && (
                    <p className="text-lg font-mono text-blue-400">{latestRelease?.tag_name || 'Pending'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <button 
            onClick={triggerUpdate} 
            disabled={status !== 'available'} 
            className={`mt-6 md:mt-0 w-full md:w-auto px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center transition-all duration-300 shrink-0 border ${
              status === 'updating' 
                ? 'bg-blue-900/50 border-blue-500/30 text-blue-300 cursor-not-allowed shadow-inner' 
                : status !== 'available'
                ? 'bg-slate-800 border-white/5 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 border-blue-400/50 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] active:scale-95'
            }`}
          >
            {status === 'updating' ? (
              <><RefreshCw className="w-5 h-5 mr-3 animate-spin" /> Reconciling Node...</>
            ) : status === 'up-to-date' ? (
              <><CheckCircle2 className="w-5 h-5 mr-3" /> Node Up To Date</>
            ) : (
              <><CloudDownload className="w-5 h-5 mr-3" /> Initiate Sync <ChevronRight className="w-5 h-5 ml-1 opacity-50" /></>
            )}
          </button>
        </div>
      </div>
      
      {/* PROGRESS BAR SIMULATION */}
      {status === 'updating' && (
        <div className="absolute bottom-4 left-8 right-8 h-1 bg-blue-950 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 w-full origin-left animate-pulse transition-all duration-1000 ease-out">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      )}
    </div>
  );
}