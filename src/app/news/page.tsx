"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

// ─── Shared ─────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CATEGORY_COLORS: Record<string, string> = {
  general: "#2d6a4f", safety: "#E23030", aviation: "#1B2A6B", maritime: "#0077B6",
  railway: "#6A0572", press_release: "#e63946", announcement: "#D97706",
};

const categoryLabel = (cat: string) =>
  cat.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const CategoryBadge = ({ category }: { category: string }) => (
  <span style={{
    display: "inline-block", padding: "0.25rem 0.7rem", borderRadius: "20px",
    fontSize: "0.66rem", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.05em", backgroundColor: CATEGORY_COLORS[category] ?? "#64748B", color: "#fff", whiteSpace: "nowrap",
  }}>{categoryLabel(category)}</span>
);

const TabNav = ({ active }: { active: string }) => {
  const tabs = [
    { id: "all",           label: "All Publications",       href: "/publications" },
    { id: "aircraft",      label: "Aircraft Reports",       href: "/air-reports" },
    { id: "maritime",      label: "Maritime Reports",       href: "/marine-reports" },
    { id: "rail",          label: "Rail Reports",           href: "/rail-reports" },
    { id: "news",          label: "Press Release",          href: "/news" },
    { id: "legislations",  label: "Acts & Legislations",    href: "/legislations" },
    { id: "mou",           label: "MoUs",                   href: "/mou" },
    { id: "forms",         label: "Forms & Checklists",     href: "/investigation-forms-and-checklists" },
    { id: "manuals",       label: "Investigation Manuals",  href: "/investigation-manuals" },
    { id: "foi",           label: "FOI Docs",               href: "/foi" },
  ] as const;
  return (
    <div style={{ display: "flex", borderBottom: "2px solid #E2E8F0", marginBottom: "2rem", overflowX: "auto", gap: 0 }}>
      {tabs.map(tab => {
        const isActive = tab.id === active;
        return (
          <Link key={tab.id} href={tab.href} style={{
            padding: "0.85rem 1.5rem", fontSize: "0.9rem", fontWeight: isActive ? 700 : 600,
            color: isActive ? "#E23030" : "#3A3A3A",
            borderBottom: isActive ? "2px solid #E23030" : "2px solid transparent",
            marginBottom: "-2px", whiteSpace: "nowrap", transition: "color 0.2s", textDecoration: "none",
          }}
          onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#1B2A6B"; }}
          onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "#3A3A3A"; }}
          >{tab.label}</Link>
        );
      })}
    </div>
  );
};

// ─── Data ───────────────────────────────────────────────────────────────────

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  published_at: string;
  author_name: string;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// ─── Card ───────────────────────────────────────────────────────────────────

