-- SQLite database schema for the office-queue server.
-- Foreign-key enforcement must be enabled by the connection (PRAGMA foreign_keys = ON).

CREATE TABLE IF NOT EXISTS counter (
  number INTEGER UNIQUE
);

CREATE TABLE IF NOT EXISTS service (
  id INTEGER PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE,
  service_time INTEGER NOT NULL CHECK (service_time > 0)
);

CREATE TABLE IF NOT EXISTS counter_service (
  counter_number INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  PRIMARY KEY (counter_number, service_id),
  FOREIGN KEY (counter_number) REFERENCES counter (number),
  FOREIGN KEY (service_id) REFERENCES service (id)
);

CREATE TABLE IF NOT EXISTS ticket (
  id INTEGER PRIMARY KEY,
  day TEXT NOT NULL,
  number INTEGER NOT NULL CHECK (number > 0),
  service_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'WAITING'
    CHECK (status IN ('WAITING', 'SERVING', 'COMPLETED', 'CANCELLED')),
  UNIQUE (day, number),
  FOREIGN KEY (service_id) REFERENCES service (id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_waiting_queue
  ON ticket (day, service_id, status, number);
