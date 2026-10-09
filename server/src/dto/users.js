import { ValidationError } from '../domain/errors.js';

const roles = new Set(['OFFICER', 'MANAGER', 'ADMIN']);

export const parseCreateUser = (body) => {
  const username = body?.username?.trim();
  const password = body?.password;
  const role = body?.role;
  const counterValue = body?.counterNumber;
  const counterNumber = counterValue === undefined || counterValue === null
    ? null
    : Number(counterValue);

  if (!username) throw new ValidationError('username is required');
  if (typeof password !== 'string' || password.length === 0) {
    throw new ValidationError('password is required');
  }
  if (!roles.has(role)) throw new ValidationError('role must be OFFICER, MANAGER, or ADMIN');
  if (counterNumber !== null && (!Number.isInteger(counterNumber) || counterNumber <= 0)) {
    throw new ValidationError('counterNumber must be a positive integer');
  }
  if (role !== 'OFFICER' && counterNumber !== null) {
    throw new ValidationError('counterNumber can be set only for an OFFICER');
  }

  return { username, password, role, counterNumber };
};

export const toUserDto = ({ id, username, role, counterNumber }) => ({
  id, username, role, counterNumber,
});
