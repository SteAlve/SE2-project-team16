/**
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 * 
 * 
 * ROUTES - the URL map. One file per resource: verb + URL -> controller. Nothing else.
 *
 * Contains: a function that receives the controllers (handed over by app.js) and returns a Router.
 * Does not contain: logic, validation, SQL, imports from any other layer (ESLint enforces it).
 * app.js mounts every router under /api.
 *
 * Example: story 1, POST /api/tickets. Delete when the real files exist.
 */
import { Router } from 'express';

export function makeTicketsRouter({ issueTicketController }) {
  const router = Router();
  router.post('/tickets', issueTicketController);
  return router;
}
