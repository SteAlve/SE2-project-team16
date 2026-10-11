import { useCallback, useEffect, useRef, useState } from 'react';
import { issueTicket } from '../api/tickets.js';

/**
 * Issues a ticket for `serviceId` once, on mount. Pass a falsy serviceId to skip the request.
 * The pending request is kept in a ref, so the double effect run of StrictMode does not
 * issue two tickets. `retry` sends a new request, e.g. after a server error.
 */
export function useIssueTicket(serviceId) {
  const [state, setState] = useState({ ticket: null, loading: Boolean(serviceId), error: null });
  const [attempt, setAttempt] = useState(0);
  const pending = useRef(null);

  useEffect(() => {
    if (!serviceId) return;
    let active = true;
    if (pending.current?.serviceId !== serviceId)
      pending.current = { serviceId, promise: issueTicket(serviceId) };
    pending.current.promise.then(
      (ticket) => active && setState({ ticket, loading: false, error: null }),
      (error) => active && setState({ ticket: null, loading: false, error }),
    );
    return () => {
      active = false;
    };
  }, [serviceId, attempt]);

  const retry = useCallback(() => {
    pending.current = null;
    setState({ ticket: null, loading: true, error: null });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}
