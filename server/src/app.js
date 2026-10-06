/**
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT AND CHECK IT.
 * 
 * APP - the composition root: the only file that knows every other piece.
 * PLACEHOLDER with the wiring of story 1: extend it as the stories arrive.
 *
 * What it does, in this order
 *  1. Picks the concrete pieces: dao modules, clock, transaction helper.
 *  2. Builds the use cases, handing them those pieces (dependency injection).
 *  3. Builds the controllers, handing them the use cases.
 *  4. Builds the routers, handing them the controllers, and mounts them under /api.
 *  5. Adds the error middleware: domain errors -> 400 / 409 / 422, anything else -> 500.
 *
 * Why here: every other layer receives what it needs as parameters, so none of them imports a
 * layer outside of it (ESLint enforces it). Joining the real pieces together is this file's job only.
 * Tests can build the same chain with fake objects instead of the dao modules.
 *
 * It exports `app` without calling listen(): index.js starts the server, so Supertest can use
 * `app` without opening a port.
 * Does not contain: business rules, SQL, request handling. If it grows beyond wiring,
 * something is in the wrong place.
 *
 * Imports use the final file names, created with the first story.
 */
import express from 'express';
import * as ticketDao from './dao/tickets.js';
import * as counterDao from './dao/counters.js';
import { clock } from './clock.js';
import { makeIssueTicket } from './usecases/issueTicket.js';
import { makeIssueTicketController } from './controllers/tickets.js';
import { makeTicketsRouter } from './routes/tickets.js';
import { ValidationError, ConflictError, UnprocessableError } from './domain/errors.js';

// 2. use cases
const issueTicket = makeIssueTicket({ tickets: ticketDao, counters: counterDao, clock });

// 3. controllers
const issueTicketController = makeIssueTicketController({ issueTicket });

// 4. routers
export const app = express();
app.use(express.json());
app.use('/api', makeTicketsRouter({ issueTicketController }));

// 5. errors
const statusOf = (err) => {
  if (err instanceof ValidationError) return 400;
  if (err instanceof ConflictError) return 409;
  if (err instanceof UnprocessableError) return 422;
  return 500;
};

app.use((err, _req, res, _next) => {
  const status = statusOf(err);
  res.status(status).json({ error: status === 500 ? 'Internal error' : err.message });
});
