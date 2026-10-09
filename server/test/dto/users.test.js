import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/domain/errors.js';
import { parseCreateUser, toUserDto } from '../../src/dto/users.js';

describe('users DTO', () => {
  // DTO: users. Validation rule: trims usernames and accepts each declared role without a counter.
  it.each(['OFFICER', 'MANAGER', 'ADMIN'])('parses a valid %s user', (role) => {
    expect(parseCreateUser({
      username: '  alice  ',
      password: 'secret',
      role,
    })).toEqual({
      username: 'alice',
      password: 'secret',
      role,
      counterNumber: null,
    });
  });

  // DTO: users. Validation rule: an OFFICER may be assigned a positive integer counter number.
  it('parses an officer with a numeric counter number', () => {
    expect(parseCreateUser({
      username: 'alice',
      password: 'secret',
      role: 'OFFICER',
      counterNumber: '3',
    })).toEqual({
      username: 'alice',
      password: 'secret',
      role: 'OFFICER',
      counterNumber: 3,
    });
  });

  // DTO: users. Validation rule: username is required and cannot be empty or whitespace.
  it.each([undefined, '', '   '])(
    'rejects a missing or empty username (%s)',
    (username) => {
      expect(() => parseCreateUser({
        username,
        password: 'secret',
        role: 'OFFICER',
      })).toThrow(ValidationError);
    },
  );

  // DTO: users. Validation rule: password must be a non-empty string.
  it.each([undefined, '', 123])(
    'rejects a missing, empty, or non-string password (%s)',
    (password) => {
      expect(() => parseCreateUser({
        username: 'alice',
        password,
        role: 'OFFICER',
      })).toThrow(ValidationError);
    },
  );

  // DTO: users. Validation rule: role must be OFFICER, MANAGER, or ADMIN.
  it.each([undefined, 'CUSTOMER'])('rejects an invalid role (%s)', (role) => {
    expect(() => parseCreateUser({
      username: 'alice',
      password: 'secret',
      role,
    })).toThrow(ValidationError);
  });

  // DTO: users. Validation rule: a supplied counter number must be a positive integer.
  it.each([0, -1, 1.5, 'not-a-number'])(
    'rejects an invalid counter number (%s)',
    (counterNumber) => {
      expect(() => parseCreateUser({
        username: 'alice',
        password: 'secret',
        role: 'OFFICER',
        counterNumber,
      })).toThrow(ValidationError);
    },
  );

  // DTO: users. Validation rule: only an OFFICER may be assigned a counter.
  it.each(['MANAGER', 'ADMIN'])(
    'rejects a counter assignment for a %s',
    (role) => {
      expect(() => parseCreateUser({
        username: 'alice',
        password: 'secret',
        role,
        counterNumber: 1,
      })).toThrow(ValidationError);
    },
  );

  // DTO: users. Mapping rule: exposes public user fields without password or password hash.
  it('maps a user to the public DTO shape', () => {
    expect(toUserDto({
      id: 5,
      username: 'alice',
      role: 'OFFICER',
      counterNumber: 3,
      passwordHash: 'sensitive-hash',
    })).toEqual({
      id: 5,
      username: 'alice',
      role: 'OFFICER',
      counterNumber: 3,
    });
  });
});