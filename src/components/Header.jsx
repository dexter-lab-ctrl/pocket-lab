import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Network, Activity, ShieldCheck, 
  TestTube2, Database, CloudCog, Fingerprint, 
  AlignLeft, FileCheck, GitBranch, Workflow, 
  ChevronLeft, ChevronRight
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const [scrolled, setScrolled] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);

  // ENVIRONMENT AWARENESS
  const isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Detect page scroll to add a dynamic glass shadow to the header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check scroll bounds to show/hide chevron buttons
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // Use Math.ceil to prevent rounding errors on high-DPI screens
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 1);
    }
  };

  // Initialize and attach scroll listener
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  // Auto-scroll the active tab into the center of the view
  useEffect(() => {
    const activeEl = document.getElementById(`tab-${activeTab}`);
    if (activeEl && scrollContainerRef.current) {
      // Timeout ensures DOM layout has settled before scrolling
      setTimeout(() => {
         activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 50);
    }
  }, [activeTab]);

  // Manual scrolling buttons
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  // Allow desktop users to scroll horizontally using their vertical mouse wheel
  const handleWheel = (e) => {
    if (scrollContainerRef.current) {
       scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  // Aligned with Day-3 Enterprise Edge Architecture
  const tabs = [
    { id: 'appstore', label: 'App Catalog', icon: Package },
    { id: 'blueprint', label: 'System Map', icon: Network },
    { id: 'gitops', label: 'GitOps Pipeline', icon: CloudCog }, 
    { id: 'registry', label: 'Blueprint Registry', icon: GitBranch }, 
    { id: 'vault', label: 'Identity Vault', icon: Fingerprint },
    { id: 'logs', label: 'Log Explorer', icon: AlignLeft }, 
    { id: 'opa', label: 'Policy Guardrails', icon: FileCheck }, 
    { id: 'telemetry', label: 'NOC Telemetry', icon: Activity },
    { id: 'security', label: 'Security Posture', icon: ShieldCheck }, 
    { id: 'fleet', label: 'Mesh Fleet', icon: Workflow }, 
    { id: 'recovery', label: 'Disaster Recovery', icon: Database },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ease-out max-w-full ${scrolled ? 'pt-2 pb-6' : 'py-6'}`}>
      
      {/* MAIN NAVBAR BACKGROUND */}
      <div className={`transition-all duration-500 ease-out rounded-[2rem] p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6 border ${
        scrolled 
          ? 'bg-[#020617]/90 backdrop-blur-2xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
          : 'bg-slate-900/60 backdrop-blur-xl border-white/5 shadow-2xl'
      }`}>
        
        {/* LOGO SECTION */}
        <div className="flex items-center space-x-4 shrink-0 px-2 xl:px-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative shrink-0 transition-transform hover:scale-105 ${
            isDevMode 
              ? 'bg-gradient-to-br from-orange-500 to-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.4)]' 
              : 'bg-gradient-to-br from-indigo-500 to-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
          }`}>
            <div className="absolute inset-0 rounded-2xl opacity-50 bg-white/20 transition-opacity duration-300"></div>
            {isDevMode ? <TestTube2 className="w-6 h-6 text-white relative z-10" /> : <Network className="w-6 h-6 text-white relative z-10" />}
          </div>
          
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none drop-shadow-md truncate">Pocket Lab</h1>
            
            {/* DYNAMIC HARDWARE LED BADGE */}
            <div className="flex items-center space-x-2 mt-1.5 bg-black/40 px-2 py-0.5 rounded-md border border-white/5 w-fit backdrop-blur-sm">
              <span className={`w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor] ${isDevMode ? 'bg-orange-500 text-orange-500 animate-pulse' : 'bg-emerald-500 text-emerald-500 animate-pulse'}`}></span>
              <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest truncate ${isDevMode ? 'text-orange-400' : 'text-emerald-400'}`}>
                {isDevMode ? 'Simulator Sandbox' : 'Edge Node Online'}
              </span>
            </div>
          </div>
        </div>

        {/* SCROLLABLE NAVIGATION CONTAINER */}
        <div className="relative flex-1 w-full min-w-0 flex items-center">
          
          {/* Dynamic Left Scroll Indicator/Button */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none z-10 hidden sm:flex items-center justify-start rounded-l-2xl">
               <button 
                 onClick={() => scroll('left')} 
                 aria-label="Scroll tabs left"
                 className="p-1.5 rounded-full bg-black/80 text-white pointer-events-auto hover:bg-black border border-white/10 shadow-lg ml-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
               >
                  <ChevronLeft className="w-4 h-4"/>
               </button>
            </div>
          )}

          {/* The Scrollable Tab Bar */}
          <nav 
            ref={scrollContainerRef}
            onScroll={checkScroll}
            onWheel={handleWheel}
            role="tablist"
            aria-label="Main Navigation"
            className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] w-full snap-x snap-mandatory scroll-smooth"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const activeBg = isDevMode ? 'bg-orange-600 border-orange-500/50' : 'bg-indigo-600 border-indigo-500/50';
              const activeGlow = isDevMode ? 'shadow-[0_0_15px_rgba(234,88,12,0.4)] text-white' : 'shadow-[0_0_15px_rgba(79,70,229,0.4)] text-white';
              const activeIconColor = isDevMode ? 'text-orange-200' : 'text-indigo-200';

              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab.id}-panel`}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center px-4 py-3 xl:py-2.5 rounded-xl text-xs sm:text-sm xl:text-xs font-bold transition-all duration-300 whitespace-nowrap shrink-0 border snap-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black ${
                    isActive
                      ? `${activeBg} ${activeGlow}`
                      : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 xl:w-4 xl:h-4 mr-2 transition-transform duration-300 shrink-0 ${
                    isActive ? activeIconColor : 'text-slate-500'
                  } ${isActive ? 'scale-110' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Dynamic Right Scroll Indicator/Button */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none z-10 hidden sm:flex items-center justify-end rounded-r-2xl">
               <button 
                 onClick={() => scroll('right')} 
                 aria-label="Scroll tabs right"
                 className="p-1.5 rounded-full bg-black/80 text-white pointer-events-auto hover:bg-black border border-white/10 shadow-lg mr-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
               >
                  <ChevronRight className="w-4 h-4"/>
               </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}