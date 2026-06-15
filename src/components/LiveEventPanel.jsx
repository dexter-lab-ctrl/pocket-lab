import React, { useEffect, useRef, useState } from 'react';
import { Activity, CheckCircle2, Radio, RefreshCw, ShieldAlert, WifiOff } from 'lucide-react';
import { usePocketLabEvents } from '../hooks/usePocketLabEvents';
import { eventTone, formatEventTime, friendlyEvent } from '../lib/pocketLabEvents';
import { animatedEventClass, animatedEventStatus, eventIdentity } from '../lib/eventMotion.js';
import { ProgressiveDisclosure, StandardList, StandardListItem, StateSurface, StatusBadge } from './ui.jsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

function EventIcon({ tone }) {
  if (tone === 'success') return <CheckCircle2 className="h-4 w-4" />;
  if (tone === 'warning' || tone === 'danger') return <ShieldAlert className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
}

export default function LiveEventPanel({
  title,
  description,
  simpleMode = false,
  subjectPrefixes = [],
  operations = [],
  jobId = '',
  maxItems = 5,
  compact = false,
}) {
  const online = useOnlineStatus();
  const { events, connection, isLive, refreshEvents, clearEvents } = usePocketLabEvents({
    subjectPrefixes,
    operations,
    jobId,
    limit: Math.max(maxItems, 10),
  });

  const [pulseKeys, setPulseKeys] = useState(() => new Set());
  const previousKeysRef = useRef(new Set());
  const visibleEvents = events.slice(0, maxItems);

  useEffect(() => {
    const keys = new Set(visibleEvents.map(eventIdentity));
    const newKeys = [...keys].filter((key) => !previousKeysRef.current.has(key));
    if (newKeys.length > 0 && previousKeysRef.current.size > 0) {
      setPulseKeys((current) => new Set([...current, ...newKeys]));
      const timeout = window.setTimeout(() => {
        setPulseKeys((current) => {
          const next = new Set(current);
          newKeys.forEach((key) => next.delete(key));
          return next;
        });
      }, 320);
      previousKeysRef.current = keys;
      return () => window.clearTimeout(timeout);
    }
    previousKeysRef.current = keys;
    return undefined;
  }, [visibleEvents]);
  const liveLabel = !online ? (simpleMode ? 'Offline' : 'Browser offline') : isLive ? (simpleMode ? 'Live updates on' : 'WebSocket live') : (connection.mode === 'polling' ? (simpleMode ? 'Checking periodically' : 'Polling fallback') : (simpleMode ? 'Connecting updates' : connection.state));

  return (
    <div className={`rounded-3xl border border-white/10 bg-black/20 shadow-xl ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/80">{simpleMode ? 'Live progress' : 'Event stream'}</p>
          <h3 className="mt-1 text-lg font-black text-white">{title || (simpleMode ? 'Recent Pocket Lab activity' : 'Live Pocket Lab events')}</h3>
          {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={!online ? 'offline' : isLive ? 'healthy' : 'degraded'} simpleMode={simpleMode} className="gap-2 py-2">
            {isLive && online ? <Radio className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {liveLabel}
          </StatusBadge>
          <button type="button" onClick={refreshEvents} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">
            <RefreshCw className="h-4 w-4" />
            {simpleMode ? 'Refresh' : 'Replay recent'}
          </button>
          {!simpleMode && (
            <button type="button" onClick={clearEvents} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {!online ? (
          <StateSurface
            tone="offline"
            title={simpleMode ? 'You are offline' : 'Browser offline'}
            description={simpleMode ? 'Pocket Lab will show recent information where possible. Actions that change your environment are paused until your connection returns.' : 'Live event streaming is unavailable while the browser is offline. Cached or recently replayed events may still be visible.'}
          />
        ) : visibleEvents.length === 0 ? (
          <StateSurface
            tone={connection.mode === 'polling' ? 'degraded' : 'empty'}
            title={simpleMode ? 'No recent activity yet' : 'No matching events received yet'}
            description={simpleMode ? 'Start an install, update, backup, device invite, or safety check and progress will appear here.' : 'Waiting for /ws/events or /api/events/recent. If the stream is degraded, Pocket Lab will continue checking periodically.'}
          />
        ) : (
          <StandardList>
            {visibleEvents.map((event) => {
              const tone = eventTone(event);
              const label = friendlyEvent(event, simpleMode);
              const fallbackStatus = tone === 'success' ? 'succeeded' : tone === 'warning' ? 'degraded' : tone === 'danger' ? 'failed' : 'running';
              const eventId = eventIdentity(event);
              const status = animatedEventStatus(event, fallbackStatus);
              return (
                <StandardListItem
                  key={eventId}
                  icon={() => <EventIcon tone={tone} />}
                  title={label.title}
                  description={label.detail}
                  status={status}
                  simpleMode={simpleMode}
                  className={`${animatedEventClass(event, pulseKeys.has(eventId))} ${pulseKeys.has(eventId) && String(event.subject || event.type || '').includes('operation.log') ? 'log-stream-row-new' : ''}`}
                  metadata={[{ label: 'Time', value: formatEventTime(event) }]}
                >
                  {!simpleMode && (
                    <ProgressiveDisclosure title="Technical event details">
                      <div className="space-y-2">
                        <div>Subject: <span className="break-all font-mono">{event.subject || event.type}</span></div>
                        <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-black/25 p-3 text-[11px] text-slate-300">{JSON.stringify(event, null, 2)}</pre>
                      </div>
                    </ProgressiveDisclosure>
                  )}
                </StandardListItem>
              );
            })}
          </StandardList>
        )}
      </div>
    </div>
  );
}
