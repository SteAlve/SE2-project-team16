import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const readSql = (relativePath) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
const imagesDir = fileURLToPath(new URL('../../public/images/services/', import.meta.url));

const expectedImages = {
  Shipping: 'shipping.jpg',
  'Bill payment': 'bill-payment.jpg',
  Accounts: 'accounts.jpg',
  'Registered mail pickup': 'registered-mail-pickup.jpg',
  'Money transfer': 'money-transfer.jpg',
  Pensions: 'pensions.jpg',
};

let db;

beforeEach(() => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  db.exec(readSql('../../database/schema.sql'));
  db.exec(readSql('../../database/seed.sql'));
});

afterEach(() => {
  db.close();
});

describe('seed: service images', () => {
  // Seed rule: every seeded service has the expected image file name.
  it('assigns the expected image file name to each service', () => {
    const rows = db.prepare('SELECT tag, image FROM service ORDER BY id').all();

    expect(Object.fromEntries(rows.map(({ tag, image }) => [tag, image])))
      .toEqual(expectedImages);
  });

  // Seed rule: each image name points to a file that really exists in public/images/services.
  it.each(Object.values(expectedImages))('has the file %s in public/images/services', (file) => {
    expect(existsSync(`${imagesDir}${file}`)).toBe(true);
  });

  // Seed rule: the image column stores only the file name, never a path or URL.
  it('stores only file names', () => {
    const images = db.prepare('SELECT image FROM service').all().map(({ image }) => image);

    for (const image of images) {
      expect(image).not.toMatch(/[\\/]/);
    }
  });
});
