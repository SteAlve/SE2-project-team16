/**
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 *
 * HOOKS - the state and data logic of the screens. One hook for each thing a screen needs.
 *
 * Contains: calls to api/, loading and error state, polling, the steps behind a button. They
 * return plain values and functions, ready for a page to hand to the components.
 * Does not contain: JSX, markup, styles, fetch, imports from components/ or pages/ (ESLint
 * enforces it).
 * Why: a page stays readable and the logic can be tested without drawing anything.
 *
 * Example: story 6 (services with queue and wait, refreshed every few seconds) and story 1
 * (take a ticket). Imports use the final file names, created with the first story.
 * Delete when the real files exist (usePolling.js, useServices.js, useIssueTicket.js).
 */
import { useEffect, useState } from 'react';
import { getServices } from '../api/services.js';
import { issueTicket } from '../api/tickets.js';

// --- usePolling.js ---

/** Calls `load` now and then every `intervalMs`. `load` must be a stable function. */
export function usePolling(load, intervalMs) {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  useEffect(() => {
    let active = true;
    const tick = () =>
      load().then(
        (data) => active && setState({ data, error: null, loading: false }),
        (error) => active && setState((old) => ({ ...old, error, loading: false })),
      );
    tick();
    const timer = setInterval(tick, intervalMs);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [load, intervalMs]);

  return state;
}

// --- useServices.js ---

export const useServices = () => usePolling(getServices, 3000);

// --- useIssueTicket.js ---

export function useIssueTicket() {
  const [state, setState] = useState({ ticket: null, error: null });

  const issue = (serviceId) =>
    issueTicket(serviceId).then(
      (ticket) => setState({ ticket, error: null }),
      (error) => setState({ ticket: null, error }),
    );

  return { ...state, issue };
}
