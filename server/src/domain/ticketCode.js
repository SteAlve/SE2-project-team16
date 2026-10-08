import { DailyLimitReachedError } from './errors.js';

export const MAX_TICKETS_PER_DAY = 999;

/** 
* Number of the next ticket of a service, given the last number issued today (0 if none).
* @param {number} lastNumber - The last ticket number issued today for the service.
* @param {string} serviceId - The ID of the service for which the ticket is being issued.
* @returns {number} The next ticket number for the service.
* @throws {DailyLimitReachedError} If the last number is greater than or equal to MAX_TICKETS_PER_DAY.
*/
export const nextTicketNumber = (lastNumber, serviceId) => {
  if (lastNumber >= MAX_TICKETS_PER_DAY) throw new DailyLimitReachedError(serviceId);
  return lastNumber + 1;
};

/** 
* Formats a ticket code with a prefix and a number.
* @example formatTicketCode('A', 5) returns 'A-005'.
* @param {string} prefix - The prefix of the ticket code.
* @param {number} number - The number of the ticket code.
* @returns {string} The formatted ticket code.  
*/
export const formatTicketCode = (prefix, number) =>
  `${prefix}-${String(number).padStart(3, '0')}`;
