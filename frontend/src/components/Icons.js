import React from "react";

/**
 * Lightweight inline icon set — single visual language (1.75 stroke, round
 * caps/joins) so the new UI never depends on emoji or icon fonts.
 * Each icon inherits `currentColor` and accepts size + className.
 */
const base = (size) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
});

export const Icon = {
  Gavel: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="m14 12-8.5 8.5a2.1 2.1 0 0 1-3-3L11 9" />
      <path d="m9.5 6.5 8 8" />
      <path d="m12.5 3.5 8 8" />
      <path d="m8.5 7.5 8 8" />
      <path d="M17 21h5" />
    </svg>
  ),
  ArrowRight: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  ),
  ArrowUpRight: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  ),
  Clock: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  Search: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-3.5-3.5" />
    </svg>
  ),
  Menu: ({ size = 24, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  Close: ({ size = 24, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  Bell: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
  Chat: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    </svg>
  ),
  User: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  ),
  Logout: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17 5 12l5-5" />
      <path d="M5 12h11" />
    </svg>
  ),
  Check: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="m4 12 5 5 11-11" />
    </svg>
  ),
  ShieldCheck: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Sparkle: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4z" />
    </svg>
  ),
  Bolt: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  ),
  Trophy: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
      <path d="M7 6H4v1a4 4 0 0 0 3 3.8M17 6h3v1a4 4 0 0 1-3 3.8" />
      <path d="M10 14h4M9 20h6M12 14v6" />
    </svg>
  ),
  Tag: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  ),
  Heart: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" />
    </svg>
  ),
  ChevronDown: ({ size = 18, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  Inbox: ({ size = 20, className = "" }) => (
    <svg {...base(size)} className={className}>
      <path d="M3 12h5l2 3h4l2-3h5" />
      <path d="M5 6h14l2 6v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
    </svg>
  ),
};

export default Icon;
