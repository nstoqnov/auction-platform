import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import AuctionCard, { currency, PLACEHOLDER } from "../components/AuctionCard";
import Icon from "../components/Icons";

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("listings");
  const [loading, setLoading] = useState(true);

  const [myListings, setMyListings] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);

  const navigate = useNavigate();

  const isAdmin =
    user?.role === "ADMIN" || (user?.roles && user.roles.includes("ROLE_ADMIN"));

  useEffect(() => {
    if (user && !isAdmin) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [listingsRes, bidsRes, paymentsRes] = await Promise.all([
        api.get("/users/me/auctions"),
        api.get("/users/me/bids"),
        api.get("/users/me/wins"),
      ]);
      setMyListings(listingsRes.data || []);
      setMyBids(bidsRes.data || []);
      setPendingPayments(paymentsRes.data || []);
    } catch (error) {
      console.error("Error fetching profile data", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = (id) => {
    if (!id) {
      alert("Error: Missing Auction ID for this payment.");
      return;
    }
    navigate(`/checkout/${id}`);
  };

  const getStatusConfig = (status) => {
    const s = status ? status.toUpperCase() : "UNKNOWN";
    switch (s) {
      case "COMPLETED":
      case "PAID":
        return { tone: "bid", label: "Paid", Icon: Icon.Check };
      case "PENDING":
      case "UNPAID":
      case "PENDING_PAYMENT":
        return { tone: "brand", label: "Pending", Icon: Icon.Clock };
      case "FAILED":
        return { tone: "outbid", label: "Failed", Icon: Icon.Close };
      default:
        return { tone: "muted", label: s, Icon: Icon.Tag };
    }
  };

  if (!user) {
    return (
      <div className="container-content flex flex-col items-center py-28 text-center">
        <Icon.User size={32} className="text-ink-muted" />
        <h1 className="mt-4 font-display text-display-md text-ink">Please log in</h1>
        <Link to="/login" className="btn-dark mt-6">Log in</Link>
      </div>
    );
  }

  const displayName = user.username || user.sub || "User";
  const displayRole = user.role || (user.roles && user.roles[0]) || "User";

  const tabs = [
    { key: "listings", label: "My Listings", count: myListings.length, danger: false },
    { key: "bids", label: "My Bids", count: myBids.length, danger: false },
    { key: "payments", label: "Payments", count: pendingPayments.length, danger: true },
  ];

  return (
    <div className="container-content py-10 lg:py-14">
      {/* Profile header */}
      <div className="flex items-center gap-5 rounded-card border border-line bg-surface p-6 shadow-subtle">
        <span
          className={`grid h-16 w-16 shrink-0 place-items-center rounded-full font-display text-2xl font-semibold text-canvas ${
            isAdmin ? "bg-outbid" : "bg-ink"
          }`}
        >
          {displayName.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">{displayName}</h1>
          <span
            className={`badge mt-1 ${
              isAdmin ? "bg-outbid-soft text-outbid" : "badge-neutral"
            }`}
          >
            {displayRole}
          </span>
        </div>
      </div>

      {isAdmin ? (
        /* Admin dashboard */
        <section className="mt-8">
          <h2 className="font-display text-display-md text-ink">Admin dashboard</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              { t: "Users", d: "Manage registered users", to: "/admin/users", label: "Manage users", Ic: Icon.User },
              { t: "Auctions", d: "Review and moderate listings", to: "/auctions", label: "All auctions", Ic: Icon.Gavel },
              { t: "Reports", d: "View system analytics", to: null, label: "Coming soon", Ic: Icon.Bolt },
            ].map((c) => (
              <div key={c.t} className="card-surface p-6">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-brand">
                  <c.Ic size={20} />
                </span>
                <h3 className="mt-4 font-display text-xl font-medium text-ink">{c.t}</h3>
                <p className="mt-1 text-sm text-ink-soft">{c.d}</p>
                {c.to ? (
                  <Link to={c.to} className="btn-outline btn-sm mt-4">{c.label}</Link>
                ) : (
                  <button className="btn-outline btn-sm mt-4" disabled>{c.label}</button>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <>
          {/* Tabs */}
          <div className="mt-8 flex gap-1 border-b border-line">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    active ? "text-ink" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-pill px-2 py-0.5 text-xs tnum ${
                      tab.danger && tab.count > 0
                        ? "bg-outbid text-white"
                        : "bg-surface-2 text-ink-soft"
                    }`}
                  >
                    {tab.count}
                  </span>
                  {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand" />}
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-72 rounded-card" />
                ))}
              </div>
            ) : (
              <>
                {/* Listings */}
                {activeTab === "listings" &&
                  (myListings.length === 0 ? (
                    <EmptyState
                      title="No listings yet"
                      body="List your first item and open it to the saleroom."
                      action={<Link to="/create-auction" className="btn-dark btn-sm">Create a listing</Link>}
                    />
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {myListings.map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} />
                      ))}
                    </div>
                  ))}

                {/* Bids */}
                {activeTab === "bids" &&
                  (myBids.length === 0 ? (
                    <EmptyState
                      title="No bids yet"
                      body="Explore the saleroom and place your first bid."
                      action={<Link to="/auctions" className="btn-dark btn-sm">Browse auctions</Link>}
                    />
                  ) : (
                    <div className="space-y-3">
                      {myBids.map((bidItem) => (
                        <Link
                          key={bidItem.id}
                          to={`/auctions/${bidItem.id}`}
                          className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-3 transition-all hover:shadow-card"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={bidItem.mainImageUrl || PLACEHOLDER}
                              alt=""
                              className="h-16 w-16 rounded-xl object-cover"
                              onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                            />
                            <div>
                              <h3 className="font-display text-lg font-medium text-ink">{bidItem.title}</h3>
                              <p className="mt-0.5 text-sm text-ink-soft">
                                Current price{" "}
                                <span className="font-semibold text-ink tnum">
                                  {currency(bidItem.currentBid)}
                                </span>
                              </p>
                            </div>
                          </div>
                          <span className="btn-outline btn-sm">
                            View <Icon.ArrowRight size={16} />
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}

                {/* Payments */}
                {activeTab === "payments" &&
                  (pendingPayments.length === 0 ? (
                    <EmptyState title="No records found" body="Payments for won lots will appear here." />
                  ) : (
                    <div className="overflow-hidden rounded-card border border-line bg-surface">
                      {pendingPayments.map((item, idx) => {
                        const cfg = getStatusConfig(item.status);
                        const isPayable = ["PENDING", "UNPAID", "FAILED", "PENDING_PAYMENT"].includes(
                          item.status ? item.status.toUpperCase() : ""
                        );
                        const isPaid = item.status === "COMPLETED" || item.status === "PAID";
                        const toneClass =
                          cfg.tone === "bid"
                            ? "bg-bid-soft text-bid"
                            : cfg.tone === "outbid"
                            ? "bg-outbid-soft text-outbid"
                            : cfg.tone === "brand"
                            ? "bg-brand-soft text-brand"
                            : "bg-surface-2 text-ink-soft";
                        return (
                          <div
                            key={item.id || idx}
                            className={`flex flex-wrap items-center justify-between gap-3 p-4 ${
                              idx > 0 ? "border-t border-line" : ""
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className={`grid h-11 w-11 place-items-center rounded-full ${toneClass}`}>
                                <cfg.Icon size={18} />
                              </span>
                              <div>
                                <h3 className="font-medium text-ink">
                                  {item.auctionTitle || item.title || "Payment item"}
                                </h3>
                                <p className="mt-0.5 text-sm text-ink-soft">
                                  <span className="font-semibold text-ink tnum">{currency(item.amount)}</span>
                                  <span className="mx-2 text-ink-muted">·</span>
                                  <span className={cfg.tone === "muted" ? "text-ink-soft" : `text-${cfg.tone}`}>
                                    {cfg.label}
                                  </span>
                                  {item.paidAt && (
                                    <span className="ml-2 text-ink-muted">
                                      Paid {new Date(item.paidAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            {isPayable && (
                              <button className="btn-brand btn-sm" onClick={() => handlePay(item.id)}>
                                {item.status === "FAILED" ? "Retry payment" : "Pay now"}
                              </button>
                            )}
                            {isPaid && (
                              <span className="badge-bid">
                                <Icon.Check size={14} /> Receipt sent
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const EmptyState = ({ title, body, action }) => (
  <div className="rounded-card border border-dashed border-line-strong bg-surface py-16 text-center">
    <h3 className="font-display text-xl text-ink">{title}</h3>
    {body && <p className="mt-1 text-sm text-ink-soft">{body}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default ProfilePage;
