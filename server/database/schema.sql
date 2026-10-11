-- SQLite database schema for the office-queue server.
-- Foreign-key enforcement must be enabled by the connection (PRAGMA foreign_keys = ON).

CREATE TABLE IF NOT EXISTS "user" (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OFFICER', 'MANAGER', 'ADMIN')),
  counter_number INTEGER,
  CHECK (role = 'OFFICER' OR counter_number IS NULL),
  FOREIGN KEY (counter_number) REFERENCES counter (number)
);

CREATE TABLE IF NOT EXISTS counter (
  number INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS service (
  id INTEGER PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL UNIQUE CHECK (length(prefix) = 1),
  service_time INTEGER NOT NULL CHECK (service_time > 0),
  image TEXT
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
  counter_number INTEGER,
  status TEXT NOT NULL DEFAULT 'WAITING'
    CHECK (status IN ('WAITING', 'SERVING', 'COMPLETED', 'CANCELLED')),
  CHECK (status NOT IN ('SERVING', 'COMPLETED') OR counter_number IS NOT NULL),
  UNIQUE (day, number, service_id),
  FOREIGN KEY (service_id) REFERENCES service (id),
  FOREIGN KEY (counter_number, service_id)
    REFERENCES counter_service (counter_number, service_id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_waiting_queue
  ON ticket (day, service_id, status, number);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ticket_one_serving_per_counter
  ON ticket (counter_number) WHERE status = 'SERVING';
