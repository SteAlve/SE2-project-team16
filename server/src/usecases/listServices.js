/**
 * Creates a use case for listing services.
 * @param {Object} param0 - The dependencies for the use case.
 * @param {Object} param0.services - The services DAO.
 * @returns {Function} A function that lists all services.
 */
export const makeListServices = ({ services }) => () => services.findAll();
