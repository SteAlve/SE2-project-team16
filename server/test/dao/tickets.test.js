import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const testState = vi.hoisted(() => ({ db: null }));
const schemaPath = fileURLToPath(new URL('../../database/schema.sql', import.meta.url));

// Run the DAO's SQL against an isolated in-memory SQLite database.
vi.mock('../../src/dao/db.js', () => ({
  all: (sql, params = {}) => testState.db.prepare(sql).all(params),
  get: (sql, params = {}) => testState.db.prepare(sql).get(params),
  run: (sql, params = {}) => testState.db.prepare(sql).run(params),
}));

let tickets;

beforeEach(async () => {
  testState.db = new Database(':memory:');
  testState.db.pragma('foreign_keys = ON');
  testState.db.exec(readFileSync(schemaPath, 'utf8'));
  vi.resetModules();
  tickets = await import('../../src/dao/tickets.js');
  seedService();
});

afterEach(() => {
  testState.db.close();
  testState.db = null;
});

const seedService = ({
  id = 1,
  tag = 'Shipping',
  prefix = 'S',
  serviceTime = 60,
} = {}) => testState.db.prepare(
  'INSERT INTO service (id, tag, prefix, service_time) VALUES (?, ?, ?, ?)',
).run(id, tag, prefix, serviceTime);

const seedCounter = (number = 1) =>
  testState.db.prepare('INSERT INTO counter (number) VALUES (?)').run(number);

const assignServiceToCounter = (counterNumber = 1, serviceId = 1) =>
  testState.db.prepare(
    'INSERT INTO counter_service (counter_number, service_id) VALUES (?, ?)',
  ).run(counterNumber, serviceId);

const seedTicket = ({
  id,
  day = '2026-10-09',
  number,
  serviceId = 1,
  counterNumber = null,
  status = 'WAITING',
}) => testState.db.prepare(
  `INSERT INTO ticket (id, day, number, service_id, counter_number, status)
   VALUES (?, ?, ?, ?, ?, ?)`,
).run(id, day, number, serviceId, counterNumber, status);

