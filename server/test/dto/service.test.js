import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/domain/errors.js';
import {
  SERVICE_IMAGES_PATH,
  parseCreateService,
  toServiceDto,
} from '../../src/dto/services.js';

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

  // Reject a missing request body when creating a service.
  it('rejects a missing service request body', () => {
    expect(() => parseCreateService(undefined)).toThrow(ValidationError);
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

  // DTO: services. Mapping rule: exposes id, name, prefix and imageUrl (built from the file name).
  it('maps a service with an image to the public DTO shape', () => {
    expect(toServiceDto({
      id: 3,
      name: 'Shipping',
      prefix: 'S',
      image: 'shipping.jpg',
      serviceTime: 60,
    })).toEqual({
      id: 3,
      name: 'Shipping',
      prefix: 'S',
      imageUrl: '/api/images/services/shipping.jpg',
    });
  });

  // DTO: services. Mapping rule: a service without image has imageUrl null.
  it.each([null, undefined, ''])(
    'maps a service without image to imageUrl null (%s)',
    (image) => {
      expect(toServiceDto({
        id: 3,
        name: 'Shipping',
        prefix: 'S',
        image,
        serviceTime: 60,
      })).toEqual({
        id: 3,
        name: 'Shipping',
        prefix: 'S',
        imageUrl: null,
      });
    },
  );

  // DTO: services. The imageUrl is built from the exported path constant.
  it('builds imageUrl from SERVICE_IMAGES_PATH', () => {
    expect(SERVICE_IMAGES_PATH).toBe('/api/images/services');
    expect(toServiceDto({ id: 1, name: 'A', prefix: 'A', image: 'a.jpg' }).imageUrl)
      .toBe(`${SERVICE_IMAGES_PATH}/a.jpg`);
  });
});
