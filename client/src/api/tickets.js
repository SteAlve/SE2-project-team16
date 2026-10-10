import { request } from './request.js';

/** @returns {Promise<{code: string}>} */
export const issueTicket = (serviceId) =>
  request('/tickets', { method: 'POST', body: JSON.stringify({ serviceId }) });
