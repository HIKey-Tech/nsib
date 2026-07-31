"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface EventDetail {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location: string;
  category: string;
  image_url?: string;
  registration_link?: string;
  organizer_name?: string;
}

interface RelatedEvent {
  id: string;
  title: string;
  event_date: string;
  location: string;
  category: string;
}

const CAT_META: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  conference:   { bg: "rgba(27,42,107,0.12)",  text: "#1B2A6B", dot: "#1B2A6B", label: "Conference" },
  seminar:      { bg: "rgba(226,48,48,0.12)",   text: "#C41A1A", dot: "#E23030", label: "Seminar" },
  workshop:     { bg: "rgba(16,185,129,0.12)",  text: "#047857", dot: "#047857", label: "Workshop" },
  training:     { bg: "rgba(245,158,11,0.12)",  text: "#B45309", dot: "#B45309", label: "Training" },
  safety_drill: { bg: "rgba(226,48,48,0.12)",   text: "#C41A1A", dot: "#E23030", label: "Safety Drill" },
  general:      { bg: "rgba(100,116,139,0.12)", text: "#475569", dot: "#475569", label: "General" },
};

function catMeta(cat: string) {
  return CAT_META[cat] ?? CAT_META.general;
}

function formatLongDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function buildICS(event: EventDetail): string {
  const toICSDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };
  const start = toICSDate(event.event_date);
  const end = event.end_date ? toICSDate(event.end_date) : toICSDate(event.event_date);
  const desc = (event.description || "").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NSIB//Events//EN",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${event.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadICS(event: EventDetail) {
  const ics = buildICS(event);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function Spinner() {
  return (
    <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "var(--nsib-navy)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
    </main>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [related, setRelated] = useState<RelatedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => {
        if (data) {
          setEvent(data.event);
          setRelated(data.related || []);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;

  if (notFound || !event) {
    return (
      <main style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "2rem" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "rgba(27,42,107,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "0.5rem",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--nsib-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--nsib-navy)" }}>Event not found</h1>
        <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>This event may have been removed or the link is incorrect.</p>
        <Link href="/event" style={{ marginTop: "1rem", padding: "0.75rem 1.75rem", background: "var(--nsib-navy)", color: "white", borderRadius: "10px", fontWeight: 600 }}>
          ← All Events
        </Link>
      </main>
    );
  }

  const c = catMeta(event.category);
  const d = new Date(event.event_date);
  const now = new Date();
  const isPast = d < now;
  const daysUntil = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  const isMultiDay = !!event.end_date && new Date(event.end_date).toDateString() !== d.toDateString();

  return (
    <main style={{ minHeight: "100vh", background: "var(--nsib-gray-50)", paddingBottom: "8rem" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .ics-btn:hover { background: rgba(255,255,255,0.18) !important; }
        .reg-btn:hover { background: #C41A1A !important; }
        .back-btn:hover { background: rgba(255,255,255,0.18) !important; }
        .related-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; }
        @media (max-width: 768px) {
          .event-content-grid { grid-template-columns: 1fr !important; }
        }
      `}} />

      {/* ── HERO ── */}
      <section style={{
        background: `linear-gradient(135deg, ${c.dot}ee 0%, ${c.dot}99 100%)`,
        position: "relative",
        overflow: "hidden",
        padding: "8rem 2rem 5rem",
      }}>
        {/* Texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        {/* Big decorative circle */}
        <div style={{ position: "absolute", right: "-80px", top: "-80px", width: "420px", height: "420px", borderRadius: "50%", border: "60px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 2, maxWidth: "900px" }}>
          {/* Back + countdown row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", animation: "fadeUp 0.5s both" }}>
            <button
              className="back-btn"
              onClick={() => router.back()}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.4rem 1rem",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white", borderRadius: "8px",
                fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to Events
            </button>

            {!isPast && daysUntil >= 0 && (
              <div style={{
                padding: "0.4rem 1rem",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "50px",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                {daysUntil === 0 ? "Happening Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
              </div>
            )}
            {isPast && (
              <div style={{ padding: "0.4rem 1rem", background: "rgba(0,0,0,0.2)", borderRadius: "50px", color: "rgba(255,255,255,0.8)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Past Event
              </div>
            )}
          </div>

          {/* Category badge */}
          <div style={{ animation: "fadeUp 0.5s 0.05s both" }}>
            <span style={{
              display: "inline-block",
              padding: "0.3rem 0.9rem",
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              borderRadius: "50px",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "1.25rem",
            }}>
              {c.label}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            color: "white",
            fontSize: "clamp(1.75rem, 4.5vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "2rem",
            maxWidth: "720px",
            animation: "fadeUp 0.55s 0.1s both",
          }}>
            {event.title}
          </h1>

          {/* Date + location pills */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", animation: "fadeUp 0.55s 0.15s both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.9)", fontSize: "0.95rem", fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {formatLongDate(event.event_date)}
              {isMultiDay && event.end_date && ` – ${formatLongDate(event.end_date)}`}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.9)", fontSize: "0.95rem", fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {event.location}
            </div>
          </div>

          {/* Action buttons */}
          {!isPast && (
            <div style={{ display: "flex", gap: "0.85rem", marginTop: "2.5rem", flexWrap: "wrap", animation: "fadeUp 0.55s 0.2s both" }}>
              {event.registration_link && event.registration_link !== "#" && (
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="reg-btn"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.85rem 2rem",
                    background: "var(--nsib-red)",
                    color: "white", borderRadius: "10px",
                    fontWeight: 700, fontSize: "0.95rem",
                    transition: "background 0.15s",
                    boxShadow: "0 4px 16px rgba(226,48,48,0.4)",
                  }}
                >
                  Register Now
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
              )}
              <button
                className="ics-btn"
                onClick={() => downloadICS(event)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.85rem 1.75rem",
                  background: "rgba(255,255,255,0.14)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  color: "white", borderRadius: "10px",
                  fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Add to Calendar
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="container" style={{ maxWidth: "900px", marginTop: "3rem" }}>
        <div className="event-content-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem", alignItems: "start" }}>

          {/* Left sidebar — date/time card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Date block */}
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "1.75rem",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              border: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                {isMultiDay ? "Event Dates" : "Event Date"}
              </div>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: `${c.dot}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1rem",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "var(--nsib-navy)", lineHeight: 1, letterSpacing: "-0.02em" }}>
                {d.getDate()}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--nsib-navy)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {d.toLocaleDateString("en-NG", { month: "long" })}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                {d.getFullYear()}
              </div>
              {isMultiDay && event.end_date && (
                <>
                  <div style={{ margin: "0.75rem 0", width: "24px", height: "2px", background: c.dot, borderRadius: "2px", marginInline: "auto" }} />
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--nsib-navy)", lineHeight: 1 }}>
                    {new Date(event.end_date).getDate()}
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--nsib-navy)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {new Date(event.end_date).toLocaleDateString("en-NG", { month: "long" })}
                  </div>
                </>
              )}
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)", fontSize: "0.88rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                {formatTime(event.event_date)}
                {event.end_date && !isMultiDay && ` – ${formatTime(event.end_date)}`}
              </div>
            </div>

            {/* Location card */}
            <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                Location
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--nsib-navy)", lineHeight: 1.4 }}>{event.location}</span>
              </div>
            </div>

            {/* Organizer card */}
            {event.organizer_name && (
              <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                  Organizer
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `${c.dot}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--nsib-navy)" }}>{event.organizer_name}</span>
                </div>
              </div>
            )}

            {/* Add to calendar (past events hidden in hero, show here) */}
            <button
              onClick={() => downloadICS(event)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.85rem",
                background: "white",
                border: `1.5px solid ${c.dot}`,
                color: c.dot, borderRadius: "12px",
                fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${c.dot}10`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "white"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Add to Calendar (.ics)
            </button>
          </div>

          {/* Right — About + image */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Cover image */}
            {event.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.image_url}
                alt={event.title}
                style={{ width: "100%", height: "320px", objectFit: "cover", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
              />
            )}

            {/* Description */}
            <div style={{ background: "white", borderRadius: "16px", padding: "2.5rem", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "4px", height: "24px", background: c.dot, borderRadius: "3px" }} />
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--nsib-navy)", margin: 0 }}>About this Event</h2>
              </div>

              {event.description ? (
                event.description.split("\n").map((para, i) =>
                  para.trim() ? (
                    <p key={i} style={{ fontSize: "1.05rem", lineHeight: 1.85, color: "#374151", marginBottom: "1.25rem", fontWeight: 400 }}>
                      {para}
                    </p>
                  ) : null
                )
              ) : (
                <p style={{ fontSize: "1rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                  No description provided for this event.
                </p>
              )}
            </div>

            {/* Registration CTA block (visible for upcoming events) */}
            {!isPast && event.registration_link && event.registration_link !== "#" && (
              <div style={{
                background: `linear-gradient(135deg, ${c.dot} 0%, ${c.dot}cc 100%)`,
                borderRadius: "16px",
                padding: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1.5rem",
                flexWrap: "wrap",
              }}>
                <div>
                  <h3 style={{ color: "white", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 0.35rem" }}>
                    Ready to attend?
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", margin: 0 }}>
                    Secure your spot before registration closes.
                  </p>
                </div>
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.85rem 1.75rem",
                    background: "white",
                    color: c.dot, borderRadius: "10px",
                    fontWeight: 800, fontSize: "0.9rem",
                    transition: "opacity 0.15s",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Register Now →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── RELATED EVENTS ── */}
        {related.length > 0 && (
          <div style={{ marginTop: "4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
              <div style={{ width: "4px", height: "24px", background: c.dot, borderRadius: "3px" }} />
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--nsib-navy)", margin: 0 }}>
                More {c.label} Events
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: "1.25rem" }}>
              {related.map(rel => {
                const rd = new Date(rel.event_date);
                const rc = catMeta(rel.category);
                return (
                  <Link
                    key={rel.id}
                    href={`/event/${rel.id}`}
                    className="related-card"
                    style={{
                      display: "block",
                      background: "white",
                      borderRadius: "14px",
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      border: "1px solid var(--border-subtle)",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    }}
                  >
                    <div style={{ height: "6px", background: rc.dot }} />
                    <div style={{ padding: "1.25rem" }}>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: rc.text, marginBottom: "0.5rem" }}>
                        {formatShortDate(rel.event_date)}
                      </div>
                      <div style={{ fontWeight: 700, color: "var(--nsib-navy)", fontSize: "0.95rem", lineHeight: 1.3, marginBottom: "0.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {rel.title}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {rel.location}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Back link */}
        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <Link href="/event" style={{ padding: "0.85rem 2rem", background: "var(--nsib-navy)", color: "white", borderRadius: "12px", fontWeight: 600, fontSize: "0.95rem", display: "inline-block" }}>
            ← All Events
          </Link>
        </div>
      </div>
    </main>
  );
}