function NewsCard({ n }: { n: NewsItem }) {
  return (
    <Link href={`/news/${n.id}`} style={{ textDecoration: "none", display: "block" }}>
      <article
        style={{
          background: "white", borderRadius: "16px", overflow: "hidden",
          border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(27,42,107,0.12)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
      >
        <div style={{ height: "190px", position: "relative", background: "linear-gradient(135deg, #1B2A6B, #2d3f8f)" }}>
          {n.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={n.image_url} alt={n.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.25)" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
            </div>
          )}
          <div style={{ position: "absolute", top: "0.9rem", left: "0.9rem" }}><CategoryBadge category={n.category} /></div>
        </div>
        <div style={{ padding: "1.4rem 1.5rem 1.6rem", display: "flex", flexDirection: "column", flex: 1 }}>
          <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, marginBottom: "0.6rem" }}>{formatDate(n.published_at)}</span>
          <h3 style={{ fontSize: "1.12rem", fontWeight: 700, color: "#1B2A6B", lineHeight: 1.35, marginBottom: "0.65rem" }}>{n.title}</h3>
          <p style={{ fontSize: "0.9rem", color: "#64748B", lineHeight: 1.6, marginBottom: "1.1rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.excerpt}</p>
          <span style={{ marginTop: "auto", fontSize: "0.85rem", fontWeight: 700, color: "#E23030" }}>Read more →</span>
        </div>
      </article>
    </Link>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    fetch("/api/news?limit=100")
      .then((r) => r.json())
      .then((data) => setItems(data.news || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const years = useMemo(
    () => Array.from(new Set(items.map((n) => new Date(n.published_at).getFullYear().toString()))).sort().reverse(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items
      .filter((n) => {
        const matchSearch = !q || n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q) || n.category.toLowerCase().includes(q);
        const matchYear = !yearFilter || n.published_at.startsWith(yearFilter);
        return matchSearch && matchYear;
      })
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [items, search, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageClamped = Math.min(page, totalPages);
  const paged = filtered.slice((pageClamped - 1) * PER_PAGE, pageClamped * PER_PAGE);

  return (
    <main style={{ paddingBottom: "8rem", backgroundColor: "var(--bg-primary)", overflowX: "hidden" }}>
      {/* ── Hero ── */}
      <section ref={containerRef} style={{
        backgroundColor: "var(--nsib-navy)", color: "white",
        padding: "12rem 2rem 10rem", position: "relative",
        overflow: "hidden", marginBottom: "4rem", perspective: "1000px",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at top right, rgba(0, 168, 255, 0.2) 0%, transparent 40%), radial-gradient(circle at bottom center, rgba(255, 255, 255, 0.1) 0%, transparent 60%)", zIndex: 0 }} />
        <motion.div style={{ position: "absolute", top: "15%", right: "10%", width: "180px", height: "180px", borderRadius: "24px", background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 60px rgba(0,0,0,0.1)", zIndex: 1, y: y1 }}
          animate={{ rotateZ: [15, 20, 15], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div style={{ position: "absolute", bottom: "5%", left: "8%", width: "300px", height: "300px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(0,168,255,0.08) 0%, rgba(0,168,255,0) 100%)", backdropFilter: "blur(24px)", zIndex: 1, y: y2 }}
          animate={{ scale: [1, 1.05, 1], y: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="container" style={{ position: "relative", zIndex: 2, opacity: opacityFade }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
          <div style={{ maxWidth: "800px" }}>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              style={{ color: "white", fontSize: "clamp(3.5rem, 6vw, 4.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.5rem", textShadow: "0 20px 40px rgba(0,0,0,0.4)", letterSpacing: "-0.02em" }}>
              Press<br/>Release
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
              style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.85)", maxWidth: "600px", lineHeight: 1.7, textShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
              Press releases, safety alerts, investigation milestones, and organizational news from the Nigerian Safety Investigation Bureau.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* ── Content ── */}
      <div className="container" style={{ maxWidth: "1400px" }}>
        <TabNav active="news" />

        {/* Toolbar */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 260px", maxWidth: "380px" }}>
            <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: "0.9rem", color: "#94A3B8", pointerEvents: "none" }}><SearchIcon /></div>
            <input type="text" placeholder="Search news by title, category…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "0.7rem 1rem 0.7rem 2.6rem", border: "1.5px solid #E2E8F0", borderRadius: "8px", fontSize: "0.875rem", color: "#1E293B", backgroundColor: "white", outline: "none", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#1B2A6B"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
          </div>
          <select value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1); }}
            style={{ padding: "0.7rem 1rem", border: "1.5px solid #E2E8F0", borderRadius: "8px", fontSize: "0.875rem", color: "#1E293B", backgroundColor: "white", cursor: "pointer", outline: "none" }}>
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div style={{ marginLeft: "auto", fontSize: "0.85rem", color: "#64748B", whiteSpace: "nowrap" }}>
            <strong style={{ color: "#1B2A6B" }}>{filtered.length}</strong> article{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "#94A3B8" }}>
            <div style={{ width: 36, height: 36, margin: "0 auto 1rem", border: "3px solid #e2e8f0", borderTopColor: "#1B2A6B", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
            Loading news…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", color: "#94A3B8" }}>
            <p style={{ fontSize: "1rem" }}>{items.length === 0 ? "No news articles have been published yet." : "No articles match your search."}</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.75rem" }}>
              {paged.map((n) => <NewsCard key={n.id} n={n} />)}
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
      </div>
    </main>
  );
}
