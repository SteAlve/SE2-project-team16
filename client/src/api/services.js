import { request } from './request.js';

/** @returns {Promise<{id: number, name: string, prefix: string}[]>} */
export const getServices = () => request('/services');
