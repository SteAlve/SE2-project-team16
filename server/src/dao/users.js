import { get, run } from './db.js';

const selectUser = `
  SELECT id, username, password_hash AS passwordHash, role,
         counter_number AS counterNumber
  FROM "user"`;

export const findById = (id) => get(`${selectUser} WHERE id = :id`, { id });

export const findByUsername = (username) => get(
  `${selectUser} WHERE username = :username`,
  { username },
);

export const create = ({ username, passwordHash, role, counterNumber = null }) => get(
  `INSERT INTO "user" (username, password_hash, role, counter_number)
   VALUES (:username, :passwordHash, :role, :counterNumber)
   RETURNING id, username, password_hash AS passwordHash, role,
             counter_number AS counterNumber`,
  { username, passwordHash, role, counterNumber },
);

export const setCounter = (id, counterNumber) => run(
  `UPDATE "user"
   SET counter_number = :counterNumber
   WHERE id = :id AND role = 'OFFICER'`,
  { id, counterNumber },
);
