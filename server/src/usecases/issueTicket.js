import { ServiceNotFoundError } from '../domain/errors.js';
import { formatTicketCode, nextTicketNumber } from '../domain/ticketCode.js';

/**
 * Creates a function to issue a new ticket for a given service.
 * @param {Object} param0 - The dependencies for the issueTicket function.
 * @param {Object} param0.services - The services DAO.
 * @param {Object} param0.tickets - The tickets DAO.
 * @param {Object} param0.clock - The clock instance.
 * @param {Function} param0.inTransaction - The function to run a transaction.
 * @returns {Function} A function that issues a new ticket for the given service.
 */
export const makeIssueTicket =
  ({ services, tickets, clock, inTransaction }) =>
  (serviceId) => {
    const service = services.findById(serviceId);
    if (!service) throw new ServiceNotFoundError(serviceId);

    const day = clock.today();

    // Read the last number and write the new ticket as one unit: two customers never get the same code.
    return inTransaction(() => {
      const number = nextTicketNumber(tickets.lastNumber(serviceId, day), serviceId);
      tickets.insert(serviceId, day, number);
      return { code: formatTicketCode(service.prefix, number) };
    });
  };
