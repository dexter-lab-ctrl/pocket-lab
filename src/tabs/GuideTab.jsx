import React, { useState } from 'react';
import { Check, CheckCircle2, Circle, ArrowRight, Lock, Unlock, Copy } from 'lucide-react';
import { deploymentSteps } from '../data/store';

export default function GuideTab({ 
  expandedStep, 
  setExpandedStep, 
  checkedPrereqs, 
  setCheckedPrereqs, 
  completedGuidePhases, 
  setCompletedGuidePhases, 
  isPhase1Complete, 
  setActiveTab 
}) {
  const [copiedId, setCopiedId] = useState(null);

  const phase1PrereqsCount = deploymentSteps[0].instructions.length;
  const completedPrereqsCount = Object.values(checkedPrereqs).filter(Boolean).length;

  const togglePrereq = (idx) => {
    setCheckedPrereqs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCompletePhase = (idx) => {
    setCompletedGuidePhases(prev => ({ ...prev, [idx]: true }));
    if (idx < deploymentSteps.length - 1) {
      setExpandedStep(idx + 1);
    }
  };

  const handleCopy = (text, id) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-700">
      
      {deploymentSteps.map((phase, idx) => {
        const isActive = expandedStep === idx;
        const isPhaseCompleted = idx === 0 ? isPhase1Complete : completedGuidePhases[idx];
        const isLocked = idx > 0 && !isPhase1Complete;
        const PhaseIcon = phase.Icon;

        if (!isActive) {
          return (
            <div
              key={idx}
              onClick={() => { if (!isLocked) setExpandedStep(idx); }}
              className={`w-full flex items-center justify-between p-4 rounded-[1.25rem] border backdrop-blur-md transition-all duration-300 ${
                isLocked ? 'bg-slate-900/30 border-white/5 opacity-40 cursor-not-allowed' :
                isPhaseCompleted ? 'bg-green-900/10 border-green-500/30 hover:border-green-500/50 hover:bg-green-900/20 cursor-pointer shadow-sm' :
                'bg-slate-800/40 border-white/10 hover:border-blue-400/40 cursor-pointer hover:bg-slate-800/60 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                  isPhaseCompleted ? 'bg-green-500/20 text-green-400' : isLocked ? 'bg-black/30 text-slate-600' : 'bg-white/5 text-slate-400'
                }`}>
                  {isPhaseCompleted ? <Check className="w-5 h-5" /> : isLocked ? <Lock className="w-5 h-5" /> : <PhaseIcon className="w-5 h-5" />}
                </div>
                <h3 className={`font-bold text-sm tracking-wide ${isPhaseCompleted ? 'text-green-100' : isLocked ? 'text-slate-500' : 'text-slate-300'}`}>
                  {phase.phase}
                </h3>
              </div>
              {isPhaseCompleted && <span className="text-[10px] font-black uppercase tracking-widest text-green-500/70 mr-2 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Done</span>}
            </div>
          );
        }

        return (
          <div key={idx} className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden animate-in zoom-in-[0.98] fade-in duration-500 my-8 ring-1 ring-white/10">
            
            <div className="px-8 py-6 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-2xl shadow-inner border border-blue-400/20">
                  <PhaseIcon className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-black text-xl md:text-2xl text-white tracking-tight">{phase.phase}</h3>
                  <p className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest mt-1">Active Phase</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <p className="text-slate-300 text-sm leading-relaxed mb-8 bg-black/30 p-5 rounded-2xl border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                {phase.text}
              </p>

              {phase.isInteractive ? (
                <div className="space-y-4 mb-8">
                  {phase.instructions.map((inst, iIdx) => {
                    const isChecked = checkedPrereqs[iIdx];

                    return (
                      <div 
                        key={iIdx} 
                        onClick={() => togglePrereq(iIdx)}
                        className={`flex items-start space-x-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${isChecked ? 'bg-green-500/10 border-green-500/30 shadow-[inset_0_0_20px_rgba(34,197,94,0.05)]' : 'bg-black/30 border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5'}`}
                      >
                        <div className="mt-0.5 shrink-0 transition-transform hover:scale-110">
                          {isChecked ? <CheckCircle2 className="w-6 h-6 text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" /> : <Circle className="w-6 h-6 text-slate-600" />}
                        </div>
                        <div className={`text-sm leading-relaxed transition-colors ${isChecked ? 'text-slate-500' : 'text-slate-300'} w-full`}>
                          {inst.prefix && <strong className={isChecked ? 'text-slate-600 block mb-1' : (inst.prefix.includes('WARNING') ? 'text-red-400 tracking-wide block mb-1' : 'text-white tracking-wide block mb-1')}>{inst.prefix}:</strong>}
                          <span className={inst.prefix && inst.prefix.includes('WARNING') ? 'text-red-200/80 font-bold' : ''}>{inst.text}</span>
                          {inst.cmd && (
                             <div className="mt-4 bg-[#05080f] rounded-xl border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden transition-colors hover:border-blue-500/50 relative">
                               <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/5">
                                 <div className="flex space-x-1.5">
                                   <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                   <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                                   <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                                 </div>
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded shadow-inner border border-white/5">Termux</span>
                               </div>
                               <div className="p-4 flex items-start justify-between group/cmd">
                                 <div className="flex items-start space-x-3 overflow-x-auto flex-1 scrollbar-none pt-0.5">
                                   <div className="flex flex-col select-none">
                                      {inst.cmd.split('\n').map((_, i) => <span key={i} className="text-slate-600 font-black text-xs leading-[1.6]">~❯</span>)}
                                   </div>
                                   <div className="flex flex-col flex-1">
                                       {inst.cmd.split('\n').map((line, i) => (
                                           <code key={i} className="text-green-400 font-mono text-xs whitespace-nowrap drop-shadow-[0_0_2px_rgba(74,222,128,0.5)] leading-[1.6]">{line}</code>
                                       ))}
                                   </div>
                                 </div>
                                 <button
                                   onClick={(e) => { e.stopPropagation(); handleCopy(inst.cmd, `guide-cmd-${idx}-${iIdx}`); }}
                                   className="p-2 ml-3 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all border border-white/5 hover:border-white/10 shrink-0 shadow-sm"
                                   title="Copy command"
                                 >
                                   {copiedId === `guide-cmd-${idx}-${iIdx}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                 </button>
                               </div>
                             </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  <div className="mt-8 p-6 bg-black/40 rounded-[1.5rem] border border-white/10 shadow-inner backdrop-blur-md">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Verification Progress</span>
                      <span className={`text-sm font-black ${isPhase1Complete ? 'text-green-400' : 'text-blue-400'}`}>{completedPrereqsCount} / {phase1PrereqsCount}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-green-400 transition-all duration-700 ease-out relative" 
                        style={{ width: `${(completedPrereqsCount / phase1PrereqsCount) * 100}%` }}
                      >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if(isPhase1Complete) {
                          setCompletedGuidePhases(p => ({...p, 0: true}));
                          setExpandedStep(1);
                          setActiveTab('installer');
                        }
                      }}
                      disabled={!isPhase1Complete}
                      className={`mt-8 w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center transition-all duration-500 ${isPhase1Complete ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.7)] hover:scale-[1.02] border border-blue-400/50' : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-transparent'}`}
                    >
                      {isPhase1Complete ? (
                        <><Unlock className="w-5 h-5 mr-2" /> Unlock Installer & Continue to Phase 2</>
                      ) : (
                        <><Lock className="w-5 h-5 mr-2" /> Complete checklist to unlock</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="space-y-4 mb-10">
                    {phase.instructions.map((inst, iIdx) => {
                      return (
                        <div key={iIdx} className="flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-2xl transition-all duration-300 hover:border-blue-400/30 group shadow-sm">
                          <div className="flex items-start">
                            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-black mr-4 shrink-0 shadow-inner group-hover:bg-blue-500/40 group-hover:scale-110 transition-all">
                              {iIdx + 1}
                            </div>
                            <div className="text-slate-300 text-sm leading-relaxed pt-1.5 w-full">
                              {inst.prefix ? (
                                <>
                                  <strong className="text-white bg-black/40 px-2.5 py-1 rounded-lg mr-2 border border-white/10 shadow-inner block md:inline-block mb-2 md:mb-0">{inst.prefix}:</strong>
                                  <span className="opacity-90">{inst.text}</span>
                                </>
                              ) : (
                                <span className="opacity-90">{inst.text}</span>
                              )}
                              
                              {inst.cmd && (
                                 <div className="mt-4 bg-[#05080f] rounded-xl border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden transition-colors hover:border-blue-500/50 relative">
                                   <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/5">
                                     <div className="flex space-x-1.5">
                                       <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                       <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                                       <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                                     </div>
                                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded shadow-inner border border-white/5">Termux CLI</span>
                                   </div>
                                   <div className="p-4 flex items-start justify-between group/cmd">
                                     <div className="flex items-start space-x-3 overflow-x-auto flex-1 scrollbar-none pt-0.5">
                                       <div className="flex flex-col select-none">
                                          {inst.cmd.split('\n').map((_, i) => <span key={i} className="text-slate-600 font-black text-xs leading-[1.6]">~❯</span>)}
                                       </div>
                                       <div className="flex flex-col flex-1">
                                           {inst.cmd.split('\n').map((line, i) => (
                                               <code key={i} className="text-green-400 font-mono text-xs whitespace-nowrap drop-shadow-[0_0_2px_rgba(74,222,128,0.5)] leading-[1.6]">{line}</code>
                                           ))}
                                       </div>
                                     </div>
                                     <button
                                       onClick={(e) => { e.stopPropagation(); handleCopy(inst.cmd, `guide-cmd-${idx}-${iIdx}`); }}
                                       className="p-2 ml-3 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all border border-white/5 hover:border-white/10 shrink-0 shadow-sm"
                                       title="Copy command"
                                     >
                                       {copiedId === `guide-cmd-${idx}-${iIdx}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                     </button>
                                   </div>
                                 </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {idx < deploymentSteps.length - 1 ? (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleCompletePhase(idx); 
                      }}
                      className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-blue-900/50 hover:to-slate-900 border border-white/10 hover:border-blue-500/50 text-white rounded-xl font-bold text-sm transition-all duration-300 flex justify-center items-center shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                    >
                      Mark Complete & Proceed to Next Phase <ArrowRight className="w-5 h-5 ml-2 opacity-70" />
                    </button>
                  ) : (
                    <div className="w-full py-5 bg-gradient-to-r from-green-900/40 to-green-800/40 border border-green-500/50 text-green-400 rounded-xl font-black text-center flex justify-center items-center shadow-[inset_0_0_20px_rgba(34,197,94,0.1)] backdrop-blur-md">
                      <CheckCircle2 className="w-6 h-6 mr-3 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" /> Architecture Deployed Successfully
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}