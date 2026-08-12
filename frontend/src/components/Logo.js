import React from "react";

// Rename the house in one place.
export const BRAND_NAME = "AUREUM";
export const BRAND_TAGLINE = "Auction House";

/**
 * AUREUM wordmark — a gilt seal monogram + Playfair Display wordmark.
 * tone: "ink" (default, for light surfaces) or "canvas" (for dark surfaces).
 */
const Logo = ({ size = 38, showText = true, tone = "ink", className = "" }) => {
  const textColor =
    tone === "canvas" ? "rgb(var(--color-canvas))" : "rgb(var(--color-ink))";
  const tagColor =
    tone === "canvas" ? "rgb(var(--color-canvas) / 0.6)" : "rgb(var(--color-ink-muted))";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`${BRAND_NAME} logo`}
      >
        {/* Gilt seal */}
        <circle cx="24" cy="24" r="22" stroke="rgb(var(--color-brand))" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="18.5" stroke="rgb(var(--color-brand))" strokeWidth="0.75" opacity="0.5" />
        {/* Serif "A" monogram */}
        <path
          d="M24 12.5 33 34h-4.4l-1.7-4.3h-5.8L19.4 34H15L24 12.5Zm0 8.1-2.1 5.4h4.2L24 20.6Z"
          fill="rgb(var(--color-brand))"
        />
        {/* Gavel accent dot */}
        <circle cx="24" cy="37.5" r="1.4" fill="rgb(var(--color-brand))" />
      </svg>

      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className="font-display font-semibold tracking-brand"
            style={{ color: textColor, fontSize: size * 0.5, letterSpacing: "0.16em" }}
          >
            {BRAND_NAME}
          </span>
          <span
            className="mt-0.5 font-sans text-[9px] font-medium uppercase tracking-brand"
            style={{ color: tagColor }}
          >
            {BRAND_TAGLINE}
          </span>
        </span>
      )}
    </span>
  );
};

export default Logo;
