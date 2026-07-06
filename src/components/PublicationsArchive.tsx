"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";

interface PubRow {
  id: string;
  title: string;
  categoryLabel: string;
  reference: string;
  date: string;      // ISO
  status: string;
  href: string;      // file url or /news/[id]
  isNewsLink?: boolean;
  trackRefId?: string; // set for reports → fires report_download
}

type Source = { kind: "category"; category: string } | { kind: "all" };

const CATEGORY_LABEL: Record<string, string> = {
  legislation: "Legislation", mou: "MoU", form: "Form", manual: "Manual", foi: "FOI", general: "General",
};
const SECTOR_LABEL: Record<string, string> = { aviation: "Aviation Report", maritime: "Maritime Report", railway: "Rail Report" };

const STATUS_COLORS: Record<string, string> = {
  "final report": "#1B2A6B", "final": "#1B2A6B",
  "preliminary report": "#D97706", "preliminary": "#D97706",
  "interim statement": "#0284c7", "interim": "#0284c7",
  "safety advisory": "#E23030", published: "#1B2A6B",
  "in force": "#166534", active: "#166534", amended: "#92400E", renewed: "#0284c7",
};

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const ChevronIcon = ({ dir }: { dir: "left" | "right" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{dir === "left" ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}</svg>
);

const StatusBadge = ({ status }: { status: string }) => {
  if (!status || status === "-") return <span style={{ color: "#94A3B8" }}>—</span>;
  const bg = STATUS_COLORS[status.toLowerCase()] ?? "#64748B";
  return <span style={{ display: "inline-block", padding: "0.2rem 0.65rem", borderRadius: "10px", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: bg, color: "#fff", whiteSpace: "nowrap" }}>{status}</span>;
};

const TabNav = ({ active }: { active: string }) => {
  const tabs = [
    { id: "all", label: "All Publications", href: "/publications" },
    { id: "aircraft", label: "Aircraft Reports", href: "/air-reports" },
    { id: "maritime", label: "Maritime Reports", href: "/marine-reports" },
    { id: "rail", label: "Rail Reports", href: "/rail-reports" },
    { id: "news", label: "Press Release", href: "/news" },
    { id: "legislations", label: "Acts & Legislations", href: "/legislations" },
    { id: "mou", label: "MoUs", href: "/mou" },
    { id: "forms", label: "Forms & Checklists", href: "/investigation-forms-and-checklists" },
    { id: "manuals", label: "Investigation Manuals", href: "/investigation-manuals" },
    { id: "foi", label: "FOI Docs", href: "/foi" },
  ] as const;
  return (
    <div style={{ display: "flex", borderBottom: "2px solid #E2E8F0", marginBottom: "2rem", overflowX: "auto", gap: 0 }}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link key={tab.id} href={tab.href} style={{ padding: "0.85rem 1.5rem", fontSize: "0.9rem", fontWeight: isActive ? 700 : 600, color: isActive ? "#E23030" : "#3A3A3A", borderBottom: isActive ? "2px solid #E23030" : "2px solid transparent", marginBottom: "-2px", whiteSpace: "nowrap", transition: "color 0.2s", textDecoration: "none" }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#1B2A6B"; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#3A3A3A"; }}>{tab.label}</Link>
        );
      })}
    </div>
  );
};

const TH = ({ children, width }: { children: React.ReactNode; width?: string }) => (
  <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap", width, borderRight: "1px solid rgba(255,255,255,0.1)" }}>{children}</th>
);

