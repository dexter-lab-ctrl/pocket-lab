import React, { useState } from 'react';
import OTAUpdater from '../components/OTAUpdater';
import { Activity, AlertTriangle, RotateCcw, History } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { getInstallerScript, getIgnitionScript } from '../utils/installerScriptBuilder';

export default function InstallerTab({ isPhase1Complete }) {
  const [scriptType, setScriptType] = useState('core');
  const [backupMode, setBackupMode] = useState('rollover');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* --- OTA UPDATER PLACED HERE AT THE VERY TOP --- */}
      <OTAUpdater />

      {!isPhase1Complete && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl flex items-start space-x-4">
          <AlertTriangle className="text-orange-400 w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-orange-400 font-bold text-lg">Phase 1 Incomplete</h4>
            <p className="text-slate-300 mt-3 text-sm">Please return to the guide and complete Phase 1 checklist before generating the deployment payload.</p>
          </div>
        </div>
      )}

      <div className={`transition-all duration-1000 ${!isPhase1Complete ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
        
        {/* Toggle between Core Installer and Ignition Script */}
        <div className="flex bg-black/40 rounded-2xl p-1.5 mb-8 w-fit mx-auto border border-white/10 shadow-inner">
           <button onClick={() => setScriptType('core')} className={`px-6 py-3 rounded-xl text-sm font-bold flex transition-all ${scriptType === 'core' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
             Core Architecture
           </button>
           <button onClick={() => setScriptType('ignition')} className={`px-6 py-3 rounded-xl text-sm font-bold flex transition-all ${scriptType === 'ignition' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
             Dashboard Ignition
           </button>
        </div>

        <div className="bg-slate-900/40 border border-white/10 p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl mb-8">
          <div className="flex items-start space-x-5">
            <div className={`p-4 rounded-2xl shadow-inner ${scriptType === 'core' ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
              <Activity className={`w-8 h-8 ${scriptType === 'core' ? 'text-purple-400' : 'text-blue-400'}`} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">{scriptType === 'core' ? 'The Gold Master Payload' : 'Master Ignition Script'}</h3>
              <p className="text-slate-400 mt-2 text-sm">
                {scriptType === 'core' ? 'Provisions the Linux subsystem.' : 'Deploys the PWA and telemetry daemon.'}
              </p>
            </div>
          </div>
          
          {scriptType === 'core' && (
            <div className="flex bg-black/40 rounded-2xl p-1.5 shadow-inner border border-white/5">
              <button onClick={() => setBackupMode('rollover')} className={`px-5 py-3.5 rounded-xl text-sm font-bold flex transition-all ${backupMode === 'rollover' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><RotateCcw className="w-4 h-4 mr-2" /> Static</button>
              <button onClick={() => setBackupMode('archive')} className={`px-5 py-3.5 rounded-xl text-sm font-bold flex transition-all ${backupMode === 'archive' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><History className="w-4 h-4 mr-2" /> Archives</button>
            </div>
          )}
        </div>
        
        <CodeBlock 
          code={scriptType === 'core' ? getInstallerScript(backupMode) : getIgnitionScript()} 
          id={scriptType === 'core' ? `installer-${backupMode}` : 'ignition-script'} 
        />
      </div>
    </div>
  );
}