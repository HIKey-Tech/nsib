import Link from "next/link";
import { pageMeta } from "@/lib/site";
import { getWatchlist, OsrUnavailable, type WatchlistItem } from "@/lib/osr";
import { Hero, SubNav, Unavailable, rs, MODE } from "@/components/osr/PublicParts";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Safety Recommendations Watchlist",
  description: "The safety issues the Nigerian Safety Investigation Bureau is watching most closely, with the recommendations linked to each.",
  path: "/safety-recommendations/watchlist",
});

export default async function Page() {
  const intro = <Hero title="Watchlist">The safety issues NSIB considers most important to resolve. Each page lists the recommendations linked to the issue and where they stand.</Hero>;
  let issues: WatchlistItem[];
  try {
    issues = await getWatchlist();
  } catch (e) {
    if (!(e instanceof OsrUnavailable)) throw e;
    console.error("Safety recommendations watchlist:", e.message);
    return <>{intro}<SubNav active="watchlist" /><Unavailable /></>;
  }
  return (
    <>
      {intro}
      <SubNav active="watchlist" />
      <div className={`container ${rs.body}`}>
        <div className={rs.cards}>
          {issues.map((i) => (
            <Link key={i.slug} href={`/safety-recommendations/watchlist/${i.slug}`} className={rs.card}>
              <div className={rs.cardTop}>
                <b style={{ fontSize: "1.1rem", color: "var(--nsib-navy)" }}>{i.title}</b>
                <span className={rs.badges}>{i.mode && <span className={`${rs.badge} ${rs.bBlue}`}>{MODE[i.mode]}</span>}<span className={`${rs.badge} ${rs.bAmber}`}>{i.open} open of {i.total}</span></span>
              </div>
              <p className={rs.excerpt}>{i.summary}</p>
            </Link>
          ))}
          {!issues.length && <div className={rs.empty}>No watchlist issues have been published yet.</div>}
        </div>
      </div>
    </>
  );
}
