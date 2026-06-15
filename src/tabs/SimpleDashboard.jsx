import React, { useState } from 'react';
import { executeOperation } from '../lib/operations';
import { useExperienceMode } from '../context/ExperienceModeContext.jsx';
import AppStoreTab from './AppStoreTab.jsx';
import FleetScalingTab from './FleetScalingTab.jsx';
import DisasterRecoveryTab from './DisasterRecoveryTab.jsx';
import ReleaseWorkflowTab from './ReleaseWorkflowTab.jsx';
import SecurityPostureTab from './SecurityPostureTab.jsx';
import NocTelemetryTab from './NocTelemetryTab.jsx';
import GitOpsTab from './GitOpsTab.jsx';
import DriftCenterTab from './DriftCenterTab.jsx';
import IdentityVaultTab from './IdentityVaultTab.jsx';
import SimpleActionWizard from '../components/SimpleActionWizard.jsx';
import LiveEventPanel from '../components/LiveEventPanel.jsx';
import ControlPlaneBanner from '../components/ControlPlaneBanner.jsx';
import ModeSwitcher from '../components/ModeSwitcher.jsx';
import PageGuidance from '../components/PageGuidance.jsx';

/*
 * SimpleDashboard provides an outcome‑focused interface for the
 * "simple" experience mode.  It displays a high‑level health
 * summary and organizes common tasks into clearly labeled
 * categories (apps, devices, backups, updates, safety, support).
 * Each category renders an underlying professional tab with a
 * simplified presentation when the simpleMode prop is passed.
 */

const SIMPLE_PAGES = {
  apps: {
    label: 'Apps & Services',
    component: AppStoreTab,
  },
  updated: {
    label: 'Keep My Environment Updated',
    component: GitOpsTab,
  },
  issues: {
    label: 'Health & Issues',
    component: DriftCenterTab,
  },
  devices: {
    label: 'My Devices',
    component: FleetScalingTab,
  },
  passwords: {
    label: 'Passwords & Access',
    component: IdentityVaultTab,
  },
  backups: {
    label: 'Backups',
    component: DisasterRecoveryTab,
  },
  updates: {
    label: 'Updates',
    component: ReleaseWorkflowTab,
  },
  safety: {
    label: 'Safety Center',
    component: SecurityPostureTab,
  },
  support: {
    label: 'System Status',
    component: NocTelemetryTab,
  },
};

