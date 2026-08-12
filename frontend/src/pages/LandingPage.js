import { API_BASE } from "../config";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuctionCard, { currency } from "../components/AuctionCard";
import Icon from "../components/Icons";
import { useRevealGroup } from "../hooks/useReveal";

const LandingPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/api/auctions`)
      .then((res) => res.json())
      .then((data) => {
        if (alive) setAuctions(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error loading auctions:", err))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const active = auctions.filter((a) => a.status === "ACTIVE");
  const featured = active.slice(0, 3);

  // Live stats derived from real data
  const liveCount = active.length;
  const totalValue = auctions.reduce((sum, a) => sum + (Number(a.currentBid) || 0), 0);

  const revealRef = useRevealGroup();

  return (
    <div ref={revealRef}>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden">
        {/* Soft radial wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 55% at 85% 0%, rgba(154,111,52,0.10), transparent 60%), radial-gradient(50% 50% at 0% 100%, rgba(47,122,85,0.06), transparent 55%)",
          }}
        />
        <div className="container-content grid items-center gap-12 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
          {/* Copy */}
          <div className="reveal">
            <span className="eyebrow">
              <Icon.Sparkle size={14} /> Curated live auctions
            </span>
            <h1 className="mt-5 font-display text-display-xl text-ink">
              Own something
              <span className="italic text-brand"> extraordinary.</span>
            </h1>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink-soft">
              A modern auction house for exceptional pieces. Follow the bidding in real time,
              place with confidence, and win beautifully — all from one refined room.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/auctions" className="btn-dark btn-lg">
                Explore auctions <Icon.ArrowRight size={18} />
              </Link>
              <Link to="/create-auction" className="btn-outline btn-lg">
                <Icon.Tag size={18} /> Sell an item
              </Link>
            </div>

            {/* Live stat strip */}
            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-5">
              {[
                { label: "Live lots now", value: loading ? "—" : liveCount, live: true },
                { label: "Total in play", value: loading ? "—" : currency(totalValue) },
                { label: "Buyer protection", value: "100%" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex items-center gap-2 font-display text-2xl font-semibold text-ink tnum">
                    {stat.live && liveCount > 0 && (
                      <span className="h-2 w-2 rounded-full bg-bid animate-pulse-soft" />
                    )}
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-ink-muted">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero feature card */}
          <div className="reveal" style={{ transitionDelay: "120ms" }}>
            <HeroShowcase lot={featured[0]} loading={loading} />
          </div>
        </div>
      </section>

      {/* ===================== CATEGORIES ===================== */}
      <section className="border-y border-line bg-surface/60">
        <div className="container-content flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-7 text-sm">
          <span className="text-xs uppercase tracking-brand text-ink-muted">Departments</span>
          {["Fine Art", "Watches", "Jewellery", "Design", "Collectibles", "Wine"].map((c) => (
            <Link
              key={c}
              to="/auctions"
              className="font-display text-base text-ink-soft transition-colors hover:text-brand"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* ===================== LIVE NOW ===================== */}
      <section className="section">
        <div className="container-content">
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-outbid animate-pulse-soft" /> Live now
              </span>
              <h2 className="mt-3 font-display text-display-md text-ink">The saleroom floor</h2>
            </div>
            <Link to="/auctions" className="btn-ghost">
              View all lots <Icon.ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
              : featured.length > 0
              ? featured.map((a, i) => (
                  <div key={a.id} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                    <AuctionCard auction={a} />
                  </div>
                ))
              : (
                <div className="col-span-full rounded-card border border-dashed border-line-strong bg-surface py-16 text-center">
                  <p className="text-ink-soft">No live lots at the moment.</p>
                  <Link to="/auctions" className="btn-outline btn-sm mt-4">
                    Browse upcoming
                  </Link>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="how" className="section bg-surface/60 border-y border-line">
        <div className="container-content">
          <div className="reveal mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">The experience</span>
            <h2 className="mt-3 font-display text-display-md text-ink">Bidding, refined</h2>
            <p className="mt-4 text-ink-soft">
              Three simple steps between you and your next piece — no paddles, no queues.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Icon.Search,
                title: "Discover",
                body: "Browse curated departments and watch the lots that catch your eye.",
              },
              {
                icon: Icon.Gavel,
                title: "Bid live",
                body: "Place bids and watch the room update in real time as the clock counts down.",
              },
              {
                icon: Icon.Trophy,
                title: "Win & collect",
                body: "Win the lot, pay securely through Stripe, and arrange delivery with ease.",
              },
            ].map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.title}
                  className="reveal card-surface p-8"
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
                      <StepIcon size={22} />
                    </span>
                    <span className="font-display text-3xl font-semibold text-line-strong tnum">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-medium text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== TRUST ===================== */}
      <section id="trust" className="section">
        <div className="container-content grid items-center gap-12 lg:grid-cols-2">
          <div className="reveal">
            <span className="eyebrow">Trust & safety</span>
            <h2 className="mt-3 font-display text-display-md text-ink">
              Bid with total confidence
            </h2>
            <p className="mt-4 max-w-prose text-ink-soft">
              Every transaction is protected end to end. We verify sellers, escrow payments through
              Stripe, and give you a direct line to the seller before and after the hammer falls.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Icon.ShieldCheck, t: "Secure payments", d: "PCI-compliant checkout via Stripe." },
                { icon: Icon.Bolt, t: "Real-time bidding", d: "Instant updates over live sockets." },
                { icon: Icon.Chat, t: "Direct messaging", d: "Talk to sellers before you commit." },
                { icon: Icon.Check, t: "Verified lots", d: "Curated and reviewed before listing." },
              ].map((f) => {
                const FIcon = f.icon;
                return (
                  <div key={f.t} className="flex gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bid-soft text-bid">
                      <FIcon size={18} />
                    </span>
                    <div>
                      <div className="font-medium text-ink">{f.t}</div>
                      <div className="text-sm text-ink-soft">{f.d}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editorial quote card */}
          <div className="reveal" style={{ transitionDelay: "100ms" }}>
            <figure className="card-surface relative overflow-hidden p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-10 font-display text-[12rem] leading-none text-brand-soft"
              >
                “
              </div>
              <blockquote className="relative font-display text-2xl font-medium leading-snug text-ink">
                The most elegant way I've ever bought at auction. It feels like a private
                viewing — calm, considered, and completely trustworthy.
              </blockquote>
              <figcaption className="relative mt-6 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-semibold text-canvas">
                  EM
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">Elena Marchetti</span>
                  <span className="block text-xs text-ink-muted">Private collector, Milan</span>
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ===================== CLOSING CTA ===================== */}
      <section className="pb-24">
        <div className="container-content">
          <div className="reveal relative overflow-hidden rounded-card bg-ink px-8 py-16 text-center sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(50% 80% at 50% 0%, rgba(154,111,52,0.22), transparent 70%)",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-display-md text-canvas">
                Your next treasure is on the block
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-canvas/60">
                Join the room and place your first bid today — it takes less than a minute.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/auctions"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-pill bg-brand px-8 text-base font-semibold text-brand-ink transition-all hover:brightness-110"
                >
                  Enter the saleroom <Icon.ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-pill border border-white/20 px-8 text-base font-semibold text-canvas transition-colors hover:bg-white/10"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* Hero showcase — features the top live lot, or a graceful placeholder */
const HeroShowcase = ({ lot, loading }) => {
  if (loading) {
    return <div className="skeleton aspect-[4/5] w-full rounded-card" />;
  }
  if (!lot) {
    return (
      <div className="card-surface flex aspect-[4/5] flex-col items-center justify-center gap-3 p-10 text-center">
        <Icon.Gavel size={32} className="text-brand" />
        <p className="font-display text-xl text-ink">The saleroom opens soon</p>
        <Link to="/auctions" className="btn-outline btn-sm mt-2">
          Preview upcoming lots
        </Link>
      </div>
    );
  }
  return (
    <div className="relative">
      <div className="card-surface overflow-hidden">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-2">
          <img
            src={lot.mainImageUrl}
            alt={lot.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="absolute left-4 top-4 badge-live">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-soft" /> Featured lot
          </span>
        </div>
        <div className="flex items-end justify-between gap-4 p-6">
          <div className="min-w-0">
            <div className="eyebrow !text-ink-muted">
              {lot.categoryNames?.slice(0, 1).join("") || "Featured"}
            </div>
            <h3 className="mt-1 truncate font-display text-xl font-medium text-ink">{lot.title}</h3>
            <div className="mt-1 text-xs text-ink-muted">Current bid</div>
            <div className="font-display text-2xl font-semibold text-ink tnum">
              {currency(lot.currentBid)}
            </div>
          </div>
          <Link to={`/auctions/${lot.id}`} className="btn-brand btn-sm shrink-0">
            Bid now <Icon.ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const CardSkeleton = () => (
  <div className="lot-card">
    <div className="skeleton aspect-[4/3] w-full rounded-none" />
    <div className="space-y-3 p-5">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-10 w-full" />
    </div>
  </div>
);

export default LandingPage;
