import { Router } from 'express';

/**
 * Creates a router for services.
 * @param {Object} param0 - The dependencies for the router.
 * @param {Function} param0.listServicesController - The controller for listing services.
 * @returns {Object} A router object.
 */
export const makeServicesRouter = ({ listServicesController }) => {
  const router = Router();
  router.get('/services', listServicesController);
  return router;
};
