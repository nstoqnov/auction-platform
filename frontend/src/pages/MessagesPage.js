import { API_BASE } from "../config";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../api";
import { useAuth } from "../AuthContext";
import Icon from "../components/Icons";

const fmtTime = (t) =>
  t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const MessagesPage = () => {
  const { user } = useAuth();
  const currentUser = user?.username || user?.sub || "";

  const [conversations, setConversations] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [online, setOnline] = useState(false);
  const [draft, setDraft] = useState("");

  const selectedRef = useRef(null);
  const endRef = useRef(null);
  const [searchParams] = useSearchParams();

  const partnerOf = useCallback(
    (msg) => (msg.senderUsername === currentUser ? msg.recipientUsername : msg.senderUsername),
    [currentUser]
  );

  const upsert = useCallback(
    (list, msg) => {
      const p = partnerOf(msg);
      const others = list.filter((c) => partnerOf(c) !== p);
      return [msg, ...others];
    },
    [partnerOf]
  );

  // --- data loaders ---
  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get("/chat/conversations");
      setConversations(res.data || []);
    } catch (e) {
      console.error("Failed to load conversations", e);
    }
  }, []);

  const loadUnread = useCallback(async () => {
    try {
      const res = await api.get("/chat/unread");
      const map = {};
      (res.data || []).forEach((r) => {
        if (r.partner && r.count > 0) map[r.partner] = r.count;
      });
      setUnreadCounts(map);
    } catch (e) {
      /* ignore */
    }
  }, []);

  const markRead = useCallback((partner) => {
    if (!partner) return;
    setUnreadCounts((prev) => {
      if (!prev[partner]) return prev;
      const next = { ...prev };
      delete next[partner];
      return next;
    });
    api.post(`/chat/read/${encodeURIComponent(partner)}`).catch(() => {});
  }, []);

  const openConversation = useCallback(
    async (partner) => {
      if (!partner) return;
      setSelected(partner);
      selectedRef.current = partner;
      setLoadingThread(true);
      try {
        const res = await api.get(`/chat/history/${encodeURIComponent(partner)}`);
        setMessages(res.data || []);
      } catch (e) {
        setMessages([]);
      } finally {
        setLoadingThread(false);
      }
      markRead(partner);
      api
        .get(`/chat/status/${encodeURIComponent(partner)}`)
        .then((r) => setOnline(!!r.data))
        .catch(() => setOnline(false));
    },
    [markRead]
  );

  // Initial load
  useEffect(() => {
    if (currentUser) {
      loadConversations();
      loadUnread();
    }
  }, [currentUser, loadConversations, loadUnread]);

  // Preselect from ?u=, else first conversation on desktop
  useEffect(() => {
    if (selected || conversations.length === 0) return;
    const wanted = searchParams.get("u");
    if (wanted) {
      openConversation(wanted);
    } else if (window.innerWidth >= 1024) {
      openConversation(partnerOf(conversations[0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  // Auto-scroll thread
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Single page-level socket for incoming messages + read receipts
  useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem("token");
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        client.subscribe("/user/queue/messages", (m) => {
          const msg = JSON.parse(m.body);
          const partner = msg.senderUsername === currentUser ? msg.recipientUsername : msg.senderUsername;
          setConversations((prev) => upsert(prev, msg));
          if (partner === selectedRef.current) {
            setMessages((prev) => (prev.some((x) => x.id === msg.id) ? prev : [...prev, msg]));
            if (msg.senderUsername !== currentUser) markRead(partner);
          } else if (msg.senderUsername !== currentUser) {
            setUnreadCounts((prev) => ({ ...prev, [partner]: (prev[partner] || 0) + 1 }));
          }
        });
        client.subscribe("/user/queue/read", (m) => {
          const receipt = JSON.parse(m.body);
          if (receipt.reader === selectedRef.current) {
            setMessages((prev) =>
              prev.map((x) =>
                x.senderUsername === currentUser && !(x.read ?? x.isRead)
                  ? { ...x, read: true, readAt: receipt.readAt }
                  : x
              )
            );
          }
        });
      },
      onStompError: (frame) => console.error("Messages socket error", frame.headers?.message),
    });
    client.activate();
    return () => client.deactivate();
  }, [currentUser, upsert, markRead]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !selected) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      senderUsername: currentUser,
      recipientUsername: selected,
      content: text,
      timestamp: new Date().toISOString(),
      isTemp: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setConversations((prev) => upsert(prev, optimistic));
    setDraft("");
    try {
      const res = await api.post("/chat/send", { recipientUsername: selected, content: text });
      setMessages((prev) => prev.map((x) => (x.id === tempId ? res.data : x)));
    } catch (e) {
      setMessages((prev) =>
        prev.map((x) => (x.id === tempId ? { ...x, isTemp: false, failed: true } : x))
      );
    }
  };

  if (!user) {
    return (
      <div className="container-content flex flex-col items-center py-28 text-center">
        <Icon.Chat size={32} className="text-ink-muted" />
        <h1 className="mt-4 font-display text-display-md text-ink">Please log in</h1>
        <Link to="/login" className="btn-dark mt-6">Log in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-64px)] w-full max-w-content lg:h-[calc(100dvh-72px)]">
      {/* Conversation list */}
      <aside
        className={`w-full flex-col border-r border-line bg-surface lg:flex lg:w-80 ${
          selected ? "hidden" : "flex"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h1 className="font-display text-2xl font-semibold text-ink">Messages</h1>
          <Link to="/auctions" className="text-sm text-ink-soft hover:text-ink">
            Browse
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-ink-muted">
              <Icon.Inbox size={28} />
              <p className="text-sm">No conversations yet.</p>
              <Link to="/auctions" className="btn-outline btn-sm mt-2">Find a lot to discuss</Link>
            </div>
          ) : (
            conversations.map((msg, idx) => {
              const partner = partnerOf(msg) || "Unknown";
              const isUnread = !!unreadCounts[partner];
              const active = partner === selected;
              return (
                <button
                  key={idx}
                  onClick={() => openConversation(partner)}
                  className={`flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left transition-colors ${
                    active ? "bg-surface-2" : "hover:bg-surface-2/60"
                  }`}
                >
                  <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-canvas">
                    {partner.substring(0, 2).toUpperCase()}
                    {isUnread && (
                      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-outbid ring-2 ring-surface" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate ${isUnread ? "font-semibold text-ink" : "font-medium text-ink"}`}>
                        {partner}
                      </span>
                      <span className="shrink-0 text-[11px] text-ink-muted tnum">
                        {fmtTime(msg.timestamp)}
                      </span>
                    </span>
                    <span className={`block truncate text-sm ${isUnread ? "text-ink-soft" : "text-ink-muted"}`}>
                      {msg.senderUsername === currentUser ? "You: " : ""}
                      {msg.content}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Thread */}
      <section
        className={`flex-1 flex-col bg-canvas lg:flex ${selected ? "flex" : "hidden lg:flex"}`}
      >
        {selected ? (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
              <button
                onClick={() => {
                  setSelected(null);
                  selectedRef.current = null;
                }}
                className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-surface-2 lg:hidden"
                aria-label="Back to conversations"
              >
                <span className="rotate-180"><Icon.ArrowRight size={20} /></span>
              </button>
              <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-canvas">
                {selected.substring(0, 2).toUpperCase()}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-surface ${
                    online ? "bg-bid" : "bg-ink-muted"
                  }`}
                />
              </span>
              <div className="leading-tight">
                <div className="font-display text-lg font-medium text-ink">{selected}</div>
                <div className="text-xs text-ink-muted">{online ? "Online" : "Offline"}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-2 overflow-y-auto px-4 py-5 sm:px-6">
              {loadingThread ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
                      <div className="skeleton h-9 w-40 rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center text-ink-muted">
                  <p className="text-sm">No messages yet — say hello.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const mine = msg.senderUsername === currentUser;
                  const seen = msg.read ?? msg.isRead;
                  return (
                    <div key={msg.id ?? idx} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          mine
                            ? "rounded-br-sm bg-ink text-canvas"
                            : "rounded-bl-sm border border-line bg-surface text-ink"
                        } ${msg.failed ? "!border-outbid/30 !bg-outbid-soft !text-outbid" : ""} ${
                          msg.isTemp ? "opacity-70" : ""
                        }`}
                      >
                        <div className="text-sm leading-snug">{msg.content}</div>
                        <div
                          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                            mine ? "text-canvas/50" : "text-ink-muted"
                          } ${msg.failed ? "!text-outbid" : ""}`}
                        >
                          {!mine ? (
                            fmtTime(msg.timestamp)
                          ) : msg.failed ? (
                            "Not delivered"
                          ) : msg.isTemp ? (
                            "Sending…"
                          ) : seen ? (
                            <>
                              <Icon.Check size={12} className="text-canvas" />
                              Seen {fmtTime(msg.readAt || msg.timestamp)}
                            </>
                          ) : (
                            <>Sent {fmtTime(msg.timestamp)}</>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>

            {/* Composer */}
            <div className="flex items-center gap-2 border-t border-line bg-surface p-3 sm:p-4">
              <input
                className="min-h-[46px] flex-1 rounded-pill border border-line-strong bg-canvas px-5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={online ? "Type a message…" : "Send an offline message…"}
              />
              <button
                onClick={send}
                disabled={!draft.trim()}
                className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-brand text-brand-ink transition-all hover:brightness-110 disabled:opacity-50"
                aria-label="Send message"
              >
                <Icon.ArrowRight size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="hidden flex-1 flex-col items-center justify-center gap-3 text-center text-ink-muted lg:flex">
            <Icon.Chat size={40} />
            <p className="font-display text-xl text-ink">Select a conversation</p>
            <p className="text-sm">Choose someone from the left to start chatting.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MessagesPage;
