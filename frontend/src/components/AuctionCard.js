import React from "react";
import { useNavigate } from "react-router-dom";
import { useCountdown, pad } from "../hooks/useCountdown";
import Icon from "./Icons";

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23f2efe8'/><text x='50%' y='50%' fill='%23b8b1a3' font-family='Georgia' font-size='20' text-anchor='middle' dominant-baseline='middle'>AUREUM</text></svg>`
  );

const currency = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

/** Compact live countdown shown on active lots. */
const CountdownPill = ({ endTime }) => {
  const t = useCountdown(endTime);
  if (t.ended) {
    return <span className="badge-neutral">Ended</span>;
  }
  const urgent = t.total < 1000 * 60 * 60; // < 1 hour
  const label =
    t.days > 0
      ? `${t.days}d ${pad(t.hours)}h`
      : `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`;
  return (
    <span className={`${urgent ? "badge-outbid" : "badge-neutral"} tnum`}>
      <Icon.Clock size={13} className={urgent ? "animate-pulse-soft" : ""} />
      {label}
    </span>
  );
};

/**
 * Editorial auction/lot card.
 * Props:
 *  - auction: lot object
 *  - onBidClick(e): optional — when provided on an ACTIVE lot, shows "Place bid"
 *  - isLoggedIn: gates the bid button
 */
const AuctionCard = ({ auction, onBidClick, isLoggedIn }) => {
  const navigate = useNavigate();
  const isActive = auction.status === "ACTIVE";
  const goToDetail = () => navigate(`/auctions/${auction.id}`);

  return (
    <article className="lot-card group">
      {/* Media */}
      <button
        type="button"
        onClick={goToDetail}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-2 text-left"
        aria-label={`View ${auction.title}`}
      >
        <img
          src={auction.mainImageUrl || PLACEHOLDER}
          alt={auction.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
          className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
        />
        {/* Status badge */}
        <span className="absolute left-3 top-3">
          {isActive ? (
            <span className="badge-live">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-soft" />
              Live
            </span>
          ) : (
            <span className="badge-neutral !bg-surface/90 backdrop-blur">Upcoming</span>
          )}
        </span>
        {/* Countdown */}
        {isActive && (
          <span className="absolute bottom-3 left-3">
            <span className="rounded-pill bg-surface/90 px-0.5 py-0.5 backdrop-blur">
              <CountdownPill endTime={auction.endTime} />
            </span>
          </span>
        )}
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {auction.categoryNames?.length > 0 && (
          <span className="eyebrow mb-2 !text-ink-muted">
            {auction.categoryNames.slice(0, 2).join(" · ")}
          </span>
        )}

        <button
          type="button"
          onClick={goToDetail}
          className="text-left font-display text-lg font-medium leading-snug text-ink transition-colors hover:text-brand"
        >
          {auction.title}
        </button>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
          {auction.description}
        </p>

        {/* Footer */}
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <span className="block text-xs text-ink-muted">
              {isActive ? "Current bid" : "Starting price"}
            </span>
            <span className="mt-0.5 block font-display text-xl font-semibold text-ink tnum">
              {currency(auction.currentBid)}
            </span>
          </div>

          {isActive && onBidClick ? (
            <button
              className={isLoggedIn ? "btn-brand btn-sm" : "btn-outline btn-sm"}
              onClick={(e) => {
                e.stopPropagation();
                if (isLoggedIn) onBidClick(e);
                else navigate("/login");
              }}
              title={isLoggedIn ? "Place a bid" : "Log in to bid"}
            >
              {isLoggedIn ? (
                <>
                  <Icon.Gavel size={16} /> Bid
                </>
              ) : (
                "Log in to bid"
              )}
            </button>
          ) : (
            <button className="btn-outline btn-sm" onClick={goToDetail}>
              View <Icon.ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export { currency, PLACEHOLDER };
export default AuctionCard;