export default function SimpleDashboard() {
  const { setExperienceMode } = useExperienceMode();
  const [page, setPage] = useState('apps');
  const PageComponent = SIMPLE_PAGES[page].component;
  const pageToTabId = { apps: 'appstore', updated: 'gitops', issues: 'drift', devices: 'fleet', passwords: 'vault', backups: 'recovery', updates: 'release', safety: 'security', support: 'telemetry' };

  // Provide feedback on asynchronous recommendation actions.  When a user
  // triggers a one‑click operation (e.g. Update or Backup), this message
  // displays the current status or error.
  const [recMessage, setRecMessage] = useState('');

  // Common handler wrapper to execute a backend operation and update
  // the recommendation message.  It accepts the operation name and
  // contextual payload and provides user feedback.
  const runRecommendation = async (operation, context, startMessage, successMessage) => {
    setRecMessage(startMessage);
    try {
      await executeOperation(operation, context);
      setRecMessage(successMessage);
    } catch (err) {
      setRecMessage(err?.message || 'Failed to execute action');
    }
  };

  const handleUpdateAll = () => runRecommendation(
    'release_sync',
    { target: { type: 'repo', ref: 'pocket_lab_iac' }, params: { branch: 'main' } },
    'Checking for updates...',
    'Update has started. Pocket Lab will keep you posted.'
  );

  const handleBackup = () => runRecommendation(
    'backup_now',
    { target: { type: 'backup', ref: 'release' }, params: { scope: 'full' } },
    'Starting backup...',
    'Backup has started. Pocket Lab is creating a safe restore point.'
  );

  const handleAddDevice = () => runRecommendation(
    'fleet_join',
    { target: { type: 'fleet', ref: 'compute' }, params: { role: 'compute', hostname: `pocket-device-${Date.now().toString().slice(-4)}` } },
    'Preparing device...',
    'Device invite is ready. Follow the steps to add it safely.'
  );

  const handleSecurity = () => runRecommendation(
    'policy_deploy',
    { target: { type: 'repo', ref: 'security_scanners' }, params: { playbook: '40_opa.yml', source: 'security_scanners' } },
    'Running safety check...',
    'Safety check has started.'
  );

  return (
    <div className="simple-mode-shell min-h-screen bg-slate-950 text-slate-100 p-5 sm:p-6 lg:p-8">
      <ControlPlaneBanner simpleMode />

      {/* Top summary card */}
      <div className="simple-hero-card mb-8 rounded-[2rem] border border-blue-300/20 bg-blue-500/10 p-6 shadow-2xl shadow-blue-950/25 sm:p-7 lg:p-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-blue-200">Pocket Lab Simple Mode</p>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Everything looks good</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Your apps, devices, safety checks, and backups are shown in plain language. Last checked: {new Date().toLocaleString()}</p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <ModeSwitcher compact />
          <button
            type="button"
            onClick={() => setExperienceMode('professional')}
            className="pocket-button pocket-button-secondary bg-white/5 text-slate-100 hover:bg-white/10"
          >
            Switch to Professional Mode
          </button>
        </div>
      </div>

      <div className="mb-8">
        <LiveEventPanel
          simpleMode
          title="What Pocket Lab is doing now"
          description="Live progress from installs, updates, backups, device invites, safety checks, and system health appears here."
          subjectPrefixes={['pocketlab.events.', 'pocketlab.audit.']}
          maxItems={5}
        />
      </div>


      {/* Guided action wizards */}
      <div className="simple-section-card mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-950/20 sm:p-7">
        <h3 className="mb-3 text-xl font-black text-white">Quick guided actions</h3>
        <p className="mb-5 max-w-3xl text-sm leading-6 text-slate-300">Run common tasks with safe defaults. Pocket Lab handles the technical workflow behind the scenes.</p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <SimpleActionWizard
            title="Install Something"
            operation="deploy_blueprint"
            target={{ type: 'repo', ref: 'pocket_lab_iac' }}
            params={{ playbook: 'site.yml', source_type: 'repo', source: 'pocket_lab_iac' }}
          />
          <SimpleActionWizard
            title="Add Device"
            operation="fleet_join"
            target={{ type: 'fleet', ref: 'compute' }}
            params={{ role: 'compute', hostname: `pocket-device-${Date.now().toString().slice(-4)}` }}
          />
          <SimpleActionWizard
            title="Restore Something"
            operation="restore_backup"
            target={{ type: 'backup', ref: 'latest' }}
            params={{ backup_ref: 'latest' }}
          />
          <SimpleActionWizard
            title="Update Everything"
            operation="release_sync"
            target={{ type: 'repo', ref: 'pocket_lab_iac' }}
            params={{ branch: 'main' }}
          />
          <SimpleActionWizard
            title="Change Password"
            operation="rotate_secret"
            target={{ type: 'secret', ref: 'photoprism' }}
            params={{ target: 'photoprism' }}
          />
        </div>
      </div>

      {/* Recommendations section */}
      <div className="simple-section-card mb-8 rounded-[2rem] border border-indigo-300/20 bg-indigo-500/10 p-6 shadow-2xl shadow-indigo-950/20 sm:p-7">
        <h3 className="mb-4 text-xl font-black text-white">Helpful next steps</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleUpdateAll}
            className="rounded-2xl border border-indigo-300/20 bg-indigo-500/15 px-4 py-2.5 text-sm font-bold text-indigo-100 hover:bg-indigo-500/25"
          >
            Update Available
          </button>
          <button
            type="button"
            onClick={handleBackup}
            className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-100 hover:bg-emerald-500/20"
          >
            Backup Recommended
          </button>
          <button
            type="button"
            onClick={handleAddDevice}
            className="rounded-2xl border border-blue-300/20 bg-blue-500/15 px-4 py-2.5 text-sm font-bold text-blue-100 hover:bg-blue-500/25"
          >
            Add Device
          </button>
          <button
            type="button"
            onClick={handleSecurity}
            className="rounded-2xl border border-violet-300/20 bg-violet-500/15 px-4 py-2.5 text-sm font-bold text-violet-100 hover:bg-violet-500/25"
          >
            Safety Check
          </button>
        </div>
        {recMessage && <p className="mt-3 text-sm text-slate-400">{recMessage}</p>}
      </div>

      {/* Primary navigation */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Object.entries(SIMPLE_PAGES).map(([key, value]) => {
          const isActive = page === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setPage(key)}
              className={
                'flex min-h-16 items-center justify-center rounded-3xl border px-4 py-4 text-center text-sm font-black transition-all duration-200 ' +
                (isActive ? 'border-indigo-300/35 bg-indigo-500/20 text-white shadow-lg shadow-indigo-950/25' : 'border-white/10 bg-white/5 text-slate-200 hover:border-blue-300/25 hover:bg-blue-500/10 hover:text-white')
              }
            >
              {value.label}
            </button>
          );
        })}
      </div>

      {/* Current page content */}
      <div className="simple-content-card rounded-[2rem] border border-white/10 bg-slate-900/55 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-xl sm:p-6">
        <PageGuidance tabId={pageToTabId[page] || 'appstore'} className="mb-5" />
        <PageComponent simpleMode={true} />
      </div>
    </div>
  );
}
