import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/domain/errors.js';
import { parseCreateTicket, toTicketDto } from '../../src/dto/tickets.js';

describe('tickets DTO', () => {
  // DTO: tickets. Validation rule: accepts a positive integer serviceId and converts numeric strings.
  it.each([2, '2'])('parses a valid service ID (%s)', (serviceId) => {
    expect(parseCreateTicket({ serviceId })).toEqual({ serviceId: 2 });
  });

  // DTO: tickets. Validation rule: request body and serviceId are required.
  it.each([undefined, null, {}, { serviceId: undefined }])(
    'rejects a missing request body or service ID (%s)',
    (body) => {
      expect(() => parseCreateTicket(body)).toThrow(ValidationError);
    },
  );

  // DTO: tickets. Validation rule: serviceId must be a positive integer.
  it.each([0, -1, 1.5, 'not-a-number'])(
    'rejects an invalid service ID (%s)',
    (serviceId) => {
      expect(() => parseCreateTicket({ serviceId })).toThrow(ValidationError);
    },
  );

  // DTO: tickets. Mapping rule: exposes only the ticket code.
  it('maps a ticket to the public DTO shape', () => {
    expect(toTicketDto({
      code: 'S-001',
      id: 10,
      status: 'WAITING',
    })).toEqual({
      code: 'S-001',
    });
  });
});