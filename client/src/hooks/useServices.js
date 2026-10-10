import { useCallback, useEffect, useState } from 'react';
import { getServices } from '../api/services.js';

/**
 * Loads the list of services once on mount.
 * An empty list is a valid answer (no service configured), not an error.
 * `reload` repeats the request, e.g. after a server error.
 */
export function useServices() {
  const [state, setState] = useState({ services: [], loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getServices().then(
      (services) => {
        if (!active) return;
        if (Array.isArray(services)) {
          setState({ services, loading: false, error: null });
        } else {
          setState({ services: [], loading: false, error: new Error('Invalid services response') });
        }
      },
      (error) => active && setState({ services: [], loading: false, error }),
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setState((old) => ({ ...old, loading: true, error: null }));
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload };
}
