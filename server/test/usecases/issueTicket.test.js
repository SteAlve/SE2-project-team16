import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DailyLimitReachedError, ServiceNotFoundError } from '../../src/domain/errors.js';
import { MAX_TICKETS_PER_DAY } from '../../src/domain/ticketCode.js';
import { makeIssueTicket } from '../../src/usecases/issueTicket.js';

describe('makeIssueTicket', () => {
  const serviceId = 7;
  const day = '2026-10-09';
  let services;
  let tickets;
  let clock;
  let inTransaction;
  let issueTicket;

  beforeEach(() => {
    services = {
      findById: vi.fn(() => ({ id: serviceId, prefix: 'S' })),
    };
    tickets = {
      lastNumber: vi.fn(() => 0),
      insert: vi.fn(),
    };
    clock = {
      today: vi.fn(() => day),
    };
    inTransaction = vi.fn((callback) => callback());
    issueTicket = makeIssueTicket({ services, tickets, clock, inTransaction });
  });

  it('issues and inserts the next ticket within a transaction', () => {
    expect(issueTicket(serviceId)).toEqual({ code: 'S-001' });

    expect(services.findById).toHaveBeenCalledExactlyOnceWith(serviceId);
    expect(clock.today).toHaveBeenCalledOnce();
    expect(inTransaction).toHaveBeenCalledOnce();
    expect(tickets.lastNumber).toHaveBeenCalledExactlyOnceWith(serviceId, day);
    expect(tickets.insert).toHaveBeenCalledExactlyOnceWith(serviceId, day, 1);
  });

  it('throws when the service does not exist without reading or writing tickets', () => {
    services.findById.mockReturnValue(undefined);

    expect(() => issueTicket(serviceId)).toThrow(new ServiceNotFoundError(serviceId));

    expect(clock.today).not.toHaveBeenCalled();
    expect(inTransaction).not.toHaveBeenCalled();
    expect(tickets.lastNumber).not.toHaveBeenCalled();
    expect(tickets.insert).not.toHaveBeenCalled();
  });

  it('does not insert a ticket when the daily limit has been reached', () => {
    tickets.lastNumber.mockReturnValue(MAX_TICKETS_PER_DAY);

    expect(() => issueTicket(serviceId)).toThrow(new DailyLimitReachedError(serviceId));

    expect(tickets.lastNumber).toHaveBeenCalledExactlyOnceWith(serviceId, day);
    expect(tickets.insert).not.toHaveBeenCalled();
  });
});
