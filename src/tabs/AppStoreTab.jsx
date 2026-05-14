import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { PlayCircle, Loader2, Library, CheckCircle2, XCircle, RefreshCw, ArrowDown, TestTube2, Server } from 'lucide-react';

export default function AppStoreTab() {
  const [catalog, setCatalog] = useState([]);
  const [loadingApp, setLoadingApp] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [isFetching, setIsFetching] = useState(true);

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const pullThreshold = 70;

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

  const fetchCatalog = async () => {
    setIsFetching(true);
    if (!isLiveEnv) {
      setTimeout(() => {
        setCatalog([
          { id: 'photoprism', title: 'PhotoPrism AI', description: 'AI-powered photo indexer and gallery.', icon: 'Image' },
          { id: 'security_scanners', title: 'Security Scanners', description: 'Ephemeral Trivy & Lynis auditing drones.', icon: 'ShieldCheck' },
          { id: 'ubuntu_base', title: 'Ubuntu Core', description: 'Raw Debian-based PRoot environment.', icon: 'TerminalSquare' }
        ]);
        setIsFetching(false);
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1200);
    } else {
      try {
        const res = await fetch('/api/catalog.json');
        const text = await res.text();
        setCatalog(JSON.parse(text));
      } catch (err) {
        showToast('error', 'Control plane unreachable.');
      } finally {
        setIsFetching(false);
        setIsRefreshing(false);
        setPullDistance(0);
      }
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [isLiveEnv]);

  const handleTouchStart = (e) => {
    if (window.scrollY <= 0) touchStartY.current = e.touches[0].clientY;
    else touchStartY.current = 0;
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === 0 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) setPullDistance(Math.min(diff * 0.4, 120)); 
  };

  const handleTouchEnd = () => {
    if (pullDistance > pullThreshold && !isRefreshing) {
      if (navigator.vibrate) navigator.vibrate(30); 
      setIsRefreshing(true);
      fetchCatalog();
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  const handleDeploy = async (appId, appTitle) => {
    setLoadingApp(appId);
    if (!isLiveEnv) {
      setTimeout(() => {
        setLoadingApp(null);
        showToast('success', `Simulated orchestration of ${appTitle} successful.`);
      }, 2500);
      return;
    }
    try {
      // The API proxy safely handles this and routes to Gitea Actions (act_runner)
      const res = await fetch('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'tofu_deploy', app_name: appId, action: 'apply' })
      });
      if (!res.ok) throw new Error(`API Error`);
      showToast('success', `Successfully submitted ${appTitle} to GitOps Pipeline.`);
    } catch (err) {
      showToast('error', `Failed to deploy ${appTitle}. Verify API and Gitea connectivity.`);
    } finally {
      setLoadingApp(null);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 5000);
  };

  return (
    <div 
      className="max-w-6xl mx-auto p-4 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${toast.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'}`}>
            {toast.type === 'error' ? <XCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            <div>
              <h4 className="font-bold text-sm">{toast.type === 'error' ? 'Orchestration Error' : 'Orchestration Success'}</h4>
              <p className="text-xs opacity-80">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* PULL TO REFRESH INDICATOR */}
      <div 
        className="flex justify-center items-center w-full absolute top-0 left-0 right-0 z-0 overflow-hidden"
        style={{ 
          height: `${pullDistance}px`,
          opacity: pullDistance / pullThreshold,
          transition: isRefreshing || pullDistance === 0 ? 'height 0.3s ease, opacity 0.3s ease' : 'none' 
        }}
      >
        <div className="flex flex-col items-center justify-center mt-4 text-indigo-400">
          {isRefreshing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <ArrowDown className={`w-6 h-6 transition-transform duration-300 ${pullDistance > pullThreshold ? 'rotate-180 text-emerald-400' : ''}`} />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest mt-2">
            {isRefreshing ? 'Syncing...' : pullDistance > pullThreshold ? 'Release to Sync' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div 
        className="relative z-10 animate-in fade-in duration-700 bg-[#020617]"
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl mb-8">
          <div className="text-center md:text-left">
            <div className="flex items-center space-x-2 mb-2 justify-center md:justify-start">
               {!isLiveEnv ? <TestTube2 className="w-4 h-4 text-orange-400" /> : <Server className="w-4 h-4 text-indigo-400" />}
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{!isLiveEnv ? 'Simulator Sandbox' : 'Live Orchestration Environment'}</h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Private Registry</h2>
            <p className="text-slate-400 text-sm max-w-xl">Dynamically serving Application Blueprints and Ansible Playbooks from the local Gitea registry.</p>
          </div>
          <button onClick={fetchCatalog} disabled={isFetching} className="hidden md:flex mt-4 md:mt-0 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all items-center">
             <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
          </button>
        </div>

        {isFetching && catalog.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
             <Library className="w-12 h-12 text-slate-500 animate-pulse mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Syncing with Gitea...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {catalog.map((app) => {
              const LucideIcon = Icons[app.icon] || Icons.Box;
              return (
                <div key={app.id} className="bg-[#05080f] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col hover:border-indigo-500/50 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                     <LucideIcon className="w-24 h-24 text-white" />
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4 relative z-10">
                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/30 text-indigo-400">
                      <LucideIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white leading-tight">{app.title}</h3>
                      <p className="text-[10px] font-mono text-slate-500">ID: {app.id}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-6 flex-1 relative z-10">{app.description}</p>
                  
                  <button 
                    onClick={() => handleDeploy(app.id, app.title)}
                    disabled={loadingApp === app.id}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-all relative z-10 ${
                      loadingApp === app.id ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed' : 'bg-white/5 hover:bg-indigo-600 text-white border border-white/10 hover:border-indigo-500'
                    }`}
                  >
                    {loadingApp === app.id ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <PlayCircle className="w-5 h-5 mr-2" />}
                    {loadingApp === app.id ? 'Triggering Pipeline...' : 'Deploy Workload'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}