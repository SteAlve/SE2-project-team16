import { all, get, run } from './db.js';

const selectTicket = `
  SELECT t.id, t.day, t.number, t.status, t.service_id AS serviceId,
         t.counter_number AS counterNumber, s.tag, s.prefix,
         s.service_time AS serviceTime
  FROM ticket t
  JOIN service s ON s.id = t.service_id`;

export const findById = (id) => get(`${selectTicket} WHERE t.id = :id`, { id });

export const lastNumber = (serviceId, day) => get(
  `SELECT COALESCE(MAX(number), 0) AS number
   FROM ticket
   WHERE service_id = :serviceId AND day = :day`,
  { serviceId, day },
).number;

export const insert = (serviceId, day, number) => {
  run(
    `INSERT INTO ticket (day, number, service_id, status)
     VALUES (:day, :number, :serviceId, 'WAITING')`,
    { serviceId, day, number },
  );
};

export const countAhead = (ticket) => get(
  `SELECT COUNT(*) AS n
   FROM ticket
   WHERE day = :day
     AND service_id = :serviceId
     AND status = 'WAITING'
     AND number < :number`,
  ticket,
).n;

export const listWaitingForService = (serviceId, day) => all(
  `${selectTicket}
   WHERE t.service_id = :serviceId AND t.day = :day AND t.status = 'WAITING'
   ORDER BY t.number`,
  { serviceId, day },
);

export const startServing = (id, counterNumber) => run(
  `UPDATE ticket
   SET status = 'SERVING', counter_number = :counterNumber
   WHERE id = :id AND status = 'WAITING'`,
  { id, counterNumber },
);

export const completeAtCounter = (id, counterNumber) => run(
  `UPDATE ticket
   SET status = 'COMPLETED'
   WHERE id = :id AND counter_number = :counterNumber AND status = 'SERVING'`,
  { id, counterNumber },
);
