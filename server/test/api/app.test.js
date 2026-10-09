import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const apiState = vi.hoisted(() => ({
  services: [],
  tickets: [],
}));

// Keep API tests isolated from SQLite while exercising the real Express app and use cases.
vi.mock('../../src/dao/db.js', () => ({
  inTransaction: (callback) => callback(),
}));

vi.mock('../../src/dao/services.js', () => ({
  findAll: () => apiState.services.map(({ id, name, prefix }) => ({ id, name, prefix })),
  findById: (id) => apiState.services.find((service) => service.id === id),
}));

vi.mock('../../src/dao/tickets.js', () => ({
  lastNumber: (serviceId, day) => apiState.tickets
    .filter((ticket) => ticket.serviceId === serviceId && ticket.day === day)
    .reduce((last, ticket) => Math.max(last, ticket.number), 0),
  insert: (serviceId, day, number) => {
    apiState.tickets.push({ serviceId, day, number, status: 'WAITING' });
  },
}));

const { app } = await import('../../src/app.js');

describe('API app', () => {
  beforeEach(() => {
    apiState.services = [];
    apiState.tickets = [];
  });

  describe('GET /api/services', () => {
    // Endpoint: GET /api/services. Returns the public DTOs for all configured services.
    it('returns the available services', async () => {
      apiState.services = [
        { id: 1, name: 'Shipping', prefix: 'S' },
        { id: 2, name: 'Payments', prefix: 'P' },
      ];

      const response = await request(app).get('/api/services');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: 1, name: 'Shipping', prefix: 'S' },
        { id: 2, name: 'Payments', prefix: 'P' },
      ]);
    });

    // Endpoint: GET /api/services. Returns an empty array when no services are configured.
    it('returns an empty list when there are no services', async () => {
      const response = await request(app).get('/api/services');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/tickets', () => {
    // Endpoint: POST /api/tickets. Issues a ticket and returns its code and Location header.
    it('issues the first ticket for an existing service', async () => {
      apiState.services = [{ id: 1, name: 'Shipping', prefix: 'S' }];

      const response = await request(app)
        .post('/api/tickets')
        .send({ serviceId: 1 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ code: 'S-001' });
      expect(response.headers.location).toBe('/api/tickets/S-001');
      expect(apiState.tickets).toHaveLength(1);
      expect(apiState.tickets[0]).toMatchObject({
        serviceId: 1,
        number: 1,
        status: 'WAITING',
      });
    });

    // Endpoint: POST /api/tickets. Assigns the next number after the last ticket issued today.
    it('issues the next ticket number for the same service and day', async () => {
      apiState.services = [{ id: 1, name: 'Shipping', prefix: 'S' }];

      const firstResponse = await request(app)
        .post('/api/tickets')
        .send({ serviceId: 1 });
      const secondResponse = await request(app)
        .post('/api/tickets')
        .send({ serviceId: 1 });

      expect(firstResponse.body).toEqual({ code: 'S-001' });
      expect(secondResponse.status).toBe(201);
      expect(secondResponse.body).toEqual({ code: 'S-002' });
    });

    // Endpoint: POST /api/tickets. Invalid request bodies return a validation error with status 400.
    it.each([{}, { serviceId: 0 }, { serviceId: 'invalid' }])(
      'rejects invalid ticket input (%s)',
      async (body) => {
        const response = await request(app)
          .post('/api/tickets')
          .send(body);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('ValidationError');
        expect(apiState.tickets).toHaveLength(0);
      },
    );

    // Endpoint: POST /api/tickets. Malformed JSON is rejected by Express with status 400.
    it('returns 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Content-Type', 'application/json')
        .send('{"serviceId":');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ValidationError');
      expect(apiState.tickets).toHaveLength(0);
    });

    // Endpoint: POST /api/tickets. Reaching the daily maximum returns a conflict without inserting another ticket.
    it('returns 409 when the daily ticket limit is reached', async () => {
      apiState.services = [
        { id: 1, name: 'Shipping', prefix: 'S' },
      ];

      const { clock } = await import('../../src/clock.js');
      apiState.tickets = [{
        serviceId: 1,
        day: clock.today(),
        number: 999,
        status: 'WAITING',
      }];

      const response = await request(app)
        .post('/api/tickets')
        .send({ serviceId: 1 });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('DailyLimitReachedError');
      expect(apiState.tickets).toHaveLength(1);
    });

    // Endpoint: POST /api/tickets. Ticket numbering is independent for each service.
    it('issues independent ticket numbers for different services', async () => {
      apiState.services = [
        { id: 1, name: 'Shipping', prefix: 'S' },
        { id: 2, name: 'Payments', prefix: 'P' },
      ];

      const firstResponse = await request(app)
        .post('/api/tickets')
        .send({ serviceId: 1 });

      const secondResponse = await request(app)
        .post('/api/tickets')
        .send({ serviceId: 2 });

      expect(firstResponse.status).toBe(201);
      expect(firstResponse.body).toEqual({ code: 'S-001' });
      expect(secondResponse.status).toBe(201);
      expect(secondResponse.body).toEqual({ code: 'P-001' });
    });

    // Endpoint: POST /api/tickets. A valid but unknown service ID returns 422.
    it('returns 422 when the requested service does not exist', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send({ serviceId: 99 });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: 'ServiceNotFoundError',
        message: 'Service 99 does not exist',
      });
      expect(apiState.tickets).toHaveLength(0);
    });
  });
});