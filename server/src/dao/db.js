/**
 * THIS IS JUST A PLACEHOLDER.
 * 
 * DB - the only file that knows which database we use.
 * PLACEHOLDER: implemented with the first story.
 *
 * Contains: the basic functions every dao file reuses, for example opening the connection,
 * running queries (get, all, run) and running a function as one all-or-nothing block
 * (inTransaction). Anything needed to set the database up (schema, seed) lives here too.
 * Does not contain: queries about tickets, services, counters or stats (other dao files),
 * business rules, HTTP.
 *
 * Why: the other dao files never import the database driver, so changing database means
 * changing this file (plus any SQL dialect differences), not every dao.
 * How it is built is up to whoever implements it.
 */

const notImplemented = () => {
  throw new Error('dao/db.js is a placeholder: implement it with the first story.');
};

export const get = notImplemented;
export const all = notImplemented;
export const run = notImplemented;
export const inTransaction = notImplemented;
