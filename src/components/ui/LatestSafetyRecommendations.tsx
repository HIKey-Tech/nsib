"use client";

import { useEffect, useState } from "react";
import styles from "./LatestSafetyRecommendations.module.css";

interface Rec {
  ref_no: string;
  type: "urgent" | "report";
  addressee: { name: string; short_name: string | null };
  issued_at: string | null;
  recommendation: string;
  response_state_label: string;
}

// Latest published safety recommendations, read from the separate Office of Safety Recommendations app (same
// domain, routed by the web server). Best-effort: if that app is down or returns nothing, the section hides itself
// rather than showing an error on the homepage.
export default function LatestSafetyRecommendations() {
  const [recs, setRecs] = useState<Rec[]>([]);

  useEffect(() => {
    const ctl = new AbortController();
    fetch("/api/osr/public/recommendations?limit=3", { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.data) setRecs(d.data); })
      .catch(() => {});
    return () => ctl.abort();
  }, []);

  if (!recs.length) return null;
  const fmt = (d: string | null) => (d ? new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "");

  return (
    <section className={styles.section} aria-labelledby="latest-recs">
      <div className="container">
        <div className={styles.head}>
          <span className={styles.label}>Safety Recommendations</span>
          <h2 id="latest-recs">What we have recommended</h2>
          <p>Recommendations NSIB has issued to regulators and operators, and what has been done about them.</p>
        </div>
        <div className={styles.grid}>
          {recs.map((r) => (
            // Plain <a>, not next/link: the register is a different app on this domain.
            <a key={r.ref_no} href={`/safety-recommendations/${r.ref_no}`} className={`${styles.card} ${r.type === "urgent" ? styles.urgent : ""}`}>
              <div className={styles.top}>
                <span className={styles.ref}>{r.ref_no}</span>
                <span>{r.type === "urgent" && <span className={`${styles.badge} ${styles.badgeRed}`}>Urgent</span>} <span className={styles.badge}>{r.response_state_label}</span></span>
              </div>
              <div className={styles.meta}>To {r.addressee.short_name || r.addressee.name} · {fmt(r.issued_at)}</div>
              <p className={styles.text}>{r.recommendation}</p>
            </a>
          ))}
        </div>
        <div className={styles.more}><a href="/safety-recommendations" className="btn btn-primary">View the full register</a></div>
      </div>
    </section>
  );
}
