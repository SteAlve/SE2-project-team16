/**
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 * 
 * CONTROLLERS - the HTTP adapter. One file per resource.
 * A controller reads the request (parse* from dto/), calls one use case, chooses the status code
 * and answers (to*Dto from dto/).
 *
 * Contains: only req/res work. It receives its use cases as parameters, handed over by app.js.
 * Does not contain: SQL, business rules, the clock, imports from dao/, domain/ or usecases/
 * (ESLint enforces it). Domain errors are not caught here: the error middleware in app.js
 * maps them to 400 / 409 / 422.
 *
 * Example: story 1. Imports use the final file names, created with the first story.
 * Delete when the real files exist.
 */
import { parseIssueTicket, toTicketDto } from '../dto/ticket.js';

export const makeIssueTicketController = ({ issueTicket }) => (req, res) => {
  const { serviceId } = parseIssueTicket(req.body);
  const { ticket, waitSec } = issueTicket(serviceId);

  res.status(201).json(toTicketDto(ticket, waitSec));
};
