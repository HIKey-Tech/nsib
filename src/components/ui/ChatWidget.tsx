"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Message = {
  id: number;
  text: string;
  from: "user" | "bot";
  time: string;
  href?: string;
  label?: string;
};

const BOT_NAME = "Virtual Assistant";

const QUICK_REPLIES = [
  "What can this assistant do?",
  "Tell me about your offerings",
  "I have an issue",
];

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

type BotReply = { text: string; href?: string; label?: string };

function getBotReply(text: string): BotReply {
  const lower = text.toLowerCase();
  if (lower.includes("offering") || lower.includes("service")) {
    return {
      text: "NSIB investigates accidents and incidents involving air, marine, and rail transportation in Nigeria.",
      href: "/directorates", label: "View Directorates",
    };
  }
  if (lower.includes("issue") || lower.includes("problem") || lower.includes("complaint")) {
    return {
      text: "I'm sorry to hear that. Please reach out and our team will assist you promptly.",
      href: "/contact-us", label: "Contact Us",
    };
  }
  if (lower.includes("report") || lower.includes("accident")) {
    return {
      text: "You can file an accident or incident report through our Reporting page.",
      href: "/reporting", label: "Report an Accident",
    };
  }
  if (lower.includes("news") || lower.includes("press")) {
    return {
      text: "Catch up on our latest press releases and announcements.",
      href: "/news", label: "Press Release",
    };
  }
  if (lower.includes("publication") || lower.includes("document")) {
    return {
      text: "Browse our published investigation reports and documents.",
      href: "/publications", label: "View Publications",
    };
  }
  if (lower.includes("learn") || lower.includes("training") || lower.includes("course")) {
    return {
      text: "Explore courses and register for training through our Learning Portal.",
      href: "/learning-portal", label: "Learning Portal",
    };
  }
  if (lower.includes("vacan") || lower.includes("job") || lower.includes("career")) {
    return {
      text: "See current openings on our Vacancies page.",
      href: "/vacancies", label: "View Vacancies",
    };
  }
  if (lower.includes("what can this assistant")) {
    return {
      text: "I can point you to the right page — reporting an accident, press releases, publications, training, or contacting NSIB. Try one of the quick replies below or ask me directly.",
    };
  }
  if (lower.includes("contact")) {
    return {
      text: "You can reach us via our Contact Us page, or call our operations centre directly.",
      href: "/contact-us", label: "Contact Us",
    };
  }
  return {
    text: "Thank you for reaching out to NSIB. For specific enquiries, please visit our Contact Us page or call our helpline.",
    href: "/contact-us", label: "Contact Us",
  };
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hi there 👋\nHow can I help you today?",
      from: "bot",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: Date.now(), text: trimmed, from: "user", time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const reply = getBotReply(trimmed);
      const botMsg: Message = {
        id: Date.now() + 1,
        text: reply.text,
        href: reply.href,
        label: reply.label,
        from: "bot",
        time: getTime(),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (!open) setUnread((n) => n + 1);
    }, 450);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage(input);
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div style={styles.window}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white"/>
                </svg>
              </div>
              <span style={styles.headerName}>{BOT_NAME}</span>
            </div>
            <button style={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.from === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
                <div style={msg.from === "user" ? styles.bubbleUser : styles.bubbleBot}>
                  {msg.text.split("\n").map((line, i) => (
                    <span key={i}>{line}{i < msg.text.split("\n").length - 1 && <br />}</span>
                  ))}
                  {msg.href && msg.label && (
                    <Link href={msg.href} onClick={() => setOpen(false)} style={styles.replyLink}>
                      {msg.label} →
                    </Link>
                  )}
                </div>
                <span style={styles.timeLabel}>{msg.time}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div style={styles.quickReplies}>
            {QUICK_REPLIES.map((q) => (
              <button key={q} style={styles.quickBtn} onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Write your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button style={styles.sendBtn} onClick={() => sendMessage(input)} aria-label="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="white"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button style={styles.fab} onClick={() => setOpen((o) => !o)} aria-label="Open chat">
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="white"/>
          </svg>
        )}
        {!open && unread > 0 && <span style={styles.badge}>{unread}</span>}
      </button>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  window: {
    position: "fixed",
    bottom: 88,
    right: 24,
    width: "min(320px, calc(100vw - 48px))",
    maxHeight: "min(480px, calc(100dvh - 140px))",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 9999,
    fontFamily: "var(--font-quicksand), sans-serif",
  },
  header: {
    background: "var(--nsib-navy)",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "var(--nsib-red)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    padding: 4,
    opacity: 0.8,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 14px 8px",
    background: "#F8FAFC",
    display: "flex",
    flexDirection: "column",
  },
  bubbleBot: {
    background: "#fff",
    color: "#1E293B",
    borderRadius: "12px 12px 12px 2px",
    padding: "9px 13px",
    fontSize: 13.5,
    maxWidth: "80%",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    lineHeight: 1.5,
  },
  replyLink: {
    display: "flex",
    marginTop: 8,
    color: "var(--nsib-red)",
    fontWeight: 700,
    fontSize: 12.5,
    textDecoration: "none",
  },
  bubbleUser: {
    background: "var(--nsib-red)",
    color: "#fff",
    borderRadius: "12px 12px 2px 12px",
    padding: "9px 13px",
    fontSize: 13.5,
    maxWidth: "80%",
    lineHeight: 1.5,
  },
  timeLabel: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 3,
    marginLeft: 2,
    marginRight: 2,
  },
  quickReplies: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "6px 14px 10px",
    background: "#F8FAFC",
  },
  quickBtn: {
    background: "none",
    border: "1.5px solid var(--nsib-red)",
    color: "var(--nsib-red)",
    borderRadius: 20,
    padding: "7px 14px",
    fontSize: 12.5,
    cursor: "pointer",
    textAlign: "center",
    fontFamily: "inherit",
    fontWeight: 600,
    transition: "background 0.15s",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    borderTop: "1px solid #E2E8F0",
    gap: 8,
    background: "#fff",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 13.5,
    color: "#1E293B",
    background: "transparent",
    fontFamily: "inherit",
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "var(--nsib-red)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fab: {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: 54,
    height: 54,
    borderRadius: "50%",
    background: "var(--nsib-red)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(226,48,48,0.45)",
    zIndex: 9999,
    transition: "transform 0.2s",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "var(--nsib-navy)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #fff",
  },
};
