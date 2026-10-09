-- Sample services and counters so you can try the app and run the E2E tests.
-- Load them with `npm run db:seed`, after `npm run db:create`.
-- Running it again is fine: anything that's already there is skipped.

-- service_time is in minutes
INSERT OR IGNORE INTO service (id, tag, prefix, service_time) VALUES
  (1, 'Shipping', 'S', 10),
  (2, 'Bill payment', 'P', 5),
  (3, 'Accounts', 'A', 5),
  (4, 'Registered mail pickup', 'R', 3),
  (5, 'Money transfer', 'M', 8),
  (6, 'Pensions', 'N', 12);

INSERT OR IGNORE INTO counter (number) VALUES (1), (2), (3), (4), (5), (6);

-- Which services each counter handles. Every service has at least one counter.
INSERT OR IGNORE INTO counter_service (counter_number, service_id) VALUES
  (1, 3),
  (2, 1), (2, 3),
  (3, 1), (3, 4),
  (4, 2), (4, 4),
  (5, 2), (5, 5),
  (6, 2), (6, 5), (6, 6);
