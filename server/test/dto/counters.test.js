import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/domain/errors.js';
import {
  parseAssignService,
  parseCreateCounter,
  toCounterDto,
} from '../../src/dto/counters.js';

describe('counters DTO', () => {
  // DTO: counters. Validation rule: parseCreateCounter accepts a positive integer and numeric strings.
  it.each([4, '4'])('parses a valid counter number (%s)', (number) => {
    expect(parseCreateCounter({ number })).toEqual({ number: 4 });
  });

  // DTO: counters. Validation rule: the counter number must be a positive integer.
  it.each([undefined, null, 0, -1, 1.5, 'not-a-number'])(
    'rejects an invalid counter number (%s)',
    (number) => {
      expect(() => parseCreateCounter({ number })).toThrow(ValidationError);
    },
  );

  // DTO: counters. Validation rule: parseAssignService accepts positive counter and service IDs.
  it('parses valid counter and service IDs, including numeric strings', () => {
    expect(parseAssignService({ counterNumber: '4', serviceId: 2 })).toEqual({
      counterNumber: 4,
      serviceId: 2,
    });
  });

  // DTO: counters. Validation rule: both counterNumber and serviceId must be positive integers.
  it.each([
    [{ counterNumber: undefined, serviceId: 1 }],
    [{ counterNumber: 0, serviceId: 1 }],
    [{ counterNumber: 1, serviceId: undefined }],
    [{ counterNumber: 1, serviceId: -1 }],
    [{ counterNumber: 1.5, serviceId: 1 }],
    [{ counterNumber: 1, serviceId: 'not-a-number' }],
  ])('rejects invalid counter-service assignment input (%s)', (body) => {
    expect(() => parseAssignService(body)).toThrow(ValidationError);
  });

  // DTO: counters. Mapping rule: exposes only the counter number.
  it('maps a counter to the public DTO shape', () => {
    expect(toCounterDto({ number: 4, internalId: 15 })).toEqual({ number: 4 });
  });
});