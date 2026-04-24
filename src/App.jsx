import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useDeviceMotion } from './hooks/useDeviceMotion';
import Header from './components/Header';
import GuideTab from './tabs/GuideTab';
import InstallerTab from './tabs/InstallerTab';
import CliTab from './tabs/CliTab';
import BlueprintTab from './tabs/BlueprintTab';
import { deploymentSteps } from './data/store';
import ConsoleTab from './tabs/ConsoleTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('guide');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const { motionEnabled, getParallaxStyle, handleEnableMotion } = useDeviceMotion();

  // Monolithic State migrated to root
  const [expandedStep, setExpandedStep] = useState(0);
  const [checkedPrereqs, setCheckedPrereqs] = useState({});
  const [completedGuidePhases, setCompletedGuidePhases] = useState({});

  const phase1PrereqsCount = deploymentSteps[0].instructions.length;
  const completedPrereqsCount = Object.values(checkedPrereqs).filter(Boolean).length;
  const isPhase1Complete = completedPrereqsCount === phase1PrereqsCount && phase1PrereqsCount > 0;

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

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-300 p-4 md:p-8 font-sans overflow-hidden">
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] z-0" style={getParallaxStyle(40)} />
      <div className="fixed bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] z-0" style={getParallaxStyle(60)} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} isPhase1Complete={isPhase1Complete} />
        
        {deferredPrompt && (
          <div className="mb-8 p-4 bg-blue-900/40 border border-blue-500/50 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col"><strong className="text-white">Install Pocket Lab</strong><span className="text-sm text-blue-200">Native OS performance</span></div>
            <button onClick={handleInstallClick} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"><Download className="w-4 h-4 mr-2 inline" /> Install</button>
          </div>
        )}

        {activeTab === 'guide' && <GuideTab expandedStep={expandedStep} setExpandedStep={setExpandedStep} checkedPrereqs={checkedPrereqs} setCheckedPrereqs={setCheckedPrereqs} completedGuidePhases={completedGuidePhases} setCompletedGuidePhases={setCompletedGuidePhases} isPhase1Complete={isPhase1Complete} setActiveTab={setActiveTab} />}
        {activeTab === 'installer' && <InstallerTab isPhase1Complete={isPhase1Complete} />}
        {activeTab === 'cli' && <CliTab />}
        {activeTab === 'blueprint' && <BlueprintTab motionEnabled={motionEnabled} getParallaxStyle={getParallaxStyle} handleEnableMotion={handleEnableMotion} />}
        {activeTab === 'console' && <ConsoleTab />}
      </div>
    </div>
  );
}
