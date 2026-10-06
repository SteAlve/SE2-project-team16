/**
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 * 
 * DOMAIN - business rules as pure functions, plus the errors the rules can raise.
 *
 * Contains: the rules of the spec (next service, waiting time). Plain values in, plain values out.
 * Does not contain: HTTP, SQL, Date or any clock, imports from any other layer
 * (ESLint enforces it).
 * Why: a pure function is tested by just calling it, with no server and no database.
 *
 * Example: story 6, T_r = t_r * ( n_r / sum_i( s_ir / k_i ) + 1/2 ), and the three kinds of
 * error, which app.js maps to HTTP status codes.
 * Delete when the real files (waitTime.js, errors.js) exist.
 */

// --- waitTime.js ---

/**
 * @param {number} serviceTime minutes per customer (t_r)
 * @param {number} ahead tickets waiting before this one (n_r)
 * @param {number[]} kOfCountersServing k_i of every counter that serves this service
 * @returns {number} seconds
 */
export function waitTimeSec(serviceTime, ahead, kOfCountersServing) {
  const capacity = kOfCountersServing.reduce((sum, k) => sum + 1 / k, 0);
  if (capacity === 0) {
    throw new Error('No counter serves this service');
  }
  return Math.round(serviceTime * 60 * (ahead / capacity + 1 / 2));
}

// Spec example: waitTimeSec(5, 4, [1, 2]) === 950  // 15:50

// --- errors.js ---

export class ValidationError extends Error {} // bad input                   -> 400
export class ConflictError extends Error {} // operation not allowed now    -> 409
export class UnprocessableError extends Error {} // a rule of the office fails -> 422
