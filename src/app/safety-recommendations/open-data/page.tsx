import { pageMeta, SITE_URL } from "@/lib/site";
import { Hero, SubNav, rs } from "@/components/osr/PublicParts";

export const metadata = pageMeta({
  title: "Safety Recommendations Open Data",
  description: "Download the public register of safety recommendations as CSV or read it through the open JSON API.",
  path: "/safety-recommendations/open-data",
});

// The CSV and API links below are served by the OSR app through this site's /api/osr/public/* forwarding (next.config.ts).
export default function Page() {
  return (
    <>
      <Hero title="Open data">The public register is available as a CSV download and a read-only JSON API, for ICAO, partner investigation bureaus, researchers and journalists. Only published records and approved fields are included.</Hero>
      <SubNav active="open-data" />
      <div className={`container ${rs.body}`}>
        <div className={rs.grid2}>
          <section className={rs.panel}>
            <h2>CSV download</h2>
            <p>Every published recommendation, one row each.</p>
            <p style={{ marginTop: "1rem" }}>
              <a className={rs.primary} href="/api/osr/public/recommendations?format=csv">Download CSV</a>
            </p>
            <p className={rs.note}>Filters work on the CSV too, for example <code>?format=csv&amp;mode=aviation&amp;year=2025</code>.</p>
          </section>
          <section className={rs.panel}>
            <h2>JSON API</h2>
            <p>Read-only, no key required, CORS enabled. Please keep to a reasonable request rate (120 per minute per address).</p>
            <div className={rs.code}>{`GET ${SITE_URL}/api/osr/public/recommendations
    ?q=&mode=&year=&addressee_id=&status=&theme=
    &type=urgent|report&global=1&is_watchlist=1
    &page=1&limit=20            (limit max 100)

GET ${SITE_URL}/api/osr/public/recommendations/{reference}
GET ${SITE_URL}/api/osr/public/stats
GET ${SITE_URL}/api/osr/public/watchlist
GET ${SITE_URL}/api/osr/public/watchlist/{slug}`}</div>
            <p>
              <a href="/api/osr/public/recommendations?limit=3" style={{ textDecoration: "underline" }}>Try it →</a>
            </p>
          </section>
        </div>
        <section className={rs.panel} style={{ marginTop: "1.2rem" }}>
          <h2>Using this data</h2>
          <p>Please credit the Nigerian Safety Investigation Bureau. Response status reflects NSIB’s records on the date of the request. Recommendations are not intended to apportion blame or liability.</p>
        </section>
      </div>
    </>
  );
}
