/* global console, process, URL */

import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const databaseArgument = process.argv[2] ?? process.env.DB_FILE ?? 'office-queue.db';
const databaseFile = resolve(process.cwd(), databaseArgument);
const seedFile = fileURLToPath(new URL('./seed.sql', import.meta.url));

// The tables come from db:create. If the file isn't there yet, stop with an error
// instead of quietly creating an empty database.
const db = new Database(databaseFile, { fileMustExist: true });
db.pragma('foreign_keys = ON');
db.exec(readFileSync(seedFile, 'utf8'));
db.close();

console.log(`Database seeded: ${databaseFile}`);
