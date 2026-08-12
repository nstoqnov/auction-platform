# AUREUM — Design System

Light-editorial auction house. Warm ivory canvas, near-black ink, a single brass
accent, with functional green (bid up) and red (outbid) states.

## Tokens (never use raw hex in components)

Defined in `src/index.css` as RGB channels; exposed to Tailwind in
`tailwind.config.js`. Use the Tailwind class names:

| Token | Class examples | Meaning |
|-------|----------------|---------|
| `canvas` | `bg-canvas` | Page background (warm ivory) |
| `surface` / `surface-2` | `bg-surface` | Cards / alt surface |
| `ink` / `ink-soft` / `ink-muted` | `text-ink` | Text: primary / secondary / captions |
| `line` / `line-strong` | `border-line` | Hairlines |
| `brand` / `brand-soft` / `brand-ink` | `bg-brand text-brand-ink` | Brass accent + fill text |
| `bid` / `bid-soft` | `text-bid` | Winning / price up (green) |
| `outbid` / `outbid-soft` | `text-outbid` | Outbid / ending soon (red) |

Opacity modifiers work on every token (e.g. `bg-canvas/80`, `text-canvas/60`).

## Type
- Display / headings: **Playfair Display** → `font-display`
- Body / UI: **Inter** → `font-sans`
- Figures (prices, timers): tabular via `.tnum`
- Fluid heading sizes: `text-display-xl` / `-lg` / `-md`

## Component classes (in `src/index.css`)
`.btn-brand` `.btn-dark` `.btn-outline` `.btn-ghost` (+ `.btn-sm` `.btn-lg`),
`.card-surface` `.lot-card`, `.badge-bid` `.badge-outbid` `.badge-neutral`
`.badge-live`, `.field` `.field-label`, `.eyebrow`, `.container-content`,
`.section`, `.skeleton`, `.rule`.

## Motion
Restrained, transform/opacity only. Scroll reveals via `useReveal` /
`useRevealGroup` (add `.reveal` + optional `style={{transitionDelay}}`).
All motion is disabled under `prefers-reduced-motion`.

## Shared building blocks
- `components/AuctionCard.js` — the canonical lot card (+ `currency`, `PLACEHOLDER`)
- `components/Icons.js` — inline SVG icon set (no icon fonts / emoji)
- `components/Logo.js` — wordmark; rename via `BRAND_NAME`
- `hooks/useCountdown.js`, `hooks/useReveal.js`

## Build pipeline
Tailwind runs through **Create React App's native support** (react-scripts
5.0.1 auto-detects `tailwind.config.js` and adds the Tailwind PostCSS plugin).
No CRACO / eject needed — `npm start` and `npm run build` work as-is. Preflight
is enabled.

## Migration status
**Complete.** Every page is on Tailwind; Bootstrap and `bootstrap-icons` have
been uninstalled and removed. All per-page `.css` files were deleted (only
`src/index.css` remains). Icons come from `components/Icons.js`.
