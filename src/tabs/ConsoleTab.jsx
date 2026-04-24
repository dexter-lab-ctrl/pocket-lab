import React, { useState } from 'react';
import { Terminal, Maximize2, ShieldCheck, RefreshCw, Cpu } from 'lucide-react';

export default function ConsoleTab() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in zoom-in-[0.98] duration-500">
      <div className="bg-[#05080f] rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[75vh]">
        
        {/* Fake Window Chrome (macOS Style) */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-inner"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-inner"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-inner"></div>
          </div>
          
          <div className="flex items-center space-x-2 text-slate-400">
            <Terminal className="w-4 h-4" />
            <span className="text-xs font-black tracking-widest uppercase">root@pocket-lab:~</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-500">
            <div className="flex items-center space-x-1.5 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-[9px] font-black tracking-widest text-green-400 uppercase">WSS Active</span>
            </div>
            <button onClick={() => setReloadKey(k => k + 1)} className="hover:text-white transition-colors" title="Reload Connection">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="hover:text-white transition-colors" title="Fullscreen">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Live Terminal Embedded */}
        <div className="flex-1 w-full bg-[#03050a] relative group">
          {/* A soft glowing gradient behind the terminal */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none z-0"></div>
          
          {/* We append query params to highly customize the ttyd look */}
          <iframe 
            key={reloadKey}
            src="/terminal/?theme={'background':'#03050a','foreground':'#4ade80','cursor':'#3b82f6','selection':'#1e3a8a'}&fontSize=13&title=Pocket+Lab+Shell" 
            className="absolute inset-0 w-full h-full border-0 z-10 opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            title="Termux Shell"
            allow="clipboard-read; clipboard-write; fullscreen"
          />
        </div>

      </div>
      
      <div className="flex items-center justify-center space-x-6 mt-6">
        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 mr-2 text-slate-400" /> End-to-End Encrypted
        </div>
        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest border-l border-white/10 pl-6">
          <Cpu className="w-4 h-4 mr-2 text-slate-400" /> Direct Hardware Access
        </div>
      </div>
    </div>
  );
}