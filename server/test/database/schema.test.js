import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Resolve the schema relative to this file, regardless of where Vitest is run from.
const schemaPath = fileURLToPath(new URL('../../database/schema.sql', import.meta.url));

let db;

const insertService = (options = {}) => {
  const { id = 1, tag = 'Shipping', prefix = 'S', serviceTime = 60 } = options;
  return db.prepare(
    'INSERT INTO service (id, tag, prefix, service_time) VALUES (?, ?, ?, ?)',
  ).run(id, tag, prefix, serviceTime);
};

const insertCounter = (number = 1) =>
  db.prepare('INSERT INTO counter (number) VALUES (?)').run(number);

const insertUser = ({
  id,
  username = 'operator',
  passwordHash = 'hashed-password',
  role = 'OFFICER',
  counterNumber = null,
} = {}) => {
  const columns = ['username', 'password_hash', 'role', 'counter_number'];
  const values = [username, passwordHash, role, counterNumber];

  if (id !== undefined) {
    columns.unshift('id');
    values.unshift(id);
  }

  const placeholders = values.map(() => '?').join(', ');
  return db.prepare(
    `INSERT INTO "user" (${columns.join(', ')}) VALUES (${placeholders})`,
  ).run(...values);
};

const assignServiceToCounter = (counterNumber = 1, serviceId = 1) =>
  db.prepare(
    'INSERT INTO counter_service (counter_number, service_id) VALUES (?, ?)',
  ).run(counterNumber, serviceId);

const insertTicket = ({
  id,
  day = '2026-10-09',
  number = 1,
  serviceId = 1,
  counterNumber = null,
  status,
} = {}) => {
  const columns = ['day', 'number', 'service_id', 'counter_number'];
  const values = [day, number, serviceId, counterNumber];

  if (id !== undefined) {
    columns.unshift('id');
    values.unshift(id);
  }
  if (status !== undefined) {
    columns.push('status');
    values.push(status);
  }

  const placeholders = values.map(() => '?').join(', ');
  return db.prepare(
    `INSERT INTO ticket (${columns.join(', ')}) VALUES (${placeholders})`,
  ).run(...values);
};

beforeEach(() => {
  // Use a fresh in-memory database for every test and enforce foreign keys as SQLite requires.
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  // Apply the complete project schema, including the user table.
  db.exec(readFileSync(schemaPath, 'utf8'));
});

afterEach(() => {
  // Always close the connection, even if schema execution or an assertion fails.
  db.close();
});

