import { getErrorMessage } from "../utils/errorMessage";
import { API_BASE } from "../config";
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import AuctionCard, { currency, PLACEHOLDER } from "../components/AuctionCard";
import Icon from "../components/Icons";
import { useCountdown, pad } from "../hooks/useCountdown";

const AuctionDetailPage = ({ onOpenChat }) => {
  const { id } = useParams();
  const { user } = useAuth();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedAuctions, setRelatedAuctions] = useState([]);

  const [selectedImage, setSelectedImage] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const isLoggedIn = !!localStorage.getItem("token");
  const stompClientRef = useRef(null);

  // --- 1. Fetch data ---
  useEffect(() => {
    const fetchAuctionData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/auctions/${id}`);
        setAuction(res.data);
        if (res.data.mainImageUrl) setSelectedImage(res.data.mainImageUrl);

        const relatedRes = await api.get("/auctions");
        const filtered = relatedRes.data
          .filter((a) => a.id !== Number(id) && a.status === "ACTIVE")
          .slice(0, 3);
        setRelatedAuctions(filtered);
      } catch (err) {
        console.error(err);
        setError("Auction not found or server error");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionData();
    window.scrollTo(0, 0);
  }, [id]);

  // --- 2. WebSocket ---
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        client.subscribe(`/topic/auction/${id}`, (message) => {
          const update = JSON.parse(message.body);
          setAuction((prev) => (prev ? { ...prev, currentBid: update.newAmount } : null));
          showToast(`New highest bid: ${currency(update.newAmount)}`, "info");
        });
      },
      onStompError: (frame) => console.error("Broker error: " + frame.headers["message"]),
    });
    client.activate();
    stompClientRef.current = client;
    return () => {
      if (client) client.deactivate();
    };
  }, [id]);

  const time = useCountdown(auction?.endTime);
  const isUrgent = !time.ended && time.total < 60000;

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
  };

  const handleBid = async () => {
    if (!bidAmount || Number(bidAmount) <= auction.currentBid) {
      showToast("Your bid must be higher than the current price.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const username = localStorage.getItem("username");
      await api.post(`/bids/auction/${id}`, {
        bidderName: username,
        amount: Number(bidAmount),
        bidTime: new Date().toISOString(),
      });
      showToast("Bid placed successfully", "success");
      setBidAmount("");
    } catch (err) {
      showToast("Bid failed: " + (getErrorMessage(err)), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Loading / error ---
  if (loading) return <DetailSkeleton />;
  if (error)
    return (
      <div className="container-content flex flex-col items-center justify-center py-28 text-center">
        <Icon.Close size={32} className="text-outbid" />
        <h1 className="mt-4 font-display text-display-md text-ink">{error}</h1>
        <Link to="/auctions" className="btn-dark mt-8">
          Back to auctions <Icon.ArrowRight size={18} />
        </Link>
      </div>
    );
  if (!auction) return null;

  const thumbs = [
    auction.mainImageUrl && { url: auction.mainImageUrl },
    ...(auction.images || []),
  ].filter(Boolean);

  const isActive = auction.status === "ACTIVE" && !time.ended;
  const minBid = auction.currentBid + 1;

  return (
    <div className="container-content py-8 lg:py-12">
      {/* Toast */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 animate-fade-up rounded-pill px-5 py-3 text-sm font-medium shadow-lift ${
            toast.type === "error"
              ? "bg-outbid text-white"
              : toast.type === "info"
              ? "bg-brand text-brand-ink"
              : "bg-ink text-canvas"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Breadcrumb */}
      <Link
        to="/auctions"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <span className="rotate-180">
          <Icon.ArrowRight size={16} />
        </span>
        Back to the saleroom
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-card border border-line bg-surface shadow-subtle">
            <div className="aspect-[4/3] w-full overflow-hidden bg-surface-2">
              <img
                src={selectedImage || PLACEHOLDER}
                alt={auction.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER;
                }}
              />
            </div>
          </div>
          {thumbs.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {thumbs.map((imgObj, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgObj.url)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === imgObj.url
                      ? "border-brand"
                      : "border-line hover:border-line-strong"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={imgObj.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sticky detail panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {auction.categoryNames?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {auction.categoryNames.map((cat, idx) => (
                <span key={idx} className="badge-neutral">
                  {cat}
                </span>
              ))}
            </div>
          )}
          <h1 className="mt-3 font-display text-display-md text-ink">{auction.title}</h1>

          {/* Countdown */}
          <div
            className={`mt-6 rounded-card border p-5 ${
              isUrgent ? "border-outbid/30 bg-outbid-soft" : "border-line bg-surface"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <Icon.Clock size={14} className={isUrgent ? "text-outbid" : ""} />
              {time.ended ? "Auction ended" : "Time remaining"}
            </div>
            {time.ended ? (
              <div className="mt-2 font-display text-2xl font-semibold text-outbid">Ended</div>
            ) : (
              <div className="mt-2 flex gap-3 tnum">
                {[
                  { v: time.days, l: "days" },
                  { v: time.hours, l: "hrs" },
                  { v: time.minutes, l: "min" },
                  { v: time.seconds, l: "sec" },
                ].map((u) => (
                  <div key={u.l} className="text-center">
                    <div
                      className={`font-display text-3xl font-semibold ${
                        isUrgent ? "text-outbid" : "text-ink"
                      }`}
                    >
                      {pad(u.v)}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-ink-muted">{u.l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bid panel */}
          {isActive ? (
            <div className="mt-5 rounded-card border border-line bg-surface p-6 shadow-subtle">
              <div className="text-xs uppercase tracking-wide text-ink-muted">Current highest bid</div>
              <div className="mt-1 font-display text-4xl font-semibold text-ink tnum">
                {currency(auction.currentBid)}
              </div>

              {isLoggedIn ? (
                <div className="mt-5">
                  <label htmlFor="bid" className="field-label">
                    Your bid <span className="text-ink-muted">(min {currency(minBid)})</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
                        $
                      </span>
                      <input
                        id="bid"
                        type="number"
                        inputMode="decimal"
                        className="field pl-8 tnum"
                        placeholder={`${minBid}`}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={minBid}
                        onKeyDown={(e) => e.key === "Enter" && !submitting && handleBid()}
                      />
                    </div>
                    <button className="btn-brand" onClick={handleBid} disabled={submitting}>
                      {submitting ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-ink/40 border-t-brand-ink" />
                      ) : (
                        <>
                          <Icon.Gavel size={18} /> Bid
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-xl bg-surface-2 p-4 text-center">
                  <p className="text-sm text-ink-soft">Sign in to place a bid on this lot.</p>
                  <Link to="/login" className="btn-dark mt-3 w-full">
                    Log in to bid
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-card border border-line bg-surface-2 p-5 text-sm text-ink-soft">
              This auction is {auction.status === "UPCOMING" ? "starting soon." : "closed."}
            </div>
          )}

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Description</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{auction.description}</p>
          </div>

          {/* Seller */}
          <div className="mt-5 flex items-center justify-between rounded-card border border-line bg-surface p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-semibold text-canvas">
                {(auction.ownerName || "?").substring(0, 2).toUpperCase()}
              </span>
              <div>
                <div className="text-xs text-ink-muted">Seller</div>
                <div className="font-medium text-ink">{auction.ownerName}</div>
              </div>
            </div>
            {user && user.username !== auction.ownerName && (
              <button className="btn-outline btn-sm" onClick={() => onOpenChat(auction.ownerName)}>
                <Icon.Chat size={16} /> Message
              </button>
            )}
          </div>

          {/* Meta */}
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
            <div>
              <div className="text-xs text-ink-muted">Opens</div>
              <div className="mt-0.5 text-ink">{new Date(auction.startTime).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-ink-muted">Closes</div>
              <div className="mt-0.5 text-ink">{new Date(auction.endTime).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {relatedAuctions.length > 0 && (
        <section className="mt-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="eyebrow">Also in the saleroom</span>
              <h2 className="mt-2 font-display text-display-md text-ink">You might also like</h2>
            </div>
            <Link to="/auctions" className="btn-ghost">
              View all <Icon.ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedAuctions.map((item) => (
              <AuctionCard key={item.id} auction={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const DetailSkeleton = () => (
  <div className="container-content py-12">
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="skeleton aspect-[4/3] w-full rounded-card" />
      <div className="space-y-4">
        <div className="skeleton h-4 w-1/4" />
        <div className="skeleton h-10 w-3/4" />
        <div className="skeleton h-24 w-full rounded-card" />
        <div className="skeleton h-40 w-full rounded-card" />
      </div>
    </div>
  </div>
);

export default AuctionDetailPage;
