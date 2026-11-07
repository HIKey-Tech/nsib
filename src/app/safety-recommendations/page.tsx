import Link from "next/link";
import { pageMeta } from "@/lib/site";
import { listRecommendations, getFacets, portalUrl, OsrUnavailable } from "@/lib/osr";
import { Hero, SubNav, RecCard, Unavailable, rs, MODE } from "@/components/osr/PublicParts";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Safety Recommendations Register",
  description: "Search every safety recommendation issued by the Nigerian Safety Investigation Bureau and see what has been done about it.",
  path: "/safety-recommendations",
});

type SP = Record<string, string | string[] | undefined>;
const LIMIT = 20;
const FILTERS = ["q", "mode", "year", "addressee_id", "status", "theme", "type", "is_watchlist", "global", "report_no", "page"];

function toParams(sp: SP): URLSearchParams {
  const p = new URLSearchParams();
  for (const k of FILTERS) { const v = sp[k]; const x = Array.isArray(v) ? v[0] : v; if (x) p.set(k, x.slice(0, 200)); }
  return p;
}

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const params = toParams(await searchParams);
  const intro = (
    <Hero title="Safety recommendations">
      When NSIB investigates an accident it can issue safety recommendations to regulators, operators and other organisations.
      Each must acknowledge within 30 days and respond within 90. This register shows what we have recommended and what has been done.
    </Hero>
  );

  let list, facets;
  try {
    [list, facets] = await Promise.all([listRecommendations(params, LIMIT), getFacets()]);
  } catch (e) {
    if (!(e instanceof OsrUnavailable)) throw e;
    console.error("Safety recommendations register:", e.message);
    return <>{intro}<SubNav active="register" /><Unavailable /></>;
  }

  const total = list.meta.total;
  const page = list.meta.page;
  const pages = Math.max(1, Math.ceil(total / LIMIT));
  const link = (n: number) => { const p = new URLSearchParams(params); p.set("page", String(n)); return `?${p.toString()}`; };
  const val = (k: string) => params.get(k) ?? "";
  const reportNo = params.get("report_no");
  const filtered = [...params.keys()].some((k) => k !== "page");

  return (
    <>
      {intro}
      <SubNav active="register" />
      <div className={`container ${rs.body}`}>
        <form className={rs.filters} method="get" role="search">
          <div className={rs.wide}><label htmlFor="q">Search</label><input id="q" name="q" defaultValue={val("q")} placeholder="Reference, keyword, operator, registration…" /></div>
          <div><label htmlFor="mode">Mode</label>
            <select id="mode" name="mode" defaultValue={val("mode")}><option value="">All</option>{Object.entries(MODE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label htmlFor="year">Year issued</label>
            <select id="year" name="year" defaultValue={val("year")}><option value="">All</option>{facets.years.map((y) => <option key={y} value={y}>{y}</option>)}</select></div>
          <div><label htmlFor="addr">Addressee</label>
            <select id="addr" name="addressee_id" defaultValue={val("addressee_id")}><option value="">All</option>{facets.addressees.map((a) => <option key={a.id} value={a.id}>{a.short_name || a.name}</option>)}</select></div>
          <div><label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={val("status")}><option value="">All</option>{facets.status.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}</select></div>
          <div><label htmlFor="theme">Theme</label>
            <select id="theme" name="theme" defaultValue={val("theme")}><option value="">All</option>{facets.theme.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}</select></div>
          <div><label htmlFor="type">Type</label>
            <select id="type" name="type" defaultValue={val("type")}><option value="">All</option><option value="urgent">Urgent safety recommendation</option><option value="report">Report recommendation</option></select></div>
          <div className={rs.checks}>
            <label><input type="checkbox" name="is_watchlist" value="1" defaultChecked={val("is_watchlist") === "1"} /> On the Watchlist</label>
            <label><input type="checkbox" name="global" value="1" defaultChecked={val("global") === "1"} /> Global concern</label>
          </div>
          {reportNo && <input type="hidden" name="report_no" value={reportNo} />}
          <div className={rs.filterActions}><button className={rs.primary}>Search</button><Link href="/safety-recommendations" className={rs.ghost}>Clear</Link></div>
        </form>

        {reportNo && <p className={rs.count}>Showing recommendations arising from investigation report <b>{reportNo}</b>. <Link href="/safety-recommendations" style={{ textDecoration: "underline" }}>Show all</Link></p>}
        <p className={rs.count} aria-live="polite">{total === 0 ? "No recommendations match." : `${total} recommendation${total === 1 ? "" : "s"}`}</p>
        <div className={rs.cards}>
          {list.data.map((r) => <RecCard key={r.ref_no} r={r} />)}
          {list.data.length === 0 && <div className={rs.empty}>{!filtered ? "No recommendations have been published yet." : "Nothing matches those filters. Try widening your search."}</div>}
        </div>
        {pages > 1 && (
          <div className={rs.pager}>
            {page > 1 ? <Link className={rs.ghost} href={link(page - 1)}>← Previous</Link> : <span />}
            <span>Page {page} of {pages}</span>
            {page < pages ? <Link className={rs.ghost} href={link(page + 1)}>Next →</Link> : <span />}
          </div>
        )}
        {portalUrl() && <a className={rs.addrLink} href={`${portalUrl()}/osr-portal/login`}>Receiving organisation? Sign in to the addressee portal →</a>}
      </div>
    </>
  );
}
