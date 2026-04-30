import React, { useState, useEffect, useRef } from 'react';
import { CloudCog, FileJson, TerminalSquare, RefreshCw, PlayCircle, Eye, Trash2, Lock, Globe, Server, AlertTriangle, FileDiff, TestTube2, CheckCircle2 } from 'lucide-react';

const TEMPLATES = {
  nomad_basic: `job "custom-service" {
  datacenters = ["dc1"]
  type = "service"

  group "workload" {
    task "execute" {
      driver = "raw_exec"
      
      config {
        command = "bash"
        args    = ["-c", "echo 'Workload orchestrated by Nomad!' && sleep 3600"]
      }

      resources {
        cpu    = 100
        memory = 64
      }
    }
  }
}`,
  nomad_vault: `job "secure-service" {
  datacenters = ["dc1"]
  type = "service"

  group "secure-workload" {
    task "execute" {
      driver = "raw_exec"

      # 1. Authenticate with Vault using AppRole
      vault {
        policies = ["gitops-policy"]
        change_mode = "restart"
      }

      # 2. Inject Dynamic Secrets securely into Memory
      template {
        data = <<EOF
DB_USER="{{ with secret "database/creds/mariadb-role" }}{{ .Data.username }}{{ end }}"
DB_PASS="{{ with secret "database/creds/mariadb-role" }}{{ .Data.password }}{{ end }}"
EOF
        destination = "secrets/db.env"
        env         = true
      }

      config {
        command = "bash"
        args    = ["-c", "echo 'Connected securely using Vault Dynamic Leases!' && sleep 3600"]
      }
    }
  }
}`,
  ansible_playbook: `---
- name: Enterprise OS Maintenance Task
  hosts: localhost
  connection: local
  
  tasks:
    - name: Verify Android Storage Mounts
      command: df -h /data/data/com.termux
      register: disk_space

    - name: Print Storage Analytics
      debug:
        msg: "Current Storage: {{ disk_space.stdout_lines[1] }}"

    - name: Ensure Base Ubuntu PRoot Exists
      command: proot-distro install ubuntu
      ignore_errors: yes
`
};

