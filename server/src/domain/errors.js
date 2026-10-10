// Base classes: app.js maps them to HTTP status codes (400 / 409 / 422).
// `name` is the concrete class name, so the API can answer { error: err.name, message: err.message }.
export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {}     // -> 400
export class ConflictError extends DomainError {}       // -> 409
export class UnprocessableError extends DomainError {}  // -> 422

/**
 * Error thrown when a service is not found.
 * @param {number} serviceId - The ID of the service that was not found.
 * @extends UnprocessableError code: 422
 * @example throw new ServiceNotFoundError(serviceId);
 */
export class ServiceNotFoundError extends UnprocessableError {
  constructor(serviceId) {
    super(`Service ${serviceId} does not exist`);
  }
}

/**
 * Error thrown when the daily limit of tickets for a service is reached.
 * @param {number} serviceId - The ID of the service for which the limit is reached.
 * @extends ConflictError code: 409
 * @example throw new DailyLimitReachedError(serviceId);
 */
export class DailyLimitReachedError extends ConflictError {
  constructor(serviceId) {
    super(`No more tickets available today for service ${serviceId}`);
  }
}