const ITEMS_PER_PAGE = 20;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function PublicationsArchive({
  source, heroTitle, heroSubtitle, activeTab,
}: {
  source: Source;
  heroTitle: React.ReactNode;
  heroSubtitle: string;
  activeTab: string;
}) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [rows, setRows] = useState<PubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        if (source.kind === "category") {
          const d = await fetch(`/api/publications?category=${source.category}&limit=500`).then((r) => r.json());
          setRows((d.publications || []).map((p: Record<string, string>) => ({
            id: p.id, title: p.title, categoryLabel: CATEGORY_LABEL[p.category] || p.category,
            reference: p.reference_no || "-", date: p.published_at, status: p.status || "-", href: p.file_url,
          })));
        } else {
          const [pubs, reps, news] = await Promise.all([
            fetch("/api/publications?limit=500").then((r) => r.json()).catch(() => ({})),
            fetch("/api/reports?limit=500").then((r) => r.json()).catch(() => ({})),
            fetch("/api/news?limit=500").then((r) => r.json()).catch(() => ({})),
          ]);
          const merged: PubRow[] = [
            ...(reps.reports || []).map((r: Record<string, string>) => ({
              id: r.id, title: r.occurrence || r.title, categoryLabel: SECTOR_LABEL[r.sector] || "Report",
              reference: r.report_no || (r.report_status === "Preliminary Report" ? "Preliminary Report" : "-"),
              date: r.published_at, status: r.report_status || "-", href: r.file_url, trackRefId: r.id,
            })),
            ...(news.news || []).map((n: Record<string, string>) => ({
              id: n.id, title: n.title, categoryLabel: "News", reference: "-", date: n.published_at,
              status: "Published", href: `/news/${n.id}`, isNewsLink: true,
            })),
            ...(pubs.publications || []).map((p: Record<string, string>) => ({
              id: p.id, title: p.title, categoryLabel: CATEGORY_LABEL[p.category] || p.category,
              reference: p.reference_no || "-", date: p.published_at, status: p.status || "-", href: p.file_url,
            })),
          ];
          setRows(merged);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [source]);

  const years = useMemo(() => Array.from(new Set(rows.map((r) => new Date(r.date).getFullYear().toString()))).sort().reverse(), [rows]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows
      .filter((r) => {
        const hay = `${r.title} ${r.categoryLabel} ${r.reference} ${r.status}`.toLowerCase();
        return (!q || hay.includes(q)) && (!yearFilter || r.date.startsWith(yearFilter));
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [rows, search, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const download = (r: PubRow) => {
    if (r.trackRefId) {
      fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: pathname, kind: "report_download", refId: r.trackRefId }), keepalive: true }).catch(() => {});
    }
    window.open(r.href, "_blank", "noopener");
  };

  return (
    <main style={{ paddingBottom: "8rem", backgroundColor: "var(--bg-primary)", overflowX: "hidden" }}>
      {/* Hero */}
      <section ref={containerRef} style={{ backgroundColor: "var(--nsib-navy)", color: "white", padding: "12rem 2rem 10rem", position: "relative", overflow: "hidden", marginBottom: "4rem", perspective: "1000px" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at top right, rgba(0, 168, 255, 0.2) 0%, transparent 40%), radial-gradient(circle at bottom center, rgba(255, 255, 255, 0.1) 0%, transparent 60%)", zIndex: 0 }} />
        <motion.div style={{ position: "absolute", top: "15%", right: "10%", width: "180px", height: "180px", borderRadius: "24px", background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", zIndex: 1, y: y1 }} animate={{ rotateZ: [15, 20, 15], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div style={{ position: "absolute", bottom: "5%", left: "8%", width: "300px", height: "300px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(0,168,255,0.08) 0%, rgba(0,168,255,0) 100%)", backdropFilter: "blur(24px)", zIndex: 1, y: y2 }} animate={{ scale: [1, 1.05, 1], y: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="container" style={{ position: "relative", zIndex: 2, opacity: opacityFade }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
          <div style={{ maxWidth: "800px" }}>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ color: "white", fontSize: "clamp(3.5rem, 6vw, 4.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.5rem", textShadow: "0 20px 40px rgba(0,0,0,0.4)", letterSpacing: "-0.02em" }}>{heroTitle}</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.85)", maxWidth: "600px", lineHeight: 1.7 }}>{heroSubtitle}</motion.p>
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <div className="container" style={{ maxWidth: "1400px" }}>
        <TabNav active={activeTab} />

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 260px", maxWidth: "380px" }}>
            <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: "0.9rem", color: "#94A3B8", pointerEvents: "none" }}><SearchIcon /></div>
            <input type="text" placeholder="Search publications…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "0.7rem 1rem 0.7rem 2.6rem", border: "1.5px solid #E2E8F0", borderRadius: "8px", fontSize: "0.875rem", color: "#1E293B", backgroundColor: "white", outline: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "#1B2A6B")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
          </div>
          <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setPage(1); }} style={{ padding: "0.7rem 1rem", border: "1.5px solid #E2E8F0", borderRadius: "8px", fontSize: "0.875rem", color: "#1E293B", backgroundColor: "white", cursor: "pointer", outline: "none" }}>
            <option value="">All Years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div style={{ marginLeft: "auto", fontSize: "0.85rem", color: "#64748B", whiteSpace: "nowrap" }}>
            Showing <strong style={{ color: "#1B2A6B" }}>{paged.length}</strong> of <strong style={{ color: "#1B2A6B" }}>{filtered.length}</strong> records
          </div>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr style={{ backgroundColor: "#1B2A6B" }}>
                  <TH width="52px">S/N</TH>
                  <TH>Title / Subject</TH>
                  <TH width="150px">Category</TH>
                  <TH width="150px">Reference</TH>
                  <TH width="120px">Date</TH>
                  <TH width="140px">Status</TH>
                  <TH width="90px">Access</TH>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: "4rem", textAlign: "center", color: "#94A3B8" }}>Loading…</td></tr>
                ) : paged.length > 0 ? paged.map((r, idx) => {
                  const rowBg = idx % 2 === 0 ? "white" : "#F8FAFC";
                  return (
                    <tr key={`${r.id}-${idx}`} style={{ backgroundColor: rowBg }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#EEF2FF")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = rowBg)}>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.855rem", color: "#6A6B70", borderBottom: "1px solid #F1F5F9" }}>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.875rem", color: "#1E293B", fontWeight: 500, borderBottom: "1px solid #F1F5F9" }}>{r.title}</td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "#475569", borderBottom: "1px solid #F1F5F9" }}>{r.categoryLabel}</td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", fontFamily: "monospace", color: "#1B2A6B", borderBottom: "1px solid #F1F5F9" }}>{r.reference}</td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.82rem", color: "#6A6B70", borderBottom: "1px solid #F1F5F9", whiteSpace: "nowrap" }}>{fmtDate(r.date)}</td>
                      <td style={{ padding: "0.9rem 1rem", borderBottom: "1px solid #F1F5F9" }}><StatusBadge status={r.status} /></td>
                      <td style={{ padding: "0.9rem 1rem", verticalAlign: "middle", borderBottom: "1px solid #F1F5F9" }}>
                        {r.isNewsLink ? (
                          <Link href={r.href} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.8rem", backgroundColor: "#1B2A6B", color: "white", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>Read</Link>
                        ) : (
                          <button onClick={() => download(r)} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.8rem", backgroundColor: "#E23030", color: "white", border: "none", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B92424")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E23030")}><DownloadIcon />PDF</button>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={7} style={{ padding: "4rem 2rem", textAlign: "center", color: "#94A3B8" }}>{rows.length === 0 ? "No publications have been posted yet." : "No records match your search."}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderTop: "1px solid #F1F5F9", backgroundColor: "white", flexWrap: "wrap", gap: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "#64748B" }}>Page {page} of {totalPages}</span>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", border: "1.5px solid #E2E8F0", backgroundColor: "white", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, color: "#1B2A6B" }}><ChevronIcon dir="left" /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5).map((n) => (
                  <button key={n} onClick={() => setPage(n)} style={{ width: "36px", height: "36px", borderRadius: "8px", border: n === page ? "1.5px solid #1B2A6B" : "1.5px solid #E2E8F0", backgroundColor: n === page ? "#1B2A6B" : "white", color: n === page ? "white" : "#1B2A6B", fontSize: "0.85rem", fontWeight: n === page ? 700 : 500, cursor: "pointer" }}>{n}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", border: "1.5px solid #E2E8F0", backgroundColor: "white", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, color: "#1B2A6B" }}><ChevronIcon dir="right" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
