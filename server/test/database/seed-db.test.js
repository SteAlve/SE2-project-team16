import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const createDbScript = fileURLToPath(new URL('../../database/create-db.js', import.meta.url));
const seedDbScript = fileURLToPath(new URL('../../database/seed-db.js', import.meta.url));

const runScript = (script, databaseFile) =>
  spawnSync(process.execPath, [script, databaseFile], { encoding: 'utf8' });

describe('database seed script', () => {
  let temporaryDirectory;
  let databaseFile;

  // Every test gets its own throwaway database, so the real one is never touched.
  beforeEach(() => {
    temporaryDirectory = mkdtempSync(join(tmpdir(), 'office-queue-seed-db-'));
    databaseFile = join(temporaryDirectory, 'test.db');
  });

  afterEach(() => {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  const createAndSeed = () => {
    runScript(createDbScript, databaseFile);
    const result = runScript(seedDbScript, databaseFile);
    expect(result.status, result.stderr).toBe(0);
  };

  const query = (sql) => {
    const db = new Database(databaseFile, { readonly: true });
    try {
      return db.prepare(sql).all();
    } finally {
      db.close();
    }
  };

  // Fresh database, run the seed, and the six services should be there.
  it('loads the six services into a clean database', () => {
    createAndSeed();

    expect(query('SELECT id, tag, prefix, service_time AS serviceTime FROM service ORDER BY id')).toEqual([
      { id: 1, tag: 'Shipping', prefix: 'S', serviceTime: 10 },
      { id: 2, tag: 'Bill payment', prefix: 'P', serviceTime: 5 },
      { id: 3, tag: 'Accounts', prefix: 'A', serviceTime: 5 },
      { id: 4, tag: 'Registered mail pickup', prefix: 'R', serviceTime: 3 },
      { id: 5, tag: 'Money transfer', prefix: 'M', serviceTime: 8 },
      { id: 6, tag: 'Pensions', prefix: 'N', serviceTime: 12 },
    ]);
  });

  // The six counters should be there, each with the services it handles.
  it('loads the six counters and their services', () => {
    createAndSeed();

    expect(query(
      `SELECT counter_number AS counterNumber, group_concat(service_id) AS serviceIds
       FROM (SELECT * FROM counter_service ORDER BY counter_number, service_id)
       GROUP BY counter_number`,
    )).toEqual([
      { counterNumber: 1, serviceIds: '3' },
      { counterNumber: 2, serviceIds: '1,3' },
      { counterNumber: 3, serviceIds: '1,4' },
      { counterNumber: 4, serviceIds: '2,4' },
      { counterNumber: 5, serviceIds: '2,5' },
      { counterNumber: 6, serviceIds: '2,5,6' },
    ]);
  });

  // No service should be left without a counter, or its customers could never be served.
  it('gives every service at least one counter', () => {
    createAndSeed();

    expect(query(
      'SELECT id FROM service WHERE id NOT IN (SELECT service_id FROM counter_service)',
    )).toEqual([]);
  });

  // Running the seed a second time shouldn't fail or add anything twice.
  it('can run twice without duplicating data', () => {
    createAndSeed();

    const secondRun = runScript(seedDbScript, databaseFile);

    expect(secondRun.status, secondRun.stderr).toBe(0);
    expect(query('SELECT COUNT(*) AS n FROM service')).toEqual([{ n: 6 }]);
    expect(query('SELECT COUNT(*) AS n FROM counter')).toEqual([{ n: 6 }]);
    expect(query('SELECT COUNT(*) AS n FROM counter_service')).toEqual([{ n: 12 }]);
  });

  // If someone forgets db:create, the seed should fail instead of making an empty file.
  it('fails when the database has not been created yet', () => {
    expect(runScript(seedDbScript, databaseFile).status).not.toBe(0);
  });
});
