import { parseCreateTicket, toTicketDto } from '../dto/tickets.js';

/**
 * Creates a controller for issuing tickets.
 * @param {Object} param0 - The dependencies for the controller.
 * @param {Function} param0.issueTicket - The function to issue a ticket.
 * @returns {Function} A controller function for issuing tickets.
 */
export const makeIssueTicketController = ({ issueTicket }) => (req, res) => {
  const { serviceId } = parseCreateTicket(req.body);
  const ticket = issueTicket(serviceId);
  res.status(201)
  .location(`/api/tickets/${ticket.code}`) // not yet implemented, but useful for the client to know where to poll
  .json(toTicketDto(ticket));
};
