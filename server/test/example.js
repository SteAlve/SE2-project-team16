/**
 * TESTS - run by Vitest. Real tests are named *.test.js; this file is not run.
 *   Unit (domain):    call the pure functions with plain values.
 *   Unit (use case):  build the use case with hand-written fake objects: no database, no HTTP.
 *   Integration:      Supertest on `app`, in-memory SQLite (DB_FILE=:memory:), fixed clock.
 *
 * Example: story 1. Imports use the final file names, created with the first story.
 * Delete when the real tests exist.
 */
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { waitTimeSec } from '../src/domain/waitTime.js';
import { UnprocessableError } from '../src/domain/errors.js';
import { makeIssueTicket } from '../src/usecases/issueTicket.js';
import { app } from '../src/app.js';

// Fixed clock for the integration tests (vi.mock is hoisted by Vitest)
vi.mock('../src/clock.js', () => ({ clock: { today: () => '2026-01-15' } }));

describe('waitTimeSec (domain)', () => {
  it('matches the spec example: 15:50', () => {
    expect(waitTimeSec(5, 4, [1, 2])).toBe(950);
  });
});

describe('issueTicket (use case, with fakes)', () => {
  const clock = { today: () => '2026-01-15' };
  const tickets = {
    insert: () => ({ id: 1, number: 7, serviceId: 3, tag: 'SHIP', serviceTime: 5 }),
    countAhead: () => 4,
  };

  it('returns the ticket and the estimated wait', () => {
    const counters = { kOfCountersServing: () => [1, 2] };
    const issueTicket = makeIssueTicket({ tickets, counters, clock });

    expect(issueTicket(3).waitSec).toBe(950);
  });

  it('refuses a service that no counter serves', () => {
    const counters = { kOfCountersServing: () => [] };
    const issueTicket = makeIssueTicket({ tickets, counters, clock });

    expect(() => issueTicket(3)).toThrow(UnprocessableError);
  });
});

describe('POST /api/tickets (integration)', () => {
  it('answers 201 with the ticket code and the estimated wait', async () => {
    const res = await request(app).post('/api/tickets').send({ serviceId: 1 });

    expect(res.status).toBe(201);
    expect(res.body.code).toMatch(/^[A-Z]+-\d{3}$/);
    expect(res.body.estimatedWaitSec).toBeGreaterThan(0);
  });

  it('answers 400 when serviceId is missing', async () => {
    const res = await request(app).post('/api/tickets').send({});

    expect(res.status).toBe(400);
  });
});
