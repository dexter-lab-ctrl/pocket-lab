import React, { useState, useEffect } from 'react';
import { CloudDownload, RefreshCw, AlertTriangle, ChevronRight, Zap } from 'lucide-react';

const GITHUB_REPO = 'dexter-lab-ctrl/pocket-lab'; // <-- Don't forget to change this!
const CURRENT_VERSION = 'v1.1.0';

export default function OTAUpdater() {
  const [latestRelease, setLatestRelease] = useState(null);
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
      .then(res => res.json())
      .then(data => {
        // Change to v0.0.0 here locally to test the UI!
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
    <div className="relative animate-in slide-in-from-top-8 fade-in duration-700 mb-8 z-50">
      {/* Animated glowing background layer */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-[2rem] blur opacity-75 animate-pulse"></div>
      
      {/* Main Banner Content */}
      <div className="relative bg-[#020617] border border-white/20 p-1 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between">
        
        <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 w-full h-full rounded-[1.75rem] p-5 md:p-6 flex flex-col md:flex-row items-center justify-between">
          
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
              <div className="relative p-4 bg-blue-500/20 rounded-2xl border border-blue-400/50">
                <Zap className="text-blue-400 w-8 h-8" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-white font-black text-xl tracking-wide">CRITICAL SYSTEM UPDATE</h3>
                <span className="px-2.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-widest flex items-center animate-pulse">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Action Required
                </span>
              </div>
              <p className="text-blue-200 text-sm">
                Pocket Lab <strong className="text-white">{latestRelease?.tag_name}</strong> is now available. You are currently running <span className="text-slate-400">{CURRENT_VERSION}</span>.
              </p>
            </div>
          </div>

          <button 
            onClick={triggerUpdate} 
            disabled={status === 'updating'} 
            className="mt-6 md:mt-0 w-full md:w-auto px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] bg-blue-500 hover:bg-blue-400 text-white group"
          >
            {status === 'updating' ? (
              <><RefreshCw className="w-5 h-5 mr-3 animate-spin" /> Upgrading Architecture...</>
            ) : (
              <><CloudDownload className="w-5 h-5 mr-3 group-hover:-translate-y-1 transition-transform" /> Install Update <ChevronRight className="w-5 h-5 ml-1 opacity-50" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}