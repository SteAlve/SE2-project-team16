# Data schema

## counter

| Column | Type | Constraints |
| --- | --- | --- |
| number | INTEGER | UNIQUE |

## service

| Column | Type | Constraints |
| --- | --- | --- |
| id | INTEGER | PRIMARY KEY |
| tag | TEXT | NOT NULL, UNIQUE |
| service_time | INTEGER | NOT NULL, greater than 0 |

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
| status | TEXT | NOT NULL; `WAITING`, `SERVING`, `COMPLETED`, or `CANCELLED` |

The pair `(day, number)` is unique, so ticket numbers start over each business day.
