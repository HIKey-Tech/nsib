"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location: string;
  category: string;
  organizer_name?: string;
}
//fix
const CAT_META: Record<string, { dot: string; badge: string; text: string; label: string }> = {
  conference: { dot: "#1B2A6B", badge: "rgba(27,42,107,0.12)", text: "#1B2A6B", label: "Conference" },
  workshop: { dot: "#047857", badge: "rgba(16,185,129,0.12)", text: "#047857", label: "Workshop" },
  training: { dot: "#B45309", badge: "rgba(245,158,11,0.12)", text: "#B45309", label: "Training" },
  seminar: { dot: "#E23030", badge: "rgba(226,48,48,0.12)", text: "#C41A1A", label: "Seminar" },
  safety_drill: { dot: "#E23030", badge: "rgba(226,48,48,0.12)", text: "#C41A1A", label: "Safety Drill" },
  general: { dot: "#475569", badge: "rgba(100,116,139,0.12)", text: "#475569", label: "General" },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function catMeta(category: string) {
  return CAT_META[category] ?? CAT_META.general;
}

export default function CalendarEventsSection({ events }: { events: CalendarEvent[] }) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Map events by "YYYY-MM-DD" key
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(ev => {
      const d = new Date(ev.event_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  // Calendar day slots (nulls = padding before month start)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const slots: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) slots.push(d);
    while (slots.length % 7 !== 0) slots.push(null);
    return slots;
  }, [viewYear, viewMonth]);

  // Sidebar: events spanning current + next month
  const sidebarEvents = useMemo(() => {
    const start = new Date(viewYear, viewMonth, 1);
    const end = new Date(viewYear, viewMonth + 2, 0);
    return events
      .filter(ev => { const d = new Date(ev.event_date); return d >= start && d <= end; })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }, [events, viewYear, viewMonth]);

  // Events on the selected day
  const selectedEvents = useMemo(() => {
    if (!selectedDay) return [];
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    return eventsByDate[key] ?? [];
  }, [selectedDay, viewYear, viewMonth, eventsByDate]);

  const prevMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const dateKey = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const nextMonthName = MONTH_NAMES[viewMonth === 11 ? 0 : viewMonth + 1];

  return (
    <section style={{ padding: "8rem 0", background: "var(--nsib-gray-50)" }}>
      <style>{`
        .cal-day-btn:hover > div { filter: brightness(0.88); }
        .cal-nav-btn:hover { background: rgba(255,255,255,0.22) !important; }
        .cal-event-row:hover { background: rgba(27,42,107,0.03) !important; }
        .cal-view-all:hover { background: rgba(226,48,48,0.04) !important; }
        .cal-scroll::-webkit-scrollbar { width: 4px; }
        .cal-scroll::-webkit-scrollbar-track { background: transparent; }
        .cal-scroll::-webkit-scrollbar-thumb { background: var(--nsib-gray-200); border-radius: 4px; }
        /* min-width:0 lets the panels shrink below their content's natural width —
           without it the calendar grid blows out of the viewport on phones */
        .cal-two-col > div { min-width: 0; max-width: 100%; }
        @media (max-width: 900px) {
          .cal-two-col { grid-template-columns: minmax(0, 1fr) !important; }
          .cal-day-label { display: none !important; }
        }
      `}</style>

      <div className="container">
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3rem" }}>
          <div>
            <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--nsib-red)", marginBottom: "0.5rem" }}>
              Calendar
            </span>
            <h2 style={{ margin: 0 }}>Upcoming Events</h2>
          </div>
          <Link href="/event" style={{ color: "var(--nsib-red)", fontWeight: 700, fontSize: "0.9rem", opacity: 1, transition: "opacity 0.2s" }}>
            View All Events →
          </Link>
        </div>

        {/* ── Two-column layout ── */}
        <div className="cal-two-col" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 380px",
          gap: "2rem",
          alignItems: "start",
        }}>

          {/* ════ CALENDAR PANEL ════ */}
          <div style={{
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
            border: "1px solid var(--border-subtle)",
            overflow: "hidden",
          }}>
            {/* Month navigation bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.5rem 2rem",
              background: "linear-gradient(135deg, var(--nsib-navy) 0%, #0d1435 100%)",
            }}>
              <button
                className="cal-nav-btn"
                onClick={prevMonth}
                aria-label="Previous month"
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "background 0.15s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div style={{ textAlign: "center" }}>
                <div style={{ color: "white", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.01em" }}>
                  {MONTH_NAMES[viewMonth]}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", fontWeight: 600 }}>
                  {viewYear}
                </div>
              </div>

              <button
                className="cal-nav-btn"
                onClick={nextMonth}
                aria-label="Next month"
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "background 0.15s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Day-of-week headers */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              background: "#f1f5f9",
              borderBottom: "1px solid var(--border-subtle)",
            }}>
              {DAY_NAMES.map(d => (
                <div key={d} style={{
                  textAlign: "center",
                  padding: "0.65rem 0",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                  color: d === "Sun" || d === "Sat" ? "#94a3b8" : "var(--text-secondary)",
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0.75rem" }}>
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} style={{ aspectRatio: "1" }} />;
                }

                const key = dateKey(day);
                const dayEvents = eventsByDate[key] ?? [];
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDay === day;
                const todayDay = isToday(day);

                // Red takes priority (safety_drill / seminar), else navy
                const hasRed = dayEvents.some(e => e.category === "safety_drill" || e.category === "seminar");
                const tileColor = hasRed ? "#E23030" : "#1B2A6B";
                const tileDark = hasRed ? "#B91C1C" : "#0d1435";

                // Multiple event types → show tiny count badge
                const multiType = new Set(dayEvents.map(e => catMeta(e.category).dot)).size > 1;

                return (
                  <div
                    key={`day-${day}`}
                    className={hasEvents ? "cal-day-btn" : ""}
                    onClick={() => hasEvents && setSelectedDay(isSelected ? null : day)}
                    role={hasEvents ? "button" : undefined}
                    tabIndex={hasEvents ? 0 : undefined}
                    onKeyDown={e => { if (hasEvents && (e.key === "Enter" || e.key === " ")) setSelectedDay(isSelected ? null : day); }}
                    aria-label={hasEvents ? `${day} ${MONTH_NAMES[viewMonth]}, ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}` : undefined}
                    style={{
                      aspectRatio: "1",
                      padding: "3px",
                      outline: "none",
                    }}
                  >
                    <div style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px",
                      cursor: hasEvents ? "pointer" : "default",
                      position: "relative",
                      // Full tile fill for event days
                      background: hasEvents
                        ? (isSelected ? tileDark : tileColor)
                        : todayDay
                          ? "var(--nsib-navy)"
                          : "transparent",
                      boxShadow: hasEvents
                        ? (isSelected ? `0 4px 12px ${tileColor}55` : `0 2px 8px ${tileColor}40`)
                        : "none",
                      transition: "background 0.15s, box-shadow 0.15s",
                      // Subtle ring for selected non-event today
                      outline: (!hasEvents && !todayDay && isSelected) ? "2px solid var(--nsib-navy)" : "none",
                    }}>
                      {/* Day number */}
                      <span style={{
                        fontSize: "0.92rem",
                        fontWeight: hasEvents || todayDay ? 800 : 500,
                        color: hasEvents || todayDay ? "white" : "#334155",
                        lineHeight: 1,
                      }}>
                        {day}
                      </span>

                      {/* Event count badge for multi-event days */}
                      {hasEvents && dayEvents.length > 1 && (
                        <span className="cal-day-label" style={{
                          marginTop: "3px",
                          fontSize: "0.58rem",
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.75)",
                          letterSpacing: "0.02em",
                        }}>
                          {dayEvents.length} events
                        </span>
                      )}

                      {/* Mixed-type dot indicator */}
                      {hasEvents && multiType && (
                        <div style={{
                          position: "absolute",
                          top: "5px",
                          right: "6px",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.6)",
                        }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected-day detail strip */}
            {selectedEvents.length > 0 && (
              <div style={{
                borderTop: "1px solid var(--border-subtle)",
                background: "#f8fafc",
                padding: "1.25rem 2rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-secondary)" }}>
                  {selectedDay} {MONTH_NAMES[viewMonth]} · {selectedEvents.length} Event{selectedEvents.length > 1 ? "s" : ""}
                </div>
                {selectedEvents.map(ev => {
                  const c = catMeta(ev.category);
                  return (
                    <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--nsib-navy)" }}>{ev.title}</span>
                      <span style={{
                        display: "inline-block",
                        padding: "0.1rem 0.5rem",
                        background: c.badge,
                        color: c.text,
                        borderRadius: "50px",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}>{c.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem 1.5rem",
              padding: "1rem 2rem",
              borderTop: selectedEvents.length === 0 ? "1px solid var(--border-subtle)" : "none",
              background: "#f1f5f9",
            }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>Legend</span>
              {[
                { color: "#1B2A6B", label: "Conference / Workshop" },
                { color: "#E23030", label: "Seminar / Safety Drill" },
                { color: "#B45309", label: "Training" },
                { color: "#475569", label: "General" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: l.color }} />
                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 500 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ════ SIDEBAR: Event List ════ */}
          <div style={{
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
            border: "1px solid var(--border-subtle)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Sidebar header */}
            <div style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid var(--border-subtle)",
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--nsib-navy)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {MONTH_NAMES[viewMonth]} – {nextMonthName}
              </span>
              <span style={{
                padding: "0.2rem 0.6rem",
                background: "rgba(27,42,107,0.08)",
                color: "var(--nsib-navy)",
                borderRadius: "50px",
                fontSize: "0.72rem",
                fontWeight: 700,
              }}>
                {sidebarEvents.length} event{sidebarEvents.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Event list */}
            {sidebarEvents.length === 0 ? (
              <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--text-secondary)", flexGrow: 1 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 1rem", display: "block", opacity: 0.3 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p style={{ fontSize: "0.9rem" }}>No events this period</p>
              </div>
            ) : (
              <div className="cal-scroll" style={{ maxHeight: "520px", overflowY: "auto" }}>
                {sidebarEvents.map((ev, idx) => {
                  const d = new Date(ev.event_date);
                  const c = catMeta(ev.category);
                  const isThisMonth = d.getMonth() === viewMonth && d.getFullYear() === viewYear;
                  const isSelectedEv = selectedDay === d.getDate() && isThisMonth;
                  const isTodayEv = d.toDateString() === today.toDateString();
                  const isLastItem = idx === sidebarEvents.length - 1;

                  // Month separator
                  const showMonthLabel =
                    idx === 0 ||
                    new Date(sidebarEvents[idx - 1].event_date).getMonth() !== d.getMonth();

                  return (
                    <div key={ev.id}>
                      {showMonthLabel && (
                        <div style={{
                          padding: "0.65rem 1.5rem",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "var(--text-secondary)",
                          background: "#f8fafc",
                          borderBottom: "1px solid var(--border-subtle)",
                          ...(idx > 0 ? { borderTop: "1px solid var(--border-subtle)" } : {}),
                        }}>
                          {MONTH_NAMES[d.getMonth()]} {d.getFullYear()}
                        </div>
                      )}

                      <Link
                        href={`/event/${ev.id}`}
                        className="cal-event-row"
                        style={{
                          display: "flex",
                          gap: "0.85rem",
                          padding: "1.1rem 1.5rem",
                          borderBottom: !isLastItem ? "1px solid var(--border-subtle)" : "none",
                          background: isSelectedEv ? "rgba(27,42,107,0.04)" : "transparent",
                          cursor: "pointer",
                          alignItems: "flex-start",
                          transition: "background 0.15s",
                          outline: "none",
                          textDecoration: "none",
                        }}
                      >
                        {/* Color accent bar */}
                        <div style={{ width: "3px", alignSelf: "stretch", background: c.dot, borderRadius: "3px", flexShrink: 0 }} />

                        {/* Date block */}
                        <div style={{ textAlign: "center", minWidth: "34px", flexShrink: 0 }}>
                          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--nsib-navy)", lineHeight: 1 }}>
                            {d.getDate()}
                          </div>
                          <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
                            {d.toLocaleDateString("en-NG", { month: "short" })}
                          </div>
                        </div>

                        {/* Content */}
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                            <span style={{
                              display: "inline-block",
                              padding: "0.12rem 0.5rem",
                              background: c.badge,
                              color: c.text,
                              borderRadius: "50px",
                              fontSize: "0.62rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                            }}>
                              {c.label}
                            </span>
                            {isTodayEv && (
                              <span style={{
                                display: "inline-block",
                                padding: "0.12rem 0.5rem",
                                background: "rgba(226,48,48,0.1)",
                                color: "#C41A1A",
                                borderRadius: "50px",
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                              }}>
                                Today
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            color: "var(--nsib-navy)",
                            lineHeight: 1.3,
                            marginBottom: "0.3rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}>
                            {ev.title}
                          </div>
                          <div style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            overflow: "hidden",
                          }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {ev.location}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer CTA */}
            <Link
              href="/event"
              className="cal-view-all"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "1.1rem",
                borderTop: "1px solid var(--border-subtle)",
                color: "var(--nsib-red)",
                fontWeight: 700,
                fontSize: "0.85rem",
                transition: "background 0.15s",
                background: "transparent",
              }}
            >
              See full events calendar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
