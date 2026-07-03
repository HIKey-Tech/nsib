import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { query } from "@/lib/db";
import { SITE_NAME } from "@/lib/site";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string | null;
  published_at: string;
  author_name: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  general: "#1B2A6B",
  safety: "#0077B6",
  aviation: "#1B2A6B",
  maritime: "#0077B6",
  railway: "#6A0572",
  press_release: "#2d6a4f",
  announcement: "#e63946",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// cache() dedupes the query between generateMetadata and the page render.
const getArticle = cache(async (id: string): Promise<NewsItem | null> => {
  if (!UUID_RE.test(id)) return null; // non-UUID would throw a pg cast error
  const rows = await query<NewsItem>(
    "SELECT * FROM news WHERE id = $1 AND status = 'published' LIMIT 1",
    [id]
  );
  return rows[0] ?? null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getArticle(id);
  if (!item) return { title: "Article not found" };

  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: `/news/${item.id}` },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.excerpt,
      url: `/news/${item.id}`,
      siteName: SITE_NAME,
      publishedTime: item.published_at,
      authors: item.author_name ? [item.author_name] : undefined,
      ...(item.image_url ? { images: [item.image_url] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.excerpt,
      ...(item.image_url ? { images: [item.image_url] } : {}),
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function categoryLabel(cat: string) {
  return cat.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getArticle(id);
  if (!item) notFound();

  return (
    <main style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "6rem" }}>
      {/* Hero */}
      <section style={{ background: "var(--nsib-navy)", color: "white", padding: "8rem 2rem 4rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 70% 30%, rgba(226,48,48,0.1) 0%, transparent 50%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: "860px" }}>
          <Link href="/news" style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: "8px", padding: "0.4rem 1rem", fontSize: "0.82rem", textDecoration: "none", marginBottom: "2rem" }}>
            ← Back
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <span style={{ padding: "0.3rem 0.9rem", background: CATEGORY_COLORS[item.category] || "#1B2A6B", color: "white", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {categoryLabel(item.category)}
            </span>
            <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>{formatDate(item.published_at)}</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1.25rem" }}>{item.title}</h1>
          <p style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.75 }}>{item.excerpt}</p>
          <p style={{ marginTop: "1.75rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>By {item.author_name}</p>
        </div>
      </section>

      {/* Cover image */}
      {item.image_url && (
        <div className="container" style={{ maxWidth: "860px", marginTop: "-2rem", position: "relative", zIndex: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image_url}
            alt={item.title}
            style={{ width: "100%", height: "420px", objectFit: "cover", borderRadius: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
          />
        </div>
      )}

      {/* Article body */}
      <div className="container" style={{ maxWidth: "860px", marginTop: item.image_url ? "3rem" : "1rem" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "clamp(2.5rem, 5vw, 5rem)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          {item.content ? (
            item.content.split("\n").map((para, i) =>
              para.trim() ? (
                <p key={i} style={{ fontSize: "1.2rem", lineHeight: 1.85, color: "#2d3748", marginBottom: "1.75rem", fontWeight: 400 }}>
                  {para}
                </p>
              ) : null
            )
          ) : (
            <p style={{ fontSize: "1.2rem", color: "#888", fontStyle: "italic" }}>Full article content not available.</p>
          )}
        </div>

        <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
          <Link href="/news" style={{ padding: "0.85rem 2rem", background: "var(--nsib-navy)", color: "white", borderRadius: "12px", fontWeight: 600, textDecoration: "none", fontSize: "0.95rem" }}>
            ← All News
          </Link>
        </div>
      </div>
    </main>
  );
}
