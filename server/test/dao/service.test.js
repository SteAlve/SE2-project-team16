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
}));

let services;

beforeEach(async () => {
  testState.db = new Database(':memory:');
  testState.db.pragma('foreign_keys = ON');
  testState.db.exec(readFileSync(schemaPath, 'utf8'));
  vi.resetModules();
  services = await import('../../src/dao/services.js');
});

afterEach(() => {
  testState.db.close();
  testState.db = null;
});

const seedService = ({ id, tag, prefix, serviceTime = 60 }) =>
  testState.db.prepare(
    'INSERT INTO service (id, tag, prefix, service_time) VALUES (?, ?, ?, ?)',
  ).run(id, tag, prefix, serviceTime);

describe('services DAO', () => {
  // Table: service. findAll() returns service DTO fields ordered by tag.
  it('finds all services ordered by name', () => {
    seedService({ id: 1, tag: 'Shipping', prefix: 'S' });
    seedService({ id: 2, tag: 'Payments', prefix: 'P' });

    expect(services.findAll()).toEqual([
      { id: 2, name: 'Payments', prefix: 'P' },
      { id: 1, name: 'Shipping', prefix: 'S' },
    ]);
  });

  // Table: service. findAll() returns an empty array when no services exist.
  it('returns an empty list when there are no services', () => {
    expect(services.findAll()).toEqual([]);
  });

  // Table: service. findById() returns the matching service or undefined when absent.
  it('finds a service by ID', () => {
    seedService({ id: 5, tag: 'Shipping', prefix: 'S' });

    expect(services.findById(5)).toEqual({
      id: 5,
      name: 'Shipping',
      prefix: 'S',
    });
    expect(services.findById(6)).toBeUndefined();
  });

  // Table: service. list() is an alias of findAll() and preserves its ordering and DTO shape.
  it('lists services using the same behavior as findAll', () => {
    seedService({ id: 1, tag: 'Shipping', prefix: 'S' });
    seedService({ id: 2, tag: 'Payments', prefix: 'P' });

    expect(services.list()).toEqual(services.findAll());
  });

  // Table: service. create() inserts a service and returns its persisted database fields.
  it('creates and returns a service', () => {
    expect(services.create({
      tag: 'Shipping',
      prefix: 'S',
      serviceTime: 60,
    })).toEqual({
      id: 1,
      tag: 'Shipping',
      prefix: 'S',
      serviceTime: 60,
    });
    expect(testState.db.prepare('SELECT * FROM service').get()).toEqual({
      id: 1,
      tag: 'Shipping',
      prefix: 'S',
      service_time: 60,
    });
  });
});