import { ValidationError } from '../domain/errors.js';

export const parseCreateTicket = (body) => {
  if (body === undefined || body === null || body.serviceId === undefined) {
    throw new ValidationError('serviceId is required');
  }

  const serviceId = Number(body.serviceId);
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    throw new ValidationError('serviceId must be a positive integer');
  }
  return { serviceId };
};

export const toTicketDto = ({ code }) => ({ code });
