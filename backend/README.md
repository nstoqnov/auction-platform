# Auction Platform — Backend

A full-featured online auction backend in **Java + Spring Boot**: real-time bidding over
WebSockets, secure auth (JWT + Google OAuth2), Stripe payments, and concurrency-safe bids.

> Frontend (React) lives in a separate project — see [Repository layout](#repository-layout).

## Overview

Users register (with email verification), browse and create auctions, and place **live bids** that
are broadcast to everyone watching over WebSockets. When an auction closes, the winning bidder pays
through Stripe. Bidding is protected against concurrent lost-updates with optimistic locking.

## What it demonstrates

- **Authentication & authorization** — JWT-based login *and* Google OAuth2, role-based access
  (user/admin), and email-verification on sign-up.
- **Real-time bidding** — WebSockets (STOMP) push bid updates to all viewers instantly; in-app chat too.
- **Concurrency safety** — `@Version` optimistic locking prevents lost bids when two users bid at the
  same instant; a concurrent conflict returns **409** for the client to retry.
- **Payments** — Stripe Checkout sessions plus webhook handling for the winning bidder.
- **Clean error handling** — typed exceptions mapped to RFC 7807 `ProblemDetail` responses with correct
  status codes (**404 / 400 / 403 / 409**), and a safe 500 catch-all.
- **Scheduled lifecycle** — a scheduler transitions auctions (activation / closing).
- **External integrations** — Cloudinary (image hosting) and SMTP email (best-effort, so a mail hiccup
  never fails a registration).
- **Layered design** — controllers → services → repositories, with DTOs and mappers.
- **Tested end to end** — 76 tests: Mockito unit tests for logic + **Testcontainers** integration tests
  against a real PostgreSQL.

## Tech stack

Java 17 · Spring Boot 3.4 · Spring Security · Spring Data JPA · PostgreSQL · WebSocket/STOMP ·
Stripe · Cloudinary · JWT · Maven · Testcontainers · Mockito.

## Running it

All secrets are injected from the environment — **nothing sensitive is committed**. Copy
`.env.example`, fill in your values, and export them (or use your run configuration).

```bash
# requires a running PostgreSQL and the env vars from .env.example
./mvnw spring-boot:run     # starts on :8080
./mvnw test                # unit + Testcontainers integration tests (needs Docker)
```

Required env vars (see `.env.example`): `DB_*`, `JWT_SECRET`, `STRIPE_API_KEY`,
`STRIPE_WEBHOOK_SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `MAIL_USERNAME/PASSWORD`, `CLOUDINARY_*`.

## API areas

| Area | Endpoints (prefix `/api`) |
|------|----------------------------|
| Auth | register, login, Google OAuth2, verify-email |
| Auctions | create, list, detail |
| Bids | place bid (broadcast over WebSocket), list per auction |
| Categories | list / manage |
| Payments | Stripe checkout session + webhook |
| Images | upload (Cloudinary) |
| Users / Admin | profile, admin management |

## Testing

- **Unit (Mockito)** — service logic with mocked repositories (e.g. bid validation).
- **Integration (Testcontainers Postgres)** — controllers exercised end-to-end against a real database.

## Notes / what I'd improve next

- Schema is currently Hibernate-managed (`ddl-auto=update`); a production version would use **Flyway
  migrations** with `ddl-auto=validate` for versioned, reviewable schema changes.
- Server-side bid **retry** on optimistic-lock conflict (instead of returning 409) would be a nicer UX.

## Repository layout

- **Backend** (this repo) — Java / Spring Boot.
- **Frontend** — React (Create React App): live bidding UI, Stripe checkout, auth. *(link your frontend repo here)*
