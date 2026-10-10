import { ValidationError } from '../domain/errors.js';

const positiveInteger = (value, field) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new ValidationError(`${field} must be a positive integer`);
  }
  return number;
};

export const parseCreateCounter = (body) => ({
  number: positiveInteger(body?.number, 'number'),
});

export const parseAssignService = (body) => ({
  counterNumber: positiveInteger(body?.counterNumber, 'counterNumber'),
  serviceId: positiveInteger(body?.serviceId, 'serviceId'),
});

export const toCounterDto = ({ number }) => ({ number });
