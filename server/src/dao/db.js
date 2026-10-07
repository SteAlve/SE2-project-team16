/**
 * DB - opens the SQLite database and gives the other dao files a few helpers to use it.
 *
 * This is the only file that imports the database library. The other dao files only use
 * get, all and run; inTransaction is for the use cases, which get it from app.js. So if we
 * ever change database, only this file changes.
 *
 * The data is saved in server/office-queue.db, created the first time the server starts.
 * Delete that file to start from scratch.
 * Tests use DB_FILE=:memory: to get an empty database that is never saved.
 */
import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';

const file = process.env.DB_FILE ?? fileURLToPath(new URL('../../office-queue.db', import.meta.url));
const db = new Database(file);

db.pragma('foreign_keys = ON');
if (file !== ':memory:') db.pragma('journal_mode = WAL');

// --- tables ---
//
// Put the CREATE TABLE statements here, using IF NOT EXISTS so they can run on every start:
//   db.exec(`CREATE TABLE IF NOT EXISTS ...`);

// --- helpers ---
//
// Pass values as an object, never paste them into the SQL string:
//   get('SELECT * FROM service WHERE id = :id', { id: 2 })

export const get = (sql, params = {}) => db.prepare(sql).get(params); // first row, or undefined
export const all = (sql, params = {}) => db.prepare(sql).all(params); // all rows, as an array
export const run = (sql, params = {}) => db.prepare(sql).run(params); // for INSERT, UPDATE, DELETE

// Runs fn so that either all its changes are saved, or none if it throws. fn can't be async.
// It takes the write lock right away (BEGIN IMMEDIATE), so a read followed by a write, like
// "call next", can't be overtaken by another connection in between.
export const inTransaction = (fn) => db.transaction(fn).immediate();
