/**
 * 
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 * 
 * DAO - the only place with SQL. One file per table: tickets.js, services.js, counters.js, stats.js.
 *
 * Contains: queries with bound parameters, run through the helpers of db.js (get, all, run).
 * They return plain objects with camelCase names (alias the columns: service_id AS serviceId),
 * so column names never leave this folder.
 * Does not contain: the database driver (only db.js knows it), business rules, HTTP or DTOs,
 * clock reads (the use case passes `day`), imports from any other layer (ESLint enforces it).
 * Never build SQL by concatenating values.
 *
 * The use cases receive these modules as parameters (tickets, counters), handed over by app.js:
 * what they call, e.g. tickets.insert(serviceId, day), is the contract.
 *
 * Example: story 1. The number is assigned and the ticket inserted in ONE statement, so two
 * simultaneous requests never get the same number.
 * Delete when the real files exist.
 */
import { get, all } from './db.js';

// --- tickets.js ---

/** @param {string} day business day 'YYYY-MM-DD', passed by the caller */
export function insert(serviceId, day) {
  const { id } = get(
    `INSERT INTO ticket (day, number, service_id, status)
     VALUES (
       :day,
       (SELECT COALESCE(MAX(number), 0) + 1 FROM ticket WHERE day = :day),
       :serviceId,
       'WAITING'
     )
     RETURNING id`,
    { day, serviceId },
  );
  return get(
    `SELECT t.id, t.number, t.status, t.service_id AS serviceId, s.tag, s.service_time AS serviceTime
     FROM ticket t
     JOIN service s ON s.id = t.service_id
     WHERE t.id = :id`,
    { id },
  );
}

/** WAITING tickets of the same service issued before `ticket` (n_r). */
export function countAhead(ticket, day) {
  return get(
    `SELECT COUNT(*) AS n
     FROM ticket
     WHERE day = :day AND service_id = :serviceId AND status = 'WAITING' AND number < :number`,
    { day, serviceId: ticket.serviceId, number: ticket.number },
  ).n;
}

// --- counters.js ---

/** For each counter serving `serviceId`, how many services it handles (k_i). */
export function kOfCountersServing(serviceId) {
  return all(
    `SELECT (SELECT COUNT(*) FROM counter_service other WHERE other.counter_id = cs.counter_id) AS k
     FROM counter_service cs
     WHERE cs.service_id = :serviceId`,
    { serviceId },
  ).map((row) => row.k);
}
