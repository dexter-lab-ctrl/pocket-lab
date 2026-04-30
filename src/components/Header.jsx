import React, { useState, useEffect } from 'react';
import { 
  Package, Network, Activity, ShieldCheck, 
  Menu, X, TestTube2, Database, CloudCog, 
  Fingerprint, AlignLeft, FileCheck, GitBranch,
  Workflow
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ENVIRONMENT AWARENESS
  const isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Detect page scroll to add a dynamic glass shadow to the header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1280) setMobileMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    { id: 'appstore', label: 'App Store', icon: Package },
    { id: 'blueprint', label: 'System Map', icon: Network },
    { id: 'gitops', label: 'GitOps IaC', icon: CloudCog },
    { id: 'registry', label: 'GitOps Registry', icon: GitBranch }, 
    { id: 'recovery', label: 'Disaster Recovery', icon: Database },
    { id: 'vault', label: 'Identity Vault', icon: Fingerprint },
    { id: 'logs', label: 'Log Explorer', icon: AlignLeft },
    { id: 'opa', label: 'Policy Guardrails', icon: FileCheck },
    { id: 'telemetry', label: 'NOC Telemetry', icon: Activity },
    { id: 'security', label: 'Security Posture', icon: ShieldCheck },
    { id: 'fleet', label: 'Fleet Scaling', icon: Workflow }, 
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    if (navigator.vibrate) navigator.vibrate(10);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-500 ease-out ${scrolled ? 'pt-2 pb-6' : 'py-6'}`}>
        {/* MAIN NAVBAR BACKGROUND */}
        <div className={`transition-all duration-500 ease-out rounded-[2rem] p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border ${
          scrolled 
            ? 'bg-[#020617]/80 backdrop-blur-2xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
            : 'bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-2xl'
        }`}>
          
          {/* TOP ROW: Logo & Mobile Toggle */}
          <div className="flex items-center justify-between w-full xl:w-auto z-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative group transition-transform hover:scale-105 ${
                isDevMode 
                  ? 'bg-gradient-to-br from-orange-500 to-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.4)]' 
                  : 'bg-gradient-to-br from-indigo-500 to-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
              }`}>
                <div className="absolute inset-0 rounded-2xl opacity-50 bg-white/20 group-hover:opacity-0 transition-opacity duration-300"></div>
                {isDevMode ? <TestTube2 className="w-6 h-6 text-white relative z-10" /> : <Network className="w-6 h-6 text-white relative z-10" />}
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-2xl font-black text-white tracking-tight leading-none drop-shadow-md">Pocket Lab</h1>
                
                {/* DYNAMIC HARDWARE LED BADGE */}
                <div className="flex items-center space-x-2 mt-1.5 bg-black/40 px-2 py-0.5 rounded-md border border-white/5 w-fit backdrop-blur-sm">
                  <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${isDevMode ? 'bg-orange-500 text-orange-500 animate-pulse' : 'bg-emerald-500 text-emerald-500 animate-pulse'}`}></span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isDevMode ? 'text-orange-400' : 'text-emerald-400'}`}>
                    {isDevMode ? 'Simulator Sandbox' : 'Edge Node Online'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Menu Hamburger */}
            <button 
              className={`xl:hidden p-3 rounded-xl border transition-all duration-300 active:scale-95 ${
                mobileMenuOpen 
                  ? 'bg-white/10 border-white/20 text-white shadow-inner rotate-90' 
                  : 'bg-black/40 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 -rotate-90 transition-transform" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* DESKTOP/TABLET NAVIGATION (Fluid Segmented Control) */}
          <nav className="hidden xl:flex items-center gap-1.5 bg-black/50 p-1.5 rounded-2xl border border-white/5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] w-full xl:w-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const activeBg = isDevMode ? 'bg-orange-600 border-orange-500/50' : 'bg-indigo-600 border-indigo-500/50';
              const activeGlow = isDevMode ? 'shadow-[0_0_15px_rgba(234,88,12,0.4)] text-white' : 'shadow-[0_0_15px_rgba(79,70,229,0.4)] text-white';
              const activeIconColor = isDevMode ? 'text-orange-200' : 'text-indigo-200';

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap shrink-0 group border ${
                    isActive
                      ? `${activeBg} ${activeGlow}`
                      : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 mr-2 transition-transform duration-300 ${
                    isActive ? activeIconColor : 'text-slate-500 group-hover:text-slate-300'
                  } ${isActive ? 'scale-110' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* MOBILE/TABLET DROPDOWN MENU (Glassmorphic Grid) */}
        <div className={`absolute top-[100%] left-0 right-0 mt-2 xl:hidden z-40 transition-all duration-300 ease-out origin-top ${mobileMenuOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'}`}>
          <div className="bg-[#05080f]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-6">
            
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2 flex items-center">
              <div className="h-px bg-white/10 flex-1 mr-3"></div>
              Control Modules
              <div className="h-px bg-white/10 flex-1 ml-3"></div>
            </div>
            
            {/* 2-Column Responsive Grid for Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto scrollbar-none pb-4">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const activeBg = isDevMode ? 'bg-orange-600/20 border-orange-500/40 text-orange-400 shadow-[0_0_15px_rgba(234,88,12,0.1)]' : 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.1)]';
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center w-full px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-200 border active:scale-95 ${
                      isActive
                        ? activeBg
                        : 'bg-black/40 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-colors ${isActive ? 'bg-black/40 shadow-inner' : 'bg-black/20 group-hover:bg-black/40'}`}>
                      <tab.icon className={`w-5 h-5 ${isActive ? '' : 'opacity-70'}`} />
                    </div>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* FULL SCREEN BACKDROP TO CLOSE MENU */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity xl:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}