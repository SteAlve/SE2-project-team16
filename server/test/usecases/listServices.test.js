import { describe, expect, it, vi } from 'vitest';
import { makeListServices } from '../../src/usecases/listServices.js';

describe('makeListServices', () => {
  it('returns all available services', () => {
    const availableServices = [
      { id: 1, name: 'Shipping', prefix: 'S' },
      { id: 2, name: 'Payments', prefix: 'P' },
    ];
    const services = {
      findAll: vi.fn(() => availableServices),
    };
    const listServices = makeListServices({ services });

    expect(listServices()).toEqual(availableServices);
    expect(services.findAll).toHaveBeenCalledOnce();
  });

  it('returns an empty array when no services exist', () => {
    const services = {
      findAll: vi.fn(() => []),
    };
    const listServices = makeListServices({ services });

    expect(listServices()).toEqual([]);
    expect(services.findAll).toHaveBeenCalledOnce();
  });
});
