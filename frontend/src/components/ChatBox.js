import { API_BASE } from "../config";
import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../api";
import Icon from "./Icons";

const fmtTime = (t) =>
  t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const ChatBox = ({ currentUser, recipientUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!recipientUser || !token) return;

    fetchHistory();
    checkOnlineStatus();
    connectWebSocket(token);

    return () => disconnectWebSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientUser]);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/chat/history/${recipientUser}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const checkOnlineStatus = async () => {
    try {
      const res = await api.get(`/chat/status/${recipientUser}`);
      setIsRecipientOnline(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWebSocket = (token) => {
    if (stompClientRef.current && stompClientRef.current.active) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/user/queue/messages`, (msg) => {
          const received = JSON.parse(msg.body);
          // We send our own messages over HTTP now, so the socket only carries
          // incoming messages from the person in this open conversation.
          if (received.senderUsername !== recipientUser) return;
          setMessages((prev) =>
            prev.some((m) => m.id === received.id) ? prev : [...prev, received]
          );
        });

        // "Seen" receipts: the recipient read my messages in this conversation
        client.subscribe(`/user/queue/read`, (msg) => {
          const receipt = JSON.parse(msg.body);
          if (receipt.reader !== recipientUser) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.senderUsername === currentUser && !(m.read ?? m.isRead)
                ? { ...m, read: true, readAt: receipt.readAt }
                : m
            )
          );
        });
      },
      onStompError: (frame) => console.error("Chat Socket Error", frame),
    });
    client.activate();
    stompClientRef.current = client;
  };

  const disconnectWebSocket = () => {
    if (stompClientRef.current) stompClientRef.current.deactivate();
  };

  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text) return;

    // Optimistic bubble, reconciled with the persisted message from the API
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      senderUsername: currentUser,
      recipientUsername: recipientUser,
      content: text,
      timestamp: new Date().toISOString(),
      id: tempId,
      isTemp: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage("");

    try {
      // Send over HTTP (reliable). The server persists and pushes to the
      // recipient over WS; our own copy comes back in the response.
      const res = await api.post("/chat/send", {
        recipientUsername: recipientUser,
        content: text,
      });
      setMessages((prev) => prev.map((m) => (m.id === tempId ? res.data : m)));
    } catch (err) {
      console.error("Send failed", err);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, isTemp: false, failed: true } : m))
      );
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initials = (recipientUser || "?").substring(0, 2).toUpperCase();

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex h-[30rem] w-[calc(100vw-2rem)] max-w-sm animate-fade-up flex-col overflow-hidden rounded-card border border-line bg-surface shadow-lift">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-line bg-ink px-4 py-3 text-canvas">
        <div className="flex items-center gap-3">
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-canvas/10 text-xs font-semibold">
            {initials}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink ${
                isRecipientOnline ? "bg-bid" : "bg-ink-muted"
              }`}
            />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{recipientUser}</div>
            <div className="text-[11px] text-canvas/60">
              {isRecipientOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="grid h-8 w-8 place-items-center rounded-full text-canvas/70 hover:bg-canvas/10 hover:text-canvas"
        >
          <Icon.Close size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-2 overflow-y-auto bg-canvas px-4 py-4">
        {messages.map((msg, idx) => {
          const mine = msg.senderUsername === currentUser;
          const seen = msg.read ?? msg.isRead; // tolerate either JSON key
          return (
            <div key={idx} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                  mine
                    ? "rounded-br-sm bg-ink text-canvas"
                    : "rounded-bl-sm border border-line bg-surface text-ink"
                } ${msg.failed ? "!bg-outbid-soft !text-outbid border border-outbid/30" : ""} ${
                  msg.isTemp ? "opacity-70" : ""
                }`}
              >
                <div className="text-sm leading-snug">{msg.content}</div>
                <div
                  className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] ${
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
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-line bg-surface p-3">
        <input
          className="min-h-[42px] flex-1 rounded-pill border border-line-strong bg-canvas px-4 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isRecipientOnline ? "Type a message…" : "Send offline message…"}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-brand text-brand-ink transition-all hover:brightness-110 disabled:opacity-50"
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          aria-label="Send message"
        >
          <Icon.ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
