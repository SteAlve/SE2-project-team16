import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const testState = vi.hoisted(() => ({ db: null }));
const schemaPath = fileURLToPath(new URL('../../database/schema.sql', import.meta.url));

// Run the DAO's SQL against an isolated in-memory SQLite database.
vi.mock('../../src/dao/db.js', () => ({
  get: (sql, params = {}) => testState.db.prepare(sql).get(params),
  run: (sql, params = {}) => testState.db.prepare(sql).run(params),
}));

let users;

beforeEach(async () => {
  testState.db = new Database(':memory:');
  testState.db.pragma('foreign_keys = ON');
  testState.db.exec(readFileSync(schemaPath, 'utf8'));
  vi.resetModules();
  users = await import('../../src/dao/users.js');
});

afterEach(() => {
  testState.db.close();
  testState.db = null;
});

const seedCounter = (number) =>
  testState.db.prepare('INSERT INTO counter (number) VALUES (?)').run(number);

const seedUser = ({
  id,
  username = 'operator',
  passwordHash = 'hashed-password',
  role = 'OFFICER',
  counterNumber = null,
} = {}) => testState.db.prepare(
  `INSERT INTO "user" (id, username, password_hash, role, counter_number)
   VALUES (?, ?, ?, ?, ?)`,
).run(id, username, passwordHash, role, counterNumber);

describe('users DAO', () => {
  // Table: user. findById() returns the user fields or undefined when the ID does not exist.
  it('finds a user by ID', () => {
    seedUser({ id: 1 });

    expect(users.findById(1)).toEqual({
      id: 1,
      username: 'operator',
      passwordHash: 'hashed-password',
      role: 'OFFICER',
      counterNumber: null,
    });
    expect(users.findById(2)).toBeUndefined();
  });

  // Table: user. findByUsername() returns the matching user or undefined when the username does not exist.
  it('finds a user by username', () => {
    seedUser({ id: 1, username: 'alice' });

    expect(users.findByUsername('alice')).toEqual({
      id: 1,
      username: 'alice',
      passwordHash: 'hashed-password',
      role: 'OFFICER',
      counterNumber: null,
    });
    expect(users.findByUsername('bob')).toBeUndefined();
  });

  // Table: user. create() persists a user and defaults counterNumber to null.
  it('creates a user without an assigned counter', () => {
    expect(users.create({
      username: 'alice',
      passwordHash: 'alice-hash',
      role: 'MANAGER',
    })).toEqual({
      id: 1,
      username: 'alice',
      passwordHash: 'alice-hash',
      role: 'MANAGER',
      counterNumber: null,
    });
    expect(testState.db.prepare('SELECT username, password_hash, role, counter_number FROM "user"').get())
      .toEqual({
        username: 'alice',
        password_hash: 'alice-hash',
        role: 'MANAGER',
        counter_number: null,
      });
  });

  // Table: user. create() persists the optional counterNumber when provided.
  it('creates an officer with an assigned counter', () => {
    seedCounter(3);

    expect(users.create({
      username: 'alice',
      passwordHash: 'alice-hash',
      role: 'OFFICER',
      counterNumber: 3,
    })).toMatchObject({
      username: 'alice',
      role: 'OFFICER',
      counterNumber: 3,
    });
  });

  // Table: user. setCounter() updates only users whose role is OFFICER.
  it('assigns a counter to an officer', () => {
    seedCounter(3);
    seedUser({ id: 1, counterNumber: null });

    expect(users.setCounter(1, 3).changes).toBe(1);
    expect(users.findById(1).counterNumber).toBe(3);
  });

  // Table: user. setCounter() leaves users with roles other than OFFICER unchanged.
  it('does not assign a counter to a non-officer', () => {
    seedCounter(3);
    seedUser({ id: 1, role: 'MANAGER' });

    expect(users.setCounter(1, 3).changes).toBe(0);
    expect(users.findById(1).counterNumber).toBeNull();
  });

  // Table: user. setCounter() does not change anything when the user ID does not exist.
  it('does not update a missing user', () => {
    seedCounter(3);

    expect(users.setCounter(99, 3).changes).toBe(0);
  });
});