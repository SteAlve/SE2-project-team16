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

let counters;

beforeEach(async () => {
  testState.db = new Database(':memory:');
  testState.db.pragma('foreign_keys = ON');
  testState.db.exec(readFileSync(schemaPath, 'utf8'));
  vi.resetModules();
  counters = await import('../../src/dao/counters.js');
});

afterEach(() => {
  testState.db.close();
  testState.db = null;
});

const seedCounter = (number) =>
  testState.db.prepare('INSERT INTO counter (number) VALUES (?)').run(number);

const seedService = ({ id, tag, prefix, serviceTime = 60 }) =>
  testState.db.prepare(
    'INSERT INTO service (id, tag, prefix, service_time) VALUES (?, ?, ?, ?)',
  ).run(id, tag, prefix, serviceTime);

describe('counters DAO', () => {
  // Table: counter. list() returns all counter numbers in ascending order.
  it('lists counters ordered by number', () => {
    seedCounter(3);
    seedCounter(1);
    seedCounter(2);

    expect(counters.list()).toEqual([
      { number: 1 },
      { number: 2 },
      { number: 3 },
    ]);
  });

  // Table: counter. list() returns an empty array when no counters exist.
  it('returns an empty list when there are no counters', () => {
    expect(counters.list()).toEqual([]);
  });

  // Table: counter. findByNumber() returns the matching counter or undefined when absent.
  it('finds a counter by number', () => {
    seedCounter(4);

    expect(counters.findByNumber(4)).toEqual({ number: 4 });
    expect(counters.findByNumber(5)).toBeUndefined();
  });

  // Table: counter. create() inserts a counter and returns its number.
  it('creates a counter', () => {
    expect(counters.create(7)).toEqual({ number: 7 });
    expect(testState.db.prepare('SELECT number FROM counter').all()).toEqual([
      { number: 7 },
    ]);
  });

  // Table: counter_service. assignService() creates an assignment and safely ignores duplicates.
  it('assigns a service to a counter without creating duplicate assignments', () => {
    seedCounter(1);
    seedService({ id: 1, tag: 'Shipping', prefix: 'S' });

    expect(counters.assignService(1, 1).changes).toBe(1);
    expect(counters.assignService(1, 1).changes).toBe(0);
    expect(testState.db.prepare('SELECT * FROM counter_service').all()).toEqual([
      { counter_number: 1, service_id: 1 },
    ]);
  });

  // Tables: counter_service and service. servicesForCounter() returns assigned service data ordered by tag.
  it('lists a counter’s assigned services ordered by tag', () => {
    seedCounter(1);
    seedCounter(2);
    seedService({ id: 1, tag: 'Shipping', prefix: 'S', serviceTime: 60 });
    seedService({ id: 2, tag: 'Payments', prefix: 'P', serviceTime: 30 });
    counters.assignService(1, 1);
    counters.assignService(1, 2);
    counters.assignService(2, 1);

    expect(counters.servicesForCounter(1)).toEqual([
      { id: 2, tag: 'Payments', serviceTime: 30 },
      { id: 1, tag: 'Shipping', serviceTime: 60 },
    ]);
    expect(counters.servicesForCounter(2)).toEqual([
      { id: 1, tag: 'Shipping', serviceTime: 60 },
    ]);
    expect(counters.servicesForCounter(3)).toEqual([]);
  });

  // Tables: counter_service and service. kOfCountersServing() returns each assigned counter's service count.
  it('returns the number of services assigned to each counter serving a service', () => {
    seedCounter(1);
    seedCounter(2);
    seedService({ id: 1, tag: 'Shipping', prefix: 'S' });
    seedService({ id: 2, tag: 'Payments', prefix: 'P' });
    seedService({ id: 3, tag: 'Consultation', prefix: 'C' });
    counters.assignService(1, 1);
    counters.assignService(1, 2);
    counters.assignService(2, 1);
    counters.assignService(2, 3);

    expect(counters.kOfCountersServing(1).sort()).toEqual([2, 2]);
    expect(counters.kOfCountersServing(2)).toEqual([2]);
    expect(counters.kOfCountersServing(3)).toEqual([2]);
    expect(counters.kOfCountersServing(4)).toEqual([]);
  });
});