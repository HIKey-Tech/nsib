import type { NextConfig } from "next";

// Office of Safety Recommendations (OSR): a SEPARATE app with its own database and logins, at its own address
// (OSR_APP_URL, e.g. https://osr.nsib.gov.ng). This website shows its public register under /safety-recommendations
// (pages in src/app/safety-recommendations, data read from the OSR's public API — see src/lib/osr.ts).
// Here: the OSR's public data feed (used by the homepage block, the "N safety recs" links on report pages, the CSV
// download and document downloads) and its sitemap are forwarded to it, and sign-in links go to the portal address.
// These are fixed when the site is BUILT, so OSR_APP_URL is a Docker build arg as well as a runtime setting.
const OSR_APP_URL = process.env.OSR_APP_URL?.replace(/\/$/, "");
const OSR_PORTAL_URL = (process.env.NEXT_PUBLIC_OSR_PORTAL_URL || OSR_APP_URL || "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    if (!OSR_APP_URL) return [];
    return [
      { source: "/api/osr/public/:path*", destination: `${OSR_APP_URL}/api/osr/public/:path*` },
      { source: "/osr-sitemap.xml", destination: `${OSR_APP_URL}/osr-sitemap.xml` },
    ];
  },
  async redirects() {
    if (!OSR_PORTAL_URL) return [];
    return ["/osr", "/osr/:path*", "/osr-portal", "/osr-portal/:path*"].map((source) => ({
      source, destination: `${OSR_PORTAL_URL}${source}`, permanent: false,
    }));
  },
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: "standalone",
  // Allow Next.js <Image> to load from Supabase Storage when in demo mode.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Baseline security headers, site-wide. nosniff also stops user uploads under
        // /uploads being MIME-sniffed into something renderable.
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Effective only once the site is served over HTTPS (it will be, behind the proxy).
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
      {
        source: "/flight-track",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://globe.adsbexchange.com https://www.flightradar24.com;",
          },
        ],
      },
      {
        // The inner widget page — must allow VesselFinder's script and resources
        source: "/vessel-widget",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' 'unsafe-inline' https://www.vesselfinder.com; frame-src 'self' https://www.vesselfinder.com; connect-src 'self' https://www.vesselfinder.com https://*.vesselfinder.com; img-src 'self' data: blob: https://*.vesselfinder.com https://*.openstreetmap.org https://*.tile.openstreetmap.org;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

