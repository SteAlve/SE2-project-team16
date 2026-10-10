/* global console, process, URL */

import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const databaseArgument = process.argv[2] ?? process.env.DB_FILE ?? 'office-queue.db';
const databaseFile = resolve(process.cwd(), databaseArgument);
const schemaFile = fileURLToPath(new URL('./schema.sql', import.meta.url));

const db = new Database(databaseFile);
db.pragma('foreign_keys = ON');
db.exec(readFileSync(schemaFile, 'utf8'));
db.close();

console.log(`Database initialized: ${databaseFile}`);
