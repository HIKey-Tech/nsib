"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import CalendarEventsSection from "@/components/ui/CalendarEventsSection";

interface Event {
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

const CAT_META: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  conference:   { bg: "rgba(27,42,107,0.1)",   text: "#1B2A6B", dot: "#1B2A6B", label: "Conference" },
  seminar:      { bg: "rgba(226,48,48,0.1)",    text: "#C41A1A", dot: "#E23030", label: "Seminar" },
  workshop:     { bg: "rgba(16,185,129,0.1)",   text: "#047857", dot: "#047857", label: "Workshop" },
  training:     { bg: "rgba(245,158,11,0.1)",   text: "#B45309", dot: "#B45309", label: "Training" },
  safety_drill: { bg: "rgba(226,48,48,0.1)",    text: "#C41A1A", dot: "#E23030", label: "Safety Drill" },
  general:      { bg: "rgba(100,116,139,0.1)",  text: "#475569", dot: "#475569", label: "General" },
};

const CATEGORIES =["all", "conference", "workshop", "seminar", "training", "safety_drill", "general"];

function catMeta(cat: string) {
  return CAT_META[cat] ?? CAT_META.general;
}

function formatEventDate(dateStr: string, endDateStr?: string): string {
  const start = new Date(dateStr);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  if (!endDateStr) return start.toLocaleDateString("en-NG", opts);
  const end = new Date(endDateStr);
  if (start.toDateString() === end.toDateString()) return start.toLocaleDateString("en-NG", opts);
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${end.getDate()} ${start.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}`;
  }
  return `${start.toLocaleDateString("en-NG", opts)} – ${end.toLocaleDateString("en-NG", opts)}`;
}

function formatEventTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const d = new Date(event.event_date);
  const now = new Date();
  const isPast = d < now;
  const daysUntil = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  const c = catMeta(event.category);
  const isPlaceholder = event.id.startsWith("ph-");

  return (
    <article style={{
      background: "white",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      border: "1px solid rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease",
      opacity: isPast ? 0.65 : 1,
      animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s both`,
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
    }}
    >
      {/* Coloured top bar */}
      <div style={{
        background: isPast
          ? "linear-gradient(135deg, #64748b, #94a3b8)"
          : `linear-gradient(135deg, ${c.dot}, ${c.dot}cc)`,
        padding: "1.5rem 1.75rem",
        display: "flex",
        alignItems: "center",
        gap: "1.25rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Big day number */}
        <div style={{ textAlign: "center", minWidth: "52px" }}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {d.toLocaleDateString("en-NG", { month: "short" })}
          </div>
          <div style={{ color: "white", fontSize: "2.4rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {d.getDate()}
          </div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.65rem" }}>{d.getFullYear()}</div>
        </div>

        <div style={{ width: "1px", height: "44px", background: "rgba(255,255,255,0.2)", flexShrink: 0 }} />

        <div style={{ flexGrow: 1 }}>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.82rem", fontWeight: 500 }}>
            {formatEventTime(event.event_date)}
          </div>
          {!isPast && daysUntil >= 0 && (
            <div style={{
              marginTop: "0.3rem",
              display: "inline-block",
              padding: "0.15rem 0.6rem",
              background: "rgba(255,255,255,0.18)",
              borderRadius: "50px",
              color: "rgba(255,255,255,0.9)",
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
            </div>
          )}
          {isPast && (
            <div style={{
              marginTop: "0.3rem",
              display: "inline-block",
              padding: "0.15rem 0.6rem",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "50px",
              color: "rgba(255,255,255,0.75)",
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>Past event</div>
          )}
        </div>

        {/* Decorative circle */}
        <div style={{ position: "absolute", right: "-16px", top: "-16px", width: "72px", height: "72px", borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Body */}
      <div style={{ padding: "1.5rem 1.75rem", flexGrow: 1, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {/* Category badge */}
        <div style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          padding: "0.2rem 0.65rem",
          background: c.bg,
          color: c.text,
          borderRadius: "50px",
          fontSize: "0.68rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}>
          {c.label}
        </div>

        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--nsib-navy)", lineHeight: 1.3, margin: 0 }}>
          {event.title}
        </h3>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.65, flexGrow: 1, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {event.description}
        </p>

        {/* Meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {event.location}
          </div>
          {event.end_date && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {formatEventDate(event.event_date, event.end_date)}
            </div>
          )}
        </div>

        {/* CTA row */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem", alignItems: "center" }}>
          {!isPlaceholder && (
            <Link
              href={`/event/${event.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.6rem 1.25rem",
                background: "var(--nsib-navy)",
                color: "white",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.82rem",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0d1435")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--nsib-navy)")}
            >
              View Details
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          )}
          {event.registration_link && event.registration_link !== "#" && !isPast && (
            <a
              href={event.registration_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.6rem 1.25rem",
                background: "var(--nsib-red)",
                color: "white",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.82rem",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#C41A1A")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--nsib-red)")}
            >
              Register
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showPast, setShowPast] = useState(false);
  const [page, setPage] = useState(1);
  const EVENTS_PER_PAGE = 9;
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/events?limit=100")
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .catch(() => {});
  }, []);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.event_date) >= now);
  const past = events.filter(e => new Date(e.event_date) < now);

  const filtered = useMemo(() => {
    return events
      .filter(e => filter === "all" || e.category === filter)
      .filter(e => showPast || new Date(e.event_date) >= now)
      .filter(e => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, filter, showPast, search]);

  useEffect(() => { setPage(1); }, [filter, showPast, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / EVENTS_PER_PAGE));
  const pageClamped = Math.min(page, totalPages);
  const pagedEvents = filtered.slice((pageClamped - 1) * EVENTS_PER_PAGE, pageClamped * EVENTS_PER_PAGE);

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--nsib-gray-50)", paddingBottom: "8rem" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .search-input::placeholder { color: #94a3b8; }
        .search-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(27,42,107,0.12); }
        .filter-pill { transition: all 0.15s ease; }
        .filter-pill:hover { border-color: var(--nsib-navy) !important; color: var(--nsib-navy) !important; }
      `}} />

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(135deg, var(--nsib-navy) 0%, #0d1435 100%)",
        color: "white",
        padding: "9rem 2rem 6rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "36px 36px" }} />
        <div style={{ position: "absolute", bottom: "-8%", right: "4%", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(226,48,48,0.12), transparent 70%)" }} />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
            <span style={{
              display: "inline-block",
              padding: "0.35rem 1rem",
              background: "rgba(226,48,48,0.2)",
              border: "1px solid rgba(226,48,48,0.3)",
              color: "#ffbaba",
              borderRadius: "50px",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}>
              NSIB Events &amp; Programs
            </span>
            <h1 style={{ color: "white", fontSize: "clamp(2.2rem,4.5vw,4rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem", maxWidth: "660px" }}>
              Events &amp; Safety Programs
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", maxWidth: "540px", lineHeight: 1.7 }}>
              Conferences, workshops, drills, and awareness campaigns advancing safety across Nigeria&apos;s transport sector.
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "3rem", marginTop: "3rem", animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
            {[
              { num: upcoming.length, label: "Upcoming" },
              { num: past.length, label: "Past Events" },
              { num: new Set(events.map(e => e.category)).size, label: "Categories" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "white", lineHeight: 1 }}>{s.num}</div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", marginTop: "0.2rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALENDAR ── */}
      <CalendarEventsSection events={events} />

      {/* ── FILTER + SEARCH BAR ── */}
      <div style={{
        background: "white",
        borderBottom: "1px solid var(--border-subtle)",
        position: "sticky",
        top: "var(--nav-height, 80px)",
        zIndex: 40,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}>
        <div className="container" style={{ padding: "0.85rem 2rem" }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: "0.75rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search events by title, location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 1rem 0.65rem 2.75rem",
                border: "1.5px solid var(--border-subtle)",
                borderRadius: "10px",
                fontSize: "0.9rem",
                background: "var(--nsib-gray-50)",
                color: "var(--text-primary)",
                transition: "box-shadow 0.15s",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "0.25rem",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: "0.25rem" }}>
              Filter:
            </span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className="filter-pill"
                onClick={() => { setFilter(cat); scrollToGrid(); }}
                style={{
                  padding: "0.3rem 0.85rem",
                  borderRadius: "50px",
                  border: filter === cat ? "1.5px solid var(--nsib-navy)" : "1.5px solid var(--border-subtle)",
                  background: filter === cat ? "var(--nsib-navy)" : "transparent",
                  color: filter === cat ? "white" : "var(--text-secondary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {cat === "all" ? "All Events" : cat.replace(/_/g, " ")}
              </button>
            ))}
            <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", color: "var(--text-secondary)", cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={showPast} onChange={e => setShowPast(e.target.checked)} style={{ accentColor: "var(--nsib-navy)", width: "14px", height: "14px" }} />
              Show past events
            </label>
          </div>
        </div>
      </div>

      {/* ── EVENTS GRID ── */}
      <div className="container" style={{ paddingTop: "3.5rem" }} ref={gridRef}>
        {/* Results count */}
        <div style={{ marginBottom: "1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {filtered.length === 0
              ? "No events found"
              : `${filtered.length} event${filtered.length !== 1 ? "s" : ""}${search ? ` matching "${search}"` : ""}`}
          </p>
          {(search || filter !== "all" || showPast) && (
            <button
              onClick={() => { setSearch(""); setFilter("all"); setShowPast(false); }}
              style={{ fontSize: "0.8rem", color: "var(--nsib-red)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 0", color: "var(--text-secondary)" }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 1.5rem", display: "block", opacity: 0.3 }}>
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>No events found</h3>
            <p style={{ fontSize: "0.95rem" }}>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: "1.75rem" }}>
              {pagedEvents.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginTop: "2.5rem" }}>
                <button onClick={() => { setPage(p => Math.max(1, p - 1)); scrollToGrid(); }} disabled={pageClamped === 1}
                  style={{ width: 38, height: 38, borderRadius: 8, border: "1.5px solid #E2E8F0", background: "white", color: "#1B2A6B", cursor: pageClamped === 1 ? "not-allowed" : "pointer", opacity: pageClamped === 1 ? 0.4 : 1 }}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => { setPage(n); scrollToGrid(); }}
                    style={{ width: 38, height: 38, borderRadius: 8, border: n === pageClamped ? "1.5px solid #1B2A6B" : "1.5px solid #E2E8F0", background: n === pageClamped ? "#1B2A6B" : "white", color: n === pageClamped ? "white" : "#1B2A6B", fontWeight: n === pageClamped ? 700 : 500, cursor: "pointer" }}>{n}</button>
                ))}
                <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); scrollToGrid(); }} disabled={pageClamped === totalPages}
                  style={{ width: 38, height: 38, borderRadius: 8, border: "1.5px solid #E2E8F0", background: "white", color: "#1B2A6B", cursor: pageClamped === totalPages ? "not-allowed" : "pointer", opacity: pageClamped === totalPages ? 0.4 : 1 }}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
