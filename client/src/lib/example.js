/**
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 *
 * LIB - small pure functions the screens use to show data.
 *
 * Contains: formatting and plain calculations on plain values (seconds to "mm:ss", ...).
 * Does not contain: React, fetch, imports from any other folder (ESLint enforces it), business
 * rules: the server decides who is called next and how long the wait is.
 * Why: a pure function is tested by just calling it.
 *
 * Example: the server sends the wait in seconds (estimatedWaitSec), the screen shows mm:ss.
 * Delete when the real files exist (formatWait.js, ...).
 */

/** @param {number} seconds @returns {string} e.g. 950 -> '15:50' */
export function formatWait(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

// Spec example: formatWait(950) === '15:50'
