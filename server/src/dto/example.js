/**
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 * 
 * 
 * DTO - the shape of the data crossing the HTTP boundary. One file per resource.
 *   parseXxx(body)  validates the request body and throws a ValidationError (-> 400) when it is wrong.
 *   toXxxDto(obj)   turns a plain object from the use case into the API shape.
 *
 * Contains: plain functions on plain values, shared by every controller that needs them.
 * Does not contain: req/res, SQL, business rules, imports from other layers, except the error
 * classes in domain/errors.js (ESLint enforces it).
 *
 * Example: tickets. Imports use the final file names, created with the first story.
 * Delete when the real files exist.
 */
import { ValidationError } from '../domain/errors.js';

export function parseIssueTicket(body) {
  const serviceId = Number(body?.serviceId);
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    throw new ValidationError('serviceId must be a positive integer');
  }
  return { serviceId };
}

export function toTicketDto(ticket, waitSec) {
  return {
    code: `${ticket.tag}-${String(ticket.number).padStart(3, '0')}`, // e.g. SHIP-007
    estimatedWaitSec: waitSec,
  };
}
