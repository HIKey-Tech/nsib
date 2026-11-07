import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { getWatchlistIssue, OsrUnavailable } from "@/lib/osr";
import { Hero, SubNav, RecCard, Unavailable, rs } from "@/components/osr/PublicParts";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return { d: await getWatchlistIssue(slug.slice(0, 100)) };
  } catch (e) {
    if (!(e instanceof OsrUnavailable)) throw e;
    console.error("Safety watchlist issue page:", e.message);
    return { down: true as const };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const x = await load(slug);
  if ("down" in x) return { title: "Watchlist" };
  if (!x.d) return { title: "Not found", robots: { index: false } };
  return pageMeta({ title: `Watchlist: ${x.d.issue.title}`, description: x.d.issue.summary || x.d.issue.title, path: `/safety-recommendations/watchlist/${slug}` });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const x = await load(slug);
  const crumb = (t: string) => <><Link href="/safety-recommendations/watchlist">Watchlist</Link> / {t}</>;
  if ("down" in x) return <><Hero title="Watchlist" crumb={crumb("…")} /><SubNav active="watchlist" /><Unavailable /></>;
  if (!x.d) notFound();
  const { issue, recommendations: recs } = x.d;
  const open = recs.filter((r) => r.stage !== "closed").length;
  return (
    <>
      <Hero title={issue.title} crumb={crumb(issue.title)}>{issue.summary}</Hero>
      <SubNav active="watchlist" />
      <div className={`container ${rs.body}`}>
        {issue.content && <section className={rs.panel} style={{ marginBottom: "1.5rem" }}><h2>About this issue</h2><p className={rs.prose}>{issue.content}</p></section>}
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Linked recommendations <span style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: "1rem" }}>· {open} open of {recs.length}</span></h2>
        <div className={rs.cards}>
          {recs.map((r) => <RecCard key={r.ref_no} r={r} />)}
          {!recs.length && <div className={rs.empty}>No recommendations are linked to this issue yet.</div>}
        </div>
      </div>
    </>
  );
}
