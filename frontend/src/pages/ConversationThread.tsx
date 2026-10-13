import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { imageUrl, formatPrice } from "../components/ListingCard";
import { Conversation, Message } from "../types";
import { useAuth } from "../context/AuthContext";

export default function ConversationThread() {
  const { id } = useParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    // conversation list already has participant/listing info, so reuse it for the header
    api.get("/conversations").then((res) => {
      if (!active) return;
      const found = res.data.find((c: Conversation) => c._id === id);
      if (found) setConversation(found);
    });

    function loadMessages() {
      api
        .get(`/conversations/${id}/messages`)
        .then((res) => active && setMessages(res.data))
        .finally(() => active && setLoading(false));
    }

    loadMessages();
    const interval = setInterval(loadMessages, 4000); // poll for new messages
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/conversations/${id}/messages`, { text });
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } finally {
      setSending(false);
    }
  }

  const other = conversation?.participants.find((p) => p._id !== user?._id);

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-4 py-4">
      <Link to="/messages" className="text-sm text-jade-600 hover:underline">
        ← All messages
      </Link>

      {conversation && (
        <div className="mt-3 flex items-center gap-3 border-b border-jade-100 pb-3">
          {other?.avatar ? (
            <img
              src={imageUrl(other.avatar) || ""}
              alt={other.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-jade-100 font-bold text-jade-600">
              {other?.name?.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="text-sm font-semibold text-ink">{other?.name}</p>
            {conversation.listing && (
              <p className="text-xs text-ink/50">
                About: {conversation.listing.title} ·{" "}
                {formatPrice(
                  conversation.listing.price,
                  conversation.listing.currency,
                )}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-4">
        {loading ? (
          <p className="py-12 text-center text-jade-600">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink/50">
            Say hello to start the conversation.
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((m) => {
              const senderId =
                typeof m.sender === "object" ? m.sender._id : m.sender;
              const isMine = senderId === user?._id;
              return (
                <div
                  key={m._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                      isMine ? "bg-jade-500 text-white" : "bg-jade-50 text-ink"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="flex gap-2 border-t border-jade-100 pt-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-jade-100 px-4 py-2 text-sm focus:border-jade-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="rounded-full bg-jade-500 px-5 py-2 text-sm font-semibold text-white hover:bg-jade-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
