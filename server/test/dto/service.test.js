import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/domain/errors.js';
import { parseCreateService, toServiceDto } from '../../src/dto/services.js';

describe('services DTO', () => {
  // DTO: services. Validation rule: trims tag and prefix and converts serviceTime to a number.
  it('parses and normalizes valid service input', () => {
    expect(parseCreateService({
      tag: '  Shipping  ',
      prefix: ' S ',
      serviceTime: '60',
    })).toEqual({
      tag: 'Shipping',
      prefix: 'S',
      serviceTime: 60,
    });
  });

  // DTO: services. Validation rule: tag is required and cannot be empty or whitespace.
  it.each([undefined, '', '   '])('rejects a missing or empty tag (%s)', (tag) => {
    expect(() => parseCreateService({ tag, prefix: 'S', serviceTime: 60 }))
      .toThrow(ValidationError);
  });

  // DTO: services. Validation rule: prefix must contain exactly one non-whitespace character.
  it.each([undefined, '', '   ', 'SHIP'])(
    'rejects an invalid prefix (%s)',
    (prefix) => {
      expect(() => parseCreateService({ tag: 'Shipping', prefix, serviceTime: 60 }))
        .toThrow(ValidationError);
    },
  );

  // DTO: services. Validation rule: serviceTime must be a positive integer.
  it.each([undefined, 0, -1, 1.5, 'not-a-number'])(
    'rejects a non-positive or non-integer service time (%s)',
    (serviceTime) => {
      expect(() => parseCreateService({ tag: 'Shipping', prefix: 'S', serviceTime }))
        .toThrow(ValidationError);
    },
  );

  // DTO: services. Mapping rule: exposes only id, name, and prefix.
  it('maps a service to the public DTO shape', () => {
    expect(toServiceDto({
      id: 3,
      name: 'Shipping',
      prefix: 'S',
      serviceTime: 60,
    })).toEqual({
      id: 3,
      name: 'Shipping',
      prefix: 'S',
    });
  });
});