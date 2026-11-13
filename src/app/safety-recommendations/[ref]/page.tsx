import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { getRecommendation, OsrUnavailable } from "@/lib/osr";
import { Hero, SubNav, StateBadge, StatusBadge, PublicLegend, Unavailable, rs, MODE, fmt } from "@/components/osr/PublicParts";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ ref: string }> };

const clean = (ref: string) => decodeURIComponent(ref).toUpperCase().slice(0, 100);

async function load(ref: string) {
  try {
    return { rec: await getRecommendation(clean(ref)) };
  } catch (e) {
    if (!(e instanceof OsrUnavailable)) throw e;
    console.error("Safety recommendation page:", e.message);
    return { down: true as const };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ref } = await params;
  const d = await load(ref);
  if ("down" in d) return { title: "Safety Recommendation" };
  if (!d.rec) return { title: "Recommendation not found", robots: { index: false } };
  return pageMeta({
    title: `Safety Recommendation ${d.rec.ref_no}`,
    description: d.rec.recommendation.slice(0, 160),
    path: `/safety-recommendations/${d.rec.ref_no}`,
  });
}

export default async function Page({ params }: Props) {
  const { ref } = await params;
  const d = await load(ref);
  if ("down" in d) return <><Hero title={clean(ref)} crumb={<><Link href="/safety-recommendations">Safety recommendations</Link> / {clean(ref)}</>} /><SubNav active="register" /><Unavailable /></>;
  if (!d.rec) notFound();
  const r = d.rec;
  return (
    <>
      <Hero title={r.ref_no} crumb={<><Link href="/safety-recommendations">Safety recommendations</Link> / {r.ref_no}</>}>
        {r.type_label} to {r.addressee.name}
      </Hero>
      <SubNav active="register" />
      <div className={`container ${rs.body}`}>
        <PublicLegend />
        <div className={rs.badges} style={{ marginBottom: "1.2rem" }}>
          {r.type === "urgent" && <span className={`${rs.badge} ${rs.bUrgent}`}>Urgent</span>}
          {r.global_concern && <span className={`${rs.badge} ${rs.bPurple}`}>Safety Recommendation of Global Concern</span>}
          <StatusBadge r={r} />
          <StateBadge state={r.response_state} label={r.response_state_label} />
        </div>
        <div className={rs.detailGrid}>
          <div>
            <section className={rs.panel}>
              <h2>Recommendation</h2>
              <p className={rs.prose}>{r.recommendation}</p>
              {r.finding && <><h2 style={{ marginTop: "1.4rem" }}>Finding</h2><p className={rs.prose}>{r.finding}</p></>}
            </section>
            {r.response_summary && (
              <section className={rs.panel}>
                <h2>Response from {r.addressee.short_name || r.addressee.name}</h2>
                <p className={rs.prose}>{r.response_summary}</p>
              </section>
            )}
            {r.classification && (
              <section className={rs.panel}>
                <h2>NSIB’s assessment</h2>
                <p><span className={`${rs.badge} ${r.classification.code.startsWith("closed_") && ["closed_unacceptable_action", "closed_no_response"].includes(r.classification.code) ? rs.bGrey : r.classification.code.startsWith("closed_") ? rs.bGreen : rs.bAmber}`}>{r.classification.label}</span></p>
              </section>
            )}
            {r.documents.length > 0 && (
              <section className={rs.panel}>
                <h2>Documents</h2>
                {/* Served from the OSR app through this site's /api/osr/public/* forwarding (next.config.ts) */}
                <ul className={rs.docs}>{r.documents.map((x) => <li key={x.id}><a href={`/api/osr/public/documents/${x.id}`}>{x.name}</a></li>)}</ul>
              </section>
            )}
            <p className={rs.note}>A safety recommendation is made to prevent future accidents. It is not intended to apportion blame or liability. The response status shown is the Bureau’s record of whether the addressee has acknowledged and answered the recommendation within the required time.</p>
          </div>
          <aside>
            <section className={rs.panel}>
              <h2>Details</h2>
              <dl className={rs.dl}>
                <dt>Addressee</dt><dd>{r.addressee.name}</dd>
                <dt>Mode</dt><dd>{MODE[r.mode]}</dd>
                <dt>Date issued</dt><dd>{fmt(r.issued_at)}</dd>
                <dt>Response due</dt><dd>{fmt(r.response_due)}</dd>
                {r.days_outstanding != null && <><dt>{r.days_outstanding_final ? "Time to respond" : "Days outstanding"}</dt><dd>{r.days_outstanding_final ? `Responded in ${r.days_outstanding} day${r.days_outstanding === 1 ? "" : "s"}` : r.days_outstanding}</dd></>}
                {r.closed_at && <><dt>Closed</dt><dd>{fmt(r.closed_at)}</dd></>}
                <dt>Status</dt><dd>{r.status.label}</dd>
                {r.themes.length > 0 && <><dt>Themes</dt><dd>{r.themes.map((t) => t.label).join(", ")}</dd></>}
                {r.watchlist && <><dt>Watchlist</dt><dd><Link href={`/safety-recommendations/watchlist/${r.watchlist.slug}`} style={{ textDecoration: "underline" }}>{r.watchlist.title}</Link></dd></>}
              </dl>
            </section>
            {(Object.values(r.occurrence).some(Boolean) || r.report?.url) && <section className={rs.panel}>
              <h2>Occurrence</h2>
              <dl className={rs.dl}>
                {r.occurrence.title && <><dt>Event</dt><dd>{r.occurrence.title}</dd></>}
                {r.occurrence.ref && <><dt>Reference</dt><dd>{r.occurrence.ref}</dd></>}
                {r.occurrence.date && <><dt>Date</dt><dd>{fmt(r.occurrence.date)}</dd></>}
                {r.occurrence.location && <><dt>Location</dt><dd>{r.occurrence.location}</dd></>}
                {r.occurrence.operator && <><dt>Operator</dt><dd>{r.occurrence.operator}</dd></>}
                {r.occurrence.registration && <><dt>Registration</dt><dd>{r.occurrence.registration}</dd></>}
              </dl>
              {r.report?.url && <p style={{ marginTop: "1rem" }}><a className={rs.primary} href={r.report.url} target="_blank" rel="noopener noreferrer">Read the investigation report{r.report.report_no ? ` (${r.report.report_no})` : ""}</a></p>}
            </section>}
          </aside>
        </div>
      </div>
    </>
  );
}
