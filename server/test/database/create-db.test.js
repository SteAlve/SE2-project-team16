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
});