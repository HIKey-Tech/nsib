"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";

export interface ReportRow {
  id: string;
  report_no: string | null;
  sector: string;
  report_status: string | null;
  operator: string | null;
  reg_no: string | null;
  vehicle_type: string | null;
  train_name: string | null;
  occurrence: string | null;
  published_at: string;
  file_url: string;
  file_name: string | null;
}

export interface MiddleCol {
  label: string;
  width?: string;
  get: (r: ReportRow) => string;
  mono?: boolean;
  muted?: boolean;
}

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const ChevronIcon = ({ dir }: { dir: "left" | "right" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {dir === "left" ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
  </svg>
);

const STATUS_COLORS: Record<string, string> = {
  "final report": "#1B2A6B", "final": "#1B2A6B",
  "preliminary report": "#D97706", "preliminary": "#D97706",
  "interim statement": "#0284c7", "interim": "#0284c7",
  "safety advisory": "#E23030",
};
const StatusBadge = ({ status }: { status: string | null }) => {
  if (!status) return <span style={{ color: "#94A3B8" }}>—</span>;
  const bg = STATUS_COLORS[status.toLowerCase()] ?? "#64748B";
  return (
    <span style={{ display: "inline-block", padding: "0.2rem 0.65rem", borderRadius: "10px", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: bg, color: "#fff", whiteSpace: "nowrap" }}>{status}</span>
  );
};

const TabNav = ({ active }: { active: string }) => {
  const tabs = [
    { id: "all", label: "All Publications", href: "/publications" },
    { id: "aircraft", label: "Aircraft Reports", href: "/air-reports" },
    { id: "maritime", label: "Maritime Reports", href: "/marine-reports" },
    { id: "rail", label: "Rail Reports", href: "/rail-reports" },
    { id: "other", label: "Other Reports", href: "/other-reports" },
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
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#3A3A3A"; }}
          >{tab.label}</Link>
        );
      })}
    </div>
  );
};

const TH = ({ children, width }: { children: React.ReactNode; width?: string }) => (
  <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap", width, borderRight: "1px solid rgba(255,255,255,0.1)" }}>{children}</th>
);
const TD = ({ children, muted, mono }: { children: React.ReactNode; muted?: boolean; mono?: boolean }) => (
  <td style={{ padding: "0.9rem 1rem", fontSize: mono ? "0.8rem" : "0.855rem", fontFamily: mono ? "monospace" : undefined, fontWeight: mono ? 700 : undefined, color: mono ? "#1B2A6B" : muted ? "#6A6B70" : "#1E293B", borderBottom: "1px solid #F1F5F9", verticalAlign: "middle" }}>{children}</td>
);

