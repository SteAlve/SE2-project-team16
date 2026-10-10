import { ValidationError } from '../domain/errors.js';

export const parseCreateService = (body) => {
  const tag = body?.tag?.trim();
  const prefix = body?.prefix?.trim();
  const serviceTime = Number(body?.serviceTime);

  if (!tag) throw new ValidationError('tag is required');
  if (!prefix || [...prefix].length !== 1) {
    throw new ValidationError('prefix must be exactly one character');
  }
  if (!Number.isInteger(serviceTime) || serviceTime <= 0) {
    throw new ValidationError('serviceTime must be a positive integer');
  }
  return { tag, prefix, serviceTime };
};

export const SERVICE_IMAGES_PATH = '/api/images/services';

export const toServiceDto = ({ id, name, prefix, image }) => ({
  id,
  name,
  prefix,
  imageUrl: image ? `${SERVICE_IMAGES_PATH}/${image}` : null,
});