export default function GitOpsTab() {
  const [activeTemplate, setActiveTemplate] = useState('nomad_basic');
  const [editorCode, setEditorCode] = useState(TEMPLATES.nomad_basic);
  const [engineState, setEngineState] = useState(null); 
  const [logs, setLogs] = useState('');
  const logsEndRef = useRef(null);

  const isAnsible = activeTemplate.includes('ansible');
  const filename = isAnsible ? 'maintenance.yml' : 'app.nomad';

  // HTML-PROOF ENVIRONMENT DETECTION
  const [isLiveEnv, setIsLiveEnv] = useState(false);
  useEffect(() => {
    fetch('/api/telemetry.json')
      .then(res => res.text())
      .then(text => {
        try { setIsLiveEnv(!JSON.parse(text).error); } 
        catch { setIsLiveEnv(false); }
      })
      .catch(() => setIsLiveEnv(false));
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const loadTemplate = (key) => {
    setActiveTemplate(key);
    setEditorCode(TEMPLATES[key]);
  };

  const handleExecute = async (action) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) window.navigator.vibrate(20);
    setEngineState(action);
    setLogs('');
    
    const toolName = isAnsible ? 'Ansible Semaphore' : 'HashiCorp Nomad';
    const cliCommand = isAnsible 
      ? (action === 'validate' ? 'ansible-playbook --syntax-check' : (action === 'run' ? 'ansible-playbook' : 'echo "Cannot stop a completed playbook"'))
      : (action === 'validate' ? 'nomad job validate' : (action === 'run' ? 'nomad job run' : 'nomad job stop $(grep -oP \'job "\\K[^"]+\' app.nomad)'));

    if (!isLiveEnv) {
      // SIMULATOR MODE
      setLogs(`[*] SIMULATOR: Initializing ${toolName} engine...\n`);
      setTimeout(() => setLogs(prev => prev + `[${isAnsible ? 'semaphore' : 'nomad'}] Parsing syntax definition...\n`), 500);
      
      if (action === 'validate') {
        setTimeout(() => setLogs(prev => prev + `\nValidation successful. The ${isAnsible ? 'playbook' : 'job specification'} is valid.\n`), 1500);
      } else if (action === 'run') {
        setTimeout(() => setLogs(prev => prev + `[${isAnsible ? 'semaphore' : 'nomad'}] Executing: ${cliCommand} ${filename}...\n\n[SUCCESS] Execution complete. Resources deployed and healthy.\n`), 2000);
      } else {
        setTimeout(() => setLogs(prev => prev + `[nomad] Signaling allocations to halt...\n[nomad] Job stopped successfully.\n`), 1500);
      }
      setTimeout(() => setEngineState(null), 2500);

    } else {
      // PRODUCTION MODE (LIVE DEVICE EXECUTION)
      setLogs(`[*] EDGE NODE: Transmitting execution payload to ${toolName}...\n`);
      
      const executionScript = `
mkdir -p ~/pocket_lab_iac/custom_workspace
cat << 'EOF' > ~/pocket_lab_iac/custom_workspace/${filename}
${editorCode}
EOF
cd ~/pocket_lab_iac/custom_workspace
echo "------------------------------------------------"
echo "⚙️  ${toolName.toUpperCase()}"
echo "------------------------------------------------"
${cliCommand} ${filename}
`;

      try {
        const res = await fetch('/api/action/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intent: 'sync_bash', command: executionScript })
        });
        
        // HTML-PROOF PARSING
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { throw new Error("Invalid Backend Response"); }
        
        if (!res.ok) throw new Error("API Execution Failed");
        
        setLogs(prev => prev + `\n` + data.output + `\n\n[SUCCESS] Engine execution completed.`);
      } catch (err) {
        setLogs(prev => prev + `\n[CRITICAL ERROR] Control Plane communication severed.`);
      }
      setEngineState(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 animate-in fade-in duration-700 flex flex-col xl:flex-row gap-6">
      
      {/* LEFT COLUMN: Blueprint Catalog & IDE */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Header Module */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
            <CloudCog className="w-48 h-48 text-pink-400" />
          </div>
          
          <div className="relative z-10 flex-1">
            <div className="flex items-center space-x-2 mb-4">
              {isLiveEnv ? <FileDiff className="w-5 h-5 text-pink-400" /> : <TestTube2 className="w-5 h-5 text-orange-400" />}
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{isLiveEnv ? 'Enterprise Orchestration (Live)' : 'Simulator Sandbox'}</h3>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight mb-2">Orchestration IDE</h2>
            <p className="text-slate-400 text-sm max-w-lg">Manage edge resources via Nomad Job Specifications (HCL) and Ansible Playbooks (YAML). Leverage real-time orchestration and audited automations across your enterprise edge.</p>
          </div>
        </div>

        {/* Blueprint Catalog */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <button onClick={() => loadTemplate('nomad_basic')} className={`p-5 rounded-2xl border text-left transition-all ${activeTemplate === 'nomad_basic' ? 'bg-slate-800 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'bg-[#05080f] border-white/5 hover:border-white/20'}`}>
            <Server className={`w-6 h-6 mb-3 ${activeTemplate === 'nomad_basic' ? 'text-pink-400' : 'text-slate-500'}`} />
            <h4 className="font-bold text-white mb-1">Nomad Service Job</h4>
            <p className="text-xs text-slate-400">Deploy long-running background tasks with resource limits.</p>
          </button>
          
          <button onClick={() => loadTemplate('nomad_vault')} className={`p-5 rounded-2xl border text-left transition-all ${activeTemplate === 'nomad_vault' ? 'bg-slate-800 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'bg-[#05080f] border-white/5 hover:border-white/20'}`}>
            <Lock className={`w-6 h-6 mb-3 ${activeTemplate === 'nomad_vault' ? 'text-pink-400' : 'text-slate-500'}`} />
            <h4 className="font-bold text-white mb-1">Nomad Vault Secrets</h4>
            <p className="text-xs text-slate-400">Native integration for dynamic credential injection.</p>
          </button>

          <button onClick={() => loadTemplate('ansible_playbook')} className={`p-5 rounded-2xl border text-left transition-all ${activeTemplate === 'ansible_playbook' ? 'bg-slate-800 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'bg-[#05080f] border-white/5 hover:border-white/20'}`}>
            <Globe className={`w-6 h-6 mb-3 ${activeTemplate === 'ansible_playbook' ? 'text-pink-400' : 'text-slate-500'}`} />
            <h4 className="font-bold text-white mb-1">Ansible Playbook</h4>
            <p className="text-xs text-slate-400">Automate host-level maintenance and configuration.</p>
          </button>
        </div>

        {/* Code Editor */}
        <div className="bg-[#05080f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col flex-1 min-h-[400px] relative z-10">
          <div className="bg-slate-900/80 px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileJson className={`w-4 h-4 ${isAnsible ? 'text-blue-400' : 'text-pink-400'}`} />
              <span className="text-sm font-bold text-slate-300">{filename}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-black/40 px-2 py-1 rounded">
              {isAnsible ? 'YAML Playbook Editor' : 'HCL Syntax Editor'}
            </span>
          </div>
          
          <textarea
            value={editorCode}
            onChange={(e) => setEditorCode(e.target.value)}
            className={`flex-1 w-full bg-black/50 ${isAnsible ? 'text-blue-200/90' : 'text-pink-200/90'} font-mono text-sm p-6 focus:outline-none resize-none leading-relaxed scrollbar-thin scrollbar-thumb-slate-700`}
            spellCheck="false"
            placeholder="# Write your configuration here..."
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Execution Actions & Terminal */}
      <div className="w-full xl:w-[450px] flex flex-col gap-6 shrink-0 z-10">
        
        {/* Action Buttons */}
        <div className="bg-[#05080f] border border-white/10 rounded-3xl p-6 flex flex-col gap-3 shadow-xl">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center">
             <AlertTriangle className="w-4 h-4 mr-2" /> Orchestration Controls
          </h3>
          
          <button 
            onClick={() => handleExecute('validate')}
            disabled={engineState !== null}
            className="w-full py-4 px-4 rounded-xl font-bold flex items-center justify-center transition-all bg-blue-900/40 hover:bg-blue-600 border border-blue-500/30 text-blue-200 hover:text-white disabled:opacity-50"
          >
            {engineState === 'validate' ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Eye className="w-5 h-5 mr-2" />} 
            Validate Syntax
          </button>
          
          <button 
            onClick={() => handleExecute('run')}
            disabled={engineState !== null}
            className="w-full py-4 px-4 rounded-xl font-bold flex items-center justify-center transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            {engineState === 'run' ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <PlayCircle className="w-5 h-5 mr-2" />} 
            {isAnsible ? 'Execute Playbook' : 'Submit Nomad Job'}
          </button>

          {!isAnsible && (
            <button 
              onClick={() => handleExecute('stop')}
              disabled={engineState !== null}
              className="w-full py-4 px-4 rounded-xl font-bold flex items-center justify-center transition-all bg-red-900/20 hover:bg-red-900/50 border border-red-500/20 text-red-400 disabled:opacity-50 mt-2"
            >
              {engineState === 'stop' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} 
              Stop Allocation
            </button>
          )}
        </div>

        {/* Terminal Execution Stream */}
        <div className="bg-[#020617] border border-slate-700 rounded-3xl overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] flex flex-col flex-1 min-h-[400px]">
           <div className="bg-black/80 px-4 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TerminalSquare className={`w-4 h-4 ${isAnsible ? 'text-blue-400' : 'text-pink-400'}`} />
                <span className="text-sm font-bold text-slate-300">Engine Stream</span>
              </div>
              <div className="flex space-x-1.5"><div className="w-2 h-2 rounded-full bg-slate-600"></div><div className="w-2 h-2 rounded-full bg-slate-600"></div><div className="w-2 h-2 rounded-full bg-slate-600"></div></div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-5 font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-pink-100/80 scrollbar-thin scrollbar-thumb-slate-700">
             {logs ? (
               <div className="animate-in fade-in">
                 {logs}
                 <div ref={logsEndRef} />
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <CloudCog className="w-12 h-12 mb-3" />
                  <p>Awaiting declarative<br/>state configurations...</p>
               </div>
             )}
           </div>
           
           <div className="bg-black/80 px-4 py-2 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${engineState ? 'bg-pink-500 animate-pulse' : (isLiveEnv ? 'bg-emerald-500' : 'bg-yellow-500')}`}></span>
                <span>{engineState ? `Running ${engineState.toUpperCase()}` : (isLiveEnv ? 'Live Engine Ready' : 'Simulator Idle')}</span>
              </div>
              <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> {isAnsible ? 'Ansible Mode' : 'Nomad Mode'}</span>
           </div>
        </div>

      </div>
    </div>
  );
}