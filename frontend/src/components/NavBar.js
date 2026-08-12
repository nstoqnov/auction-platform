import { API_BASE } from "../config";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "../AuthContext";
import api from "../api";
import Logo from "./Logo";
import Icon from "./Icons";

const NavBar = ({ onOpenChat, chatRecipient }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [pendingCount, setPendingCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [showInbox, setShowInbox] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({}); // { partnerUsername: count }
  const inboxRef = useRef(null);
  const mobileInboxRef = useRef(null);

  const isAdmin = user?.role === "ROLE_ADMIN";
  const isUser = user?.role === "ROLE_USER";
  const displayName = user?.username || user?.sub || "";
  const initials = displayName.substring(0, 2).toUpperCase();
  const currentUser = displayName;

  const openChatRef = useRef(chatRecipient);

  const unreadTotal = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  // Pull authoritative unread counts (per partner) from the server
  const fetchUnread = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await api.get("/chat/unread");
      const map = {};
      (res.data || []).forEach((row) => {
        if (row.partner && row.count > 0) map[row.partner] = row.count;
      });
      setUnreadCounts(map);
    } catch (err) {
      console.error("Failed to load unread counts", err);
    }
  }, [currentUser]);

  // Mark a conversation read on the server + optimistically clear its badge
  const markRead = useCallback((partner) => {
    if (!partner) return;
    setUnreadCounts((prev) => {
      if (!prev[partner]) return prev;
      const next = { ...prev };
      delete next[partner];
      return next;
    });
    api.post(`/chat/read/${encodeURIComponent(partner)}`).catch((err) =>
      console.error("Failed to mark read", err)
    );
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      const inDesktop = inboxRef.current && inboxRef.current.contains(e.target);
      const inMobile = mobileInboxRef.current && mobileInboxRef.current.contains(e.target);
      if (!inDesktop && !inMobile) setShowInbox(false);
    };
    if (showInbox) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showInbox]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user?.username) {
      const fetchWins = async () => {
        try {
          const res = await api.get("/users/me/wins");
          if (Array.isArray(res.data)) {
            const pendingItems = res.data.filter(
              (item) => item.status && item.status.toUpperCase() !== "COMPLETED"
            );
            setPendingCount(pendingItems.length);
          }
        } catch (err) {
          console.error("Failed to fetch payment notifications", err);
        }
      };
      fetchWins();
    } else {
      setPendingCount(0);
    }
  }, [user?.username, location.pathname]);

  // Opening a chat marks it read; keep a ref so the socket callback sees it fresh
  useEffect(() => {
    openChatRef.current = chatRecipient;
    if (chatRecipient) markRead(chatRecipient);
  }, [chatRecipient, markRead]);

  const fetchConversations = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await api.get("/chat/conversations");
      setConversations(res.data || []);
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  }, [currentUser]);

  // Initial load + periodic refresh of unread counts (server-authoritative)
  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      setUnreadCounts({});
      return;
    }
    fetchUnread();
    const id = setInterval(fetchUnread, 25000);
    return () => clearInterval(id);
  }, [currentUser, fetchUnread, location.pathname]);

  // Live notifications: subscribe to this user's private message queue
  useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem("token");
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        client.subscribe("/user/queue/messages", (msg) => {
          try {
            const m = JSON.parse(msg.body);
            const sender = m.senderUsername;
            if (!sender || sender === currentUser) return;
            // Already viewing that chat → mark read instead of badging
            if (openChatRef.current === sender) {
              markRead(sender);
              return;
            }
            setUnreadCounts((prev) => ({ ...prev, [sender]: (prev[sender] || 0) + 1 }));
          } catch {
            /* ignore malformed */
          }
        });
      },
      onStompError: (frame) => console.error("Notif socket error", frame.headers?.message),
    });
    client.activate();
    return () => client.deactivate();
  }, [currentUser, markRead]);

  const handleToggleInbox = async () => {
    if (!showInbox && user) {
      await fetchConversations();
      fetchUnread();
    }
    setShowInbox(!showInbox);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/auctions", label: "Auctions", show: true },
    { to: "/create-auction", label: "Sell", show: !!user },
    { to: "/admin", label: "Admin", show: isAdmin },
    { to: "/profile", label: "My Profile", show: isUser },
  ].filter((l) => l.show);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ease-editorial ${
        scrolled
          ? "border-b border-line bg-canvas/80 backdrop-blur-md shadow-subtle"
          : "border-b border-transparent bg-canvas/40 backdrop-blur-sm"
      }`}
    >
      <nav className="container-content flex h-16 items-center justify-between lg:h-[72px]">
        {/* Brand */}
        <Link to="/" aria-label={`${"AUREUM"} home`} className="shrink-0">
          <Logo size={38} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative rounded-pill px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive(link.to)
                  ? "text-ink"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="absolute inset-x-4 -bottom-0.5 h-px bg-brand" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              {/* Inbox */}
              <div className="relative" ref={inboxRef}>
                <button
                  className="relative grid h-11 w-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
                  onClick={handleToggleInbox}
                  aria-label={
                    unreadTotal > 0 ? `Messages, ${unreadTotal} unread` : "Messages"
                  }
                  aria-expanded={showInbox}
                >
                  <Icon.Chat size={20} />
                  {unreadTotal > 0 && (
                    <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-outbid px-1 text-[10px] font-bold text-white tnum ring-2 ring-canvas">
                      {unreadTotal > 9 ? "9+" : unreadTotal}
                    </span>
                  )}
                </button>

                {showInbox && (
                  <div className="absolute right-0 top-14 w-80 origin-top-right animate-fade-up rounded-card border border-line bg-surface p-2 shadow-lift">
                    <InboxPanel
                      conversations={conversations}
                      currentUser={currentUser}
                      unreadCounts={unreadCounts}
                      onClose={() => setShowInbox(false)}
                      onOpen={(name) => {
                        markRead(name);
                        onOpenChat(name);
                        setShowInbox(false);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Pending payments */}
              {pendingCount > 0 && (
                <Link
                  to="/profile"
                  className="relative grid h-11 w-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
                  aria-label={`${pendingCount} pending payments`}
                >
                  <Icon.Bell size={20} />
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-outbid px-1 text-[10px] font-bold text-white tnum">
                    {pendingCount}
                  </span>
                </Link>
              )}

              {/* User pill */}
              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-pill border border-line bg-surface py-1 pl-3 pr-1 transition-colors hover:border-line-strong"
              >
                {isAdmin && (
                  <span className="badge-neutral !bg-brand-soft !text-brand !border-transparent">
                    Admin
                  </span>
                )}
                <span className="hidden text-sm text-ink-soft xl:inline">
                  Hello, <strong className="font-semibold text-ink">{displayName}</strong>
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-semibold text-canvas">
                  {initials}
                </span>
              </Link>

              <button onClick={handleLogout} className="btn-ghost" aria-label="Log out">
                <Icon.Logout size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/login" className="btn-dark">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="relative flex items-center gap-1 lg:hidden" ref={mobileInboxRef}>
          {user && (
            <button
              className="relative grid h-11 w-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
              onClick={() => {
                setMenuOpen(false);
                if (!showInbox) fetchConversations();
                setShowInbox((v) => !v);
              }}
              aria-label={unreadTotal > 0 ? `Messages, ${unreadTotal} unread` : "Messages"}
              aria-expanded={showInbox}
            >
              <Icon.Chat size={22} />
              {unreadTotal > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-outbid px-1 text-[10px] font-bold text-white tnum ring-2 ring-canvas">
                  {unreadTotal > 9 ? "9+" : unreadTotal}
                </span>
              )}
            </button>
          )}

          <button
            className="grid h-11 w-11 place-items-center rounded-full text-ink"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => {
              setShowInbox(false);
              setMenuOpen((v) => !v);
            }}
          >
            {menuOpen ? <Icon.Close size={24} /> : <Icon.Menu size={24} />}
          </button>

          {/* Mobile inbox sheet */}
          {showInbox && user && (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(20rem,calc(100vw-1.5rem))] origin-top-right animate-fade-up rounded-card border border-line bg-surface p-2 shadow-lift">
              <InboxPanel
                conversations={conversations}
                currentUser={currentUser}
                unreadCounts={unreadCounts}
                onClose={() => setShowInbox(false)}
                onOpen={(name) => {
                  markRead(name);
                  onOpenChat(name);
                  setShowInbox(false);
                }}
              />
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="animate-fade-up border-t border-line bg-canvas lg:hidden">
          <div className="container-content flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-surface-2 text-ink"
                    : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="rule my-2" />
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-surface-2"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-semibold text-canvas">
                    {initials}
                  </span>
                  <span className="text-sm text-ink-soft">
                    Hello, <strong className="font-semibold text-ink">{displayName}</strong>
                  </span>
                </Link>
                <button onClick={handleLogout} className="btn-outline w-full">
                  <Icon.Logout size={18} /> Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" className="btn-outline w-full">
                  Log in
                </Link>
                <Link to="/login" className="btn-dark w-full">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

// Shared inbox list used by both the desktop dropdown and the mobile sheet
const InboxPanel = ({ conversations, currentUser, unreadCounts, onOpen, onClose }) => (
  <>
    <div className="flex items-center justify-between px-3 py-2">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon.Inbox size={18} className="text-brand" />
        Recent messages
      </span>
      <button
        aria-label="Close"
        onClick={onClose}
        className="grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:bg-surface-2"
      >
        <Icon.Close size={16} />
      </button>
    </div>
    <div className="rule my-1" />
    <div className="max-h-[70vh] overflow-y-auto sm:max-h-80">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-ink-muted">
          <Icon.Inbox size={28} />
          <span className="text-sm">No messages yet.</span>
        </div>
      ) : (
        conversations.map((msg, idx) => {
          const otherName =
            (msg.senderUsername === currentUser ? msg.recipientUsername : msg.senderUsername) ||
            "Unknown";
          const safeInitial = otherName.substring(0, 2).toUpperCase();
          const isUnread = !!unreadCounts[otherName];
          return (
            <button
              key={idx}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-2"
              onClick={() => onOpen(otherName)}
            >
              <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-canvas">
                {safeInitial}
                {isUnread && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-outbid ring-2 ring-surface" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-sm ${
                    isUnread ? "font-semibold text-ink" : "font-medium text-ink"
                  }`}
                >
                  {otherName}
                </span>
                <span
                  className={`block truncate text-xs ${
                    isUnread ? "font-medium text-ink-soft" : "text-ink-muted"
                  }`}
                >
                  {msg.senderUsername === currentUser ? "You: " : ""}
                  {msg.content}
                </span>
              </span>
              {isUnread && <span className="h-2 w-2 shrink-0 rounded-full bg-outbid" />}
            </button>
          );
        })
      )}
    </div>
    <div className="rule my-1" />
    <Link
      to="/messages"
      onClick={onClose}
      className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-surface-2"
    >
      View all messages <Icon.ArrowRight size={16} />
    </Link>
  </>
);

export default NavBar;
