import React, { useState, useEffect } from 'react';
import { CloudDownload, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

// Change this to your actual GitHub username and repo
const GITHUB_REPO = 'dexter-lab-ctrl/pocket-lab';
const CURRENT_VERSION = 'v1.0.0'; // Update this manually in your code for each release

export default function OTAUpdater() {
  const [latestRelease, setLatestRelease] = useState(null);
  const [status, setStatus] = useState('checking'); // checking, up-to-date, available, updating, complete

  useEffect(() => {
    // 1. Check GitHub API for the latest release
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
      .then(res => res.json())
      .then(data => {
        if (data.tag_name && data.tag_name !== CURRENT_VERSION) {
          setLatestRelease(data);
          setStatus('available');
        } else {
          setStatus('up-to-date');
        }
      })
      .catch(() => setStatus('error'));
  }, []);

  const triggerUpdate = async () => {
    setStatus('updating');
    try {
      // 2. Send the OTA intent to our local Python Command Bridge
      const res = await fetch('/api/action/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'ota_update', downloadUrl: latestRelease.assets[0].browser_download_url })
      });

      if (res.ok) {
        // Wait 10 seconds for bash to unzip and restart services, then force reload
        setTimeout(() => window.location.reload(true), 10000);
      }
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'checking' || status === 'up-to-date') return null;

  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between mb-8 shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-500/20 rounded-full animate-pulse">
          <CloudDownload className="text-blue-400 w-6 h-6" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">System Update Available</h3>
          <p className="text-blue-200 text-sm">Version {latestRelease?.tag_name} is ready to install. (Current: {CURRENT_VERSION})</p>
        </div>
      </div>
      
      <button 
        onClick={triggerUpdate}
        disabled={status === 'updating'}
        className={`mt-4 md:mt-0 px-6 py-3 rounded-xl font-bold flex items-center transition-all ${
          status === 'updating' ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
        }`}
      >
        {status === 'updating' ? (
          <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Applying OTA...</>
        ) : (
          <><CloudDownload className="w-5 h-5 mr-2" /> One-Click Update</>
        )}
      </button>
    </div>
  );
}