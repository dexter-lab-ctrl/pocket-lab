import { useState, useEffect } from 'react';

/**
 * useTelemetry (Enterprise Edition)
 * * Logic:
 * 1. Initializes state from localStorage (Persistent Offline State).
 * 2. Polls the API every 5 seconds.
 * 3. HTML-PROOF: Safely parses response to bypass Vite's SPA fallback.
 * 4. FAST FAILING: Uses AbortController to kill requests that hang longer than 2.5s.
 */
export function useTelemetry() {
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
    const endpoint = '/api/telemetry.json';

    const fetchTelemetry = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      try {
        const res = await fetch(endpoint, { 
          cache: 'no-store',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // HTML-PROOF PARSING
        const text = await res.text();
        let data;
        try { 
          data = JSON.parse(text); 
        } catch { 
          throw new Error("Invalid Format"); 
        }

        if (data.error || !res.ok) throw new Error('Hardware link offline');
        
        setLiveData(data);
        setIsConnected(true);
        localStorage.setItem('pocket_telemetry', JSON.stringify(data));
        
      } catch (err) {
        clearTimeout(timeoutId);
        setIsConnected(false);
      }
    };

    fetchTelemetry();
    const intervalId = setInterval(fetchTelemetry, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return { liveData, isConnected };
}