import Link from "next/link";
import type { ReactNode } from "react";
import styles from "@/app/safety-recommendations/register.module.css";
import type { PublicRec } from "@/lib/osr";

// Building blocks of the Safety Recommendations section (data from the OSR app's public API — see lib/osr.ts).
export const rs = styles;

const TABS = [
  { href: "/safety-recommendations", label: "Register", key: "register" },
  { href: "/safety-recommendations/watchlist", label: "Watchlist", key: "watchlist" },
  { href: "/safety-recommendations/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/safety-recommendations/open-data", label: "Open data", key: "open-data" },
] as const;

export function Hero({ title, children, crumb }: { title: string; children?: ReactNode; crumb?: ReactNode }) {
  return (
    <section className={styles.hero}>
      <div className="container">
        {crumb && <span className={styles.crumb}>{crumb}</span>}
        <div className={styles.eyebrow}>Office of Safety Recommendations</div>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
    </section>
  );
}

export function SubNav({ active }: { active: (typeof TABS)[number]["key"] }) {
  return (
    <nav className={styles.subnav} aria-label="Safety recommendations">
      <div className={`container ${styles.subnavIn}`}>
        {TABS.map((t) => <Link key={t.key} href={t.href} aria-current={t.key === active ? "page" : undefined}>{t.label}</Link>)}
      </div>
    </nav>
  );
}

/** Shown when the OSR app can't be reached (or OSR_APP_URL is not set yet), instead of an error page. */
export function Unavailable() {
  return (
    <div className={`container ${styles.body}`}>
      <div className={styles.empty} role="status">
        The safety recommendations register is temporarily unavailable. Please try again shortly.
      </div>
    </div>
  );
}

const TONE: Record<string, string> = {
  awaiting_ack: styles.bGrey, awaiting_response: styles.bGrey, ack_overdue: styles.bRed, response_overdue: styles.bRed,
  responded: styles.bPurple, assessed: styles.bGreen, closed: styles.bNavy,
};
// The NSIB status ("Awaiting Response", "Open, Acceptable Intent"…) is always shown, so this extra badge only appears
// when it adds something: a response is in and being assessed, or the DG has approved disclosing it as overdue.
export function StateBadge({ state, label }: { state: string; label: string }) {
  if (state !== "responded" && state !== "ack_overdue" && state !== "response_overdue") return null;
  return <span className={`${styles.badge} ${TONE[state] ?? ""}`}>{label}</span>;
}

/** "Issued 3 March 2025 · Response due 1 June 2025 · 248 days outstanding" (or "Closed …"). */
export function Dates({ r }: { r: PublicRec }) {
  return (
    <div className={styles.dates}>
      <span><b>Issued</b> {fmt(r.issued_at)}</span>
      <span><b>Response due</b> {fmt(r.response_due)}</span>
      {r.days_outstanding != null
        ? <span><b>{r.days_outstanding}</b> day{r.days_outstanding === 1 ? "" : "s"} outstanding</span>
        : r.closed_at && <span><b>Closed</b> {fmt(r.closed_at)}</span>}
    </div>
  );
}

export function Themes({ r }: { r: PublicRec }) {
  if (!r.themes.length) return null;
  return <div className={styles.themes}>{r.themes.map((t) => <span key={t.code} className={`${styles.badge} ${styles.bTheme}`}>{t.label}</span>)}</div>;
}

export const MODE: Record<string, string> = { aviation: "Aviation", rail: "Rail", marine: "Marine", road: "Road" };
export const fmt = (d?: string | null) =>
  d ? new Date(d.length === 10 ? d + "T00:00:00Z" : d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }) : "—";

export function RecCard({ r }: { r: PublicRec }) {
  return (
    <Link href={`/safety-recommendations/${r.ref_no}`} className={`${styles.card} ${r.type === "urgent" ? styles.cardUrgent : ""}`}>
      <div className={styles.cardTop}>
        <span className={styles.ref}>{r.ref_no}</span>
        <span className={styles.badges}>
          {r.type === "urgent" && <span className={`${styles.badge} ${styles.bRed}`}>Urgent</span>}
          {r.global_concern && <span className={`${styles.badge} ${styles.bPurple}`}>Global concern</span>}
          {r.watchlist && <span className={`${styles.badge} ${styles.bAmber}`}>Watchlist</span>}
          <span className={`${styles.badge} ${styles.bBlue}`}>{r.status.label}</span>
          <StateBadge state={r.response_state} label={r.response_state_label} />
        </span>
      </div>
      <div className={styles.meta}>
        <span><b>To:</b> {r.addressee.short_name ? `${r.addressee.short_name} — ` : ""}{r.addressee.name}</span>
        <span>{MODE[r.mode]}</span>
        {r.occurrence.title && <span>{r.occurrence.title}</span>}
      </div>
      <p className={styles.excerpt}>{r.recommendation}</p>
      <Dates r={r} />
      <Themes r={r} />
    </Link>
  );
}
