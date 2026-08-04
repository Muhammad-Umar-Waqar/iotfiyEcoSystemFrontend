import { useEffect, useRef, useState } from "react";
import { Minimize2, RotateCcw, Send } from "lucide-react";
import HelpMarkdown from "./HelpMarkdown";
import "./HelpChatWidget.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5054";
const FAB_SIZE = 60;
const FAB_POS_KEY = "eco-help-fab-pos";
const DRAG_THRESHOLD = 6;

const SERVICE_UNAVAILABLE =
  "Currently the service is unavailable. Sorry for the inconvenience — please try again.";

const WELCOME =
  "Hi! I'm the ecoSystem assistant. Ask me about devices, alerts, AC controls, schedules, and how to use the app.";

function defaultFabPos() {
  const margin = 20;
  const mobileExtra =
    typeof window !== "undefined" && window.innerWidth <= 640 ? 56 : 0;
  return {
    x: window.innerWidth - FAB_SIZE - margin,
    y: window.innerHeight - FAB_SIZE - margin - mobileExtra,
  };
}

function clampFabPos(x, y) {
  const pad = 8;
  const maxX = Math.max(pad, window.innerWidth - FAB_SIZE - pad);
  const maxY = Math.max(pad, window.innerHeight - FAB_SIZE - pad);
  return {
    x: Math.min(Math.max(pad, x), maxX),
    y: Math.min(Math.max(pad, y), maxY),
  };
}

function loadFabPos() {
  try {
    const raw = localStorage.getItem(FAB_POS_KEY);
    if (!raw) return defaultFabPos();
    const parsed = JSON.parse(raw);
    if (!Number.isFinite(parsed?.x) || !Number.isFinite(parsed?.y)) {
      return defaultFabPos();
    }
    return clampFabPos(parsed.x, parsed.y);
  } catch {
    return defaultFabPos();
  }
}

/**
 * Fiverr-style floating help chat.
 * FAB is draggable; panel always opens fixed bottom-right (approach A).
 */