describe('database schema', () => {
  // Tables: user, counter, service, counter_service, and ticket. Constraint: verifies all schema tables are created.
  it('creates all expected tables', () => {
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    ).all().map(({ name }) => name);

    expect(tables).toEqual([
      'counter',
      'counter_service',
      'service',
      'ticket',
      'user',
    ]);
  });

  describe('user constraints', () => {
    // Table: user. Constraint: accepts each role allowed by the role CHECK.
    it.each(['OFFICER', 'MANAGER', 'ADMIN'])('accepts the %s role', (role) => {
      expect(() => insertUser({ role })).not.toThrow();
    });

    // Table: user. Constraint: username, password_hash, and role are NOT NULL.
    it.each([
      ['username', { username: null }],
      ['password hash', { passwordHash: null }],
      ['role', { role: null }],
    ])('requires a non-null %s', (_field, options) => {
      expect(() => insertUser(options)).toThrow();
    });

    // Table: user. Constraint: role CHECK permits only OFFICER, MANAGER, and ADMIN.
    it('rejects roles outside the declared set', () => {
      expect(() => insertUser({ role: 'CUSTOMER' })).toThrow();
    });

    // Table: user. Constraint: username has a UNIQUE constraint.
    it('requires usernames to be unique', () => {
      insertUser();

      expect(() => insertUser({ id: 2 })).toThrow();
    });

    // Table: user. Constraint: counter_number may be set only when role is OFFICER.
    it.each(['MANAGER', 'ADMIN'])(
      'does not allow a %s to have a counter',
      (role) => {
        insertCounter();

        expect(() => insertUser({ role, counterNumber: 1 })).toThrow();
      },
    );

    // Table: user. Constraint: an OFFICER may have no counter assigned.
    it('allows an OFFICER without an assigned counter', () => {
      expect(() => insertUser()).not.toThrow();
    });

    // Tables: user and counter. Constraint: a non-null counter_number must reference an existing counter.
    it('requires an assigned counter to exist', () => {
      expect(() => insertUser({ counterNumber: 1 })).toThrow();

      insertCounter();
      expect(() => insertUser({ counterNumber: 1 })).not.toThrow();
    });
  });

  describe('service constraints', () => {
    // Table: service. Constraint: a service with valid required fields and CHECK values is accepted.
    it('accepts a valid service', () => {
      expect(() => insertService()).not.toThrow();
    });

    // Table: service. Constraint: tag, prefix, and service_time are NOT NULL.
    it.each([
      ['tag', { tag: null }],
      ['prefix', { prefix: null }],
      ['service time', { serviceTime: null }],
    ])('requires a non-null %s', (_field, options) => {
      expect(() => insertService(options)).toThrow();
    });

    // Table: service. Constraint: CHECK requires prefix to be exactly one character long.
    it('requires the prefix to contain exactly one character', () => {
      expect(() => insertService({ prefix: 'SHIP' })).toThrow();
    });

    // Table: service. Constraint: CHECK requires service_time to be greater than zero.
    it('requires the service time to be positive', () => {
      expect(() => insertService({ serviceTime: 0 })).toThrow();
    });

    // Table: service. Constraint: tag has a UNIQUE constraint.
    it('requires service tags to be unique', () => {
      insertService();

      expect(() => insertService({ id: 2, prefix: 'P' })).toThrow();
    });

    // Table: service. Constraint: prefix has a UNIQUE constraint.
    it('requires service prefixes to be unique', () => {
      insertService();

      expect(() => insertService({ id: 2, tag: 'Payments' })).toThrow();
    });
  });

  describe('counter constraints', () => {
    // Table: counter. Constraint: number is a PRIMARY KEY and must be unique.
    it('requires counter numbers to be unique', () => {
      insertCounter();

      expect(() => insertCounter()).toThrow();
    });
  });

  describe('counter_service constraints', () => {
    // Table: counter_service. Constraints: both foreign keys reference existing counter and service rows.
    it('accepts an assignment to an existing counter and service', () => {
      insertCounter();
      insertService();

      expect(() => assignServiceToCounter()).not.toThrow();
    });

    // Table: counter_service. Constraint: counter_number and service_id are NOT NULL.
    it.each([
      ['counter number', null, 1],
      ['service ID', 1, null],
    ])('requires a non-null %s', (_field, counterNumber, serviceId) => {
      expect(() => assignServiceToCounter(counterNumber, serviceId)).toThrow();
    });

    // Table: counter_service. Constraints: counter_number and service_id must satisfy their foreign keys.
    it('rejects assignments to a non-existent counter or service', () => {
      insertCounter();
      insertService();

      expect(() => assignServiceToCounter(2, 1)).toThrow();
      expect(() => assignServiceToCounter(1, 2)).toThrow();
    });

    // Table: counter_service. Constraint: the (counter_number, service_id) composite PRIMARY KEY is unique.
    it('does not allow the same service to be assigned to a counter twice', () => {
      insertCounter();
      insertService();
      assignServiceToCounter();

      expect(() => assignServiceToCounter()).toThrow();
    });
  });

  describe('ticket constraints', () => {
    beforeEach(() => {
      insertService();
    });

    // Table: ticket. Constraint: status defaults to WAITING when omitted.
    it('accepts a valid ticket and defaults its status to WAITING', () => {
      insertTicket();

      expect(db.prepare('SELECT status FROM ticket').get()).toEqual({
        status: 'WAITING',
      });
    });

    // Table: ticket. Constraint: day, number, service_id, and status are NOT NULL.
    it.each([
      ['day', { day: null }],
      ['number', { number: null }],
      ['service ID', { serviceId: null }],
      ['status', { status: null }],
    ])('requires a non-null %s', (_field, options) => {
      expect(() => insertTicket(options)).toThrow();
    });

    // Table: ticket. Constraint: CHECK requires number to be greater than zero.
    it('requires ticket numbers to be positive', () => {
      expect(() => insertTicket({ number: 0 })).toThrow();
    });

    // Table: ticket. Constraint: CHECK permits only WAITING, SERVING, COMPLETED, or CANCELLED.
    it('accepts only the declared ticket statuses', () => {
      expect(() => insertTicket({ status: 'UNKNOWN' })).toThrow();
    });

    // Table: ticket. Constraint: CHECK requires counter_number for SERVING and COMPLETED tickets.
    it.each(['SERVING', 'COMPLETED'])(
      'requires a counter for a ticket with status %s',
      (status) => {
        expect(() => insertTicket({ status })).toThrow();
      },
    );

    // Table: ticket. Constraint: service_id must reference an existing service.
    it('rejects tickets for a non-existent service', () => {
      expect(() => insertTicket({ serviceId: 2 })).toThrow();
    });

    // Table: ticket. Constraint: (counter_number, service_id) must reference an existing counter_service assignment.
    it('requires an assigned counter to serve the ticket service', () => {
      insertCounter();

      expect(() => insertTicket({ counterNumber: 1 })).toThrow();
    });

    // Table: ticket. Constraint: (day, number, service_id) is UNIQUE; changing day or number permits another ticket.
    it('requires day, number, and service to be unique together', () => {
      insertTicket();

      expect(() => insertTicket()).toThrow();
      expect(() => insertTicket({ number: 2 })).not.toThrow();
      expect(() => insertTicket({ day: '2026-10-10' })).not.toThrow();
    });

    // Table: ticket. Constraint: the partial unique index allows only one SERVING ticket per counter.
    it('allows only one SERVING ticket at a counter', () => {
      insertCounter();
      assignServiceToCounter();
      insertTicket({ number: 1, counterNumber: 1, status: 'SERVING' });

      expect(() => insertTicket({
        number: 2,
        counterNumber: 1,
        status: 'SERVING',
      })).toThrow();
    });

    // Verify that the schema accepts valid non-default statuses; WAITING is covered by the default-status test.
    it.each(['SERVING', 'COMPLETED', 'CANCELLED'])(
      'accepts tickets with the valid non-default status %s',
      (status) => {
        if (status === 'SERVING' || status === 'COMPLETED') {
          insertCounter();
          assignServiceToCounter();
        }

        expect(() => insertTicket({
          status,
          counterNumber: status === 'SERVING' || status === 'COMPLETED'
            ? 1
            : null,
        })).not.toThrow();
      },
    );

    // Verify that different counters can serve tickets simultaneously.
    it('allows SERVING tickets at different counters', () => {
      insertCounter(1);
      insertCounter(2);
      assignServiceToCounter(1, 1);
      assignServiceToCounter(2, 1);

      insertTicket({
        number: 1,
        counterNumber: 1,
        status: 'SERVING',
      });

      expect(() => insertTicket({
        number: 2,
        counterNumber: 2,
        status: 'SERVING',
      })).not.toThrow();
    });

    // Verify that ticket numbers can repeat across different services.
    it('allows the same day and ticket number for different services', () => {
      insertService({
        id: 2,
        tag: 'Payments',
        prefix: 'P',
      });

      insertTicket({
        day: '2026-10-09',
        number: 1,
        serviceId: 1,
      });

      expect(() => insertTicket({
        day: '2026-10-09',
        number: 1,
        serviceId: 2,
      })).not.toThrow();
    });
  });
});
