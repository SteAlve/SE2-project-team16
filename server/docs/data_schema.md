# Data schema

## user

| Column | Type | Constraints |
| --- | --- | --- |
| id | INTEGER | PRIMARY KEY |
| username | TEXT | NOT NULL, UNIQUE |
| password_hash | TEXT | NOT NULL |
| role | TEXT | NOT NULL; `OFFICER`, `MANAGER`, or `ADMIN` |
| counter_number | INTEGER | NULL; references `counter(number)` and can be set only for an `OFFICER` |

## counter

| Column | Type | Constraints |
| --- | --- | --- |
| number | INTEGER | PRIMARY KEY |

## service

| Column | Type | Constraints |
| --- | --- | --- |
| id | INTEGER | PRIMARY KEY |
| tag | TEXT | NOT NULL, UNIQUE |
| prefix | TEXT | NOT NULL, UNIQUE, exactly one character; used in ticket codes such as `A-001` |
| service_time | INTEGER | NOT NULL, greater than 0 |
| image | TEXT | NULL; file name only (e.g. `shipping.jpg`), stored in `server/public/images/services/` |

## counter_service

Maps the services offered by each counter.

| Column | Type | Constraints |
| --- | --- | --- |
| counter_number | INTEGER | NOT NULL, references `counter(number)` |
| service_id | INTEGER | NOT NULL, references `service(id)` |

The pair `(counter_number, service_id)` is the primary key.

## ticket

| Column | Type | Constraints |
| --- | --- | --- |
| id | INTEGER | PRIMARY KEY |
| day | TEXT | NOT NULL; business day in `YYYY-MM-DD` format |
| number | INTEGER | NOT NULL, greater than 0 |
| service_id | INTEGER | NOT NULL, references `service(id)` |
| counter_number | INTEGER | NULL until called; together with `service_id`, references `counter_service` |
| status | TEXT | NOT NULL; `WAITING`, `SERVING`, `COMPLETED`, or `CANCELLED` |

The triple `(day, number, service_id)` is unique, so each service starts its numbering at `1` each business day. A counter can have at most one `SERVING` ticket, and it can serve only a service assigned to it.
