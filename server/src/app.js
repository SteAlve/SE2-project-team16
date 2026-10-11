/**
 * APP - the composition root: the only file that knows every other piece.
 *
 * What it does, in this order
 *  1. Picks the concrete pieces: dao modules, clock, transaction helper.
 *  2. Builds the use cases, handing them those pieces (dependency injection).
 *  3. Builds the controllers, handing them the use cases.
 *  4. Builds the routers, handing them the controllers, and mounts them under /api.
 *  5. Adds the error middleware: domain errors -> 400 / 409 / 422, or other specific errors code, everything else -> 500.
 *
 * Does not contain: business rules, SQL, request handling. If it grows beyond wiring,
 * something is in the wrong place.
 */

// general imports
import express from 'express';
import path from 'node:path';
import { SERVICE_IMAGES_PATH } from './dto/services.js';

// clock: the only piece that uses Date, so that the rest of the system can be tested with a fake clock
import { clock } from './clock.js';

// DAO imports: the concrete pieces that know SQL and the database. They are the only pieces that import
import { inTransaction } from './dao/db.js';

import * as ticketDao from './dao/tickets.js';
import * as serviceDao from './dao/services.js';

// use case imports: the pure functions that implement the business rules, plus the errors they can raise
import { makeIssueTicket } from './usecases/issueTicket.js';
import { makeListServices } from './usecases/listServices.js';

// controller imports: the HTTP adapters that call the use cases and choose the status code
import { makeIssueTicketController } from './controllers/tickets.js';
import { makeListServicesController } from './controllers/services.js';

// router imports: the Express routers that mount the controllers under /api
import { makeTicketsRouter } from './routes/tickets.js';
import { makeServicesRouter } from './routes/services.js';
import { ValidationError, ConflictError, UnprocessableError } from './domain/errors.js';


// 2. use cases
const issueTicket = makeIssueTicket({ services: serviceDao, tickets: ticketDao, clock, inTransaction });
const listServices = makeListServices({ services: serviceDao });

// 3. controllers
const issueTicketController = makeIssueTicketController({ issueTicket });
const listServicesController = makeListServicesController({ listServices });

// 4. routers
export const app = express();
app.use(express.json());
app.use(
  SERVICE_IMAGES_PATH,
  express.static(path.join(import.meta.dirname, '..', 'public', 'images', 'services')),
);
app.use('/api', makeServicesRouter({ listServicesController }),
                makeTicketsRouter({ issueTicketController }));

// 5. errors
const isBadJson = (err) => err.type === 'entity.parse.failed';

const statusOf = (err) => {
  if (err instanceof ValidationError || isBadJson(err)) return 400;
  if (err instanceof ConflictError) return 409;
  if (err instanceof UnprocessableError) return 422;
  return 500;
};

app.use((err, _req, res, _next) => {
  const status = statusOf(err);
  if (status === 500) {
    console.error(err);
    return res.status(500).json({ error: 'InternalServerError', message: 'Unexpected error' });
  }
  if (isBadJson(err)) {
    return res.status(400).json({ error: 'ValidationError', message: 'Request body must be valid JSON' });
  }
  res.status(status).json({ error: err.name, message: err.message });
});
