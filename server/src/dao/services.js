import { all, get } from './db.js';

const selectService = `
  SELECT id, tag AS name, prefix
  FROM service`;

export const findAll = () => all(`${selectService} ORDER BY name`);

export const findById = (id) => get(`${selectService} WHERE id = :id`, { id });

export const list = findAll;

export const create = ({ tag, prefix, serviceTime }) => get(
  `INSERT INTO service (tag, prefix, service_time)
   VALUES (:tag, :prefix, :serviceTime)
   RETURNING id, tag, prefix, service_time AS serviceTime`,
  { tag, prefix, serviceTime },
);
