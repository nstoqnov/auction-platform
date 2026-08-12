# Auction Platform — Frontend

The **React** frontend for the auction platform: browse and create auctions, place **live bids** that
update in real time over WebSockets, and pay for winnings through Stripe.

> Backend (Java / Spring Boot) lives in a separate project — see [Backend](#backend).

## Features

- **Live bidding** — bid updates stream in over WebSockets (STOMP/SockJS); no refresh needed.
- **Auth** — email/password login with JWT, Google OAuth2 sign-in, and email verification.
- **Auctions** — browse, view detail with a live countdown, and create listings with image upload.
- **Payments** — Stripe Checkout flow for the winning bidder, with a payment-status page.
- **Messaging** — in-app chat.
- **Role-aware UI** — an admin area for management.

## Tech stack

React (Create React App) · React Router · Axios · `@stomp/stompjs` + SockJS (WebSockets) ·
`@stripe/stripe-js` · `jwt-decode`.

## Running it

```bash
npm install
cp .env.example .env         # set REACT_APP_API_URL if your backend isn't on localhost:8080
npm start                    # dev server on :3000
npm run build                # production build
```

The backend URL is configurable via `REACT_APP_API_URL` (defaults to `http://localhost:8080`) — see
`src/config.js`. Nothing is hardcoded, so the same build points at any environment.

## Project structure

```
src/
├── api.js            axios instance with a JWT request interceptor
├── config.js         API base URL (from REACT_APP_API_URL)
├── AuthContext.js    auth state / current user
├── pages/            Auctions, AuctionDetail, Checkout, Auth, Profile, Admin, Messages, …
├── components/       NavBar, AuctionCard, ChatBox, Footer, …
└── hooks/            useCountdown, useReveal
```

## Backend

Requires the auction backend running (default `http://localhost:8080`). *(link your backend repo here)*
