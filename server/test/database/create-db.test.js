import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';

const createDbScript = fileURLToPath(
  new URL('../../database/create-db.js', import.meta.url),
);

describe('database creation script', () => {
  it('creates a database file with all schema tables', () => {
    // Keep the database file isolated from the application's database.
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'office-queue-create-db-'));
    const databaseFile = join(temporaryDirectory, 'test.db');

    try {
      // Run the same script used to initialize the application database.
      const result = spawnSync(process.execPath, [createDbScript, databaseFile], {
        encoding: 'utf8',
      });

      expect(result.error).toBeUndefined();
      expect(result.status, result.stderr).toBe(0);

      // Open the generated file and confirm that the complete schema was applied.
      const db = new Database(databaseFile, { readonly: true });
      try {
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
      } finally {
        db.close();
      }
    } finally {
      // Remove only the temporary directory created for this test.
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  });

  // Verify that running the initialization script twice preserves existing data.
  it('reinitializes the database without losing existing data', () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'office-queue-create-db-'));
    const databaseFile = join(temporaryDirectory, 'test.db');

    try {
      // Create the database for the first time.
      const firstRun = spawnSync(process.execPath, [createDbScript, databaseFile], {
        encoding: 'utf8',
      });

      expect(firstRun.error).toBeUndefined();
      expect(firstRun.status, firstRun.stderr).toBe(0);

      // Insert a record to verify data persistence.
      const db = new Database(databaseFile);
      try {
        db.prepare('INSERT INTO counter (number) VALUES (?)').run(1);
      } finally {
        db.close();
      }

      // Run the initialization script again on the same database.
      const secondRun = spawnSync(process.execPath, [createDbScript, databaseFile], {
        encoding: 'utf8',
      });

      expect(secondRun.error).toBeUndefined();
      expect(secondRun.status, secondRun.stderr).toBe(0);

      // Verify that the existing record was not removed.
      const verifyDb = new Database(databaseFile, { readonly: true });
      try {
        const result = verifyDb.prepare(
          'SELECT number FROM counter WHERE number = ?',
        ).get(1);

        expect(result).toEqual({ number: 1 });
      } finally {
        verifyDb.close();
      }
    } finally {
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  });
});