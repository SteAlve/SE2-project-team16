// Starts the server for the E2E tests, on its own database so your normal one is never touched.
// Every run starts clean: the old test database is deleted, then created and seeded again.
// Playwright runs this file by itself (see playwright.config.js), you don't need to call it.

import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const serverDir = fileURLToPath(new URL('../server/', import.meta.url));
const databaseDir = fileURLToPath(new URL('./database/', import.meta.url));
const databaseFile = `${databaseDir}e2e.db`;

mkdirSync(databaseDir, { recursive: true });
for (const suffix of ['', '-shm', '-wal']) {
  rmSync(databaseFile + suffix, { force: true });
}

for (const script of ['database/create-db.js', 'database/seed-db.js']) {
  const result = spawnSync(process.execPath, [script, databaseFile], { cwd: serverDir, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Port 3001, because the client sends its /api requests there.
spawn(process.execPath, ['src/index.js'], {
  cwd: serverDir,
  stdio: 'inherit',
  env: { ...process.env, DB_FILE: databaseFile, PORT: '3001' },
});
