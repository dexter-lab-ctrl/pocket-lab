import { useState, useEffect } from 'react';

/**
 * useTelemetry
 * * Logic:
 * 1. Initializes state from localStorage (Persistent Offline State).
 * 2. Polls the Tailscale-proxied Termux API every 5 seconds.
 * 3. On success: Updates state and persists to localStorage.
 * 4. On failure: Keeps last known state but sets isConnected to false.
 */
export function useTelemetry() {
  // 1. Initialize from Cache (Last Known State)
  const [liveData, setLiveData] = useState(() => {
    try {
      const cached = localStorage.getItem('pocket_telemetry');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Relative path works because PWA and API share the same Tailscale domain
    const endpoint = '/api/telemetry.json';

    const fetchTelemetry = async () => {
      try {
        // We use { cache: 'no-store' } to ensure we aren't getting 
        // a stale version from the PWA's own Service Worker.
        const res = await fetch(endpoint, { 
          cache: 'no-store',
          headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error('Hardware link offline');
        
        const data = await res.json();
        
        // 2. Success: Update State & Cache
        setLiveData(data);
        setIsConnected(true);
        localStorage.setItem('pocket_telemetry', JSON.stringify(data));
        
      } catch (err) {
        // 3. Fail: Keep old data but flag as disconnected
        setIsConnected(false);
      }
    };

    // Initial trigger
    fetchTelemetry();
    
    // Poll loop (matching the 5m Warden cycle with a 5s UI refresh)
    const intervalId = setInterval(fetchTelemetry, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  return { liveData, isConnected };
}