
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

let db;

// Initialize an in-memory database to avoid modifying real data.
beforeAll(async () => {
  const previousDbFile = process.env.DB_FILE;
  process.env.DB_FILE = ':memory:';
  vi.resetModules();

  try {
    db = await import('../src/dao/db.js');
  } finally {
    // Restore the original database configuration.
    if (previousDbFile === undefined) {
      delete process.env.DB_FILE;
    } else {
      process.env.DB_FILE = previousDbFile;
    }
  }
});

describe('Database Helper Tests', () => {

  // Create a temporary table independent of the application schema.
  beforeAll(() => {
    db.run('CREATE TEMP TABLE helper_test (value TEXT)');
  });

  // Clear inserted data after each test to prevent interference.
  afterEach(() => {
    db.run('DELETE FROM helper_test');
  });

  // ==========================================================
  // GET() - SINGLE ROW RETRIEVAL
  // ==========================================================

  // Verify that get() returns only the first row of a multi-row query.
  it('get() returns the first row', () => {
    const result = db.get(`
      SELECT 1 AS value
      UNION ALL
      SELECT 2 AS value
    `);

    expect(result).toEqual({ value: 1 });
  });

  // Verify that get() returns undefined when no rows match.
  it('get() returns undefined for no matches', () => {
    const result = db.get('SELECT 1 AS value WHERE 0');

    expect(result).toBeUndefined();
  });

  // Verify that get() correctly binds named SQL parameters.
  it('get() supports named parameters', () => {
    const result = db.get(
      'SELECT :value AS value',
      { value: 42 }
    );

    expect(result).toEqual({ value: 42 });
  });

  // ==========================================================
  // ALL() - MULTIPLE ROW RETRIEVAL
  // ==========================================================

  // Verify that all() returns every matching row as an array.
  it('all() returns all matching rows', () => {
    const result = db.all(`
      WITH values_to_read(value) AS (VALUES (2), (3))
      SELECT value FROM values_to_read ORDER BY value
    `);

    expect(result).toEqual([
      { value: 2 },
      { value: 3 }
    ]);
  });

  // Verify that all() returns an empty array when no rows match.
  it('all() returns an empty array for no matches', () => {
    const result = db.all('SELECT 1 AS value WHERE 0');

    expect(result).toEqual([]);
  });

  // Verify that all() filters results using named SQL parameters.
  it('all() supports named parameters', () => {
    const result = db.all(
      `WITH values_to_read(value) AS (VALUES (1), (2), (3))
       SELECT value FROM values_to_read
       WHERE value > :min
       ORDER BY value`,
      { min: 1 }
    );

    expect(result).toEqual([
      { value: 2 },
      { value: 3 }
    ]);
  });

  // ==========================================================
  // RUN() - DATABASE MODIFICATION
  // ==========================================================

  // Verify that INSERT stores a row and reports one affected record.
  it('run() inserts a row', () => {
    const result = db.run(
      'INSERT INTO helper_test (value) VALUES (:value)',
      { value: 'inserted' }
    );

    expect(result.changes).toBe(1);
    expect(
      db.get('SELECT value FROM helper_test')
    ).toEqual({ value: 'inserted' });
  });

  // Verify that UPDATE modifies an existing row and stores the new value.
  it('run() updates a row', () => {
    db.run(
      'INSERT INTO helper_test (value) VALUES (:value)',
      { value: 'original' }
    );

    const result = db.run(
      'UPDATE helper_test SET value = :value',
      { value: 'updated' }
    );

    expect(result.changes).toBe(1);
    expect(
      db.get('SELECT value FROM helper_test')
    ).toEqual({ value: 'updated' });
  });

  // Verify that DELETE removes the selected row from the database.
  it('run() deletes a row', () => {
    db.run(
      'INSERT INTO helper_test (value) VALUES (:value)',
      { value: 'to delete' }
    );

    const result = db.run(
      'DELETE FROM helper_test WHERE value = :value',
      { value: 'to delete' }
    );

    expect(result.changes).toBe(1);
    expect(db.all('SELECT value FROM helper_test')).toEqual([]);
  });

  // ==========================================================
  // INTRANSACTION() - TRANSACTION MANAGEMENT
  // ==========================================================

  // Verify that a successful transaction commits changes and returns its result.
  it('inTransaction() commits changes and returns a result', () => {
    const result = db.inTransaction(() => {
      db.run(
        'INSERT INTO helper_test (value) VALUES (:value)',
        { value: 'committed' }
      );

      return 'complete';
    });

    expect(result).toBe('complete');
    expect(
      db.get('SELECT value FROM helper_test')
    ).toEqual({ value: 'committed' });
  });

  // Verify that an error triggers a rollback and propagates the exception.
  it('inTransaction() rolls back when the callback throws', () => {
    expect(() => {
      db.inTransaction(() => {
        db.run(
          'INSERT INTO helper_test (value) VALUES (:value)',
          { value: 'rolled back' }
        );

        throw new Error('force rollback');
      });
    }).toThrow('force rollback');

    expect(db.all('SELECT value FROM helper_test')).toEqual([]);
  });
});
