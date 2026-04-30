import React, { useState, useEffect } from 'react';
import { Download, LayoutGrid, ShieldCheck, GitBranch, Activity, Map } from 'lucide-react';
import { useDeviceMotion } from './hooks/useDeviceMotion';
import Header from './components/Header';
import OTAUpdater from './components/OTAUpdater';
import AppStoreTab from './tabs/AppStoreTab';
import GitOpsTab from './tabs/GitOpsTab';
import GiteaRegistryTab from './tabs/GiteaRegistryTab';
import DisasterRecoveryTab from './tabs/DisasterRecoveryTab';
import BlueprintTab from './tabs/BlueprintTab';
import IdentityVaultTab from './tabs/IdentityVaultTab';
import LogExplorerTab from './tabs/LogExplorerTab';
import PolicyGuardrailsTab from './tabs/PolicyGuardrailsTab';
import NocTelemetryTab from './tabs/NocTelemetryTab';
import SecurityPostureTab from './tabs/SecurityPostureTab';
import FleetScalingTab from './tabs/FleetScalingTab'; // INJECTED: Fleet Scaling Tab

export default function App() {
  const [activeTab, setActiveTab] = useState('appstore');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const { motionEnabled, getParallaxStyle, handleEnableMotion } = useDeviceMotion();

  const isPhase1Complete = true;

  // --- PWA INSTALLATION LOGIC ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  // --- MOBILE ERGONOMICS: HAPTIC FEEDBACK ---
  const handleTabChange = (tabId) => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // 50ms pulse for physical click feel
    }
    setActiveTab(tabId);
  };

  // The 5 Core "Quick Action" tabs for the mobile dock
  const bottomNavItems = [
    { id: 'appstore', label: 'Registry', icon: LayoutGrid },
    { id: 'telemetry', label: 'Telemetry', icon: Activity },
    { id: 'security', label: 'Posture', icon: ShieldCheck },
    { id: 'gitops', label: 'Pipelines', icon: GitBranch },
    { id: 'blueprint', label: 'Map', icon: Map },
  ];

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-300 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* PARALLAX BACKGROUND BLOBS */}
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] z-0 pointer-events-none" style={getParallaxStyle(40)} />
      <div className="fixed bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] z-0 pointer-events-none" style={getParallaxStyle(60)} />
      
      {/* MAIN CONTENT CONTAINER 
        Notice the pb-32 (padding-bottom: 8rem). This ensures the bottom of your 
        tabs isn't hidden behind the floating navigation bar!
      */}
      <div className="max-w-[1500px] mx-auto relative z-10 p-4 md:p-8 pb-32 md:pb-32">
        
        {/* Your existing top header is preserved for accessing the remaining tabs */}
        <Header activeTab={activeTab} setActiveTab={handleTabChange} isPhase1Complete={isPhase1Complete} />
        
        <OTAUpdater />

        {/* NATIVE OS INSTALL PROMPT */}
        {deferredPrompt && (
          <div className="mb-8 p-4 bg-blue-900/40 border border-blue-500/50 rounded-2xl flex items-center justify-between backdrop-blur-md shadow-xl">
            <div className="flex flex-col">
              <strong className="text-white">Install Pocket Lab</strong>
              <span className="text-sm text-blue-200">Native OS performance</span>
            </div>
            <button onClick={handleInstallClick} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white rounded-xl font-bold flex items-center shadow-lg">
              <Download className="w-4 h-4 mr-2" /> Install
            </button>
          </div>
        )}

        {/* TAB ROUTING AREA */}
        <main className="animate-in fade-in duration-500">
          {activeTab === 'appstore' && <AppStoreTab />}
          {activeTab === 'blueprint' && <BlueprintTab motionEnabled={motionEnabled} getParallaxStyle={getParallaxStyle} handleEnableMotion={handleEnableMotion} />}
          {activeTab === 'gitops' && <GitOpsTab />} 
          {activeTab === 'registry' && <GiteaRegistryTab />} 
          {activeTab === 'recovery' && <DisasterRecoveryTab />}
          {activeTab === 'vault' && <IdentityVaultTab />}
          {activeTab === 'logs' && <LogExplorerTab />}
          {activeTab === 'opa' && <PolicyGuardrailsTab />}
          {activeTab === 'telemetry' && <NocTelemetryTab />}
          {activeTab === 'security' && <SecurityPostureTab />}
          {activeTab === 'fleet' && <FleetScalingTab />} {/* INJECTED: Fleet Scaling Route */}
        </main>
      </div>

      {/* --- FLOATING BOTTOM NAVIGATION BAR --- */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[400px]">
        <nav className="bg-[#05080f]/90 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-3xl flex justify-between items-center p-2 relative overflow-hidden">
          
          {/* Subtle top glare effect for premium glass look */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center w-[4.5rem] h-14 rounded-2xl transition-all duration-300 outline-none ${
                  isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {/* Active Indicator Blob */}
                {isActive && (
                  <div className="absolute inset-0 bg-indigo-500/15 border border-indigo-500/20 rounded-2xl animate-in zoom-in duration-300" />
                )}
                
                <Icon className={`w-5 h-5 mb-1 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : ''}`} />
                <span className={`text-[9px] font-black uppercase tracking-widest relative z-10 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 translate-y-1'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

    </div>
  );
}