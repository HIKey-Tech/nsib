import type { NextConfig } from "next";

// The Office of Safety Recommendations is a SEPARATE app (own database and logins) that shares this domain.
// In production the VPS web server routes these paths to it (see the OSR project's docs/DEPLOY.md). Setting
// OSR_APP_URL makes this app forward them instead — handy for local testing of the combined site, and as a
// fallback if you would rather not edit the web server config. Unset = no forwarding.
const OSR_APP_URL = process.env.OSR_APP_URL?.replace(/\/$/, "");
const OSR_PATHS = [
  "/safety-recommendations", "/safety-recommendations/:path*",
  "/osr", "/osr/:path*", "/osr-portal", "/osr-portal/:path*",
  "/api/osr/:path*", "/osr-assets/:path*", "/osr-sitemap.xml",
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Document uploads to the OSR (up to 25MB) pass through the forwarder; the default buffer is 10MB.
  ...(OSR_APP_URL ? { experimental: { proxyClientMaxBodySize: "30mb" } } : {}),
  async rewrites() {
    return OSR_APP_URL ? OSR_PATHS.map((source) => ({ source, destination: `${OSR_APP_URL}${source}` })) : [];
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

