import React, { useState } from 'react';
import { TerminalSquare, Copy, Check } from 'lucide-react';
import { cliCommands } from '../data/store';

export default function CliTab() {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cliCommands.map((category, idx) => {
          const CatIcon = category.Icon;
          return (
          <div key={idx} className="bg-[#0a0f1a] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-white/5 px-7 py-6 border-b border-white/5 flex items-center space-x-4">
              <div className="p-2.5 bg-black/40 rounded-xl"><CatIcon className={`w-5 h-5 ${category.iconColor}`} /></div>
              <h4 className="font-black text-white text-lg">{category.category}</h4>
            </div>
            <div className="p-7 space-y-8 flex-1">
              {category.commands.map((cmd, cIdx) => (
                <div key={cIdx}>
                  <div className="bg-[#05080f] rounded-xl border border-white/10 overflow-hidden relative">
                    <div className="p-4 flex items-center justify-between">
                      <code className="text-green-400 font-mono text-sm">{cmd.cmd}</code>
                      <button onClick={() => handleCopy(cmd.cmd, `cmd-${idx}-${cIdx}`)} className="text-slate-500 hover:text-white">
                        {copiedId === `cmd-${idx}-${cIdx}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 pl-2 mt-3 border-l-2 border-slate-800">{cmd.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
