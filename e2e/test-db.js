// The test database the E2E server runs on, and a few helpers the tests use to look inside it
// or to prepare a situation (like an empty office).

import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const databaseDir = fileURLToPath(new URL('./database/', import.meta.url));
export const databaseFile = `${databaseDir}e2e.db`;

const seedFile = fileURLToPath(new URL('../server/database/seed.sql', import.meta.url));

// Same date the server uses for "today": the local date, not the UTC one.
const today = "date('now', 'localtime')";

const withDb = (work) => {
  const db = new Database(databaseFile);
  try {
    return work(db);
  } finally {
    db.close();
  }
};

/** Back to the starting point: no tickets, and all the sample services and counters. */
export const resetDatabase = () => withDb((db) => {
  db.exec('DELETE FROM ticket');
  db.exec(readFileSync(seedFile, 'utf8'));
});

/** Removes every service, as if nothing had been set up yet. */
export const removeAllServices = () => withDb((db) => {
  db.exec('DELETE FROM ticket; DELETE FROM counter_service; DELETE FROM service;');
});

/** Removes one service, as if the office stopped offering it. */
export const removeService = (serviceId) => withDb((db) => {
  db.prepare('DELETE FROM counter_service WHERE service_id = ?').run(serviceId);
  db.prepare('DELETE FROM service WHERE id = ?').run(serviceId);
});

/** Adds `count` tickets for today, numbered 1, 2, 3... as if customers had already taken them. */
export const addTicketsToday = (serviceId, count) => withDb((db) => {
  const insert = db.prepare(`INSERT INTO ticket (day, number, service_id) VALUES (${today}, ?, ?)`);
  db.transaction(() => {
    for (let number = 1; number <= count; number += 1) insert.run(number, serviceId);
  })();
});

/** How many tickets were created today, for every service. */
export const countTicketsToday = () => withDb((db) =>
  db.prepare(`SELECT COUNT(*) FROM ticket WHERE day = ${today}`).pluck().get());

/** The numbers waiting in a service's queue today, in queue order. */
export const waitingNumbers = (serviceId) => withDb((db) =>
  db.prepare(
    `SELECT number FROM ticket
     WHERE day = ${today} AND service_id = ? AND status = 'WAITING'
     ORDER BY number`,
  ).pluck().all(serviceId));
