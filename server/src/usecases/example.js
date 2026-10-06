/**
 * 
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 * 
 * USE CASES - one function per operation of the system, roughly one per story.
 *
 * Contains: the steps of an operation: read through the dao, apply the rules of domain/, write
 * through the dao. It receives everything it needs as parameters (dao modules, clock, transaction
 * helper), handed over by app.js. It throws domain errors, never HTTP errors.
 * Does not contain: req/res, status codes, DTOs, SQL, Date (use the injected clock), imports
 * from any layer except domain/ (ESLint enforces it).
 * Why: it is tested with hand-written fake objects, with no database and no HTTP.
 *
 * The parameters are the "ports": the shape the use case expects, e.g. tickets.insert(serviceId, day).
 * The real dao modules already have that shape.
 *
 * Example: story 1. Imports use the final file names, created with the first story.
 * Delete when the real files exist.
 */
import { waitTimeSec } from '../domain/waitTime.js';
import { UnprocessableError } from '../domain/errors.js';

export function makeIssueTicket({ tickets, counters, clock }) {
  return function issueTicket(serviceId) {
    const day = clock.today();

    const ks = counters.kOfCountersServing(serviceId);
    if (ks.length === 0) {
      throw new UnprocessableError('No counter serves this service');
    }

    const ticket = tickets.insert(serviceId, day);
    const ahead = tickets.countAhead(ticket, day);
    return { ticket, waitSec: waitTimeSec(ticket.serviceTime, ahead, ks) };
  };
}
