import { API_BASE } from "../config";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import AuctionCard, { currency } from "../components/AuctionCard";
import Icon from "../components/Icons";
import { useRevealGroup } from "../hooks/useReveal";

const AuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & notification state
  const [isBidModalOpen, setBidModalOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const stompClientRef = useRef(null);
  const isLoggedIn = !!localStorage.getItem("token");

  // --- 1. Fetch initial data ---
  const fetchAuctions = () => {
    fetch(`${API_BASE}/api/auctions`)
      .then((res) => res.json())
      .then((data) => setAuctions(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading auctions:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  // --- 2. WebSocket connection (global updates) ---
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        client.subscribe("/topic/bids", (message) => {
          const update = JSON.parse(message.body);
          setAuctions((prev) =>
            prev.map((auction) =>
              auction.id === update.auctionId
                ? { ...auction, currentBid: update.newAmount }
                : auction
            )
          );
        });
      },
      onStompError: (frame) => {
        console.error("Broker error: " + frame.headers["message"]);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) client.deactivate();
    };
  }, []);

  // --- 3. Filtering ---
  const categories = useMemo(() => {
    const allCats = auctions.flatMap((a) => a.categoryNames || []);
    return [...new Set(allCats)].sort();
  }, [auctions]);

  const toggleCategory = (category) => {
    if (category === "All") {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredList = useMemo(() => {
    if (selectedCategories.length === 0) return auctions;
    return auctions.filter((a) =>
      a.categoryNames?.some((cat) => selectedCategories.includes(cat))
    );
  }, [auctions, selectedCategories]);

  // --- 4. Helpers ---
  const handleOpenBidModal = (auction) => {
    setSelectedAuction(auction);
    setBidModalOpen(true);
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // --- 5. Place bid ---
  const handlePlaceBid = async (amount) => {
    if (!amount || Number(amount) <= selectedAuction.currentBid) {
      throw new Error("Your bid must be higher than the current price.");
    }
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const bidData = {
      bidderName: username,
      amount: Number(amount),
      bidTime: new Date().toISOString(),
    };

    const response = await fetch(
      `${API_BASE}/api/bids/auction/${selectedAuction.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bidData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to place bid");
    }

    setBidModalOpen(false);
    showToast(`Bid of ${currency(amount)} placed successfully`);
    // WebSocket updates the list for everyone.
  };

  const activeAuctions = filteredList.filter((a) => a.status === "ACTIVE");
  const upcomingAuctions = filteredList.filter((a) => a.status === "UPCOMING");

  const revealRef = useRevealGroup();

  return (
    <div ref={revealRef}>
      {/* Page header */}
      <header className="border-b border-line bg-surface/60">
        <div className="container-content py-14 lg:py-16">
          <span className="eyebrow">The saleroom</span>
          <h1 className="mt-3 font-display text-display-lg text-ink">Explore auctions</h1>
          <p className="mt-3 max-w-prose text-lg text-ink-soft">
            Bid on exclusive live lots or preview what's coming to the block next.
          </p>
        </div>
      </header>

      <div className="container-content py-10 lg:py-14">
        {/* Filter bar */}
        {categories.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <FilterChip
              active={selectedCategories.length === 0}
              onClick={() => toggleCategory("All")}
            >
              All lots
            </FilterChip>
            {categories.map((cat) => (
              <FilterChip
                key={cat}
                active={selectedCategories.includes(cat)}
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </FilterChip>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Active */}
        {!loading && activeAuctions.length > 0 && (
          <section className="mb-16">
            <SectionTitle
              kicker={
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-outbid animate-pulse-soft" /> Live now
                </span>
              }
              title="On the block"
              count={activeAuctions.length}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activeAuctions.map((auction, i) => (
                <div key={auction.id} className="reveal" style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
                  <AuctionCard
                    auction={auction}
                    isLoggedIn={isLoggedIn}
                    onBidClick={() => handleOpenBidModal(auction)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {!loading && upcomingAuctions.length > 0 && (
          <section className="mb-8">
            <SectionTitle kicker="Coming soon" title="Upcoming lots" count={upcomingAuctions.length} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingAuctions.map((auction, i) => (
                <div key={auction.id} className="reveal" style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty */}
        {!loading && filteredList.length === 0 && (
          <div className="rounded-card border border-dashed border-line-strong bg-surface py-20 text-center">
            <Icon.Search size={32} className="mx-auto text-ink-muted" />
            <p className="mt-4 font-display text-xl text-ink">No lots match your filters</p>
            <p className="mt-1 text-sm text-ink-soft">Try clearing your selection to see everything.</p>
            <button className="btn-outline btn-sm mt-6" onClick={() => setSelectedCategories([])}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Bid modal */}
      {isBidModalOpen && selectedAuction && (
        <BidModal
          auction={selectedAuction}
          onClose={() => setBidModalOpen(false)}
          onSubmit={handlePlaceBid}
        />
      )}

      {/* Toast */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 animate-fade-up rounded-pill px-5 py-3 text-sm font-medium shadow-lift ${
            toast.type === "error" ? "bg-outbid text-white" : "bg-ink text-canvas"
          }`}
        >
          <span className="flex items-center gap-2">
            {toast.type === "error" ? <Icon.Close size={16} /> : <Icon.Check size={16} />}
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
};

/* ---------- sub-components ---------- */

const FilterChip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`rounded-pill border px-4 py-2 text-sm font-medium transition-all duration-200 ${
      active
        ? "border-ink bg-ink text-canvas"
        : "border-line-strong bg-surface text-ink-soft hover:border-ink hover:text-ink"
    }`}
  >
    {children}
  </button>
);

const SectionTitle = ({ kicker, title, count }) => (
  <div className="mb-8 flex items-end justify-between gap-4">
    <div>
      <span className="eyebrow">{kicker}</span>
      <h2 className="mt-2 font-display text-display-md text-ink">{title}</h2>
    </div>
    {count != null && (
      <span className="badge-neutral tnum">{count} {count === 1 ? "lot" : "lots"}</span>
    )}
  </div>
);

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

const BidModal = ({ auction, onClose, onSubmit }) => {
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minBid = auction.currentBid + 1;

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !isSubmitting && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(bidAmount);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const quickBids = [minBid, minBid + 9, minBid + 49];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bid-title"
    >
      <div
        className="w-full max-w-md animate-fade-up rounded-t-card bg-surface p-6 shadow-lift sm:rounded-card sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow">Place your bid</span>
            <h3 id="bid-title" className="mt-2 font-display text-2xl font-medium text-ink">
              {auction.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-surface-2"
          >
            <Icon.Close size={20} />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
          <span className="text-sm text-ink-soft">Current bid</span>
          <span className="font-display text-xl font-semibold text-ink tnum">
            {currency(auction.currentBid)}
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl bg-outbid-soft px-4 py-3 text-sm text-outbid"
          >
            <Icon.Close size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="bid-amount" className="field-label">
            Your bid <span className="text-ink-muted">(minimum {currency(minBid)})</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">$</span>
            <input
              id="bid-amount"
              type="number"
              inputMode="decimal"
              className="field pl-8 tnum"
              placeholder={`${minBid}`}
              value={bidAmount}
              onChange={(e) => {
                setBidAmount(e.target.value);
                setError(null);
              }}
              min={minBid}
              step="0.01"
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {quickBids.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setBidAmount(String(q))}
                className="rounded-pill border border-line-strong bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink tnum"
              >
                {currency(q)}
              </button>
            ))}
          </div>

          <div className="mt-7 flex gap-3">
            <button type="button" className="btn-outline flex-1" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-brand flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-ink/40 border-t-brand-ink" />
                  Placing…
                </>
              ) : (
                <>
                  <Icon.Gavel size={18} /> Confirm bid
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuctionsPage;
