"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";

type Training = {
  id: string;
  title: string;
  description: string;
  venue: string;
  category: "aviation" | "maritime" | "railway" | "general";
  start_date: string;
  end_date: string | null;
};

const ICONS: Record<string, string> = {
  aviation: "✈️",
  maritime: "🚢",
  railway: "🚆",
  general: "📚",
};

function formatWhen(start: string, end: string | null) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const s = new Date(start).toLocaleDateString("en-GB", opts);
  return end ? `${s} – ${new Date(end).toLocaleDateString("en-GB", opts)}` : s;
}

export default function TrainingsList() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<Training | null>(null);

  useEffect(() => {
    fetch("/api/trainings")
      .then((r) => r.json())
      .then((d) => setTrainings(d.trainings || []))
      .catch(() => setTrainings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>Loading trainings…</p>;
  }

  if (trainings.length === 0) {
    return (
      <div className={styles.comingSoon} style={{ marginBottom: "5rem" }}>
        <h2>Trainings coming soon!</h2>
        <p>New courses and training sessions will appear here once scheduled.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.coursesGrid}>
        {trainings.map((t) => (
          <div key={t.id} className={styles.courseCard}>
            <div className={styles.courseIcon}>{ICONS[t.category] || ICONS.general}</div>
            <h3>{t.title}</h3>
            <p>{t.description}</p>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              <div>📅 {formatWhen(t.start_date, t.end_date)}</div>
              {t.venue && <div>📍 {t.venue}</div>}
            </div>
            <button className={`btn btn-primary ${styles.actionBtn}`} onClick={() => setEnrolling(t)}>
              Enroll Now
            </button>
          </div>
        ))}
      </div>

      {enrolling && <EnrollModal training={enrolling} onClose={() => setEnrolling(null)} />}
    </>
  );
}

function EnrollModal({ training, onClose }: { training: Training; onClose: () => void }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    organization: "",
    location: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/trainings/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ training_id: training.id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
    setSubmitting(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 0.9rem",
    border: "1px solid var(--border-subtle, #d5d9e0)",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontFamily: "inherit",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(13,20,53,0.55)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white", borderRadius: "14px", padding: "2rem", width: "100%",
          maxWidth: "460px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "3rem" }}>✅</div>
            <h3 style={{ color: "var(--nsib-navy)", margin: "0.5rem 0" }}>You&apos;re registered!</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Thanks for enrolling in {training.title}. We&apos;ll be in touch with the details.
            </p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <h3 style={{ color: "var(--nsib-navy)", margin: 0 }}>Enroll: {training.title}</h3>
              <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", lineHeight: 1, color: "#888" }}>×</button>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              {formatWhen(training.start_date, training.end_date)}{training.venue ? ` · ${training.venue}` : ""}
            </p>

            {error && <div style={{ background: "#fdecec", color: "#c0392b", padding: "0.6rem 0.8rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</div>}

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <input style={inputStyle} placeholder="Full name *" required value={form.full_name} onChange={set("full_name")} />
              <input style={inputStyle} type="email" placeholder="Email *" required value={form.email} onChange={set("email")} />
              <input style={inputStyle} placeholder="Phone" value={form.phone} onChange={set("phone")} />
              <input style={inputStyle} placeholder="Organization" value={form.organization} onChange={set("organization")} />
              <input style={inputStyle} placeholder="Location (city / state)" value={form.location} onChange={set("location")} />
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} placeholder="Anything else we should know?" value={form.notes} onChange={set("notes")} />
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: "0.25rem" }}>
                {submitting ? "Submitting…" : "Submit Registration"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