const ITEMS_PER_PAGE = 20;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function ReportsArchive({
  sector, heroTitle, heroSubtitle, activeTab, middleColumns,
}: {
  sector: string;
  heroTitle: React.ReactNode;
  heroSubtitle: string;
  activeTab: string;
  middleColumns: MiddleCol[];
}) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [reports, setReports] = useState<ReportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(1);
  const [allYears, setAllYears] = useState<string[]>([]);

  // When no search/year filter is active, use server-side pagination.
  // When a filter IS active, fetch all reports and filter client-side.
  const isFiltering = search || yearFilter;

  // Fetch all distinct years for this sector (independent of pagination)
  useEffect(() => {
    fetch(`/api/reports/years?type=${sector}`)
      .then((r) => r.json())
      .then((data) => setAllYears(data.years || []))
      .catch(() => setAllYears([]));
  }, [sector]);

  useEffect(() => {
    setLoading(true);
    if (!isFiltering) {
      // Server-side pagination: fetch only the current page
      fetch(`/api/reports?type=${sector}&limit=${ITEMS_PER_PAGE}&page=${page}`)
        .then((r) => r.json())
        .then((data) => {
          setReports(data.reports || []);
          setTotal(data.total || 0);
        })
        .catch(() => { setReports([]); setTotal(0); })
        .finally(() => setLoading(false));
    } else {
      // Client-side filtering: fetch all reports for this sector
      let allReports: ReportRow[] = [];
      let totalCount = 0;
      const fetchAllPages = async () => {
        try {
          // Fetch first page to get total
          const first = await fetch(`/api/reports?type=${sector}&limit=${ITEMS_PER_PAGE}&page=1`);
          const firstData = await first.json();
          totalCount = firstData.total || 0;
          allReports = firstData.reports || [];
          // Fetch remaining pages
          const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
          for (let p = 2; p <= totalPages; p++) {
            const res = await fetch(`/api/reports?type=${sector}&limit=${ITEMS_PER_PAGE}&page=${p}`);
            const data = await res.json();
            if (data.reports) allReports = allReports.concat(data.reports);
          }
          setReports(allReports);
          setTotal(totalCount);
        } catch {
          setReports([]);
          setTotal(0);
        } finally {
          setLoading(false);
        }
      };
      fetchAllPages();
    }
  }, [sector, page, isFiltering]);

  // Years are now fetched independently from /api/reports/years so the
  // dropdown is not limited to the current page's records.

  const filtered = useMemo(() => {
    if (!isFiltering) return reports;
    const q = search.toLowerCase();
    return reports
      .filter((r) => {
        const hay = [r.report_no, r.operator, r.reg_no, r.vehicle_type, r.train_name, r.occurrence, r.report_status].filter(Boolean).join(" ").toLowerCase();
        const matchSearch = !q || hay.includes(q);
        const matchYear = !yearFilter || r.published_at.startsWith(yearFilter);
        return matchSearch && matchYear;
      })
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [reports, search, yearFilter, isFiltering]);

  const totalPages = isFiltering
    ? Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
    : Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const paged = isFiltering
    ? filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    : reports;
  const colCount = 4 + middleColumns.length; // S/N, Report No, ...middle, Occurrence, Date, Status, Download = 5 fixed + middle... (see header)

  const download = (r: ReportRow) => {
    // Fire the analytics beacon, then open the file. Never block the download.
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, kind: "report_download", refId: r.id }),
      keepalive: true,
    }).catch(() => {});
    window.open(r.file_url, "_blank", "noopener");
  };

  return (
    <main style={{ paddingBottom: "8rem", backgroundColor: "var(--bg-primary)", overflowX: "hidden" }}>
      {/* Hero */}
      <section ref={containerRef} style={{ backgroundColor: "var(--nsib-navy)", color: "white", padding: "12rem 2rem 10rem", position: "relative", overflow: "hidden", marginBottom: "4rem", perspective: "1000px" }}>
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
              {heroTitle}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
              style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.85)", maxWidth: "600px", lineHeight: 1.7, textShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
              {heroSubtitle}
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <div className="container" style={{ maxWidth: "1400px" }}>
        <TabNav active={activeTab} />

        {/* Toolbar */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 260px", maxWidth: "380px" }}>
            <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: "0.9rem", color: "#94A3B8", pointerEvents: "none" }}><SearchIcon /></div>
            <input type="text" placeholder="Search by report no, operator, occurrence…"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "0.7rem 1rem 0.7rem 2.6rem", border: "1.5px solid #E2E8F0", borderRadius: "8px", fontSize: "0.875rem", color: "#1E293B", backgroundColor: "white", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.target.style.borderColor = "#1B2A6B")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
          </div>
          <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            style={{ padding: "0.7rem 1rem", border: "1.5px solid #E2E8F0", borderRadius: "8px", fontSize: "0.875rem", color: "#1E293B", backgroundColor: "white", cursor: "pointer", outline: "none" }}>
            <option value="">All Years</option>
            {allYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div style={{ marginLeft: "auto", fontSize: "0.85rem", color: "#64748B", whiteSpace: "nowrap" }}>
            Showing <strong style={{ color: "#1B2A6B" }}>{paged.length}</strong> of <strong style={{ color: "#1B2A6B" }}>{isFiltering ? filtered.length : total}</strong> records
          </div>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
              <thead>
                <tr style={{ backgroundColor: "#1B2A6B" }}>
                  <TH width="52px">S/N</TH>
                  <TH width="150px">Report No.</TH>
                  {middleColumns.map((c) => <TH key={c.label} width={c.width}>{c.label}</TH>)}
                  <TH>Occurrence</TH>
                  <TH width="110px">Date Released</TH>
                  <TH width="140px">Status</TH>
                  <TH width="80px">Download</TH>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={colCount + 3} style={{ padding: "4rem", textAlign: "center", color: "#94A3B8" }}>Loading reports…</td></tr>
                ) : paged.length > 0 ? paged.map((r, idx) => {
                  const rowBg = idx % 2 === 0 ? "white" : "#F8FAFC";
                  return (
                    <tr key={r.id} style={{ backgroundColor: rowBg, transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#EEF2FF")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = rowBg)}>
                      <TD muted>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TD>
                      <TD mono>{r.report_no || (r.report_status === "Preliminary Report" ? "Preliminary Report" : "—")}</TD>
                      {middleColumns.map((c) => <TD key={c.label} muted={c.muted} mono={c.mono}>{c.get(r) || "—"}</TD>)}
                      <TD>{r.occurrence || "—"}</TD>
                      <TD muted>{fmtDate(r.published_at)}</TD>
                      <TD><StatusBadge status={r.report_status} /></TD>
                      <td style={{ padding: "0.9rem 1rem", verticalAlign: "middle", borderBottom: "1px solid #F1F5F9" }}>
                        <button onClick={() => download(r)} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.8rem", backgroundColor: "#E23030", color: "white", border: "none", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", transition: "all 0.18s ease", whiteSpace: "nowrap" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#B92424"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#E23030"; e.currentTarget.style.transform = "none"; }}>
                          <DownloadIcon />PDF
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={colCount + 3} style={{ padding: "4rem 2rem", textAlign: "center", color: "#94A3B8" }}>
                    <div style={{ fontSize: "0.95rem" }}>{(!isFiltering && total === 0) ? "No reports have been published in this category yet." : "No records match your search criteria."}</div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderTop: "1px solid #F1F5F9", backgroundColor: "white", flexWrap: "wrap", gap: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "#64748B" }}>Page {page} of {totalPages}</span>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", border: "1.5px solid #E2E8F0", backgroundColor: "white", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, color: "#1B2A6B" }}><ChevronIcon dir="left" /></button>
                {(() => {
                  const pages: (number | "ellipsis")[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (page > 3) pages.push("ellipsis");
                    const start = Math.max(2, page - 1);
                    const end = Math.min(totalPages - 1, page + 1);
                    for (let i = start; i <= end; i++) pages.push(i);
                    if (page < totalPages - 2) pages.push("ellipsis");
                    pages.push(totalPages);
                  }
                  return pages.map((n, i) =>
                    n === "ellipsis" ? (
                      <span key={`e${i}`} style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: "0.85rem" }}>…</span>
                    ) : (
                      <button key={n} onClick={() => setPage(n)} style={{ width: "36px", height: "36px", borderRadius: "8px", border: n === page ? "1.5px solid #1B2A6B" : "1.5px solid #E2E8F0", backgroundColor: n === page ? "#1B2A6B" : "white", color: n === page ? "white" : "#1B2A6B", fontSize: "0.85rem", fontWeight: n === page ? 700 : 500, cursor: "pointer" }}>{n}</button>
                    )
                  );
                })()}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", border: "1.5px solid #E2E8F0", backgroundColor: "white", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, color: "#1B2A6B" }}><ChevronIcon dir="right" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
