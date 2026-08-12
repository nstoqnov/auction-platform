/** @type {import('tailwindcss').Config} */
// AUREUM — light-editorial auction house design system.
// All values are exposed as CSS variables in src/index.css so components
// reference semantic tokens, never raw hex.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // Tokens are stored as raw RGB channels in :root so Tailwind's
        // /opacity modifiers work everywhere (e.g. bg-canvas/80).
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-2": "rgb(var(--color-surface-2) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--color-ink-soft) / <alpha-value>)",
        "ink-muted": "rgb(var(--color-ink-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        "line-strong": "rgb(var(--color-line-strong) / <alpha-value>)",
        brand: "rgb(var(--color-brand) / <alpha-value>)",
        "brand-ink": "rgb(var(--color-brand-ink) / <alpha-value>)",
        bid: "rgb(var(--color-bid) / <alpha-value>)",
        outbid: "rgb(var(--color-outbid) / <alpha-value>)",
        // Fixed-alpha soft tints for chips / wash backgrounds
        "brand-soft": "rgb(var(--color-brand) / 0.16)",
        "bid-soft": "rgb(var(--color-bid) / 0.12)",
        "outbid-soft": "rgb(var(--color-outbid) / 0.14)",
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Fluid display scale for editorial headlines
        "display-xl": ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.25rem, 4.5vw, 3.75rem)", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        card: "14px",
        pill: "999px",
      },
      boxShadow: {
        // Soft, editorial elevation scale (warm-tinted, never harsh black)
        subtle: "0 1px 2px rgba(28, 25, 20, 0.04), 0 1px 3px rgba(28, 25, 20, 0.06)",
        card: "0 2px 8px rgba(28, 25, 20, 0.05), 0 8px 24px rgba(28, 25, 20, 0.06)",
        lift: "0 12px 32px rgba(28, 25, 20, 0.10), 0 2px 8px rgba(28, 25, 20, 0.06)",
        ring: "0 0 0 3px rgb(var(--color-brand) / 0.16)",
      },
      letterSpacing: {
        brand: "0.18em",
      },
      maxWidth: {
        content: "1200px",
        prose: "68ch",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)", // gentle ease-out
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.5s ease both",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
