import { pageMeta } from "@/lib/site";
import { getStats, OsrUnavailable, type Stats } from "@/lib/osr";
import { Hero, SubNav, Unavailable, rs } from "@/components/osr/PublicParts";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Safety Recommendations Dashboard",
  description: "Recommendations issued per year, their status, and each addressee’s response rate.",
  path: "/safety-recommendations/dashboard",
});

const SEGMENTS: { key: string; label: string; color: string }[] = [
  { key: "pending", label: "Response pending", color: "#94a3b8" },
  { key: "overdue", label: "Response overdue (disclosed)", color: "#E23030" },
  { key: "under_assessment", label: "Response received", color: "#7c3aed" },
  { key: "assessed", label: "Assessed", color: "#16a34a" },
  { key: "closed", label: "Closed", color: "#1B2A6B" },
];

export default async function Page() {
  let st: Stats | null = null;
  try {
    st = await getStats();
  } catch (e) {
    if (!(e instanceof OsrUnavailable)) throw e;
    console.error("Safety recommendations dashboard:", e.message);
  }
  if (!st) return <><Hero title="Dashboard">A summary of the published recommendations register.</Hero><SubNav active="dashboard" /><Unavailable /></>;

  const maxYear = Math.max(1, ...st.per_year.map((y) => y.count));
  const total = Math.max(1, st.total);
  const b = (k: string) => st.breakdown[k] ?? 0;
  return (
    <>
      <Hero title="Dashboard">A summary of the published recommendations register, as at {new Date(st.as_at + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}.</Hero>
      <SubNav active="dashboard" />
      <div className={`container ${rs.body}`}>
        <div className={rs.kpis}>
          <div className={rs.kpi}><b>{st.total}</b><span>Recommendations published</span></div>
          <div className={rs.kpi}><b>{st.urgent}</b><span>Urgent</span></div>
          <div className={rs.kpi}><b>{st.on_watchlist}</b><span>On the Watchlist</span></div>
          <div className={rs.kpi}><b>{b("closed")}</b><span>Closed</span></div>
        </div>

        <div className={rs.grid2}>
          <section className={rs.panel}>
            <h2>Issued per year</h2>
            {st.per_year.length === 0 && <p>No data yet.</p>}
            {st.per_year.map((y) => (
              <div key={y.year} className={rs.barRow}><span>{y.year}</span><div className={rs.bar}><div className={rs.barFill} style={{ width: `${(y.count / maxYear) * 100}%` }} /></div><b>{y.count}</b></div>
            ))}
          </section>
          <section className={rs.panel}>
            <h2>Status breakdown</h2>
            <div className={rs.stack} role="img" aria-label={SEGMENTS.map((s) => `${s.label}: ${b(s.key)}`).join(", ")}>
              {SEGMENTS.map((s) => b(s.key) > 0 && <div key={s.key} style={{ width: `${(b(s.key) / total) * 100}%`, background: s.color }} title={`${s.label}: ${b(s.key)}`} />)}
            </div>
            <div className={rs.legend}>{SEGMENTS.map((s) => <span key={s.key}><i className={rs.dot} style={{ background: s.color }} />{s.label}: <b>{b(s.key)}</b></span>)}</div>
            <p className={rs.note}>“Response overdue” appears only where NSIB has recorded an escalation and the Director-General has approved publishing it. Other outstanding responses are shown as “pending”.</p>
          </section>
        </div>

        <section className={rs.panel} style={{ marginTop: "1.2rem" }}>
          <h2>Response rate by addressee</h2>
          <div className={rs.tableWrap}>
            <table className={rs.table}>
              <thead><tr><th>Addressee</th><th>Issued</th><th>Responded</th><th>Within deadline</th><th>Response rate</th><th>Overdue (disclosed)</th></tr></thead>
              <tbody>
                {st.by_addressee.map((a) => (
                  <tr key={a.full_name}>
                    <td data-label="Addressee" title={a.full_name}><b>{a.name}</b></td><td data-label="Issued">{a.issued}</td><td data-label="Responded">{a.responded}</td><td data-label="Within deadline">{a.on_time}</td>
                    <td data-label="Response rate"><div className={rs.rate}><div className={rs.bar}><div className={rs.barFill} style={{ width: `${a.response_rate}%` }} /></div><b>{a.response_rate}%</b></div></td>
                    <td data-label="Overdue (disclosed)">{a.overdue_disclosed || "—"}</td>
                  </tr>
                ))}
                {!st.by_addressee.length && <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No data yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className={rs.note}>Response rate is responses received as a share of recommendations issued. Recommendations issued recently and still inside their 90-day window count as issued but not yet responded, so the rate rises as they are answered.</p>
        </section>
      </div>
    </>
  );
}
