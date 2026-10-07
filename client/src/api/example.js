/**
 * THIS IS JUST AN EXAMPLE. DO NOT COPY IT.
 *
 * API - the only place that talks to the server. One function per endpoint.
 *
 * Contains: the fetch calls, and turning an error answer into an ApiError(status, message).
 * Does not contain: React, state, formatting, imports from any other folder (ESLint enforces it).
 * The names and shapes mirror the server DTOs (DESIGN.md, section 5): the server is the contract.
 * Why: if an endpoint changes, only this folder changes. Tests replace a module of this folder
 * with vi.mock.
 *
 * Example: stories 6 and 1. Delete when the real files exist (request.js, services.js, tickets.js).
 */

// --- request.js ---

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status; // 400 bad input, 409 not allowed now, 422 a rule of the office fails
  }
}

async function request(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? 'Request failed');
  }
  return body;
}

// --- services.js ---

/** @returns {Promise<{id: number, tag: string, queueLength: number, estimatedWaitSec: number}[]>} */
export const getServices = () => request('/services');

// --- tickets.js ---

/** @returns {Promise<{code: string, estimatedWaitSec: number}>} */
export const issueTicket = (serviceId) =>
  request('/tickets', { method: 'POST', body: JSON.stringify({ serviceId }) });
