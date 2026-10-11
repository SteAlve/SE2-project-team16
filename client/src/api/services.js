import { request } from './request.js';

/** @returns {Promise<{id: number, name: string, prefix: string, imageUrl: string | null}[]>} */
export const getServices = () => request('/services');
