import React, { useState, useEffect } from 'react';
import { CloudDownload, RefreshCw, AlertTriangle, ChevronRight, Zap } from 'lucide-react';

const GITHUB_REPO = 'dexter-lab-ctrl/pocket-lab'; 
const CURRENT_VERSION = 'v1.1.0';

export default function OTAUpdater() {
  const [latestRelease, setLatestRelease] = useState(null);
  const [status, setStatus] = useState('checking');

  useEffect(() => {
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
      .catch(() => setStatus('error'));
  }, []);

  const triggerUpdate = async () => {
    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
    setStatus('updating');
    try {
      const res = await fetch('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'ota_update', downloadUrl: latestRelease.assets[0].browser_download_url })
      });
      if (res.ok) setTimeout(() => window.location.reload(true), 10000);
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'checking' || status === 'up-to-date') return null;

  return (
    <div className="relative animate-in slide-in-from-top-8 fade-in duration-1000 mb-8 z-40 group">
      {/* Animated glowing background layer (Enterprise Depth) */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-[2.5rem] blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 animate-pulse"></div>
      
      {/* Main Banner Content */}
      <div className="relative bg-[#020617]/90 backdrop-blur-2xl border border-white/20 p-1.5 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between overflow-hidden">
        
        <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 w-full h-full rounded-[2rem] p-5 md:p-6 md:px-8 flex flex-col md:flex-row items-center justify-between border border-white/5 shadow-inner">
          
          <div className="flex items-center space-x-5">
            <div className="relative shrink-0">
              <div className="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
              <div className="relative p-4 bg-blue-500/20 rounded-2xl border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <Zap className="text-blue-400 w-8 h-8" />
              </div>
            </div>
            
            <div className="text-center md:text-left mt-2 md:mt-0">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-1.5">
                <h3 className="text-white font-black text-xl tracking-wide drop-shadow-md">CRITICAL SYSTEM UPDATE</h3>
                <span className="mt-2 md:mt-0 px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center animate-pulse shadow-sm">
                  <AlertTriangle className="w-3 h-3 mr-1.5" /> Action Required
                </span>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed max-w-xl">
                Pocket Lab <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded ml-1">{latestRelease?.tag_name}</strong> is now available. You are currently running <span className="text-slate-400 font-mono text-xs ml-1">{CURRENT_VERSION}</span>.
              </p>
            </div>
          </div>

          <button 
            onClick={triggerUpdate} 
            disabled={status === 'updating'} 
            className={`mt-6 md:mt-0 w-full md:w-auto px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center transition-all duration-300 shrink-0 border ${
              status === 'updating' 
                ? 'bg-blue-900/50 border-blue-500/30 text-blue-300 cursor-not-allowed shadow-inner' 
                : 'bg-blue-600 hover:bg-blue-500 border-blue-400/50 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] active:scale-95'
            }`}
          >
            {status === 'updating' ? (
              <><RefreshCw className="w-5 h-5 mr-3 animate-spin" /> Upgrading OS...</>
            ) : (
              <><CloudDownload className="w-5 h-5 mr-3" /> Install Update <ChevronRight className="w-5 h-5 ml-1 opacity-50" /></>
            )}
          </button>
        </div>
      </div>
      
      {/* Progress Bar Simulation during update */}
      {status === 'updating' && (
        <div className="absolute bottom-0 left-4 right-4 h-1 bg-blue-950 rounded-b-3xl overflow-hidden z-20">
           <div className="h-full bg-blue-400 w-full origin-left animate-[progress_10s_ease-in-out_forwards]"></div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
      `}} />
    </div>
  );
}