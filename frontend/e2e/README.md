# End-to-end tests (Playwright)

These drive a real browser against a **running** app. Unlike the Jest/RTL unit tests
(`npm test`), they need the frontend (and, for full journeys, the backend) up.

## One-time setup
```bash
npm install
npx playwright install    # download browser binaries
```

## Run
```bash
# 1. start the app in another terminal
npm start                 # http://localhost:3000

# 2. run the smoke suite
npm run test:e2e
```

Point at a different environment with `E2E_BASE_URL`:
```bash
E2E_BASE_URL=https://staging.example.com npm run test:e2e
```

## Notes
- `smoke.spec.js` only checks that the SPA loads and routing works (no seeded data
  required). Extend it to a real journey — log in → open a lot → place a bid → assert
  the live price updates over WebSockets — once you run it against a full stack.
- Selectors are best-effort; adjust them to your markup after the first run.
