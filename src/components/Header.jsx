import React from 'react';
import { Server, ShieldCheck, BookOpen, Lock, Terminal, TerminalSquare, Map } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isPhase1Complete }) {
  return (
    <header className="flex flex-col xl:flex-row items-start xl:items-center justify-between pb-8 border-b border-slate-700/50 mb-8 space-y-6 xl:space-y-0">
      <div>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/20 backdrop-blur-xl rounded-2xl border border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Server className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
            Pocket Lab <span className="text-blue-400 ml-2 text-2xl font-bold tracking-wide opacity-90">v3.1</span>
          </h1>
        </div>
        <p className="text-slate-400 mt-4 text-sm uppercase tracking-widest font-bold flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
          Userspace HTTPS Architecture
        </p>
      </div>

      <div className="flex flex-wrap gap-2 bg-slate-900/40 p-2 rounded-[1.25rem] border border-white/10 backdrop-blur-xl shadow-2xl">
        <button onClick={() => setActiveTab('guide')} className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'guide' ? 'bg-blue-600/90 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-blue-400/50' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}`}>
          <BookOpen className="w-4 h-4 mr-2" />Deployment Guide
        </button>
        <button onClick={() => isPhase1Complete && setActiveTab('installer')} className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'installer' ? 'bg-green-600/90 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] border border-green-400/50' : !isPhase1Complete ? 'text-slate-600/50 cursor-not-allowed border border-transparent' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}`}>
          {!isPhase1Complete ? <Lock className="w-4 h-4 mr-2" /> : <Terminal className="w-4 h-4 mr-2" />} Deployment Script
        </button>
        <button onClick={() => setActiveTab('cli')} className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'cli' ? 'bg-orange-600/90 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-orange-400/50' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}`}>
          <TerminalSquare className="w-4 h-4 mr-2" />CLI Operations
        </button>
        <button onClick={() => setActiveTab('blueprint')} className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'blueprint' ? 'bg-purple-600/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/50' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}`}>
          <Map className="w-4 h-4 mr-2" />System Map
        </button>
        <button onClick={() => setActiveTab('console')} className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'console' ? 'bg-red-600/90 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-400/50' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}`}>
          <Terminal className="w-4 h-4 mr-2" />Live Console
        </button>
      </div>
    </header>
  );
}