export default function HelpChatWidget() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { id: "welcome", role: "bot", text: WELCOME },
  ]);
  const [fabPos, setFabPos] = useState(() =>
    typeof window !== "undefined" ? loadFabPos() : { x: 0, y: 0 }
  );
  const [dragging, setDragging] = useState(false);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, busy]);

  useEffect(() => {
    if (open && !closing) {
      const t = setTimeout(() => inputRef.current?.focus(), 280);
      return () => clearTimeout(t);
    }
  }, [open, closing]);

  useEffect(() => {
    const onResize = () => {
      setFabPos((prev) => clampFabPos(prev.x, prev.y));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const openPanel = () => {
    setClosing(false);
    setOpen(true);
  };

  const closePanel = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 220);
  };

  const resetChat = () => {
    setMessages([{ id: `welcome-${Date.now()}`, role: "bot", text: WELCOME }]);
    setInput("");
  };

  const appendBotToken = (botId, token) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === botId ? { ...m, text: (m.text || "") + token } : m
      )
    );
  };

  const onFabPointerDown = (e) => {
    if (e.button != null && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: fabPos.x,
      origY: fabPos.y,
      moved: false,
    };
    setDragging(true);
  };

  const onFabPointerMove = (e) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    d.moved = true;
    setFabPos(clampFabPos(d.origX + dx, d.origY + dy));
  };

  const endFabPointer = (e) => {
    const d = dragRef.current;
    if (!d || (e.pointerId != null && d.pointerId !== e.pointerId)) return;
    const wasDrag = d.moved;
    dragRef.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    if (wasDrag) {
      setFabPos((prev) => {
        const next = clampFabPos(prev.x, prev.y);
        try {
          localStorage.setItem(FAB_POS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
      return;
    }
    openPanel();
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    const userMsg = { id: `u-${Date.now()}`, role: "user", text };
    const historyPayload = [...messages, userMsg]
      .filter((m) => m.role === "user" || m.role === "bot")
      .filter((m) => m.id !== "welcome" && !String(m.id).startsWith("welcome-"))
      .slice(-8)
      .map((m) => ({ role: m.role, text: m.text }));

    const botId = `b-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: botId, role: "bot", text: "", streaming: true },
    ]);
    setInput("");
    setBusy(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/help/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ message: text, history: historyPayload }),
      });

      if (!res.ok) {
        throw new Error(SERVICE_UNAVAILABLE);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error(SERVICE_UNAVAILABLE);

      const decoder = new TextDecoder();
      let buffer = "";
      let gotToken = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const line = part
            .split("\n")
            .map((l) => l.trim())
            .find((l) => l.startsWith("data:"));
          if (!line) continue;

          let event;
          try {
            event = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }

          if (event.type === "token" && event.text) {
            gotToken = true;
            appendBotToken(botId, event.text);
          } else if (event.type === "error") {
            throw new Error(SERVICE_UNAVAILABLE);
          }
        }
      }

      if (!gotToken) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? {
                  ...m,
                  text: SERVICE_UNAVAILABLE,
                  streaming: false,
                }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId ? { ...m, streaming: false } : m
          )
        );
      }
    } catch (err) {
      console.error("[HelpChat]", err?.message || err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? {
                ...m,
                text: SERVICE_UNAVAILABLE,
                streaming: false,
              }
            : m
        )
      );
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="eco-help-root" aria-live="polite">
      {(open || closing) && (
        <div
          className={`eco-help-panel ${closing ? "eco-help-panel--out" : "eco-help-panel--in"}`}
          role="dialog"
          aria-label="ecoSystem Support"
        >
          <header className="eco-help-header">
            <div className="eco-help-header-left">
              <span className="eco-help-title">EcoSystem Support</span>
              <img
                src="/logo-half.png"
                alt=""
                className="eco-help-header-logo"
              />
            </div>
            <div className="eco-help-header-actions">
              <button
                type="button"
                className="eco-help-icon-btn"
                title="Reset chat"
                onClick={resetChat}
              >
                <RotateCcw size={16} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="eco-help-icon-btn"
                title="Minimize"
                onClick={closePanel}
              >
                <Minimize2 size={16} strokeWidth={2} />
              </button>
            </div>
          </header>

          <div className="eco-help-messages" ref={listRef}>
            {messages.map((m) =>
              m.role === "bot" ? (
                <div key={m.id} className="eco-help-row eco-help-row--bot">
                  <img
                    src="/logo-half.png"
                    alt=""
                    className="eco-help-avatar"
                  />
                  <div
                    className={`eco-help-bubble eco-help-bubble--bot ${
                      m.streaming ? "eco-help-bubble--streaming" : ""
                    }`}
                  >
                    {m.text?.trim() ? (
                      <HelpMarkdown text={m.text} />
                    ) : m.streaming ? (
                      <div className="eco-help-typing">
                        <span />
                        <span />
                        <span />
                      </div>
                    ) : null}
                    {m.streaming && m.text?.trim() ? (
                      <span className="eco-help-caret" aria-hidden />
                    ) : null}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="eco-help-row eco-help-row--user">
                  <div className="eco-help-bubble eco-help-bubble--user">
                    {m.text}
                  </div>
                </div>
              )
            )}
          </div>

          <footer className="eco-help-footer">
            <div className="eco-help-input-wrap">
              <input
                ref={inputRef}
                type="text"
                className="eco-help-input"
                placeholder="Message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={busy}
                autoComplete="off"
              />
              <button
                type="button"
                className="eco-help-send"
                title="Send"
                onClick={send}
                disabled={busy || !input.trim()}
              >
                <Send size={18} strokeWidth={2} />
              </button>
            </div>
            <p className="eco-help-powered">Powered by ecoSystem Assistant</p>
          </footer>
        </div>
      )}

      {!open && !closing && (
        <button
          type="button"
          className={`eco-help-fab ${dragging ? "eco-help-fab--dragging" : "eco-help-fab--enter"}`}
          style={{ left: fabPos.x, top: fabPos.y }}
          onPointerDown={onFabPointerDown}
          onPointerMove={onFabPointerMove}
          onPointerUp={endFabPointer}
          onPointerCancel={endFabPointer}
          aria-label="Open support chat (drag to move)"
          title="ecoSystem Support — drag to move"
        >
          <span className="eco-help-fab-ring" />
          <span className="eco-help-fab-inner">
            <img
              src="/logo-half.png"
              alt="ecoSystem"
              className="eco-help-fab-logo"
              draggable={false}
            />
          </span>
        </button>
      )}
    </div>
  );
}
