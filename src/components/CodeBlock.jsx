import React, { useState } from 'react';
import { FileCode, Copy, Check } from 'lucide-react';
import { highlightBash } from '../utils/syntaxHighlighter';

export default function CodeBlock({ code, id }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  return (
    <div className="relative group mt-5">
      <div className="flex items-center px-4 py-3 bg-[#0a0f1a] border border-white/10 border-b-0 rounded-t-2xl shadow-inner">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/50 shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-500/50 shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-500/50 shadow-sm"></div>
        </div>
        <div className="mx-auto text-xs text-slate-500 font-mono flex items-center tracking-widest uppercase">
          <FileCode className="w-3.5 h-3.5 mr-2 text-slate-400" /> install_master.sh
        </div>
      </div>
      <pre className="p-6 bg-[#0a0f1a] rounded-b-2xl border border-white/10 overflow-x-auto text-[13px] font-mono leading-relaxed whitespace-pre-wrap shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] text-slate-300" 
           dangerouslySetInnerHTML={{ __html: highlightBash(code) }}>
      </pre>
      <button onClick={handleCopy} className="absolute top-14 right-4 p-2.5 bg-white/10 backdrop-blur-md text-slate-200 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 border border-white/20 shadow-lg">
        {copiedId === id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
