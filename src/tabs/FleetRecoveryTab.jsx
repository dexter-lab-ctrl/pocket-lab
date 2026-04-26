import React, { useState } from 'react';
import { Database, Shield, Download, Upload, Server, PlayCircle, CheckCircle, RefreshCw, CalendarClock, Clock, XOctagon } from 'lucide-react';

export default function FleetRecoveryTab() {
  const [mode, setMode] = useState('fleet');
  const [drType, setDrType] = useState('backup'); // 'backup', 'restore', 'automate'
  const [restoreFile, setRestoreFile] = useState('');
  const [taskStatus, setTaskStatus] = useState(null); 
  
  // Cron Scheduler State
  const [cronTime, setCronTime] = useState('03:00');
  const [cronFreq, setCronFreq] = useState('daily');

  // ⚠️ CRITICAL: Change YourUsername/pocket-lab to your actual GitHub repository!
  const fleetScript = `curl -sL https://raw.githubusercontent.com/YourUsername/pocket-lab/main/bootstrap.sh | bash`;

  const runTask = async (taskName) => {
    setTaskStatus(taskName); // 'dr_backup', 'dr_restore', 'dr_automate', 'dr_clear_cron'
    let scriptToRun = "";

    if (taskName === 'dr_backup') {
      scriptToRun = `#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="~/pocket_lab_backups"
mkdir -p $BACKUP_DIR
WORKLOADS=("photoprism" "mysqld" "postgres" "nginx" "apache2" "redis-server" "node" "python3")
for app in "\${WORKLOADS[@]}"; do
    if pgrep -x "$app" > /dev/null; then pkill -15 "$app"; sleep 2; pkill -9 "$app" 2>/dev/null; fi
done
sync
proot-distro backup ubuntu --output $BACKUP_DIR/ubuntu_snapshot_$TIMESTAMP.tar.gz
bash ~/start_dashboard.sh`;

    } else if (taskName === 'dr_restore') {
      if(!restoreFile) { alert("Please enter a filename!"); setTaskStatus(null); return; }
      scriptToRun = `#!/bin/bash
BACKUP_FILE="~/pocket_lab_backups/${restoreFile}"
if [ ! -f $BACKUP_FILE ]; then echo "❌ Error: File not found."; exit 1; fi
proot-distro remove ubuntu
proot-distro restore $BACKUP_FILE
bash ~/start_dashboard.sh`;

    } else if (taskName === 'dr_automate') {
      // Translate UI selections into standard Linux Cron Expression
      const [hour, minute] = cronTime.split(':');
      const dayOfWeek = cronFreq === 'weekly' ? '0' : '*'; // 0 is Sunday
      const cronExpression = `${minute} ${hour} * * ${dayOfWeek}`;

      scriptToRun = `#!/bin/bash
# 1. Install and start the Cron Daemon
pkg install cronie -y > /dev/null 2>&1
pgrep crond > /dev/null || crond

# 2. Write the automated backup script to disk
mkdir -p ~/pocket_lab_scripts
cat << 'EOF' > ~/pocket_lab_scripts/auto_backup.sh
#!/bin/bash
TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="~/pocket_lab_backups"
mkdir -p \$BACKUP_DIR
WORKLOADS=("photoprism" "mysqld" "postgres" "nginx" "apache2" "redis-server" "node" "python3")
for app in "\${WORKLOADS[@]}"; do
    if pgrep -x "\$app" > /dev/null; then pkill -15 "\$app"; sleep 2; pkill -9 "\$app" 2>/dev/null; fi
done
sync
proot-distro backup ubuntu --output \$BACKUP_DIR/ubuntu_snapshot_\$TIMESTAMP.tar.gz
bash ~/start_dashboard.sh
EOF

chmod +x ~/pocket_lab_scripts/auto_backup.sh

# 3. Register with Crontab
crontab -l 2>/dev/null | grep -v 'auto_backup.sh' > ~/mycron || true
echo "${cronExpression} bash ~/pocket_lab_scripts/auto_backup.sh >> ~/pocket_lab_logs/auto_backup.log 2>&1" >> ~/mycron
crontab ~/mycron
rm ~/mycron
`;

    } else if (taskName === 'dr_clear_cron') {
      scriptToRun = `#!/bin/bash
crontab -l 2>/dev/null | grep -v 'auto_backup.sh' > ~/mycron || true
crontab ~/mycron
rm ~/mycron`;
    }

    try {
      await fetch('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'run_bash', task_name: taskName, script: scriptToRun })
      });
      setTaskStatus('success');
      setTimeout(() => setTaskStatus(null), 3000);
    } catch (err) {
      alert("API Error: Tailscale connection lost.");
      setTaskStatus(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 p-4 relative z-10">

      {/* Mode Selectors */}
      <div className="flex bg-black/40 rounded-2xl p-1.5 mb-8 w-fit mx-auto border border-white/10 shadow-inner">
         <button onClick={() => setMode('fleet')} className={`px-6 py-3 rounded-xl text-sm font-bold flex transition-all ${mode === 'fleet' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Fleet Scaling</button>
         <button onClick={() => setMode('dr')} className={`px-6 py-3 rounded-xl text-sm font-bold flex transition-all ${mode === 'dr' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Disaster Recovery</button>
      </div>

      {/* Header Block */}
      <div className="bg-slate-900/40 border border-white/10 p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl mb-8">
        <div className="flex items-start space-x-5">
          <div className={`p-4 rounded-2xl shadow-inner ${mode === 'fleet' ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-emerald-500/20 border border-emerald-500/30'}`}>
            {mode === 'fleet' ? <Shield className="w-8 h-8 text-indigo-400" /> : <Database className="w-8 h-8 text-emerald-400" />}
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{mode === 'fleet' ? 'Zero-Touch Provisioning' : 'Snapshot & Restore'}</h3>
            <p className="text-slate-400 mt-2 text-sm">{mode === 'fleet' ? 'Deploy additional nodes to your edge cluster.' : 'Protect your data with full subsystem backups.'}</p>
          </div>
        </div>
        
        {/* Disaster Recovery Sub-Nav */}
        {mode === 'dr' && (
          <div className="flex bg-black/40 rounded-2xl p-1.5 shadow-inner border border-white/5 overflow-x-auto">
            <button onClick={() => setDrType('backup')} className={`px-4 py-3 rounded-xl text-xs font-bold flex transition-all whitespace-nowrap ${drType === 'backup' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Download className="w-4 h-4 mr-2" /> Backup</button>
            <button onClick={() => setDrType('restore')} className={`px-4 py-3 rounded-xl text-xs font-bold flex transition-all whitespace-nowrap ${drType === 'restore' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Upload className="w-4 h-4 mr-2" /> Restore</button>
            <button onClick={() => setDrType('automate')} className={`px-4 py-3 rounded-xl text-xs font-bold flex transition-all whitespace-nowrap ${drType === 'automate' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}><CalendarClock className="w-4 h-4 mr-2" /> Automate</button>
          </div>
        )}
      </div>
      
      {/* Fleet Script UI */}
      {mode === 'fleet' ? (
        <div className="relative group">
          <pre className="bg-black/50 p-6 rounded-2xl border border-white/10 text-sm font-mono text-green-400 overflow-x-auto shadow-inner">
            <code>{fleetScript}</code>
          </pre>
        </div>
      ) : (
        <div className="bg-[#05080f] border border-emerald-500/20 rounded-3xl p-8 shadow-lg text-center relative overflow-hidden">
          
          {drType === 'automate' && <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>}

          {/* DYNAMIC CONTENT SWITCHER */}
          {drType === 'backup' && (
            <>
              <Server className="w-16 h-16 text-emerald-500/40 mx-auto mb-6" />
              <h4 className="text-xl font-bold text-white mb-2">Manual Snapshot</h4>
              <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">This will safely pause your active workloads and compress the entire Ubuntu subsystem into an archive file.</p>
              
              <button onClick={() => runTask('dr_backup')} disabled={!!taskStatus} className="w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center mx-auto">
                {taskStatus === 'dr_backup' ? <><RefreshCw className="w-5 h-5 mr-3 animate-spin" /> Compressing System...</> : taskStatus === 'success' ? <><CheckCircle className="w-5 h-5 mr-3" /> Sent to Engine</> : <><PlayCircle className="w-5 h-5 mr-3" /> Initialize Backup Sequence</>}
              </button>
            </>
          )}

          {drType === 'restore' && (
             <>
              <Server className="w-16 h-16 text-emerald-500/40 mx-auto mb-6" />
              <h4 className="text-xl font-bold text-white mb-2">Subsystem Restoration</h4>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">Enter the exact filename of your backup archive (e.g., <code className="bg-white/10 px-1 rounded">ubuntu_snapshot_2024.tar.gz</code>).</p>
              
              <div className="max-w-md mx-auto mb-6">
                <input type="text" value={restoreFile} onChange={(e) => setRestoreFile(e.target.value)} placeholder="Filename..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>

              <button onClick={() => runTask('dr_restore')} disabled={!!taskStatus} className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center mx-auto">
                {taskStatus === 'dr_restore' ? <><RefreshCw className="w-5 h-5 mr-3 animate-spin" /> Wiping & Restoring...</> : taskStatus === 'success' ? <><CheckCircle className="w-5 h-5 mr-3" /> Sent to Engine</> : <><Upload className="w-5 h-5 mr-3" /> DESTROY & RESTORE SYSTEM</>}
              </button>
             </>
          )}

          {drType === 'automate' && (
             <>
              <CalendarClock className="w-16 h-16 text-emerald-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <h4 className="text-2xl font-black text-white mb-2">Visual Cron Scheduler</h4>
              <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">Set a recurring schedule. The API will inject a <code className="text-emerald-400">crontab</code> job into Termux to execute the snapshot automatically.</p>
              
              {/* Scheduling UI */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
                <div className="bg-slate-900 border border-white/10 rounded-xl p-2 flex items-center shadow-inner">
                   <Clock className="w-5 h-5 text-slate-500 ml-2 mr-3" />
                   <input type="time" value={cronTime} onChange={(e) => setCronTime(e.target.value)} className="bg-transparent text-white font-bold text-lg focus:outline-none cursor-pointer" />
                </div>
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">AND RUN IT</span>
                <div className="bg-slate-900 border border-white/10 rounded-xl p-2 flex items-center shadow-inner">
                   <select value={cronFreq} onChange={(e) => setCronFreq(e.target.value)} className="bg-transparent text-white font-bold text-lg focus:outline-none cursor-pointer appearance-none px-4">
                     <option value="daily">Every Day</option>
                     <option value="weekly">Weekly (Sundays)</option>
                   </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-4">
                <button onClick={() => runTask('dr_automate')} disabled={!!taskStatus} className="w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center">
                  {taskStatus === 'dr_automate' ? <><RefreshCw className="w-5 h-5 mr-3 animate-spin" /> Configuring Daemon...</> : taskStatus === 'success' ? <><CheckCircle className="w-5 h-5 mr-3" /> Cron Job Registered</> : <><CalendarClock className="w-5 h-5 mr-3" /> Save Automation Rule</>}
                </button>
                <button onClick={() => runTask('dr_clear_cron')} disabled={!!taskStatus} className="w-full md:w-auto px-6 py-4 bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 border border-slate-700 font-bold rounded-xl transition-all flex items-center justify-center">
                  {taskStatus === 'dr_clear_cron' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><XOctagon className="w-4 h-4 mr-2" /> Clear Active Schedule</>}
                </button>
              </div>
             </>
          )}

          <p className="text-slate-500 text-xs mt-8">⚠️ You can view your active Cron Rules in the <strong>Control Center</strong> tab.</p>
        </div>
      )}

    </div>
  );
}