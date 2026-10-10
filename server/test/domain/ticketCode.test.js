import { describe, expect, it } from 'vitest';
import { DailyLimitReachedError } from '../../src/domain/errors.js';
import { formatTicketCode, MAX_TICKETS_PER_DAY, nextTicketNumber } from '../../src/domain/ticketCode.js';

describe('nextTicketNumber', () => {
  it.each([
    [0, 1],
    [1, 2],
    [MAX_TICKETS_PER_DAY - 1, MAX_TICKETS_PER_DAY],
  ])('returns %i + 1 = %i', (lastNumber, expectedNumber) => {
    expect(nextTicketNumber(lastNumber, 7)).toBe(expectedNumber);
  });

  it('throws when the daily maximum has already been issued', () => {
    expect(() => nextTicketNumber(MAX_TICKETS_PER_DAY, 7))
      .toThrow(new DailyLimitReachedError(7));
  });
});

describe('formatTicketCode', () => {
  it.each([
    ['S', 1, 'S-001'],
    ['P', 25, 'P-025'],
    ['A', 125, 'A-125'],
  ])('formats prefix %s and number %i as %s', (prefix, number, expectedCode) => {
    expect(formatTicketCode(prefix, number)).toBe(expectedCode);
  });
});
