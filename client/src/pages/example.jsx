/**
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 *
 * PAGES - one screen per route: Kiosk, Officer, Board, Manager, Admin. Each one is used by an
 * actor on a specific device, and holds the stories that belong together on that screen.
 *
 * Contains: it calls the hooks it needs, puts components on the screen, and decides what to show
 * while loading, on error, and when the data arrives.
 * Does not contain: fetch or api/ (ESLint enforces it: go through hooks/), business rules, long
 * markup (make a component).
 * Why: a page reads like a description of the screen.
 *
 * Example: the kiosk (stories 1 and 6). Imports use the final file names, created with the first
 * story. Delete when the real files exist.
 */
import { useServices } from '../hooks/useServices.js';
import { useIssueTicket } from '../hooks/useIssueTicket.js';
import { ServiceCard } from '../components/ServiceCard.jsx';

export function KioskPage() {
  const { data: services, error, loading } = useServices();
  const { ticket, error: issueError, issue } = useIssueTicket();

  if (ticket) {
    return <p>Your ticket: {ticket.code}</p>;
  }
  if (loading) {
    return <p>Loading...</p>;
  }
  if (error && !services) {
    return <p>Cannot reach the server.</p>;
  }

  return (
    <main>
      {issueError && <p role="alert">{issueError.message}</p>}
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} onSelect={issue} />
      ))}
    </main>
  );
}
