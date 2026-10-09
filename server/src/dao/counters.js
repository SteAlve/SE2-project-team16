import { all, get, run } from './db.js';

export const list = () => all('SELECT number FROM counter ORDER BY number');

export const findByNumber = (number) => get(
  'SELECT number FROM counter WHERE number = :number',
  { number },
);

export const create = (number) => get(
  'INSERT INTO counter (number) VALUES (:number) RETURNING number',
  { number },
);

export const assignService = (counterNumber, serviceId) => run(
  `INSERT INTO counter_service (counter_number, service_id)
   VALUES (:counterNumber, :serviceId)
   ON CONFLICT (counter_number, service_id) DO NOTHING`,
  { counterNumber, serviceId },
);

export const servicesForCounter = (counterNumber) => all(
  `SELECT s.id, s.tag, s.service_time AS serviceTime
   FROM counter_service cs
   JOIN service s ON s.id = cs.service_id
   WHERE cs.counter_number = :counterNumber
   ORDER BY s.tag`,
  { counterNumber },
);

export const kOfCountersServing = (serviceId) => all(
  `SELECT (
     SELECT COUNT(*)
     FROM counter_service other
     WHERE other.counter_number = cs.counter_number
   ) AS k
   FROM counter_service cs
   WHERE cs.service_id = :serviceId`,
  { serviceId },
).map((row) => row.k);