describe('tickets DAO', () => {
  // Table: ticket joined with service. findById() returns ticket and related service fields or undefined.
  it('finds a ticket by ID with its service details', () => {
    seedTicket({ id: 4, number: 12 });

    expect(tickets.findById(4)).toEqual({
      id: 4,
      day: '2026-10-09',
      number: 12,
      status: 'WAITING',
      serviceId: 1,
      counterNumber: null,
      tag: 'Shipping',
      prefix: 'S',
      serviceTime: 60,
    });
    expect(tickets.findById(5)).toBeUndefined();
  });

  // Table: ticket. lastNumber() returns the highest number for the requested service and day, or zero if none.
  it('returns the last ticket number for a service and day', () => {
    seedTicket({ id: 1, number: 2 });
    seedTicket({ id: 2, number: 5 });
    seedTicket({ id: 3, day: '2026-10-10', number: 9 });
    seedService({ id: 2, tag: 'Payments', prefix: 'P' });
    seedTicket({ id: 4, number: 7, serviceId: 2 });

    expect(tickets.lastNumber(1, '2026-10-09')).toBe(5);
    expect(tickets.lastNumber(1, '2026-10-11')).toBe(0);
    expect(tickets.lastNumber(2, '2026-10-09')).toBe(7);
  });

  // Table: ticket. insert() stores a new ticket in WAITING status.
  it('inserts a waiting ticket', () => {
    tickets.insert(1, '2026-10-09', 1);

    expect(testState.db.prepare('SELECT day, number, service_id, status FROM ticket').get())
      .toEqual({
        day: '2026-10-09',
        number: 1,
        service_id: 1,
        status: 'WAITING',
      });
  });

  // Table: ticket. countAhead() counts only lower-numbered WAITING tickets for the same service and day.
  it('counts waiting tickets ahead for the same service and day', () => {
    seedTicket({ id: 1, number: 1 });
    seedTicket({ id: 2, number: 3 });
    seedTicket({ id: 3, number: 4, status: 'CANCELLED' });
    seedTicket({ id: 4, day: '2026-10-10', number: 1 });
    seedService({ id: 2, tag: 'Payments', prefix: 'P' });
    seedTicket({ id: 5, number: 1, serviceId: 2 });

    expect(tickets.countAhead({
      day: '2026-10-09',
      serviceId: 1,
      number: 3,
    })).toBe(1);
  });

  // Tables: ticket and service. listWaitingForService() returns matching WAITING tickets ordered by number.
  it('lists waiting tickets for a service and day in number order', () => {
    seedTicket({ id: 1, number: 3 });
    seedTicket({ id: 2, number: 1 });
    seedTicket({ id: 3, number: 2, status: 'CANCELLED' });
    seedTicket({ id: 4, number: 1, day: '2026-10-10' });
    seedService({ id: 2, tag: 'Payments', prefix: 'P' });
    seedTicket({ id: 5, number: 1, serviceId: 2 });

    expect(tickets.listWaitingForService(1, '2026-10-09')).toEqual([
      {
        id: 2,
        day: '2026-10-09',
        number: 1,
        status: 'WAITING',
        serviceId: 1,
        counterNumber: null,
        tag: 'Shipping',
        prefix: 'S',
        serviceTime: 60,
      },
      {
        id: 1,
        day: '2026-10-09',
        number: 3,
        status: 'WAITING',
        serviceId: 1,
        counterNumber: null,
        tag: 'Shipping',
        prefix: 'S',
        serviceTime: 60,
      },
    ]);
  });

  // Tables: ticket and counter_service. startServing() assigns a compatible counter to a WAITING ticket.
  it('starts serving a waiting ticket at the assigned counter', () => {
    seedCounter();
    assignServiceToCounter();
    seedTicket({ id: 1, number: 1 });

    expect(tickets.startServing(1, 1).changes).toBe(1);
    expect(tickets.findById(1)).toMatchObject({
      status: 'SERVING',
      counterNumber: 1,
    });
  });

  // Table: ticket. startServing() does not update tickets that are missing or not WAITING.
  it('does not start a missing or non-waiting ticket', () => {
    seedTicket({ id: 1, number: 1, status: 'CANCELLED' });

    expect(tickets.startServing(1, 1).changes).toBe(0);
    expect(tickets.startServing(2, 1).changes).toBe(0);
    expect(tickets.findById(1)).toMatchObject({ status: 'CANCELLED', counterNumber: null });
  });

  // Table: ticket. Constraint: a ticket cannot be assigned to a counter that is not enabled for its service.
  it('rejects serving a ticket at an incompatible counter', () => {
    seedCounter(1);
    seedTicket({ id: 1, number: 1 });

    expect(() => tickets.startServing(1, 1)).toThrow();

    expect(tickets.findById(1)).toMatchObject({
      status: 'WAITING',
      counterNumber: null,
    });
  });

  // Table: ticket. Constraint: a counter cannot serve two tickets simultaneously.
  it('rejects serving a second ticket at an occupied counter', () => {
    seedCounter(1);
    assignServiceToCounter(1, 1);

    seedTicket({ id: 1, number: 1 });
    seedTicket({ id: 2, number: 2 });

    expect(tickets.startServing(1, 1).changes).toBe(1);
    expect(() => tickets.startServing(2, 1)).toThrow();

    expect(tickets.findById(2)).toMatchObject({
      status: 'WAITING',
      counterNumber: null,
    });
  });

  // Table: ticket. countAhead() returns zero when no lower-numbered waiting ticket exists.
  it('returns zero when no tickets are ahead', () => {
    seedTicket({ id: 1, number: 1 });

    expect(tickets.countAhead({
      day: '2026-10-09',
      serviceId: 1,
      number: 1,
    })).toBe(0);
  });

  // Tables: ticket and counter_service. completeAtCounter() completes a serving ticket at its assigned counter.
  it('completes a serving ticket at its assigned counter', () => {
    seedCounter();
    assignServiceToCounter();
    seedTicket({ id: 1, number: 1, counterNumber: 1, status: 'SERVING' });

    expect(tickets.completeAtCounter(1, 1).changes).toBe(1);
    expect(tickets.findById(1)).toMatchObject({
      status: 'COMPLETED',
      counterNumber: 1,
    });
  });

  // Table: ticket. completeAtCounter() does not update a ticket with a different counter, missing ticket, or non-SERVING status.
  it('does not complete a ticket at the wrong counter or in the wrong state', () => {
    seedCounter(1);
    seedCounter(2);
    assignServiceToCounter(1, 1);
    assignServiceToCounter(2, 1);
    seedTicket({ id: 1, number: 1, counterNumber: 1, status: 'SERVING' });
    seedTicket({ id: 2, number: 2, status: 'WAITING' });

    expect(tickets.completeAtCounter(1, 2).changes).toBe(0);
    expect(tickets.completeAtCounter(2, 1).changes).toBe(0);
    expect(tickets.completeAtCounter(3, 1).changes).toBe(0);
    expect(tickets.findById(1)).toMatchObject({ status: 'SERVING', counterNumber: 1 });
    expect(tickets.findById(2)).toMatchObject({ status: 'WAITING', counterNumber: null });
  });
});