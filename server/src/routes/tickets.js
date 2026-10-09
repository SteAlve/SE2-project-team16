import { Router } from 'express';

/**
 * Creates a router for tickets.
 * @param {Object} param0 - The dependencies for the router.
 * @param {Function} param0.issueTicketController - The controller for issuing tickets.
 * @returns {Object} A router object.
 */
export const makeTicketsRouter = ({ issueTicketController }) => {
  const router = Router();
  router.post('/tickets', issueTicketController);
  return router;
};
