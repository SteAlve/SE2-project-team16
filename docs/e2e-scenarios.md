# E2E scenarios: Get ticket

Story OQM-1: *As a customer I want to select a service so that I get served when my turn comes.*

This is the list of things the E2E tests will check for this story, using the real client and
the real server. Each scenario will become one test (OQM-46).

## Test data

Each test run starts from a fresh database with the sample services and counters:

```bash
npm run db:create
npm run db:seed
```

| id | Service | Prefix | Service time | Counters |
|---|---|---|---|---|
| 1 | Shipping | S | 10 min | 2, 3 |
| 2 | Bill payment | P | 5 min | 4, 5, 6 |
| 3 | Accounts | A | 5 min | 1, 2 |
| 4 | Registered mail pickup | R | 3 min | 3, 4 |
| 5 | Money transfer | M | 8 min | 5, 6 |
| 6 | Pensions | N | 12 min | 6 |

There are no tickets yet, so the first ticket of every service is 001.

## Main flow

### S1. The customer sees the services

- **Given** the sample services are loaded
- **When** the customer opens the service selection page
- **Then** they see "What service do you need?"
- **And** one card per service, in alphabetical order: Accounts, Bill payment, Money transfer,
  Pensions, Registered mail pickup, Shipping

### S2. The customer gets a ticket

- **Given** nobody has taken a ticket today
- **When** the customer picks "Bill payment"
- **Then** they see "Your ticket"
- **And** their code is `P-001`

### S3. The customer goes back to the services

- **Given** the customer is looking at their ticket
- **When** they press "Ok"
- **Then** they're back on the service selection page

## Unique codes

### S4. Two customers of the same service get different codes

- **Given** someone already has `P-001`
- **When** the next customer picks "Bill payment"
- **Then** their code is `P-002`

### S5. Each service counts on its own

- **Given** someone already has `P-001`
- **When** the next customer picks "Shipping"
- **Then** their code is `S-001`

### S6. Reloading the ticket page doesn't give a new ticket

- **Given** the customer has `P-001` on screen
- **When** they reload the page
- **Then** they still see `P-001`
- **And** the next "Bill payment" customer gets `P-002`, not `P-003`

## Queue update

### S7. A new ticket joins the end of its queue

- **Given** two customers already have `S-001` and `S-002`
- **When** a third customer picks "Shipping"
- **Then** their code is `S-003`
- **And** the Shipping queue now has 3 people waiting, in the order `S-001`, `S-002`, `S-003`

The display board isn't part of this sprint, so for now we check the queue in the database.

## Error cases

### S8. No services set up yet

- **Given** a fresh database without the sample services
- **When** the customer opens the service selection page
- **Then** they see "No services are available at the moment."

### S9. The server is down

- **Given** the server isn't running
- **When** the customer opens the service selection page
- **Then** they see "Unable to reach the server."
- **And** a "Try again" button

### S10. The ticket page is opened without picking a service

- **When** the customer goes straight to the ticket page
- **Then** they see "No service selected."
- **And** no ticket is created

### S11. The service doesn't exist anymore

- **Given** the customer picked a service that was removed in the meantime
- **When** the ticket is requested
- **Then** they see "This service is no longer available."
- **And** there's no "Try again" button

Services can't be removed yet, so the test fakes the server's answer (422).

### S12. No more tickets today

- **Given** 999 "Bill payment" tickets were already taken today
- **When** the customer picks "Bill payment"
- **Then** they see "No more tickets available today for this service."
- **And** there's no "Try again" button

The test puts the 999 tickets straight into the database before starting.

## To discuss with the team

- The client has pages at `/select-service` and `/show-ticket`, but nothing at `/` yet. The tests
  start from `/select-service` until we decide what the home page should be.
