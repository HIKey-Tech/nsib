"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface SocialPost {
  id: string;
  platform: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  published_at: string;
}

const NSIB_LOGO = "/images/nsib-logo.png";

// Per-platform label, brand colour, and glyph. `other` covers anything unlisted.
const PLATFORM_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  twitter:   { label: "X (Twitter)", color: "#000000", icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/> },
  facebook:  { label: "Facebook",    color: "#1877F2", icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/> },
  instagram: { label: "Instagram",   color: "#E1306C", icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/> },
  linkedin:  { label: "LinkedIn",    color: "#0A66C2", icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/> },
  youtube:   { label: "YouTube",     color: "#FF0000", icon: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/> },
  tiktok:    { label: "TikTok",      color: "#000000", icon: <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/> },
  other:     { label: "Link",        color: "#475569", icon: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></> },
};

function meta(platform: string) {
  return PLATFORM_META[platform] ?? PLATFORM_META.other;
}

function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const m = meta(platform);
  const filled = platform !== "other";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={filled ? undefined : 2} strokeLinecap="round" strokeLinejoin="round">
      {m.icon}
    </svg>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

function SocialCard({ post, index }: { post: SocialPost; index: number }) {
  const m = meta(post.platform);
  const hasThumb = !!post.thumbnail_url;

  return (
    <a href={post.url} target="_blank" rel="noopener noreferrer"
      style={{
        background: "white", borderRadius: "16px", overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease",
        animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s both`,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)"; }}
    >
      {/* Thumbnail — real image cover-cropped; logo fallback padded on a soft field */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: hasThumb ? "#f1f5f9" : "var(--nsib-gray-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.thumbnail_url || NSIB_LOGO}
          alt={post.title || m.label + " post"}
          style={hasThumb
            ? { width: "100%", height: "100%", objectFit: "cover" }
            : { width: "55%", height: "55%", objectFit: "contain", opacity: 0.85 }}
        />
        <span style={{
          position: "absolute", top: "0.75rem", left: "0.75rem",
          display: "inline-flex", alignItems: "center", gap: "0.35rem",
          padding: "0.3rem 0.7rem", borderRadius: "50px",
          background: m.color, color: "white", fontSize: "0.7rem", fontWeight: 700,
          letterSpacing: "0.03em", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}>
          <PlatformIcon platform={post.platform} size={13} />
          {m.label}
        </span>
      </div>

      <div style={{ padding: "1.25rem 1.4rem", flexGrow: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {post.title && (
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--nsib-navy)", lineHeight: 1.3, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {post.title}
          </h3>
        )}
        {post.description && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, margin: 0, flexGrow: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {post.description}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "0.4rem" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{formatDate(post.published_at)}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--nsib-red)", fontWeight: 700, fontSize: "0.82rem" }}>
            View post
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}

interface Props {
  /** Cap the number of posts shown (e.g. 6 on the home page). Omit to show all. */
  limit?: number;
  /** Show platform filter pills (feed page). */
  showFilter?: boolean;
  /** Optional heading + "see all" link (home-page section). */
  heading?: string;
  seeAllHref?: string;
}

// Data-driven grid of admin/staff-curated social posts, shared by /social and the home page.
const PER_PAGE = 9;

export default function SocialFeed({ limit, showFilter = false, heading, seeAllHref }: Props) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/social?limit=${limit ?? 200}`)
      .then(r => r.json())
      .then(d => setPosts(d.posts || []))
      .catch(() => {});
  }, [limit]);

  const platforms = useMemo(
    () => ["all", ...Array.from(new Set(posts.map(p => p.platform)))],
    [posts]
  );
  const filtered = useMemo(
    () => posts.filter(p => filter === "all" || p.platform === filter),
    [posts, filter]
  );

  // The home-page variant (limit set) shows a single row of latest posts — no paging.
  const paginated = limit === undefined;
  const totalPages = paginated ? Math.max(1, Math.ceil(filtered.length / PER_PAGE)) : 1;
  const pageClamped = Math.min(page, totalPages);
  const visible = paginated ? filtered.slice((pageClamped - 1) * PER_PAGE, pageClamped * PER_PAGE) : filtered;

  // On the home page, render nothing rather than an empty shell when there are no posts.
  if (heading && posts.length === 0) return null;

  return (
    <section className="container" style={{ paddingTop: heading ? "4rem" : "4.5rem", paddingBottom: heading ? "2rem" : "5rem" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .social-filter-pill { transition: all 0.15s ease; }
        .social-filter-pill:hover { border-color: var(--nsib-navy) !important; color: var(--nsib-navy) !important; }
      `}} />

      {heading && (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.75rem", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "var(--nsib-navy)", margin: 0 }}>{heading}</h2>
          {seeAllHref && (
            <Link href={seeAllHref} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--nsib-red)", fontWeight: 700, fontSize: "0.9rem" }}>
              See all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          )}
        </div>
      )}

      {showFilter && platforms.length > 2 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: "0.25rem" }}>Filter:</span>
          {platforms.map(p => (
            <button key={p} className="social-filter-pill" onClick={() => { setFilter(p); setPage(1); }}
              style={{ padding: "0.3rem 0.85rem", borderRadius: "50px", border: filter === p ? "1.5px solid var(--nsib-navy)" : "1.5px solid var(--border-subtle)", background: filter === p ? "var(--nsib-navy)" : "transparent", color: filter === p ? "white" : "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
              {p === "all" ? "All" : meta(p).label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 0", color: "var(--text-secondary)" }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 1.5rem", display: "block", opacity: 0.3 }}>
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Nothing here yet</h3>
          <p style={{ fontSize: "0.95rem" }}>NSIB social posts will appear here soon.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: "1.75rem" }}>
            {visible.map((post, i) => <SocialCard key={post.id} post={post} index={i} />)}
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginTop: "2.5rem" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pageClamped === 1}
                style={{ width: 38, height: 38, borderRadius: 8, border: "1.5px solid #E2E8F0", background: "white", color: "#1B2A6B", cursor: pageClamped === 1 ? "not-allowed" : "pointer", opacity: pageClamped === 1 ? 0.4 : 1 }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: 38, height: 38, borderRadius: 8, border: n === pageClamped ? "1.5px solid #1B2A6B" : "1.5px solid #E2E8F0", background: n === pageClamped ? "#1B2A6B" : "white", color: n === pageClamped ? "white" : "#1B2A6B", fontWeight: n === pageClamped ? 700 : 500, cursor: "pointer" }}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={pageClamped === totalPages}
                style={{ width: 38, height: 38, borderRadius: 8, border: "1.5px solid #E2E8F0", background: "white", color: "#1B2A6B", cursor: pageClamped === totalPages ? "not-allowed" : "pointer", opacity: pageClamped === totalPages ? 0.4 : 1 }}>›</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
