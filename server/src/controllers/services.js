import { toServiceDto } from '../dto/services.js';

/**
 * Creates a controller for listing services.
 * @param {Object} param0 - The dependencies for the controller.
 * @param {Function} param0.listServices - The function to list services.
 * @returns {Function} A controller function for listing services.
 */
export const makeListServicesController = ({ listServices }) => (_req, res) => {
  // no parseXxx needed, because no input is expected
  res.status(200).json(listServices().map(toServiceDto));
};
